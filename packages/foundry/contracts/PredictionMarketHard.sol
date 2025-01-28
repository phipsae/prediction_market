//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

contract PredictionMarketMedium {
    struct Option {
        string name;
        uint256 optionId;
    }

    struct Prediction {
        string question;
        uint256 endTime;
        mapping(uint256 => string) options;
        mapping(uint256 => uint256) betsPerOption;
        uint256 winningOptionId;
        uint256 optionsCount;
    }

    mapping(uint256 => Prediction) public predictions;
    uint256 public nextPredictionId;
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) public betsPerGambler;
    address public oracle;

    constructor(address _oracle) {
        oracle = _oracle;
    }

    function createPrediction(string calldata _question, string[] calldata _options, uint256 _endTime) external {
        require(msg.sender == oracle, "Only oracle can create predictions");
        require(_options.length >= 2, "Need at least 2 options");
        require(_endTime > block.timestamp, "End time must be in the future");

        Prediction storage prediction = predictions[nextPredictionId];
        prediction.question = _question;
        prediction.endTime = _endTime;
        for (uint256 i = 0; i < _options.length; i++) {
            prediction.options[i] = _options[i];
        }
        prediction.optionsCount = _options.length;

        nextPredictionId++;
    }

    // function to place a bet one option
    function bet(uint256 _predictionId, uint256 _optionId) external payable {
        Prediction storage prediction = predictions[_predictionId];
        require(block.timestamp < prediction.endTime, "Prediction period has ended");
        require(msg.value > 0, "Must bet some ether");
        require(_optionId < prediction.optionsCount, "Invalid option");

        prediction.betsPerOption[_optionId] += msg.value;
        betsPerGambler[msg.sender][_predictionId][_optionId] += msg.value;
    }

    // function to report the winning option
    function report(uint256 _predictionId, uint256 _winningOption) external {
        require(msg.sender == oracle, "Only oracle can report");
        Prediction storage prediction = predictions[_predictionId];
        require(block.timestamp >= prediction.endTime, "Prediction period not yet ended");
        require(_winningOption < prediction.optionsCount, "Invalid winning option");
        prediction.winningOptionId = _winningOption;
    }

    // function to withdraw bets
    function withdraw(uint256 _predictionId) external {
        Prediction storage prediction = predictions[_predictionId];
        uint256 winningOptionId = prediction.winningOptionId;
        uint256 gamblerBet = betsPerGambler[msg.sender][_predictionId][winningOptionId];
        require(gamblerBet > 0, "You have no winning bets");

        uint256 totalLosingBets = 0;
        for (uint256 i = 0; i < prediction.optionsCount; i++) {
            if (i != winningOptionId) {
                totalLosingBets += prediction.betsPerOption[i];
            }
        }

        uint256 gain = gamblerBet + (totalLosingBets * gamblerBet / prediction.betsPerOption[winningOptionId]);

        // Reset user's bets for this prediction, so that he cannot withdraw again
        for (uint256 i = 0; i < prediction.optionsCount; i++) {
            betsPerGambler[msg.sender][_predictionId][i] = 0;
        }

        (bool success,) = msg.sender.call{ value: gain }("");
        require(success, "Failed to send ether");
    }
}
