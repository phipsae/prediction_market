// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { PredictionMarketHard } from "../contracts/PredictionMarketHard.sol";
import { PredictionOptionToken } from "../contracts/PredictionOptionToken.sol";

contract PredictionMarketHardTest is Test {
    PredictionMarketHard public predictionMarket;
    address oracle = address(1);
    address gambler1 = address(2);
    address gambler2 = address(3);
    address gambler3 = address(4);

    function setUp() public {
        predictionMarket = new PredictionMarketHard(oracle);
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

    modifier withFirstBet() {
        vm.prank(gambler1);
        predictionMarket.swapEthForTokens{ value: 1 ether }(0, 0);
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

    function testSwapEthForTokens() public withPrediction {
        vm.prank(gambler1);
        predictionMarket.swapEthForTokens{ value: 1 ether }(0, 0);
        assertEq(predictionMarket.getPredictionEthReserve(0), 11 ether);
        vm.prank(gambler1);
        predictionMarket.swapEthForTokens{ value: 1 ether }(0, 0);
        assertEq(predictionMarket.getPredictionEthReserve(0), 12 ether);
    }

    function testSwapTokensForEth() public withPrediction {
        vm.startPrank(gambler1);
        predictionMarket.swapEthForTokens{ value: 1 ether }(0, 0);
        uint256 ethReserveBefore = predictionMarket.getPredictionEthReserve(0);
        PredictionOptionToken optionToken1 = predictionMarket.getPredictionOptionToken(0, 0);
        optionToken1.approve(address(predictionMarket), 1000);
        predictionMarket.swapTokensForEth(0, 0, 90);
        vm.stopPrank();
        assertGt(ethReserveBefore, predictionMarket.getPredictionEthReserve(0));
    }

    function testReport() public withPrediction withFirstBet {
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
        predictionMarket.swapEthForTokens{ value: 1 ether }(0, 0);
        console.log("After");
        console.log(predictionMarket.getPredictionEthReserve(0));
        console.log(predictionMarket.getTokenReserve(0, 0));
        console.log(predictionMarket.getTokenReserve(0, 1));
    }

    function testRedeemWinningTokens() public withPrediction withFirstBet withPrecitionReported {
        vm.prank(gambler1);
        predictionMarket.redeemWinningTokens(0, 1 ether);
    }
}
