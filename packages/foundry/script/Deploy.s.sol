//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployPredictionMarketOrderBook } from "./DeployPredictionMarketOrderBook.s.sol";
// import { PredictionMarketSimple } from "../contracts/PredictionMarketSimple.sol";
/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */

contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        // Deploys all your contracts sequentially
        // Add new deployments here when needed

        // DeployYourContract deployYourContract = new DeployYourContract();
        // deployYourContract.run();

        // address gambler1 = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8;
        // address gambler2 = 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC;
        // address gambler3 = 0x90F79bf6EB2c4f870365E785982E1f101E93b906;

        // vm.startBroadcast(deployer);
        // PredictionMarket predictionMarket = new PredictionMarket(deployer);
        // vm.stopBroadcast();

        // vm.startBroadcast(gambler1);
        // predictionMarket.bet{ value: 1 ether }(PredictionMarket.Side.Kamala);
        // vm.stopBroadcast();

        // vm.startBroadcast(gambler2);
        // predictionMarket.bet{ value: 1 ether }(PredictionMarket.Side.Trump);
        // vm.stopBroadcast();

        // vm.startBroadcast(gambler3);
        // predictionMarket.bet{ value: 1 ether }(PredictionMarket.Side.Kamala);
        // vm.stopBroadcast();

        DeployPredictionMarketOrderBook deployPredictionMarketOrderBook = new DeployPredictionMarketOrderBook();
        deployPredictionMarketOrderBook.run();

        // Deploy another contract
        // DeployMyContract myContract = new DeployMyContract();
        // myContract.run();
    }
}
