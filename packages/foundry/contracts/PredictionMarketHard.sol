//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { PredictionOptionToken } from "./PredictionOptionToken.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";

contract PredictionMarketHard {
    using Strings for uint256;

    struct Prediction {
        string question;
        uint256 endTime;
        mapping(uint256 => string) options;
        mapping(uint256 => uint256) betsPerOption;
        mapping(uint256 => PredictionOptionToken) optionTokens;
        mapping(uint256 => uint256) tokenReserves;
        uint256 winningOptionId;
        bool isReported;
        uint256 optionsCount;
        uint256 ethReserve;
    }

    mapping(uint256 => Prediction) public predictions;
    uint256 public nextPredictionId = 0;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) public betsPerGambler;
    address public oracle;

    /**
     * Dex stuff
     */
    IERC20 token;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function createPrediction(
        string calldata _question,
        string[] calldata _options,
        uint256 _endTime,
        uint256 _initalLiquidity,
        uint256 _initialTokenAmount
    ) external payable {
        require(msg.sender == oracle, "Only oracle can create predictions");
        require(_options.length >= 2, "Need at least 2 options");
        require(_endTime > block.timestamp, "End time must be in the future");
        require(msg.value == _initalLiquidity, "Must provide ETH for initial liquidity");

        Prediction storage prediction = predictions[nextPredictionId];
        prediction.question = _question;
        prediction.endTime = _endTime;
        prediction.ethReserve = msg.value;

        // Create tokens for each option and initialize liquidity
        for (uint256 i = 0; i < _options.length; i++) {
            prediction.options[i] = _options[i];

            // Create new token for this option
            string memory tokenName =
                string(abi.encodePacked("Prediction ", nextPredictionId.toString(), ", Option: ", _options[i]));
            string memory tokenSymbol = string(abi.encodePacked(nextPredictionId.toString(), "-", i.toString()));
            PredictionOptionToken newToken = new PredictionOptionToken(tokenName, tokenSymbol, nextPredictionId);

            prediction.optionTokens[i] = newToken;

            // Mint initial tokens and set up liquidity
            uint256 initialTokens = _initialTokenAmount;
            newToken.mint(address(this), initialTokens);
            prediction.tokenReserves[i] = initialTokens;
        }

        prediction.optionsCount = _options.length;
        nextPredictionId++;
    }

    function swapEthForTokens(uint256 _predictionId, uint256 _optionId) external payable {
        require(msg.value > 0, "Must send ETH");
        Prediction storage prediction = predictions[_predictionId];
        require(_optionId < prediction.optionsCount, "Invalid option");
        require(block.timestamp < prediction.endTime, "Prediction ended");
        require(prediction.winningOptionId == 0, "Prediction already resolved");

        uint256 tokenReserve = prediction.tokenReserves[_optionId];
        uint256 ethReserveForOption = prediction.ethReserve / prediction.optionsCount;

        // Calculate tokens to receive using modified price function
        uint256 tokensOut = price(msg.value, ethReserveForOption, tokenReserve, prediction.optionsCount);

        // Update reserves
        prediction.ethReserve += msg.value;
        prediction.tokenReserves[_optionId] -= tokensOut;

        // Transfer tokens to user
        require(prediction.optionTokens[_optionId].transfer(msg.sender, tokensOut), "Token transfer failed");
    }

    function swapTokensForEth(uint256 _predictionId, uint256 _optionId, uint256 _tokenAmount) external {
        Prediction storage prediction = predictions[_predictionId];
        require(_optionId < prediction.optionsCount, "Invalid option");
        // can only be traded as long as the prediction is not resolved and the end time is not reached
        require(block.timestamp < prediction.endTime, "Prediction ended");
        require(prediction.winningOptionId == 0, "Prediction already resolved");

        uint256 ethReserveForOption = prediction.ethReserve / prediction.optionsCount;
        uint256 tokenReserve = prediction.tokenReserves[_optionId];

        // Calculate ETH to receive using modified price function
        uint256 ethOut = price(_tokenAmount, tokenReserve, ethReserveForOption, prediction.optionsCount);

        // Update reserves
        prediction.ethReserve -= ethOut;
        prediction.tokenReserves[_optionId] += _tokenAmount;

        // Transfer tokens from user
        require(
            prediction.optionTokens[_optionId].transferFrom(msg.sender, address(this), _tokenAmount),
            "Token transfer failed"
        );

        // Transfer ETH to user
        (bool success,) = msg.sender.call{ value: ethOut }("");
        require(success, "ETH transfer failed");
    }

    // function to report the winning option
    function report(uint256 _predictionId, uint256 _winningOption) external {
        require(msg.sender == oracle, "Only oracle can report");
        Prediction storage prediction = predictions[_predictionId];
        require(block.timestamp >= prediction.endTime, "Prediction period not yet ended");
        require(_winningOption < prediction.optionsCount, "Invalid winning option");

        // Question: I think more is not needed here?
        // Set winning option
        prediction.winningOptionId = _winningOption;
        prediction.isReported = true;
    }

    // Function for winners to claim their ETH
    function redeemWinningTokens(uint256 _predictionId, uint256 _amount) external {
        Prediction storage prediction = predictions[_predictionId];
        // Q: should be enough?
        require(prediction.isReported, "Prediction not resolved yet");

        uint256 winningOptionId = prediction.winningOptionId;
        PredictionOptionToken winningToken = prediction.optionTokens[winningOptionId];
        uint256 totalSupply = winningToken.totalSupply();

        // Calculate the share of ETH to receive
        uint256 ethToReceive = (_amount * prediction.ethReserve) / totalSupply;

        // Update state
        prediction.ethReserve -= ethToReceive;
        prediction.tokenReserves[winningOptionId] -= _amount;

        // Transfer tokens from user to contract
        require(winningToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        // Transfer ETH to user
        (bool success,) = msg.sender.call{ value: ethToReceive }("");
        require(success, "ETH transfer failed");
    }

    // Optional: Add a function to check redemption rate for winning tokens
    function getRedemptionRate(uint256 _predictionId) external view returns (uint256) {
        Prediction storage prediction = predictions[_predictionId];
        require(prediction.winningOptionId < prediction.optionsCount, "Prediction not resolved yet");

        uint256 winningOptionId = prediction.winningOptionId;
        uint256 totalWinningTokens = prediction.tokenReserves[winningOptionId];

        // Calculate ETH per token
        return (prediction.ethReserve * 1e18) / totalWinningTokens; // Multiply by 1e18 for better precision
    }

    /**
     * DEX functions
     */
    //
    function price(uint256 inputAmount, uint256 inputReserve, uint256 outputReserve, uint256 numOptions)
        public
        pure
        returns (uint256 outputAmount)
    {
        require(inputAmount > 0, "Input amount must be greater than 0");
        require(inputReserve > 0 && outputReserve > 0, "Reserves must be greater than 0");

        // Adjust the constant product formula for multiple options
        // Each option's pool is effectively 1/numOptions of the total ETH
        uint256 adjustedInputReserve = inputReserve * numOptions;
        return (inputAmount * outputReserve) / (adjustedInputReserve + inputAmount);
    }

    /// TODO: to implement
    // 1. add liquidity
    // 2. remove liquidity

    // Getters

    function getPredictionQuestion(uint256 _predictionId) external view returns (string memory) {
        return predictions[_predictionId].question;
    }

    function getPredictionOption(uint256 _predictionId, uint256 _optionId) external view returns (string memory) {
        return predictions[_predictionId].options[_optionId];
    }

    function getPredictionOptionsCount(uint256 _predictionId) external view returns (uint256) {
        return predictions[_predictionId].optionsCount;
    }

    function getPredictionOptionToken(uint256 _predictionId, uint256 _optionId)
        external
        view
        returns (PredictionOptionToken)
    {
        return predictions[_predictionId].optionTokens[_optionId];
    }

    function getPredictionEndTime(uint256 _predictionId) external view returns (uint256) {
        return predictions[_predictionId].endTime;
    }

    function getPredictionEthReserve(uint256 _predictionId) external view returns (uint256) {
        return predictions[_predictionId].ethReserve;
    }

    function getTokenReserve(uint256 _predictionId, uint256 _optionId) external view returns (uint256) {
        return predictions[_predictionId].tokenReserves[_optionId];
    }

    function getPredictionWinningOptionId(uint256 _predictionId) external view returns (uint256) {
        return predictions[_predictionId].winningOptionId;
    }

    function getOptions(uint256 _predictionId, uint256 _optionId) external view returns (string memory) {
        return predictions[_predictionId].options[_optionId];
    }
}
