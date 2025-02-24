//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { PredictionMarketToken } from "./PredictionMarketToken.sol";

contract PredictionMarketChallenge {
    /////////////////
    /// Errors //////
    /////////////////

    error PredictionMarketChallenge__MustProvideETHForInitialLiquidity();
    error PredictionMarketChallenge__InvalidOption();
    error PredictionMarketChallenge__PredictionAlreadyResolved();
    error PredictionMarketChallenge__OnlyOracleCanReport();
    error PredictionMarketChallenge__PredictionNotResolved();
    error PredictionMarketChallenge__InsufficientWinningTokens();
    error PredictionMarketChallenge__AmountMustBeGreaterThanZero();
    error PredictionMarketChallenge__MustSendExactETHAmount();
    error PredictionMarketChallenge__InsufficientTokenReserve();
    error PredictionMarketChallenge__TokenTransferFailed();
    error PredictionMarketChallenge__NoTokensToRedeem();
    error PredictionMarketChallenge__ETHTransferFailed();
    error PredictionMarketChallenge__InsufficientBalance(uint256 _tradingAmount, uint256 _userBalance);
    error PredictionMarketChallenge__InsufficientAllowance(uint256 _tradingAmount, uint256 _allowance);

    //////////////////////////
    /// State Variables //////
    //////////////////////////

    enum Option {
        YES,
        NO
    }

    uint256 private constant PRECISION = 1e18;
    uint256 public constant INITIAL_TOKEN_AMOUNT = 1000 ether;

    address public immutable i_oracle; // is owner of contract as well
    uint256 public immutable i_initialTokenRatio;
    PredictionMarketToken public immutable i_optionToken1;
    PredictionMarketToken public immutable i_optionToken2;

    string public i_question;
    PredictionMarketToken public s_winningToken;
    bool public s_isReported;
    uint256 public s_ethCollateral; // used to be ethReserve; eth pot which get's later distributed to winners
    uint256 public s_lpTradingRevenue; // used to be lpReserve; fees which get's later distributed to liquidity providers, TODO: find better word

    /////////////////////////
    /// Events //////
    /////////////////////////

    event TokensPurchased(address indexed buyer, Option option, uint256 amount, uint256 ethAmount);
    event TokensSold(address indexed seller, Option option, uint256 amount, uint256 ethAmount);
    event WinningTokensRedeemed(address indexed redeemer, uint256 amount, uint256 ethAmount);

    /////////////////
    /// Modifiers ///
    /////////////////

    modifier onlyPredictionOpen() {
        if (s_isReported) {
            revert PredictionMarketChallenge__PredictionAlreadyResolved();
        }
        _;
    }

    modifier withValidOption(Option _option) {
        if (_option != Option.YES && _option != Option.NO) {
            revert PredictionMarketChallenge__InvalidOption();
        }
        _;
    }

    /////////////////
    /// Functions ///
    /////////////////

    constructor(address _oracle, string memory _question) payable {
        i_oracle = _oracle;
        i_question = _question;
        if (msg.value <= 0) {
            revert PredictionMarketChallenge__MustProvideETHForInitialLiquidity();
        }

        s_ethCollateral = msg.value;
        i_initialTokenRatio = (msg.value * PRECISION * PRECISION) / INITIAL_TOKEN_AMOUNT;

        i_optionToken1 = new PredictionMarketToken("Yes", "Y", INITIAL_TOKEN_AMOUNT);
        i_optionToken2 = new PredictionMarketToken("No", "N", INITIAL_TOKEN_AMOUNT);
    }

    /**
     * @notice Buy prediction outcome tokens with ETH, need to call priceInETH function first to get right amount of tokens to buy
     * @param _option The option (YES or NO) to buy tokens for
     * @param _amountTokenToBuy Amount of tokens to purchase
     */
    function buyTokensWithETH(Option _option, uint256 _amountTokenToBuy)
        external
        payable
        onlyPredictionOpen
        withValidOption(_option)
    {
        if (_amountTokenToBuy == 0) {
            revert PredictionMarketChallenge__AmountMustBeGreaterThanZero();
        }

        uint256 ethNeeded = getBuyPriceInEth(_option, _amountTokenToBuy);
        if (msg.value != ethNeeded) {
            revert PredictionMarketChallenge__MustSendExactETHAmount();
        }

        PredictionMarketToken optionToken = _option == Option.YES ? i_optionToken1 : i_optionToken2;

        if (_amountTokenToBuy > i_optionToken1.balanceOf(address(this))) {
            revert PredictionMarketChallenge__InsufficientTokenReserve();
        }

        s_lpTradingRevenue += msg.value;

        bool success = optionToken.transfer(msg.sender, _amountTokenToBuy);
        if (!success) {
            revert PredictionMarketChallenge__TokenTransferFailed();
        }

        emit TokensPurchased(msg.sender, _option, _amountTokenToBuy, msg.value);
    }

    /**
     * @notice Sell prediction outcome tokens for ETH, need to call priceInETH function first to get right amount of tokens to buy
     * @param _option The option (YES or NO) to sell tokens for
     * @param _tradingAmount The amount of tokens to sell
     */
    function sellTokensForEth(Option _option, uint256 _tradingAmount)
        external
        onlyPredictionOpen
        withValidOption(_option)
    {
        if (_tradingAmount == 0) {
            revert PredictionMarketChallenge__AmountMustBeGreaterThanZero();
        }

        uint256 ethToReceive = getSellPriceInEth(_option, _tradingAmount);

        PredictionMarketToken optionToken = _option == Option.YES ? i_optionToken1 : i_optionToken2;

        uint256 userBalance = optionToken.balanceOf(msg.sender);
        if (userBalance < _tradingAmount) {
            revert PredictionMarketChallenge__InsufficientBalance(_tradingAmount, userBalance);
        }

        uint256 allowance = optionToken.allowance(msg.sender, address(this));
        if (allowance < _tradingAmount) {
            revert PredictionMarketChallenge__InsufficientAllowance(_tradingAmount, allowance);
        }

        s_lpTradingRevenue -= ethToReceive;

        (bool sent,) = msg.sender.call{ value: ethToReceive }("");
        if (!sent) {
            revert PredictionMarketChallenge__ETHTransferFailed();
        }

        bool success = optionToken.transferFrom(msg.sender, address(this), _tradingAmount);
        if (!success) {
            revert PredictionMarketChallenge__TokenTransferFailed();
        }

        emit TokensSold(msg.sender, _option, _tradingAmount, ethToReceive);
    }

    /**
     * @notice Report the winning option for the prediction
     * @param _winningOption The winning option (YES or NO)
     */
    function report(Option _winningOption) external onlyPredictionOpen withValidOption(_winningOption) {
        if (msg.sender != i_oracle) {
            revert PredictionMarketChallenge__OnlyOracleCanReport();
        }
        // Set winning option
        s_winningToken = _winningOption == Option.YES ? i_optionToken1 : i_optionToken2;
        s_isReported = true;
    }

    /**
     * @notice Redeem winning tokens for ETH after prediction is resolved, winning tokens are burned and user receives ETH
     * @param _amount The amount of winning tokens to redeem
     */
    function redeemWinningTokens(uint256 _amount) external {
        if (_amount == 0) {
            revert PredictionMarketChallenge__AmountMustBeGreaterThanZero();
        }

        if (!s_isReported) {
            revert PredictionMarketChallenge__PredictionNotResolved();
        }

        if (s_winningToken.balanceOf(msg.sender) < _amount) {
            revert PredictionMarketChallenge__InsufficientWinningTokens();
        }

        /// TODO: check if really needed
        uint256 totalSupply = s_winningToken.totalSupply();
        uint256 ethToReceive = (_amount * s_ethCollateral) / totalSupply;

        s_ethCollateral -= ethToReceive;

        s_winningToken.burn(msg.sender, _amount);

        (bool success,) = msg.sender.call{ value: ethToReceive }("");
        if (!success) {
            revert PredictionMarketChallenge__ETHTransferFailed();
        }

        emit WinningTokensRedeemed(msg.sender, _amount, ethToReceive);
    }

    /**
     * @notice Calculate the total ETH price for buying tokens
     * @param _option The option (YES or NO) to buy tokens for
     * @param _tradingAmount The amount of tokens to buy
     * @return The total ETH price
     */
    function getBuyPriceInEth(Option _option, uint256 _tradingAmount) public view returns (uint256) {
        return _calculatePriceInEth(_option, _tradingAmount, false);
    }

    /**
     * @notice Calculate the total ETH price for selling tokens
     * @param _option The option (YES or NO) to sell tokens for
     * @param _tradingAmount The amount of tokens to sell
     * @return The total ETH price
     */
    function getSellPriceInEth(Option _option, uint256 _tradingAmount) public view returns (uint256) {
        return _calculatePriceInEth(_option, _tradingAmount, true);
    }

    /////////////////////////
    /// Helper Functions ///
    ////////////////////////

    /**
     * @dev Internal helper to calculate ETH price for both buying and selling
     * @param _option The option (YES or NO)
     * @param _tradingAmount The amount of tokens
     * @param _isSelling Whether this is a sell calculation
     */
    function _calculatePriceInEth(
        Option _option,
        uint256 _tradingAmount,
        bool _isSelling
    ) private view returns (uint256) {
        uint256 currentTokenReserve = _option == Option.YES
            ? i_optionToken1.balanceOf(address(this))
            : i_optionToken2.balanceOf(address(this));
        uint256 newReserve = _isSelling
            ? currentTokenReserve + _tradingAmount
            : currentTokenReserve - _tradingAmount;
        uint256 currentOtherTokenReserve = _option == Option.YES
            ? i_optionToken2.balanceOf(address(this))
            : i_optionToken1.balanceOf(address(this));

        uint256 currentOtherTokenSupply = INITIAL_TOKEN_AMOUNT -
            currentOtherTokenReserve;
        uint256 currentTokenSupply = INITIAL_TOKEN_AMOUNT - currentTokenReserve;
        uint256 newSupply = INITIAL_TOKEN_AMOUNT - newReserve;

        uint256 probabilityStart;

        if (currentTokenSupply + currentOtherTokenSupply == 0) {
            probabilityStart = PRECISION / 2;
        } else {
            probabilityStart =
                (currentTokenSupply * PRECISION) /
                (currentTokenSupply + currentOtherTokenSupply);
        }

        uint256 probabilityEnd;

        if (newSupply + currentOtherTokenSupply == 0) {
            probabilityEnd = PRECISION / 2;
        } else {
            probabilityEnd =
                (newSupply * PRECISION) /
                (newSupply + currentOtherTokenSupply);
        }

        uint256 probabilityAvg = (probabilityStart + probabilityEnd) / 2;

        uint256 avg = (i_initialTokenRatio * probabilityAvg) /
            PRECISION /
            PRECISION;
        return (avg * _tradingAmount) / PRECISION;
    }

    /////////////////////////
    /// Getter Functions ///
    ////////////////////////

    function prediction()
        external
        view
        returns (
            string memory question,
            string memory outcome1,
            string memory outcome2,
            address oracle,
            uint256 initialTokenRatio,
            uint256 token1Reserve,
            uint256 token2Reserve,
            bool isReported,
            address optionToken1,
            address optionToken2,
            address winningToken,
            uint256 ethCollateral,
            uint256 lpTradingRevenue
        )
    {
        question = i_question;
        outcome1 = i_optionToken1.name();
        outcome2 = i_optionToken2.name();
        oracle = i_oracle;
        initialTokenRatio = i_initialTokenRatio;
        token1Reserve = i_optionToken1.balanceOf(address(this));
        token2Reserve = i_optionToken2.balanceOf(address(this));
        isReported = s_isReported;
        optionToken1 = address(i_optionToken1);
        optionToken2 = address(i_optionToken2);
        winningToken = address(s_winningToken);
        ethCollateral = s_ethCollateral;
        lpTradingRevenue = s_lpTradingRevenue;
    }
}
