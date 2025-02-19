//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { PredictionOptionTokenOrderBook } from "./PredictionOptionTokenOrderBook.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { console } from "forge-std/console.sol";

// TODO: ownable, reentrancy guard, fallback, receive
contract PredictionMarketOrderBook {
    using Strings for uint256;

    string public constant QUESTION = "Is the price of ETH going to be above $10,000 in 30 days?";
    string[2] public OPTIONS = ["Yes", "No"];
    uint256 public constant PRECISION = 1e18;

    PredictionOptionTokenOrderBook public immutable i_yesToken;
    PredictionOptionTokenOrderBook public immutable i_noToken;
    address public immutable i_oracle;

    uint256 public constant reedemPrice = 0.01 ether; // per token

    struct Offer {
        address creator;
        uint256 probability;
        uint256 ethAmount;
        uint256 matchingETHAmount;
        uint256 tokenAmount;
        bool isActive;
    }

    Offer[] public yesOffers;

    event YesOfferCreated(uint256 indexed offerId, address creator, uint256 probability, uint256 amount);

    constructor(address _oracle) {
        i_yesToken = new PredictionOptionTokenOrderBook("Yes Token", "YES");
        i_noToken = new PredictionOptionTokenOrderBook("No Token", "NO");
        i_oracle = _oracle;
    }

    /**
     * @notice Create a new prediction market with initial liquidity
     * @param _probability The probability the user wants to bet on 100% on Yes the value should be 100
     */
    function createYesOffer(uint256 _probability) public payable {
        require(_probability > 0 && _probability <= 100, "Probability must be between 1-100%");
        require(msg.value > 0, "Must send ETH to create offer");

        uint256 matchingETHAmount = calculateMatchingETHValue(_probability, msg.value);
        uint256 tokenAmount = calculateTokenAmount(msg.value, matchingETHAmount, reedemPrice);

        // Store the offer details
        Offer memory newOffer = Offer({
            creator: msg.sender,
            probability: _probability,
            ethAmount: msg.value,
            matchingETHAmount: matchingETHAmount,
            tokenAmount: tokenAmount,
            isActive: true
        });

        yesOffers.push(newOffer);
        emit YesOfferCreated(yesOffers.length - 1, msg.sender, _probability, msg.value);
    }

    event YesOfferTaken(uint256 indexed offerId, address taker);

    // function takeOffer(uint256 _offerId) external payable {
    //     require(_offerId < offers.length, "Offer does not exist");
    //     Offer storage offer = offers[_offerId];
    //     require(offer.isActive, "Offer is not active");
    //     require(msg.value == offer.ethAmount, "Must match offer amount");

    //     // Mint tokens for both parties
    //     i_yesToken.mint(offer.creator, offer.yesTokenAmount);
    //     i_yesToken.mint(msg.sender, offer.noTokenAmount);
    //     i_noToken.mint(offer.creator, offer.noTokenAmount);
    //     i_noToken.mint(msg.sender, offer.yesTokenAmount);

    //     offer.isActive = false;
    //     emit OfferTaken(_offerId, msg.sender);
    // }

    /////////////////////////
    /// Helper functions ///
    /////////////////////////

    /**
     * @notice Calculate the matching ETH amount needed for a given probability
     * @param _probability The probability percentage (1-100)
     * @param _ethToMatch The ETH amount to match against
     * @return The required ETH amount to match the given probability
     */
    function calculateMatchingETHValue(uint256 _probability, uint256 _ethToMatch) public view returns (uint256) {
        uint256 yesProb = _probability;
        uint256 matchingAmount = ((100 - yesProb) * _ethToMatch) / yesProb;
        return matchingAmount;
    }

    /**
     * @notice Calculate the token amount for a given ETH amount and redeem price
     * @param _ethAmountYes The ETH amount for Yes
     * @param _ethAmountNo The ETH amount for No
     * @param _redeemPrice The redeem price
     * @return The token amount for both sides
     */
    function calculateTokenAmount(uint256 _ethAmountYes, uint256 _ethAmountNo, uint256 _redeemPrice)
        public
        view
        returns (uint256)
    {
        uint256 totalEthAmount = _ethAmountYes + _ethAmountNo;
        uint256 tokensPerside = totalEthAmount / _redeemPrice;
        return tokensPerside;
    }
}
