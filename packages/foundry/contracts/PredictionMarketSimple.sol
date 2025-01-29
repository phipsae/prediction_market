//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract PredictionMarketSimple {
    enum Side {
        Kamala,
        Trump
    }

    struct Result {
        Side winner;
        Side loser;
    }

    Result public result;
    bool public electionFinished;
    mapping(Side => uint256) public betsPerCandidate;
    mapping(address => mapping(Side => uint256)) public betsPerGambler;
    address public oracle;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    // 1. function to place a bet
    function bet(Side _side) external payable {
        require(!electionFinished, "Election has already finished");
        require(msg.value > 0, "You must bet some ether");
        betsPerCandidate[_side] += msg.value;
        betsPerGambler[msg.sender][_side] += msg.value;
    }

    // 2. withdraw
    function withdraw() external {
        uint256 gamblerBet = betsPerGambler[msg.sender][result.winner];
        require(gamblerBet > 0, "You have no bets on the winner");
        require(electionFinished == true, "Election has not finished yet");
        uint256 gain = gamblerBet + betsPerCandidate[result.loser] * gamblerBet / betsPerCandidate[result.winner];
        betsPerGambler[msg.sender][Side.Kamala] = 0;
        betsPerGambler[msg.sender][Side.Trump] = 0;
        (bool success,) = msg.sender.call{ value: gain }("");
        require(success, "Failed to send ether");
    }

    // 3. report
    function report(Side _winner, Side _loser) external {
        require(msg.sender == oracle, "Only oracle can report");
        require(!electionFinished, "Election has already finished");
        require(_winner != _loser, "Winner and loser cannot be the same");
        result.winner = _winner;
        result.loser = _loser;
        electionFinished = true;
    }
}
