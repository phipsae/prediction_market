// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PredictionMarketToken is ERC20 {
    error PredictionMarketToken__OnlyPredictionMarketCanMint();
    error PredictionMarketToken__OnlyPredictionMarketCanBurn();
    error PredictionMarketToken__LiquidityProviderCantSell();

    address public predictionMarket;
    address public liquidityProvider;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply,
        address _liquidityProvider
    ) ERC20(name, symbol) {
        predictionMarket = msg.sender;
        liquidityProvider = _liquidityProvider;
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        if (msg.sender != predictionMarket)
            revert PredictionMarketToken__OnlyPredictionMarketCanMint();
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        if (msg.sender != predictionMarket)
            revert PredictionMarketToken__OnlyPredictionMarketCanBurn();
        _burn(from, amount);
    }

    function _update(
        address from,
        address to,
        uint256 value
    ) internal virtual override {
        if (from == liquidityProvider) {
            revert PredictionMarketToken__LiquidityProviderCantSell();
        }
        super._update(from, to, value);
    }
}
