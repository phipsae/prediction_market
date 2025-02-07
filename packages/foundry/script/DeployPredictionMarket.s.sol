// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./DeployHelpers.s.sol";
import { PredictionMarketTrading } from "../contracts/PredictionMarketTrading.sol";

/**
 * @notice Deploy script for YourContract contract
 * @dev Inherits ScaffoldETHDeploy which:
 *      - Includes forge-std/Script.sol for deployment
 *      - Includes ScaffoldEthDeployerRunner modifier
 *      - Provides `deployer` variable
 * Example:
 * yarn deploy --file DeployYourContract.s.sol  # local anvil chain
 * yarn deploy --file DeployYourContract.s.sol --network optimism # live network (requires keystore)
 */
contract DeployPredictionMarket is ScaffoldETHDeploy {
    /**
     * @dev Deployer setup based on `ETH_KEYSTORE_ACCOUNT` in `.env`:
     *      - "scaffold-eth-default": Uses Anvil's account #9 (0xa0Ee7A142d267C1f36714E4a8F75612F20a79720), no password prompt
     *      - "scaffold-eth-custom": requires password used while creating keystore
     *
     * Note: Must use ScaffoldEthDeployerRunner modifier to:
     *      - Setup correct `deployer` account and fund it
     *      - Export contract addresses & ABIs to `nextjs` packages
     */
    function run() external ScaffoldEthDeployerRunner {
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

        PredictionMarketTrading predictionMarket = new PredictionMarketTrading(deployer);
        string memory question = "Will BTC reach $200k by end of 2025?";
        uint256 resolutionTime = block.timestamp + 365 days; // Resolution in 1 year
        uint256 initialLiquidity = 1 ether;

        string[] memory options = new string[](2);
        options[0] = "Yes";
        options[1] = "No";
        uint256 initialTokenAmount = 1000 ether; // Initial token amount for liquidity

        predictionMarket.createPrediction{ value: initialLiquidity }(
            question, options, resolutionTime, initialLiquidity, initialTokenAmount
        );
    }
}
