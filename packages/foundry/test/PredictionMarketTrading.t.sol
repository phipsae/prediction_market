// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { PredictionMarketTrading } from "../contracts/PredictionMarketTrading.sol";
import { PredictionOptionToken } from "../contracts/PredictionOptionToken.sol";

contract PredictionMarketTradingTest is Test {
    PredictionMarketTrading public predictionMarket;
    address oracle = address(1);
    address gambler1 = address(2);
    address gambler2 = address(3);
    address gambler3 = address(4);

    function setUp() public {
        predictionMarket = new PredictionMarketTrading(oracle);
        deal(gambler1, 10 ether);
        deal(gambler2, 10 ether);
        deal(gambler3, 10 ether);
        deal(oracle, 100 ether);
    }

    modifier withPrediction() {
        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";
        vm.prank(oracle);
        predictionMarket.createPrediction{ value: 10 ether }(
            "Will ETH reach $10k?", options, block.timestamp + 100, 10 ether, 1000
        );
        _;
    }

    modifier predictionReported() {
        vm.warp(block.timestamp + 101); // Warp time past the prediction end time
        vm.prank(oracle);
        predictionMarket.report(0, 0);
        _;
    }

    modifier withFirstPurchase() {
        uint256 tradingAmount = 100;
        uint256 ethReserve = predictionMarket.getPredictionEthReserve(0);
        uint256 initialTokenAmount = predictionMarket.getInitialTokenAmount(0);
        uint256 token1TokenReserve = predictionMarket.getTokenReserve(0, 0);
        uint256 ethNeeded = predictionMarket.avgPriceInEth(
            initialTokenAmount, token1TokenReserve, ethReserve, tradingAmount
        ) * tradingAmount;
        vm.prank(gambler1);
        predictionMarket.buyTokenWithETH{ value: ethNeeded }(0, 0, tradingAmount);
        _;
    }

    modifier withPrecitionReported() {
        vm.warp(block.timestamp + 101); // Warp time past the prediction end time
        vm.prank(oracle);
        predictionMarket.report(0, 0);
        _;
    }

    function testCreatePrediction() public withPrediction {
        PredictionOptionToken optionToken1 = predictionMarket.getPredictionOptionToken(0, 0);
        PredictionOptionToken optionToken2 = predictionMarket.getPredictionOptionToken(0, 1);
        console.log(optionToken1.balanceOf(address(predictionMarket)));
        console.log(optionToken2.balanceOf(address(predictionMarket)));
        assertEq(optionToken1.name(), "Prediction 0, Option: Yes");
        assertEq(optionToken2.name(), "Prediction 0, Option: No");
        assertEq(predictionMarket.getPredictionQuestion(0), "Will ETH reach $10k?");
        assertEq(predictionMarket.getPredictionOptionsCount(0), 2);
        assertEq(predictionMarket.getPredictionOption(0, 0), "Yes");
        assertEq(predictionMarket.getPredictionOption(0, 1), "No");
        assertEq(predictionMarket.getPredictionEndTime(0), block.timestamp + 100);
        assertEq(predictionMarket.getPredictionEthReserve(0), 1 ether);
    }

    function testAddLiquidity() public withPrediction {
        console.log("before");
        console.log(predictionMarket.getPredictionEthReserve(0));
        console.log(predictionMarket.getTokenReserve(0, 0));
        console.log(predictionMarket.getTokenReserve(0, 1));
        vm.prank(gambler1);
        predictionMarket.addLiquidity{ value: 1 ether }(0);
        console.log("after");
        console.log(predictionMarket.getPredictionEthReserve(0));
        console.log(predictionMarket.getTokenReserve(0, 0));
        console.log(predictionMarket.getTokenReserve(0, 1));
    }

    function testPriceInEth() public withPrediction {
        uint256 ethReserve = predictionMarket.getPredictionEthReserve(0);
        uint256 tokenBalance1 = predictionMarket.getTokenReserve(0, 0);
        console.log(ethReserve);
        console.log(tokenBalance1);
        uint256 tradingAmount = 999;
        uint256 price = predictionMarket.avgPriceInEth(tokenBalance1, tokenBalance1, ethReserve, tradingAmount);
        console.log("average price per token", price);
        console.log("Total Amoung of the to pay", price * tradingAmount);
    }

    function testBuyTokenWithETH() public withPrediction {
        PredictionOptionToken option1Tokenaddress = predictionMarket.getOptionsToken(0, 0);
        uint256 tradingAmount = 100;
        uint256 lpreserveBefore = predictionMarket.getLpReserve(0);
        uint256 option1TokenBalanceBefore = option1Tokenaddress.balanceOf(gambler1);
        uint256 ethReserve = predictionMarket.getPredictionEthReserve(0);
        uint256 initialTokenAmount = predictionMarket.getInitialTokenAmount(0);
        uint256 token1TokenReserve = predictionMarket.getTokenReserve(0, 0);
        uint256 ethNeeded = predictionMarket.avgPriceInEth(
            initialTokenAmount, token1TokenReserve, ethReserve, tradingAmount
        ) * tradingAmount;
        console.log("eth needed", ethNeeded);
        console.log("gambler1 eth balance", address(gambler1).balance);
        vm.prank(gambler1);
        predictionMarket.buyTokenWithETH{ value: ethNeeded }(0, 0, tradingAmount);

        // check lpreserve
        uint256 lpreserveAfter = predictionMarket.getLpReserve(0);
        uint256 option1TokenBalanceAfter = option1Tokenaddress.balanceOf(gambler1);
        assertEq(lpreserveAfter, lpreserveBefore + ethNeeded);
        // check token balance
        assertEq(option1TokenBalanceAfter, option1TokenBalanceBefore + tradingAmount);
    }

    function testSellTokenForETH() public withPrediction withFirstPurchase {
        PredictionOptionToken option1Tokenaddress = predictionMarket.getOptionsToken(0, 0);

        uint256 sellAmount = 100;
        uint256 lpreserveBefore = predictionMarket.getLpReserve(0);
        console.log("lpreserveBefore", lpreserveBefore);
        uint256 option1TokenBalanceBefore = option1Tokenaddress.balanceOf(gambler1);
        console.log("token1BalanceBefore", option1TokenBalanceBefore);
        // Approve tokens for selling
        vm.prank(gambler1);
        option1Tokenaddress.approve(address(predictionMarket), sellAmount);
        console.log("Allowance", option1Tokenaddress.allowance(gambler1, address(predictionMarket)));
        console.log("gambler1 eth balance before", address(gambler1).balance);
        vm.prank(gambler1);
        predictionMarket.sellTokensForEth(0, 0, sellAmount);

        // check lpreserve
        uint256 lpreserveAfter = predictionMarket.getLpReserve(0);
        // assertEq(lpreserveAfter, lpreserveBefore - sellAmount);
        console.log("gambler1 eth balance after", address(gambler1).balance);

        // // check lpreserve
        // uint256 lpreserveAfter = predictionMarket.getLpReserve(0);
        uint256 option1TokenBalanceAfter = option1Tokenaddress.balanceOf(gambler1);
        console.log("token1BalanceAfter", option1TokenBalanceAfter);
        console.log("lpreserveAfter", lpreserveAfter);
    }

    function testReport() public withPrediction withFirstPurchase {
        console.log("Before");
        console.log("Winning option id:", predictionMarket.getPredictionWinningOptionId(0));
        console.log(predictionMarket.getPredictionEthReserve(0));
        console.log(predictionMarket.getTokenReserve(0, 0));
        console.log(predictionMarket.getTokenReserve(0, 1));
        PredictionOptionToken optionToken1 = predictionMarket.getPredictionOptionToken(0, 0);
        console.log("Initial token balance:", optionToken1.balanceOf(gambler1));
        console.log("Total supply:", optionToken1.totalSupply());
        console.log("Contract balance:", optionToken1.balanceOf(address(predictionMarket)));

        vm.warp(block.timestamp + 101); // Warp time past the prediction end time
        vm.prank(gambler1);
        vm.expectRevert("Only oracle can report");
        predictionMarket.report(0, 0);
        vm.prank(oracle);
        predictionMarket.report(0, 0);
        uint256 winningOptionId = predictionMarket.getPredictionWinningOptionId(0);
        assertEq(predictionMarket.getOptions(0, winningOptionId), "Yes");
        vm.prank(gambler1);
        vm.expectRevert("Prediction ended");
        predictionMarket.buyTokenWithETH{ value: 1 ether }(0, 0, 100);
        console.log("After");
        console.log(predictionMarket.getPredictionEthReserve(0));
        console.log(predictionMarket.getTokenReserve(0, 0));
        console.log(predictionMarket.getTokenReserve(0, 1));
    }

    function testRedeemWinningTokens() public withPrediction withFirstPurchase predictionReported {
        PredictionOptionToken option1Tokenaddress = predictionMarket.getOptionsToken(0, 0);
        uint256 gambler1TokenBalanceBefore = option1Tokenaddress.balanceOf(gambler1);
        uint256 predictionEthBalanceBefore = address(predictionMarket).balance;
        console.log("Prediction contract ETH balance before:", predictionEthBalanceBefore);
        uint256 tokenRedeemed = 100;

        vm.prank(gambler1);
        option1Tokenaddress.approve(address(predictionMarket), tokenRedeemed);

        vm.prank(gambler1);
        predictionMarket.redeemWinningTokens(0, tokenRedeemed);

        vm.prank(gambler1);
        vm.expectRevert("Insufficient winning tokens");
        predictionMarket.redeemWinningTokens(0, tokenRedeemed);

        uint256 gambler1TokenBalanceAfter = option1Tokenaddress.balanceOf(gambler1);
        assertEq(gambler1TokenBalanceAfter, gambler1TokenBalanceBefore - tokenRedeemed);

        uint256 predictionEthBalanceAfter = address(predictionMarket).balance;
        console.log("Prediction contract ETH balance after:", predictionEthBalanceAfter);
        // assertEq(predictionEthBalanceAfter, predictionEthBalanceBefore + tokenRedeemed);
    }
}
