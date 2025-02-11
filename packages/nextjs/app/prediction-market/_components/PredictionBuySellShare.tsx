"use client";

import { useState } from "react";
import { GiveAllowance } from "./GiveAllowance";
import { TokenBalance } from "./TokenBalance";
import { formatEther, parseEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function PredictionBuySellShare({ optionIndex }: { optionIndex: number }) {
  const [inputAmount, setInputAmount] = useState<bigint>(BigInt(0));
  const tokenAmount = parseEther((inputAmount || BigInt(0)).toString());

  const { data: deployedContractData } = useDeployedContractInfo("PredictionMarketTradingWOTime");
  const contractAddress = deployedContractData?.address;

  //  buy token 1 of prediction 0
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketTradingWOTime",
  });

  const { data: initialTokenAmount } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getInitialTokenAmount",
    args: [BigInt(0)],
  });

  const { data: token1Reserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getTokenReserve",
    args: [BigInt(0), BigInt(optionIndex)],
  });

  const { data: ethReserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getPredictionEthReserve",
    args: [BigInt(0)],
  });

  const { data: avgPriceInEth } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "avgPriceInEth",
    args: [
      initialTokenAmount ?? BigInt(0),
      token1Reserve ?? BigInt(0),
      (ethReserve ?? BigInt(0)) * BigInt(1e18),
      tokenAmount,
    ],
    watch: true,
  });

  const { data: sellAvgPriceInEth } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "sellAvgPriceInEth",
    args: [
      initialTokenAmount ?? BigInt(0),
      token1Reserve ?? BigInt(0),
      (ethReserve ?? BigInt(0)) * BigInt(1e18),
      tokenAmount,
    ],
    watch: true,
  });

  const totalEthNeededBuy = avgPriceInEth ? (avgPriceInEth * tokenAmount) / BigInt(1e18) / BigInt(1e18) : undefined;
  const totalEthNeededSell = sellAvgPriceInEth
    ? (sellAvgPriceInEth * tokenAmount) / BigInt(1e18) / BigInt(1e18)
    : undefined;

  const token1Address = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getOptionsToken",
    args: [BigInt(0), BigInt(optionIndex)],
  });

  const { data: option } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getOptions",
    args: [BigInt(0), BigInt(optionIndex)],
  });

  console.log("contractAddress", contractAddress);
  // const contractAddress = useScaffoldReadContract({
  //   contractName: "PredictionMarketTradingWOTime",
  //   functionName: "getAddress",
  // });
  // console.log("tokenAmount", tokenAmount ? formatEther(tokenAmount) : 0);
  // console.log("token1Reserve", token1Reserve ? formatEther(token1Reserve) : 0);
  // console.log("ethReserve", ethReserve ? formatEther(ethReserve) : 0);
  // console.log("avgPriceInEth", avgPriceInEth ? formatEther(avgPriceInEth) : 0);
  // console.log("totalEthNeededBuy", formatEther(totalEthNeededBuy ?? BigInt(0)));
  // console.log("totalEthNeededSell", formatEther(totalEthNeededSell ?? BigInt(0)));
  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg space-y-4">
      <TokenBalance tokenAddress={token1Address.data ?? ""} option={option ?? ""} />

      <div className="grid grid-cols-2 gap-4">
        {/* Buy Section */}
        <div className="bg-green-50 p-3 rounded-lg">
          <h2 className="text-lg font-semibold text-green-800 mb-2">Buy {option}</h2>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Amount to buy"
              className="input input-bordered input-sm w-full border-green-200 focus:border-green-500"
              onChange={e => setInputAmount(BigInt(e.target.value))}
            />

            {totalEthNeededBuy && (
              <div className="text-sm text-green-800">ETH needed: {formatEther(totalEthNeededBuy)}</div>
            )}

            <button
              className="btn btn-sm w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "buyTokenWithETH",
                    args: [BigInt(0), BigInt(optionIndex), tokenAmount],
                    value: parseEther(formatEther(totalEthNeededBuy ?? BigInt(0))),
                  });
                } catch (e) {
                  console.error("Error buying tokens:", e);
                }
              }}
            >
              Buy
            </button>
          </div>
        </div>

        {/* Sell Section */}
        <div className="bg-red-50 p-3 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Sell {option}</h2>
          <div className="space-y-2">
            {/* Token Approval */}
            <div className="mb-4">
              <GiveAllowance tokenAddress={token1Address.data ?? ""} spenderAddress={contractAddress ?? ""} />
            </div>

            <input
              type="number"
              placeholder="Amount to sell"
              className="input input-bordered input-sm w-full border-red-200 focus:border-red-500"
              onChange={e => setInputAmount(BigInt(e.target.value))}
            />

            {totalEthNeededSell && (
              <div className="text-sm text-red-800">ETH to receive: {formatEther(totalEthNeededSell)}</div>
            )}

            <button
              className="btn btn-sm w-full bg-red-600 hover:bg-red-700 text-white"
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "sellTokensForEth",
                    args: [BigInt(0), BigInt(optionIndex), tokenAmount],
                  });
                } catch (e) {
                  console.error("Error selling tokens:", e);
                }
              }}
            >
              Sell
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
