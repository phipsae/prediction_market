/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    PredictionMarketTradingWOTime: {
      address: "0x497d8ea7ad4195f7d40009d2fe3213e9ba048ad6",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_oracle",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "addLiquidity",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "avgPriceInEth",
          inputs: [
            {
              name: "_initialTokenAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_currentTokenReserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_ethReserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_tradingAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "pure",
        },
        {
          type: "function",
          name: "buyTokenWithETH",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_amountTokenToBuy",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "createPrediction",
          inputs: [
            {
              name: "_question",
              type: "string",
              internalType: "string",
            },
            {
              name: "_options",
              type: "string[]",
              internalType: "string[]",
            },
            {
              name: "_initialTokenAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "getInitialLiquidity",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getInitialTokenAmount",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getLiquidity",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_address",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getLpReserve",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOptions",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOptionsToken",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract PredictionOptionToken",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionEthReserve",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionLpReserve",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionOption",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionOptionToken",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract PredictionOptionToken",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionOptionsCount",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "pure",
        },
        {
          type: "function",
          name: "getPredictionQuestion",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionWinningOptionId",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getRedemptionRate",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getReported",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getTokenReserve",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getWinningOptionId",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "redeemWinningTokens",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_amount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "removeLiquidity",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_ethToWithdraw",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "report",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_winningOption",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "s_nextPredictionId",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "s_oracle",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "sellAvgPriceInEth",
          inputs: [
            {
              name: "_initialTokenAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_currentTokenReserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_ethReserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_tradingAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "pure",
        },
        {
          type: "function",
          name: "sellTokensForEth",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_tokenAmountToSell",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "error",
          name: "PredictionMarketTrading__InsufficientLiquidity",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__InsufficientWinningTokens",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__InvalidOption",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__InvalidWinningOption",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__MustProvideETHForInitialLiquidity",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__NeedExactlyTwoOptions",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__NoLiquidityToRemove",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__OnlyOracleCanCreatePredictions",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__OnlyOracleCanReport",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__PredictionAlreadyResolved",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__PredictionNotResolved",
          inputs: [],
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1739289551.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
  11155111: {
    PredictionMarketTradingWOTime: {
      address: "0x12961542e5aa59541f2a7bfef3f504a406afc946",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_oracle",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "addLiquidity",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "avgPriceInEth",
          inputs: [
            {
              name: "_initialTokenAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_currentTokenReserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_ethReserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_tradingAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "pure",
        },
        {
          type: "function",
          name: "buyTokenWithETH",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_amountTokenToBuy",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "createPrediction",
          inputs: [
            {
              name: "_question",
              type: "string",
              internalType: "string",
            },
            {
              name: "_options",
              type: "string[]",
              internalType: "string[]",
            },
            {
              name: "_initialTokenAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "getInitialLiquidity",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getInitialTokenAmount",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getLiquidity",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_address",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getLpReserve",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOptions",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getOptionsToken",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract PredictionOptionToken",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionEthReserve",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionLpReserve",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionOption",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionOptionToken",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract PredictionOptionToken",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionOptionsCount",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "pure",
        },
        {
          type: "function",
          name: "getPredictionQuestion",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "string",
              internalType: "string",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getPredictionWinningOptionId",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getRedemptionRate",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getReported",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "bool",
              internalType: "bool",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getTokenReserve",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getWinningOptionId",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "redeemWinningTokens",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_amount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "removeLiquidity",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_ethToWithdraw",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "report",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_winningOption",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "s_nextPredictionId",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "s_oracle",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "sellAvgPriceInEth",
          inputs: [
            {
              name: "_initialTokenAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_currentTokenReserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_ethReserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_tradingAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [
            {
              name: "",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "pure",
        },
        {
          type: "function",
          name: "sellTokensForEth",
          inputs: [
            {
              name: "_predictionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_optionId",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_tokenAmountToSell",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "error",
          name: "PredictionMarketTrading__InsufficientLiquidity",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__InsufficientWinningTokens",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__InvalidOption",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__InvalidWinningOption",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__MustProvideETHForInitialLiquidity",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__NeedExactlyTwoOptions",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__NoLiquidityToRemove",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__OnlyOracleCanCreatePredictions",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__OnlyOracleCanReport",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__PredictionAlreadyResolved",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketTrading__PredictionNotResolved",
          inputs: [],
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1739271890.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
