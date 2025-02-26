"use client";

import { useState } from "react";
import { EtherInput } from "../scaffold-eth";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function AddRemoveLiquidity() {
  const [inputBuyAmount, setInputBuyAmount] = useState<number>(0);
  const [inputSellAmount, setInputSellAmount] = useState<number>(0);
  const { address } = useAccount();

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketChallenge",
  });

  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

  if (isLoading)
    return (
      <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-center">Loading prediction market...</h2>
      </div>
    );

  if (!prediction)
    return (
      <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg space-y-4">
        <h2 className="text-lg font-semibold text-center">No prediction market found</h2>
      </div>
    );

  const tokenvalue = prediction[4];
  const isReported = prediction[7];

  const isLiquidityProvider = address === prediction[13];
  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg space-y-4">
      {!isLiquidityProvider && (
        <p className="text-error text-center mb-4">Only the liquidity provider can add or remove liquidity</p>
      )}
      {isReported && <p className="text-error text-center mb-4">Prediction market is already reported</p>}

      <div className="grid grid-cols-2 gap-4">
        {/* Buy Section */}
        <div className={`p-3 rounded-lg`}>
          <h2 className="text-lg font-semibold mb-2">Add Liquidity</h2>
          <div className="space-y-2">
            <EtherInput
              value={inputBuyAmount.toString()}
              placeholder="Amount to buy"
              onChange={e => setInputBuyAmount(Number(e))}
              disabled={!isLiquidityProvider || isReported}
            />
            {inputBuyAmount > 0 && `Adding ${(inputBuyAmount / Number(tokenvalue)) * 10 ** 18} Yes and No tokens`}
            <button
              className={`btn btn-sm w-full btn-primary text-white`}
              disabled={!isLiquidityProvider || isReported}
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "addLiquidity",
                    value: parseEther(inputBuyAmount.toString()),
                  });
                } catch (e) {
                  console.error("Error buying tokens:", e);
                }
              }}
            >
              Add
            </button>
          </div>
        </div>

        <div className="bg-base-100 p-3 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Remove Liquidity</h2>
          <div className="space-y-2">
            <EtherInput
              value={inputSellAmount.toString()}
              placeholder="Amount to sell"
              onChange={e => {
                setInputSellAmount(Number(e));
              }}
              disabled={!isLiquidityProvider || isReported}
            />
            {inputSellAmount > 0 &&
              `Removing ${(inputSellAmount / Number(tokenvalue)) * 10 ** 18} 30 Yes and 30 No token`}
            <div className="flex gap-2">
              <button
                disabled={!isLiquidityProvider || isReported}
                className="btn btn-sm flex-1 btn-primary text-white"
                onClick={async () => {
                  try {
                    // Convert string to number first to handle decimals
                    const amount = Number(inputSellAmount);
                    await writeYourContractAsync({
                      functionName: "removeLiquidity",
                      args: [parseEther(amount.toString())],
                    });
                  } catch (e) {
                    console.error("Error removing liquidity:", e);
                  }
                }}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
