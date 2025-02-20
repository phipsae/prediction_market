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

    function test_createYesOffer() public {
        vm.prank(gambler1);
        predictionMarket.createYesOffer(100);
    }
}
