//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { PredictionOptionToken } from "./PredictionOptionToken.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { console } from "forge-std/console.sol";

contract PredictionMarketTrading {
    using Strings for uint256;

    struct Prediction {
        string question;
        uint256 endTime;
        mapping(uint256 => string) options;
        mapping(uint256 => PredictionOptionToken) optionTokens; // tracks token addresses
        mapping(uint256 => uint256) tokenReserves; // amount of tokens in the pool
        uint256 winningOptionId;
        bool isReported;
        uint256 optionsCount;
        uint256 initialTokenAmount; // per option --> to calculate the percentage of each token
        uint256 initialLiquidity; // when prediciton is opened --> to calculate the percentage of each token
        uint256 ethReserve; // eth pot which get's later distributed to winners
        uint256 lpReserve; // fees which get's later distributed to liquidity providers, TODO: find better word
        mapping(address => uint256) liquidity; // amount of liquidity added by each LP
    }

    mapping(uint256 => Prediction) public predictions;
    uint256 public nextPredictionId = 0;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) public betsPerGambler;
    address public oracle;

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
        prediction.liquidity[msg.sender] += msg.value;
        prediction.initialTokenAmount = _initialTokenAmount;
        prediction.initialLiquidity = _initalLiquidity;
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

    // need to call priceInETH function first to get right amount of tokens to buy
    function buyTokenWithETH(
        uint256 _predictionId,
        uint256 _optionId,
        uint256 _amountETHrequired,
        uint256 _amountTokenToBuy
    ) external payable {
        require(msg.value == _amountETHrequired, "Must send right amount of ETH");
        Prediction storage prediction = predictions[_predictionId];
        require(_optionId < prediction.optionsCount, "Invalid option");
        require(block.timestamp < prediction.endTime, "Prediction ended");
        require(prediction.winningOptionId == 0, "Prediction already resolved");

        uint256 initialTokenAmount = prediction.initialTokenAmount;
        uint256 currentTokenReserve = prediction.tokenReserves[_optionId];

        // Calculate eth need to buy amount of tokens
        uint256 ethNeeded =
            priceInEth(initialTokenAmount, currentTokenReserve, prediction.ethReserve, _amountTokenToBuy);

        require(msg.value == ethNeeded, "Must send right amount of ETH");

        prediction.tokenReserves[_optionId] -= _amountTokenToBuy;
        prediction.lpReserve += msg.value;

        prediction.optionTokens[_optionId].transfer(msg.sender, _amountTokenToBuy);
        (bool success,) = address(this).call{ value: _amountETHrequired }("");
        require(success, "ETH transfer failed");
    }

    // function swapTokensForEth(uint256 _predictionId, uint256 _optionId, uint256 _tokenAmount) external {
    //     Prediction storage prediction = predictions[_predictionId];
    //     require(_optionId < prediction.optionsCount, "Invalid option");
    //     // can only be traded as long as the prediction is not resolved and the end time is not reached
    //     require(block.timestamp < prediction.endTime, "Prediction ended");
    //     require(prediction.winningOptionId == 0, "Prediction already resolved");
    // }

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

    // // Function for winners to claim their ETH
    // function redeemWinningTokens(uint256 _predictionId, uint256 _amount) external {
    //     Prediction storage prediction = predictions[_predictionId];
    //     // Q: should be enough?
    //     require(prediction.isReported, "Prediction not resolved yet");

    //     uint256 winningOptionId = prediction.winningOptionId;
    //     PredictionOptionToken winningToken = prediction.optionTokens[winningOptionId];
    //     uint256 totalSupply = winningToken.totalSupply();

    //     // Calculate the share of ETH to receive
    //     uint256 ethToReceive = (_amount * prediction.ethReserve) / totalSupply;

    //     // Update state
    //     prediction.ethReserve -= ethToReceive;
    //     prediction.tokenReserves[winningOptionId] -= _amount;

    //     // Transfer tokens from user to contract
    //     require(winningToken.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

    //     // Transfer ETH to user
    //     (bool success,) = msg.sender.call{ value: ethToReceive }("");
    //     require(success, "ETH transfer failed");
    // }

    // // function to get for a specific address the amount of eth he can get back if he wons
    // function getRedemptionRate(uint256 _predictionId) external view returns (uint256) {
    // }

    /**
     * DEX functions
     */

    // only for two options, returns how much a user needs to pay for one token a certain amount of token 1
    function priceInEth(
        uint256 _initialTokenAmount,
        uint256 _currentTokenReserve,
        uint256 _ethReserve,
        uint256 _tradingAmount
    ) public view returns (uint256) {
        uint256 tokenRatio = _ethReserve / _initialTokenAmount;
        console.log("tokenRatio", tokenRatio);

        uint256 numerator1 = ((1e18 - ((_currentTokenReserve * 1e18) / _initialTokenAmount / 2)) * 1000) / 1e18;
        console.log("numerator1", numerator1);

        uint256 numberator2 =
            ((1e18 - (((_currentTokenReserve - _tradingAmount) * 1e18) / _initialTokenAmount / 2)) * 1000) / 1e18;
        console.log("numberator2", numberator2);
        return tokenRatio * (numerator1 + numberator2) / 2 / 1000;
    }

    // for getting eth in
    // function priceInToken(
    //     uint256 _initialTokenAmount,
    //     uint256 _currentTokenReserve,
    //     uint256 _ethReserve,
    //     uint256 _amountETH
    // ) public view returns (uint256) {
    //     // 2 * _currentTokenReserve - _initialTokenAmount
    //     // _amountETH * _initialTokenAmount** / _ethReserve
    //     return 2 * _currentTokenReserve - _initialTokenAmount
    //         + _amountETH * _initialTokenAmount * _initialTokenAmount / _ethReserve;
    // }

    /// TODO: to implement
    // 1. add liquidity to LP pool
    function addLiquidity(uint256 _predictionId) external payable {
        //TODO: add checks
        Prediction storage prediction = predictions[_predictionId];
        // increase the gambling pot because more tokens are added
        prediction.ethReserve += msg.value;
        uint256 optionsCount = prediction.optionsCount;

        // the amount of all created tokens in the pool, to calcualte the percentage of each token
        uint256 totalTokenReserves = 0;
        for (uint256 i = 0; i < optionsCount; i++) {
            totalTokenReserves += prediction.tokenReserves[i];
        }

        for (uint256 i = 0; i < optionsCount; i++) {
            PredictionOptionToken optionToken = prediction.optionTokens[i];
            //calculate the amount of tokens to mint, just simple ratio
            uint256 tokensToMint = (msg.value * prediction.tokenReserves[i]) / totalTokenReserves;
            prediction.tokenReserves[i] += tokensToMint;
            optionToken.mint(address(this), tokensToMint);
            // track added liquidty to have access to rewards and rest of tokens when prediciton ends
            prediction.liquidity[msg.sender] += msg.value;
        }
    }
    // 2. remove liquidity

    function removeLiquidity(uint256 _predictionId) external payable { }

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
