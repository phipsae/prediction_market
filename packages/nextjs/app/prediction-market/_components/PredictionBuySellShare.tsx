"use client";

import { useState } from "react";
import { GiveAllowance } from "./GiveAllowance";
import { TokenBalance } from "./TokenBalance";
import { formatEther, parseEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function PredictionBuySellShare({ optionIndex, colorScheme }: { optionIndex: number; colorScheme: string }) {
  const [inputAmount, setInputAmount] = useState<bigint>(BigInt(0));
  const tokenAmount = parseEther((inputAmount || BigInt(0)).toString());

  const { data: deployedContractData } = useDeployedContractInfo({ contractName: "PredictionMarket" });
  const contractAddress = deployedContractData?.address;

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarket",
  });

  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "prediction",
  });

  const { data: totalPriceInEth } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "totalPriceInEth",
    args: [
      BigInt(optionIndex),
      tokenAmount,
    ],
    watch: true,
  });

  const { data: sellTotalPriceInEth } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "sellTotalPriceInEth",
    args: [
      BigInt(optionIndex),
      tokenAmount,
    ],
    watch: true,
  });

  if (isLoading) return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-lg font-semibold text-center">Loading prediction market...</h2>
    </div>
  );

  if (!prediction) return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg space-y-4">
      <h2 className="text-lg font-semibold text-center">No prediction market found</h2>
    </div>
  );

  const token1Address = prediction[3 + optionIndex];
  const option = prediction[1 + optionIndex];

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg space-y-4">
      <TokenBalance tokenAddress={token1Address as string} option={option as string} />

      <div className="grid grid-cols-2 gap-4">
        {/* Buy Section */}
        <div className={`bg-${colorScheme}-50 p-3 rounded-lg`}>
          <h2 className={`text-lg font-semibold text-${colorScheme}-800 mb-2`}>Buy {option}</h2>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Amount to buy"
              className={`input input-bordered input-sm w-full border-${colorScheme}-200 focus:border-${colorScheme}-500`}
              onChange={e => setInputAmount(BigInt(e.target.value))}
            />

            {totalPriceInEth && (
              <div className={`text-sm text-${colorScheme}-800`}>ETH needed: {formatEther(totalPriceInEth)}</div>
            )}

            <button
              className={`btn btn-sm w-full bg-${colorScheme}-600 hover:bg-${colorScheme}-700 text-white`}
              disabled={!totalPriceInEth}
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "buyTokenWithETH",
                    args: [BigInt(optionIndex), tokenAmount],
                    value: totalPriceInEth,
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
        <div className={`bg-${colorScheme}-50 p-3 rounded-lg`}>
          <h2 className={`text-lg font-semibold text-${colorScheme}-800 mb-2`}>Sell {option}</h2>
          <div className="space-y-2">
            {/* Token Approval */}
            <div className="mb-4">
              <GiveAllowance tokenAddress={token1Address as string} spenderAddress={contractAddress ?? ""} />
            </div>

            <input
              type="number"
              placeholder="Amount to sell"
              className={`input input-bordered input-sm w-full border-${colorScheme}-200 focus:border-${colorScheme}-500`}
              onChange={e => setInputAmount(BigInt(e.target.value))}
            />

            {sellTotalPriceInEth && (
              <div className={`text-sm text-${colorScheme}-800`}>ETH to receive: {formatEther(sellTotalPriceInEth)}</div>
            )}

            <button
              className={`btn btn-sm w-full bg-${colorScheme}-600 hover:bg-${colorScheme}-700 text-white`}
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "sellTokensForEth",
                    args: [BigInt(optionIndex), tokenAmount],
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
