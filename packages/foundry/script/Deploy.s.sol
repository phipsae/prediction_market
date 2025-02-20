//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { DeployPredictionMarketChallenge } from "./DeployPredictionMarketChallenge.s.sol";
// import { PredictionMarketSimple } from "../contracts/PredictionMarketSimple.sol";
/**
 * @notice Main deployment script for all contracts
 * @dev Run this when you want to deploy multiple contracts at once
 *
 * Example: yarn deploy # runs this script(without`--file` flag)
 */

contract DeployScript is ScaffoldETHDeploy {
    function run() external {
        DeployPredictionMarketChallenge deployPredictionMarketChallenge = new DeployPredictionMarketChallenge();
        deployPredictionMarketChallenge.run();
    }
}
