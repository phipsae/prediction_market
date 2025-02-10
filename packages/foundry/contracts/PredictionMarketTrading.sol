//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { PredictionOptionToken } from "./PredictionOptionToken.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { console } from "forge-std/console.sol";

// TODO: ownable, reentrancy guard, fallback, receive
contract PredictionMarketTrading {
    using Strings for uint256;

    /////////////////
    /// Errors //////
    /////////////////

    error PredictionMarketTrading__OnlyOracleCanCreatePredictions();
    error PredictionMarketTrading__NeedExactlyTwoOptions();
    error PredictionMarketTrading__EndTimeMustBeInTheFuture();
    error PredictionMarketTrading__MustProvideETHForInitialLiquidity();
    error PredictionMarketTrading__InvalidOption();
    error PredictionMarketTrading__PredictionEnded();
    error PredictionMarketTrading__PredictionAlreadyResolved();
    error PredictionMarketTrading__OnlyOracleCanReport();
    error PredictionMarketTrading__PredictionNotResolved();
    error PredictionMarketTrading__InvalidWinningOption();
    error PredictionMarketTrading__InsufficientWinningTokens();
    error PredictionMarketTrading__NoLiquidityToRemove();
    error PredictionMarketTrading__InsufficientLiquidity();
    //////////////////////////
    /// State Variables //////
    //////////////////////////

    struct Prediction {
        string question;
        uint256 endTime;
        mapping(uint256 => string) options;
        mapping(uint256 => PredictionOptionToken) optionTokens; // tracks token addresses
        mapping(uint256 => uint256) tokenReserves; // amount of tokens in the pool
        uint256 winningOptionId;
        bool isReported;
        uint256 initialTokenAmount; // per option --> to calculate the percentage of each token
        uint256 initialLiquidity; // when prediciton is opened --> to calculate the percentage of each token
        uint256 ethReserve; // eth pot which get's later distributed to winners
        uint256 lpReserve; // fees which get's later distributed to liquidity providers, TODO: find better word
        mapping(address => uint256) liquidity; // amount of liquidity added by each LP
    }

    uint256 private constant PRECISION = 1e18;
    uint256 private constant OPTIONS_COUNT = 2;
    uint256 public s_nextPredictionId = 0;
    address public s_oracle;

    mapping(uint256 => Prediction) private s_predictions;

    /////////////////////////
    /// Events //////
    /////////////////////////

    // TODO: implement events

    /////////////////
    /// Modifiers ///
    /////////////////

    modifier onlyWhenPredictionOpen(uint256 _predictionId, uint256 _optionId) {
        Prediction storage prediction = s_predictions[_predictionId];

        if (_optionId >= OPTIONS_COUNT) {
            revert PredictionMarketTrading__InvalidOption();
        }
        if (block.timestamp >= prediction.endTime) {
            revert PredictionMarketTrading__PredictionEnded();
        }
        if (prediction.winningOptionId != 0) {
            revert PredictionMarketTrading__PredictionAlreadyResolved();
        }
        _;
    }

    /////////////////
    /// Functions ///
    /////////////////

    constructor(address _oracle) {
        s_oracle = _oracle;
    }

    /**
     * @notice Create a new prediction market with initial liquidity
     * @param _question The question being predicted
     * @param _options Array of possible outcomes (must be exactly 2)
     * @param _endTime Timestamp when prediction period ends
     * @param _initialTokenAmount Amount of tokens to mint per option
     */
    function createPrediction(
        string calldata _question,
        string[] calldata _options,
        uint256 _endTime,
        uint256 _initialTokenAmount
    ) external payable {
        if (msg.sender != s_oracle) {
            revert PredictionMarketTrading__OnlyOracleCanCreatePredictions();
        }
        if (_options.length != OPTIONS_COUNT) {
            revert PredictionMarketTrading__NeedExactlyTwoOptions();
        }
        if (_endTime <= block.timestamp) {
            revert PredictionMarketTrading__EndTimeMustBeInTheFuture();
        }
        if (msg.value <= 0) {
            revert PredictionMarketTrading__MustProvideETHForInitialLiquidity();
        }

        Prediction storage prediction = s_predictions[s_nextPredictionId];
        prediction.question = _question;
        prediction.endTime = _endTime;
        prediction.ethReserve = msg.value;
        prediction.liquidity[msg.sender] += msg.value;
        prediction.initialTokenAmount = _initialTokenAmount;
        prediction.initialLiquidity = msg.value;
        // Create tokens for each option and initialize liquidity
        for (uint256 i = 0; i < _options.length; i++) {
            prediction.options[i] = _options[i];

            // Create new token for this option
            string memory tokenName =
                string(abi.encodePacked("Prediction ", s_nextPredictionId.toString(), ", Option: ", _options[i]));
            string memory tokenSymbol = string(abi.encodePacked(s_nextPredictionId.toString(), "-", i.toString()));
            PredictionOptionToken newToken = new PredictionOptionToken(tokenName, tokenSymbol, s_nextPredictionId);

            prediction.optionTokens[i] = newToken;

            // Mint initial tokens and set up liquidity
            uint256 initialTokens = _initialTokenAmount;
            newToken.mint(address(this), initialTokens);
            prediction.tokenReserves[i] = initialTokens;
        }
        s_nextPredictionId++;
    }

    /**
     * @notice Buy prediction outcome tokens with ETH,  need to call priceInETH function first to get right amount of tokens to buy
     * @param _predictionId ID of the prediction market
     * @param _optionId ID of the option to buy tokens for (0 or 1)
     * @param _amountTokenToBuy Amount of tokens to purchase
     */
    function buyTokenWithETH(uint256 _predictionId, uint256 _optionId, uint256 _amountTokenToBuy)
        external
        payable
        onlyWhenPredictionOpen(_predictionId, _optionId)
    {
        Prediction storage prediction = s_predictions[_predictionId];
        uint256 initialTokenAmount = prediction.initialTokenAmount;
        uint256 currentTokenReserve = prediction.tokenReserves[_optionId];

        // Calculate eth need to buy amount of tokens
        uint256 avgPrice =
            avgPriceInEth(initialTokenAmount, currentTokenReserve, prediction.ethReserve, _amountTokenToBuy);

        uint256 ethNeeded = avgPrice * _amountTokenToBuy / PRECISION;

        require(msg.value == ethNeeded, "Must send right amount of ETH");

        prediction.tokenReserves[_optionId] -= _amountTokenToBuy;
        prediction.lpReserve += msg.value;

        prediction.optionTokens[_optionId].transfer(msg.sender, _amountTokenToBuy);
    }

    /**
     * @notice Sell prediction outcome tokens for ETH,  need to call priceInETH function first to get right amount of tokens to buy
     * @param _predictionId ID of the prediction market
     * @param _optionId ID of the option to sell tokens for (0 or 1)
     * @param _tokenAmountToSell Amount of tokens to sell
     */
    function sellTokensForEth(uint256 _predictionId, uint256 _optionId, uint256 _tokenAmountToSell)
        external
        onlyWhenPredictionOpen(_predictionId, _optionId)
    {
        Prediction storage prediction = s_predictions[_predictionId];

        uint256 initialTokenAmount = prediction.initialTokenAmount;
        uint256 currentTokenReserve = prediction.tokenReserves[_optionId];

        uint256 avgPrice =
            sellAvgPriceInEth(initialTokenAmount, currentTokenReserve, prediction.ethReserve, _tokenAmountToSell);

        uint256 ethToReceive = avgPrice * _tokenAmountToSell / PRECISION;

        prediction.tokenReserves[_optionId] += _tokenAmountToSell;
        prediction.lpReserve -= ethToReceive;

        prediction.optionTokens[_optionId].transferFrom(msg.sender, address(this), _tokenAmountToSell);

        (bool success,) = msg.sender.call{ value: ethToReceive }("");
        require(success, "ETH transfer failed");
    }

    // function to report the winning option
    function report(uint256 _predictionId, uint256 _winningOption) external {
        if (msg.sender != s_oracle) {
            revert PredictionMarketTrading__OnlyOracleCanReport();
        }
        Prediction storage prediction = s_predictions[_predictionId];
        if (block.timestamp < prediction.endTime) {
            revert PredictionMarketTrading__PredictionNotResolved();
        }
        if (_winningOption >= OPTIONS_COUNT) {
            revert PredictionMarketTrading__InvalidWinningOption();
        }
        // Set winning option
        prediction.winningOptionId = _winningOption;
        prediction.isReported = true;
    }

    /// TODO: would be proably nice to have some kind of burn mechanism for the tokens with no value left
    // Function for winners to claim their ETH
    function redeemWinningTokens(uint256 _predictionId, uint256 _amount) external {
        Prediction storage prediction = s_predictions[_predictionId];
        // Q: should be enough?
        if (!prediction.isReported) {
            revert PredictionMarketTrading__PredictionNotResolved();
        }
        // Check that prediction has been reported and get winning option ID
        uint256 winningOptionId = prediction.winningOptionId;
        PredictionOptionToken winningToken = prediction.optionTokens[winningOptionId];

        // Check caller has enough winning tokens
        if (winningToken.balanceOf(msg.sender) < _amount) {
            revert PredictionMarketTrading__InsufficientWinningTokens();
        }

        // TODO: check if this is correct
        uint256 totalSupply = winningToken.totalSupply();

        // Calculate the share of ETH to receive
        uint256 ethToReceive = (_amount * prediction.ethReserve) / totalSupply;

        // Update state
        prediction.ethReserve -= ethToReceive;
        prediction.tokenReserves[winningOptionId] -= _amount;

        // Transfer tokens from user to contract
        winningToken.transferFrom(msg.sender, address(this), _amount);
        // burn token and reduce total supply
        winningToken.burn(address(this), _amount);

        // Transfer ETH to user
        (bool success,) = msg.sender.call{ value: ethToReceive }("");
        require(success, "ETH transfer failed");
    }

    // function to get for a specific address the amount of eth he can get back if he wons
    function getRedemptionRate(uint256 _predictionId) external view returns (uint256) {
        if (!s_predictions[_predictionId].isReported) {
            revert PredictionMarketTrading__PredictionNotResolved();
        }
        Prediction storage prediction = s_predictions[_predictionId];
        uint256 totalSupply = prediction.optionTokens[prediction.winningOptionId].totalSupply();
        return (prediction.ethReserve * PRECISION) / totalSupply;
    }

    /**
     * DEX functions
     */
    function avgPriceInEth(
        uint256 _initialTokenAmount,
        uint256 _currentTokenReserve,
        uint256 _ethReserve,
        uint256 _tradingAmount
    ) public pure returns (uint256) {
        // First calculate the average of numerator1 and numerator2 to reduce the size
        uint256 num1 = (PRECISION - ((_currentTokenReserve * PRECISION) / (_initialTokenAmount * 2)));
        uint256 num2 = (PRECISION - (((_currentTokenReserve - _tradingAmount) * PRECISION) / (_initialTokenAmount * 2)));

        // Calculate average first to reduce number size
        uint256 avgNumerator = (num1 + num2) / 2;

        // Then multiply by tokenRatio
        uint256 tokenRatio = (_ethReserve * PRECISION * PRECISION) / _initialTokenAmount;

        uint256 result = (tokenRatio * avgNumerator) / PRECISION / PRECISION;

        // Final calculation with reduced scaling factors
        return result;
    }

    // - operation is different to function above
    function sellAvgPriceInEth(
        uint256 _initialTokenAmount,
        uint256 _currentTokenReserve,
        uint256 _ethReserve,
        uint256 _tradingAmount
    ) public pure returns (uint256) {
        // First calculate the average of numerator1 and numerator2 to reduce the size
        uint256 num1 = (PRECISION - ((_currentTokenReserve * PRECISION) / (_initialTokenAmount * 2)));
        uint256 num2 = (PRECISION - (((_currentTokenReserve + _tradingAmount) * PRECISION) / (_initialTokenAmount * 2)));

        // Calculate average first to reduce number size
        uint256 avgNumerator = (num1 + num2) / 2;

        // Then multiply by tokenRatio
        uint256 tokenRatio = (_ethReserve * PRECISION * PRECISION) / _initialTokenAmount;

        uint256 result = (tokenRatio * avgNumerator) / PRECISION / PRECISION;

        // Final calculation with reduced scaling factors
        return result;
    }

    /// TODO: to implement
    // 1. add liquidity to LP pool
    function addLiquidity(uint256 _predictionId) external payable {
        Prediction storage prediction = s_predictions[_predictionId];
        if (prediction.isReported) {
            revert PredictionMarketTrading__PredictionAlreadyResolved();
        }

        // increase the gambling pot because more tokens are added
        prediction.ethReserve += msg.value;
        prediction.liquidity[msg.sender] += msg.value;

        // the amount of all created tokens in the pool, to calcualte the percentage of each token
        uint256 totalTokenReserves = 0;
        for (uint256 i = 0; i < OPTIONS_COUNT; i++) {
            totalTokenReserves += prediction.tokenReserves[i];
        }

        for (uint256 i = 0; i < OPTIONS_COUNT; i++) {
            PredictionOptionToken optionToken = prediction.optionTokens[i];
            //calculate the amount of tokens to mint, just simple ratio
            uint256 tokensToMint = (msg.value * prediction.tokenReserves[i]) / totalTokenReserves;
            prediction.tokenReserves[i] += tokensToMint;
            optionToken.mint(address(this), tokensToMint);
            // track added liquidty to have access to rewards and rest of tokens when prediciton ends
        }
    }

    /**
     * @notice Remove liquidity from the prediction market and burn corresponding tokens, if you remove liquidity before prediction ends you got no share of lpReserve
     * @param _predictionId ID of the prediction market
     * @param _ethToWithdraw Amount of ETH to withdraw from liquidity pool
     */
    function removeLiquidity(uint256 _predictionId, uint256 _ethToWithdraw) external {
        Prediction storage prediction = s_predictions[_predictionId];
        if (prediction.isReported) {
            revert PredictionMarketTrading__PredictionAlreadyResolved();
        }

        uint256 liquidity = prediction.liquidity[msg.sender];
        if (liquidity == 0) {
            revert PredictionMarketTrading__NoLiquidityToRemove();
        }
        if (_ethToWithdraw > liquidity) {
            revert PredictionMarketTrading__InsufficientLiquidity();
        }

        uint256 ethReserveShare = _ethToWithdraw * PRECISION / prediction.ethReserve;
        prediction.ethReserve -= _ethToWithdraw;
        prediction.liquidity[msg.sender] -= _ethToWithdraw;

        for (uint256 i = 0; i < OPTIONS_COUNT; i++) {
            PredictionOptionToken optionToken = prediction.optionTokens[i];
            uint256 tokensToBurn = (ethReserveShare * prediction.tokenReserves[i]) / PRECISION;
            optionToken.burn(address(this), tokensToBurn);
            prediction.tokenReserves[i] -= tokensToBurn;
        }

        (bool success,) = msg.sender.call{ value: _ethToWithdraw }("");
        require(success, "ETH transfer failed");
    }

    //////////////////////////////////////////
    /// Private & External View Functions ////
    //////////////////////////////////////////

    function getPredictionQuestion(uint256 _predictionId) external view returns (string memory) {
        return s_predictions[_predictionId].question;
    }

    function getPredictionOption(uint256 _predictionId, uint256 _optionId) external view returns (string memory) {
        return s_predictions[_predictionId].options[_optionId];
    }

    function getPredictionOptionsCount() external pure returns (uint256) {
        return OPTIONS_COUNT;
    }

    function getPredictionOptionToken(uint256 _predictionId, uint256 _optionId)
        external
        view
        returns (PredictionOptionToken)
    {
        return s_predictions[_predictionId].optionTokens[_optionId];
    }

    function getPredictionEndTime(uint256 _predictionId) external view returns (uint256) {
        return s_predictions[_predictionId].endTime;
    }

    function getPredictionEthReserve(uint256 _predictionId) external view returns (uint256) {
        return s_predictions[_predictionId].ethReserve;
    }

    function getPredictionLpReserve(uint256 _predictionId) external view returns (uint256) {
        return s_predictions[_predictionId].lpReserve;
    }

    function getTokenReserve(uint256 _predictionId, uint256 _optionId) external view returns (uint256) {
        return s_predictions[_predictionId].tokenReserves[_optionId];
    }

    function getPredictionWinningOptionId(uint256 _predictionId) external view returns (uint256) {
        return s_predictions[_predictionId].winningOptionId;
    }

    function getOptions(uint256 _predictionId, uint256 _optionId) external view returns (string memory) {
        return s_predictions[_predictionId].options[_optionId];
    }

    function getOptionsToken(uint256 _predictionId, uint256 _optionId) external view returns (PredictionOptionToken) {
        return s_predictions[_predictionId].optionTokens[_optionId];
    }

    function getLpReserve(uint256 _predictionId) external view returns (uint256) {
        return s_predictions[_predictionId].lpReserve;
    }

    function getInitialTokenAmount(uint256 _predictionId) external view returns (uint256) {
        return s_predictions[_predictionId].initialTokenAmount;
    }

    function getInitialLiquidity(uint256 _predictionId) external view returns (uint256) {
        return s_predictions[_predictionId].initialLiquidity;
    }

    function getLiquidity(uint256 _predictionId, address _address) external view returns (uint256) {
        return s_predictions[_predictionId].liquidity[_address];
    }
}
