// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { PredictionMarketChallenge } from "../contracts/PredictionMarketChallenge.sol";
import { PredictionMarketToken } from "../contracts/PredictionMarketToken.sol";

contract PredictionMarketChallengeTest is Test {
    PredictionMarketChallenge public predictionMarket;
    uint256 initialLiquidity = 1 ether;
    address oracle = address(1);
    address gambler1 = address(2);
    address gambler2 = address(3);
    address gambler3 = address(4);

    function setUp() public {
        deal(oracle, 100 ether);
        deal(gambler2, 10 ether);
        deal(gambler3, 10 ether);
        deal(gambler1, 10 ether);
        vm.prank(oracle);
        predictionMarket = new PredictionMarketChallenge{ value: initialLiquidity }(oracle);
    }

    modifier withFirstPurchase() {
        uint256 tradingAmount = 100 ether;
        uint256 ethNeeded = predictionMarket.getBuyPriceInEth(PredictionMarketChallenge.Option.YES, tradingAmount);
        vm.prank(gambler1);
        predictionMarket.buyTokensWithETH{ value: ethNeeded }(PredictionMarketChallenge.Option.YES, tradingAmount);
        _;
    }

    modifier withPredictionReported() {
        vm.prank(oracle);
        predictionMarket.report(PredictionMarketChallenge.Option.YES);
        _;
    }

    function testBuyTokenWithETH() public {
        uint256 tradingAmount = 100 ether;
        uint256 lpRevenueBefore = predictionMarket.s_lpTradingRevenue();
        uint256 yesTokenBalanceBefore = predictionMarket.i_optionToken1().balanceOf(gambler1);

        uint256 ethNeeded = predictionMarket.getBuyPriceInEth(PredictionMarketChallenge.Option.YES, tradingAmount);

        console.log("eth needed", ethNeeded);
        console.log("gambler1 eth balance", address(gambler1).balance);

        vm.prank(gambler1);
        predictionMarket.buyTokensWithETH{ value: ethNeeded }(PredictionMarketChallenge.Option.YES, tradingAmount);

        // check lp revenue
        uint256 lpRevenueAfter = predictionMarket.s_lpTradingRevenue();
        uint256 yesTokenBalanceAfter = predictionMarket.i_optionToken1().balanceOf(gambler1);

        assertEq(lpRevenueAfter, lpRevenueBefore + ethNeeded);
        // check token balance
        assertEq(yesTokenBalanceAfter, yesTokenBalanceBefore + tradingAmount);
    }

    function testSellTokenForETH() public withFirstPurchase {
        uint256 sellAmount = 100 ether;
        uint256 lpRevenueBefore = predictionMarket.s_lpTradingRevenue();
        uint256 yesTokenBalanceBefore = predictionMarket.i_optionToken1().balanceOf(gambler1);
        uint256 gambler1EthBalanceBefore = address(gambler1).balance;
        PredictionMarketToken tokenContract1 = predictionMarket.i_optionToken1();

        uint256 ethToReceive = predictionMarket.getSellPriceInEth(PredictionMarketChallenge.Option.YES, sellAmount);

        vm.prank(gambler1);
        tokenContract1.approve(address(predictionMarket), sellAmount);

        vm.prank(gambler1);
        predictionMarket.sellTokensForEth(PredictionMarketChallenge.Option.YES, sellAmount);

        uint256 lpRevenueAfter = predictionMarket.s_lpTradingRevenue();
        uint256 yesTokenBalanceAfter = predictionMarket.i_optionToken1().balanceOf(gambler1);
        uint256 gambler1EthBalanceAfter = address(gambler1).balance;

        assertEq(lpRevenueAfter, lpRevenueBefore - ethToReceive);
        assertEq(yesTokenBalanceAfter, yesTokenBalanceBefore - sellAmount);
        console.log("gambler1EthBalanceBefore", gambler1EthBalanceBefore);
        console.log("gambler1EthBalanceAfter", gambler1EthBalanceAfter);
        console.log("ethToReceive", ethToReceive);
        // assertEq(gambler1EthBalanceAfter, gambler1EthBalanceBefore + ethToReceive);
    }

    function testReport() public withFirstPurchase {
        vm.prank(gambler1);
        vm.expectRevert(PredictionMarketChallenge.PredictionMarketChallenge__OnlyOracleCanReport.selector);
        predictionMarket.report(PredictionMarketChallenge.Option.YES);

        vm.prank(oracle);
        predictionMarket.report(PredictionMarketChallenge.Option.YES);

        vm.prank(gambler1);
        vm.expectRevert(PredictionMarketChallenge.PredictionMarketChallenge__PredictionAlreadyResolved.selector);
        predictionMarket.buyTokenWithETH{ value: 1 ether }(PredictionMarketChallenge.Option.YES, 100);
    }

    function testRedeemWinningTokens() public withFirstPurchase withPredictionReported {
        PredictionMarketToken winningToken = predictionMarket.i_optionToken1();
        uint256 gambler1TokenBalanceBefore = winningToken.balanceOf(gambler1);
        uint256 predictionEthBalanceBefore = address(predictionMarket).balance;
        console.log("Prediction contract ETH balance before:", predictionEthBalanceBefore);
        uint256 tokenRedeemed = 100 ether;

        uint256 totalSupplyBefore = winningToken.totalSupply();
        console.log("totalSupplyBefore", totalSupplyBefore);

        vm.prank(gambler1);
        winningToken.approve(address(predictionMarket), tokenRedeemed);

        vm.prank(gambler1);
        predictionMarket.redeemWinningTokens(tokenRedeemed);

        vm.prank(gambler1);
        vm.expectRevert(PredictionMarketChallenge.PredictionMarketChallenge__InsufficientWinningTokens.selector);
        predictionMarket.redeemWinningTokens(tokenRedeemed);

        uint256 gambler1TokenBalanceAfter = winningToken.balanceOf(gambler1);
        assertEq(gambler1TokenBalanceAfter, gambler1TokenBalanceBefore - tokenRedeemed);

        uint256 predictionEthBalanceAfter = address(predictionMarket).balance;
        console.log("Prediction contract ETH balance after:", predictionEthBalanceAfter);
        uint256 totalSupplyAfter = winningToken.totalSupply();
        console.log("totalSupplyAfter", totalSupplyAfter);
    }
}
