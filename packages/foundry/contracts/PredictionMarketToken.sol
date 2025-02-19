// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PredictionMarketToken is ERC20 {
    address public predictionMarket;

    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        predictionMarket = msg.sender;
    }

    function mint(address to, uint256 amount) external {
        require(
            msg.sender == predictionMarket,
            "Only prediction market can mint"
        );
        _mint(to, amount);
    }

    function burn(address from, uint256 amount) external {
        require(
            msg.sender == predictionMarket,
            "Only prediction market can burn"
        );
        _burn(from, amount);
    }
}
