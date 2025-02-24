// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PredictionMarketToken is ERC20 {
    error PredictionMarketToken__OnlyPredictionMarketCanMint();
    error PredictionMarketToken__OnlyPredictionMarketCanBurn();

    address public predictionMarket;

    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        predictionMarket = msg.sender;
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != predictionMarket) revert PredictionMarketToken__OnlyPredictionMarketCanMint();
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (msg.sender != predictionMarket) revert PredictionMarketToken__OnlyPredictionMarketCanBurn();
        _burn(from, amount);
    }
}
