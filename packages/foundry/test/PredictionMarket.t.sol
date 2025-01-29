// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { PredictionMarketSimple } from "../contracts/PredictionMarketSimple.sol";

contract PredictionMarketTest is Test {
    PredictionMarketSimple public predictionMarket;
    address oracle = address(1);
    address gambler1 = address(2);
    address gambler2 = address(3);
    address gambler3 = address(4);

    function setUp() public {
        predictionMarket = new PredictionMarketSimple(oracle);
        deal(gambler1, 10 ether);
        deal(gambler2, 10 ether);
        deal(gambler3, 10 ether);
    }

    function testBet() public {
        vm.prank(gambler1);
        predictionMarket.bet{ value: 1 ether }(PredictionMarketSimple.Side.Kamala);
        assertEq(predictionMarket.betsPerCandidate(PredictionMarketSimple.Side.Kamala), 1 ether);
        assertEq(predictionMarket.betsPerGambler(gambler1, PredictionMarketSimple.Side.Kamala), 1 ether);
        assertEq(predictionMarket.betsPerCandidate(PredictionMarketSimple.Side.Trump), 0);
        assertEq(predictionMarket.betsPerCandidate(PredictionMarketSimple.Side.Kamala), 1 ether);
    }

    function testElectionFinished() public {
        vm.prank(oracle);
        predictionMarket.report(PredictionMarketSimple.Side.Kamala, PredictionMarketSimple.Side.Trump);
        assertEq(predictionMarket.electionFinished(), true);
        vm.prank(gambler1);
        vm.expectRevert("Election has already finished");
        predictionMarket.bet{ value: 1 ether }(PredictionMarketSimple.Side.Kamala);
    }

    function testWithdraw() public {
        vm.prank(gambler1);
        predictionMarket.bet{ value: 1 ether }(PredictionMarketSimple.Side.Kamala);
        vm.prank(gambler2);
        predictionMarket.bet{ value: 1 ether }(PredictionMarketSimple.Side.Trump);
        vm.prank(oracle);
        predictionMarket.report(PredictionMarketSimple.Side.Kamala, PredictionMarketSimple.Side.Trump);

        uint256 initialBalance1 = address(gambler1).balance;

        vm.prank(gambler1);
        predictionMarket.withdraw();
        assertEq(predictionMarket.betsPerGambler(gambler1, PredictionMarketSimple.Side.Kamala), 0);
        assertEq(address(gambler1).balance, initialBalance1 + 2 ether);
    }

    function testReport() public {
        vm.prank(oracle);
        predictionMarket.report(PredictionMarketSimple.Side.Kamala, PredictionMarketSimple.Side.Trump);

        (PredictionMarketSimple.Side winner, PredictionMarketSimple.Side loser) = predictionMarket.result();
        assertEq(uint256(winner), uint256(PredictionMarketSimple.Side.Kamala));
        assertEq(uint256(loser), uint256(PredictionMarketSimple.Side.Trump));
    }
}
