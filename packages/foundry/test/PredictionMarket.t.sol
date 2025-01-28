// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import { Test, console } from "forge-std/Test.sol";
import { PredictionMarket } from "../contracts/PredictionMarket.sol";

contract PredictionMarketTest is Test {
    PredictionMarket public predictionMarket;
    address oracle = address(1);
    address gambler1 = address(2);
    address gambler2 = address(3);
    address gambler3 = address(4);

    function setUp() public {
        predictionMarket = new PredictionMarket(oracle);
        deal(gambler1, 10 ether);
        deal(gambler2, 10 ether);
        deal(gambler3, 10 ether);
    }

    function testBet() public {
        vm.prank(gambler1);
        predictionMarket.bet{ value: 1 ether }(PredictionMarket.Side.Kamala);
        assertEq(predictionMarket.betsPerCandidate(PredictionMarket.Side.Kamala), 1 ether);
        assertEq(predictionMarket.betsPerGambler(gambler1, PredictionMarket.Side.Kamala), 1 ether);
        assertEq(predictionMarket.betsPerCandidate(PredictionMarket.Side.Trump), 0);
        assertEq(predictionMarket.betsPerCandidate(PredictionMarket.Side.Kamala), 1 ether);
    }

    function testElectionFinished() public {
        vm.prank(oracle);
        predictionMarket.report(PredictionMarket.Side.Kamala, PredictionMarket.Side.Trump);
        assertEq(predictionMarket.electionFinished(), true);
        vm.prank(gambler1);
        vm.expectRevert("Election has already finished");
        predictionMarket.bet{ value: 1 ether }(PredictionMarket.Side.Kamala);
    }

    function testWithdraw() public {
        vm.prank(gambler1);
        predictionMarket.bet{ value: 1 ether }(PredictionMarket.Side.Kamala);
        vm.prank(gambler2);
        predictionMarket.bet{ value: 1 ether }(PredictionMarket.Side.Trump);
        vm.prank(oracle);
        predictionMarket.report(PredictionMarket.Side.Kamala, PredictionMarket.Side.Trump);

        uint256 initialBalance1 = address(gambler1).balance;

        vm.prank(gambler1);
        predictionMarket.withdraw();
        assertEq(predictionMarket.betsPerGambler(gambler1, PredictionMarket.Side.Kamala), 0);
        assertEq(address(gambler1).balance, initialBalance1 + 2 ether);
    }

    function testReport() public {
        vm.prank(oracle);
        predictionMarket.report(PredictionMarket.Side.Kamala, PredictionMarket.Side.Trump);

        (PredictionMarket.Side winner, PredictionMarket.Side loser) = predictionMarket.result();
        assertEq(uint256(winner), uint256(PredictionMarket.Side.Kamala));
        assertEq(uint256(loser), uint256(PredictionMarket.Side.Trump));
    }
}
