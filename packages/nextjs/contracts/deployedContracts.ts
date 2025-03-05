/**
 * This file is autogenerated by Scaffold-ETH.
 * You should not edit it manually or your changes might be overwritten.
 */
import { GenericContractsDeclaration } from "~~/utils/scaffold-eth/contract";

const deployedContracts = {
  31337: {
    PredictionMarketChallenge: {
      address: "0x9aeebff653c45abafb7bf85ee9e800b790dd0f71",
      abi: [
        {
          type: "constructor",
          inputs: [
            {
              name: "_oracle",
              type: "address",
              internalType: "address",
            },
            {
              name: "_question",
              type: "string",
              internalType: "string",
            },
            {
              name: "_initialTokenValue",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "addLiquidity",
          inputs: [],
          outputs: [],
          stateMutability: "payable",
        },
        {
          type: "function",
          name: "buyTokensWithETH",
          inputs: [
            {
              name: "_option",
              type: "uint8",
              internalType: "enum PredictionMarketChallenge.Option",
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
          name: "getBuyPriceInEth",
          inputs: [
            {
              name: "_option",
              type: "uint8",
              internalType: "enum PredictionMarketChallenge.Option",
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
          stateMutability: "view",
        },
        {
          type: "function",
          name: "getSellPriceInEth",
          inputs: [
            {
              name: "_option",
              type: "uint8",
              internalType: "enum PredictionMarketChallenge.Option",
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
          stateMutability: "view",
        },
        {
          type: "function",
          name: "i_initialTokenValue",
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
          name: "i_optionToken1",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract PredictionMarketToken",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "i_optionToken2",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract PredictionMarketToken",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "i_oracle",
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
          name: "i_question",
          inputs: [],
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
          name: "owner",
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
          name: "prediction",
          inputs: [],
          outputs: [
            {
              name: "question",
              type: "string",
              internalType: "string",
            },
            {
              name: "outcome1",
              type: "string",
              internalType: "string",
            },
            {
              name: "outcome2",
              type: "string",
              internalType: "string",
            },
            {
              name: "oracle",
              type: "address",
              internalType: "address",
            },
            {
              name: "initialTokenValue",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "token1Reserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "token2Reserve",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "isReported",
              type: "bool",
              internalType: "bool",
            },
            {
              name: "optionToken1",
              type: "address",
              internalType: "address",
            },
            {
              name: "optionToken2",
              type: "address",
              internalType: "address",
            },
            {
              name: "winningToken",
              type: "address",
              internalType: "address",
            },
            {
              name: "ethCollateral",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "lpTradingRevenue",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "predictionMarketOwner",
              type: "address",
              internalType: "address",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "redeemWinningTokens",
          inputs: [
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
          name: "renounceOwnership",
          inputs: [],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "report",
          inputs: [
            {
              name: "_winningOption",
              type: "uint8",
              internalType: "enum PredictionMarketChallenge.Option",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "resolveMarketAndWithdraw",
          inputs: [],
          outputs: [
            {
              name: "ethRedeemed",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "s_ethCollateral",
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
          name: "s_isReported",
          inputs: [],
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
          name: "s_lpTradingRevenue",
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
          name: "s_winningToken",
          inputs: [],
          outputs: [
            {
              name: "",
              type: "address",
              internalType: "contract PredictionMarketToken",
            },
          ],
          stateMutability: "view",
        },
        {
          type: "function",
          name: "sellTokensForEth",
          inputs: [
            {
              name: "_option",
              type: "uint8",
              internalType: "enum PredictionMarketChallenge.Option",
            },
            {
              name: "_tradingAmount",
              type: "uint256",
              internalType: "uint256",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "function",
          name: "transferOwnership",
          inputs: [
            {
              name: "newOwner",
              type: "address",
              internalType: "address",
            },
          ],
          outputs: [],
          stateMutability: "nonpayable",
        },
        {
          type: "event",
          name: "OwnershipTransferred",
          inputs: [
            {
              name: "previousOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "newOwner",
              type: "address",
              indexed: true,
              internalType: "address",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "TokensPurchased",
          inputs: [
            {
              name: "buyer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "option",
              type: "uint8",
              indexed: false,
              internalType: "enum PredictionMarketChallenge.Option",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "ethAmount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "TokensSold",
          inputs: [
            {
              name: "seller",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "option",
              type: "uint8",
              indexed: false,
              internalType: "enum PredictionMarketChallenge.Option",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "ethAmount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "event",
          name: "WinningTokensRedeemed",
          inputs: [
            {
              name: "redeemer",
              type: "address",
              indexed: true,
              internalType: "address",
            },
            {
              name: "amount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
            {
              name: "ethAmount",
              type: "uint256",
              indexed: false,
              internalType: "uint256",
            },
          ],
          anonymous: false,
        },
        {
          type: "error",
          name: "OwnableInvalidOwner",
          inputs: [
            {
              name: "owner",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "OwnableUnauthorizedAccount",
          inputs: [
            {
              name: "account",
              type: "address",
              internalType: "address",
            },
          ],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__AmountMustBeGreaterThanZero",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__ETHTransferFailed",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__InsufficientAllowance",
          inputs: [
            {
              name: "_tradingAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_allowance",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__InsufficientBalance",
          inputs: [
            {
              name: "_tradingAmount",
              type: "uint256",
              internalType: "uint256",
            },
            {
              name: "_userBalance",
              type: "uint256",
              internalType: "uint256",
            },
          ],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__InsufficientTokenReserve",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__InsufficientWinningTokens",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__InvalidOption",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__MustProvideETHForInitialLiquidity",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__MustSendExactETHAmount",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__NoTokensToRedeem",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__OnlyOracleCanReport",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__PredictionAlreadyResolved",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__PredictionNotResolved",
          inputs: [],
        },
        {
          type: "error",
          name: "PredictionMarketChallenge__TokenTransferFailed",
          inputs: [],
        },
      ],
      inheritedFunctions: {},
      deploymentFile: "run-1740776237.json",
      deploymentScript: "Deploy.s.sol",
    },
  },
} as const;

export default deployedContracts satisfies GenericContractsDeclaration;
