//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { PredictionMarketToken } from "./PredictionMarketToken.sol";

contract PredictionMarketChallenge {
    /////////////////
    /// Errors //////
    /////////////////

    error PredictionMarket__MustProvideETHForInitialLiquidity();
    error PredictionMarket__InvalidOption();
    error PredictionMarket__PredictionAlreadyResolved();
    error PredictionMarket__OnlyOracleCanReport();
    error PredictionMarket__PredictionNotResolved();
    error PredictionMarket__InsufficientWinningTokens();

    //////////////////////////
    /// State Variables //////
    //////////////////////////

    struct Prediction {
        string question;
        string option1;
        string option2;
        PredictionMarketToken optionToken1;
        PredictionMarketToken optionToken2;
        uint256 tokenReserve1;
        uint256 tokenReserve2;
        uint256 winningOptionId;
        bool isReported;
        uint256 tokenRatio;
        uint256 initialTokenAmount; // per option --> to calculate the percentage of each token
        uint256 initialLiquidity; // when prediction is opened --> to calculate the percentage of each token
        uint256 ethReserve; // eth pot which get's later distributed to winners
        uint256 lpReserve; // fees which get's later distributed to liquidity providers, TODO: find better word
    }

    uint256 private constant PRECISION = 1e18;
    address public oracle;
    address public owner;

    Prediction public prediction;

    /////////////////////////
    /// Events //////
    /////////////////////////

    // TODO: implement events

    /////////////////
    /// Modifiers ///
    /////////////////

    modifier onlyPredictionOpen() {
        if (prediction.isReported) {
            revert PredictionMarket__PredictionAlreadyResolved();
        }
        _;
    }

    modifier withValidOption(uint256 _optionId) {
        if (_optionId >= 2) {
            revert PredictionMarket__InvalidOption();
        }
        _;
    }

    /////////////////
    /// Functions ///
    /////////////////

    constructor(
        address _oracle,
        string memory _question,
        string memory _option1,
        string memory _option2,
        uint256 _initialTokenAmount
    ) payable {
        oracle = _oracle;

        if (msg.value <= 0) {
            revert PredictionMarket__MustProvideETHForInitialLiquidity();
        }

        owner = msg.sender;

        prediction.question = _question;
        prediction.option1 = _option1;
        prediction.option2 = _option2;
        prediction.ethReserve = msg.value;
        prediction.initialTokenAmount = _initialTokenAmount;
        prediction.initialLiquidity = msg.value;
        prediction.tokenRatio = (msg.value * PRECISION * PRECISION) / _initialTokenAmount;

        // Create tokens for each option
        prediction.optionToken1 = new PredictionMarketToken(_option1, _option1);

        prediction.optionToken1.mint(address(this), _initialTokenAmount);
        prediction.tokenReserve1 = _initialTokenAmount;

        prediction.optionToken2 = new PredictionMarketToken(_option2, _option2);

        prediction.optionToken2.mint(address(this), _initialTokenAmount);
        prediction.tokenReserve2 = _initialTokenAmount;
    }

    /**
     * @notice Buy prediction outcome tokens with ETH, need to call priceInETH function first to get right amount of tokens to buy
     * @param _optionId ID of the option to buy tokens for (0 or 1)
     * @param _amountTokenToBuy Amount of tokens to purchase
     */
    function buyTokenWithETH(uint256 _optionId, uint256 _amountTokenToBuy)
        external
        payable
        onlyPredictionOpen
        withValidOption(_optionId)
    {
        // Calculate eth need to buy amount of tokens
        uint256 ethNeeded = totalPriceInEth(_optionId, _amountTokenToBuy);

        require(msg.value == ethNeeded, "Must send right amount of ETH");

        if (_optionId == 0) {
            prediction.tokenReserve1 -= _amountTokenToBuy;
            prediction.optionToken1.transfer(msg.sender, _amountTokenToBuy);
        } else {
            prediction.tokenReserve2 -= _amountTokenToBuy;
            prediction.optionToken2.transfer(msg.sender, _amountTokenToBuy);
        }

        prediction.lpReserve += msg.value;
    }

    /**
     * @notice Sell prediction outcome tokens for ETH, need to call priceInETH function first to get right amount of tokens to buy
     * @param _optionId ID of the option to sell tokens for (0 or 1)
     * @param _tokenAmountToSell Amount of tokens to sell
     */
    function sellTokensForEth(uint256 _optionId, uint256 _tokenAmountToSell)
        external
        onlyPredictionOpen
        withValidOption(_optionId)
    {
        uint256 ethToReceive = sellTotalPriceInEth(_optionId, _tokenAmountToSell);

        if (_optionId == 0) {
            prediction.tokenReserve1 += _tokenAmountToSell;
            prediction.optionToken1.transferFrom(msg.sender, address(this), _tokenAmountToSell);
        } else {
            prediction.tokenReserve2 += _tokenAmountToSell;
            prediction.optionToken2.transferFrom(msg.sender, address(this), _tokenAmountToSell);
        }
        prediction.lpReserve -= ethToReceive;

        (bool success,) = msg.sender.call{ value: ethToReceive }("");
        require(success, "ETH transfer failed");
    }

    // function to report the winning option
    function report(uint256 _winningOption) external onlyPredictionOpen withValidOption(_winningOption) {
        if (msg.sender != oracle) {
            revert PredictionMarket__OnlyOracleCanReport();
        }
        // Set winning option
        prediction.winningOptionId = _winningOption;
        prediction.isReported = true;
    }

    /// TODO: would be proably nice to have some kind of burn mechanism for the tokens with no value left
    // Function for winners to claim their ETH
    function redeemWinningTokens(uint256 _amount) external {
        if (!prediction.isReported) {
            revert PredictionMarket__PredictionNotResolved();
        }

        uint256 winningOptionId = prediction.winningOptionId;
        PredictionMarketToken winningToken;

        if (winningOptionId == 0) {
            winningToken = prediction.optionToken1;
        } else {
            winningToken = prediction.optionToken2;
        }

        // Check caller has enough winning tokens
        if (winningToken.balanceOf(msg.sender) < _amount) {
            revert PredictionMarket__InsufficientWinningTokens();
        }

        // TODO: check if this is correct
        uint256 totalSupply = winningToken.totalSupply();

        // Calculate the share of ETH to receive
        uint256 ethToReceive = (_amount * prediction.ethReserve) / totalSupply;

        // Update state
        prediction.ethReserve -= ethToReceive;

        // Update token reserves
        if (winningOptionId == 0) {
            prediction.tokenReserve1 -= _amount;
        } else {
            prediction.tokenReserve2 -= _amount;
        }

        // burn token and reduce total supply
        winningToken.burn(msg.sender, _amount);

        // Transfer ETH to user
        (bool success,) = msg.sender.call{ value: ethToReceive }("");
        require(success, "ETH transfer failed");
    }

    function totalPriceInEth(uint256 _tokenNumber, uint256 _tradingAmount) public view returns (uint256) {
        uint256 currentTokenReserve;
        if (_tokenNumber == 0) {
            currentTokenReserve = prediction.tokenReserve1;
        } else {
            currentTokenReserve = prediction.tokenReserve2;
        }

        // First calculate the average of numerator1 and numerator2 to reduce the size
        uint256 num1 = (PRECISION - ((currentTokenReserve * PRECISION) / (prediction.initialTokenAmount * 2)));
        uint256 num2 =
            (PRECISION - (((currentTokenReserve - _tradingAmount) * PRECISION) / (prediction.initialTokenAmount * 2)));

        // Calculate average first to reduce number size
        uint256 avgNumerator = (num1 + num2) / 2;

        uint256 avg = (prediction.tokenRatio * avgNumerator) / PRECISION / PRECISION;

        uint256 result = (avg * _tradingAmount) / PRECISION;

        // Final calculation with reduced scaling factors
        return result;
    }

    function sellTotalPriceInEth(uint256 _tokenNumber, uint256 _tradingAmount) public view returns (uint256) {
        uint256 currentTokenReserve;
        if (_tokenNumber == 0) {
            currentTokenReserve = prediction.tokenReserve1;
        } else {
            currentTokenReserve = prediction.tokenReserve2;
        }

        // First calculate the average of numerator1 and numerator2 to reduce the size
        uint256 num1 = (PRECISION - ((currentTokenReserve * PRECISION) / (prediction.initialTokenAmount * 2)));
        uint256 num2 =
            (PRECISION - (((currentTokenReserve + _tradingAmount) * PRECISION) / (prediction.initialTokenAmount * 2)));

        // Calculate average first to reduce number size
        uint256 avgNumerator = (num1 + num2) / 2;

        uint256 avg = (prediction.tokenRatio * avgNumerator) / PRECISION / PRECISION;

        uint256 result = (avg * _tradingAmount) / PRECISION;

        // Final calculation with reduced scaling factors
        return result;
    }
}
