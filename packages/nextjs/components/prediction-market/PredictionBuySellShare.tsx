"use client";

import { useState } from "react";
import { ProbabilityDisplay } from "./ProbabilityDisplay";
import { formatEther, parseEther } from "viem";
import { useReadContract } from "wagmi";
import { GiveAllowance } from "~~/components/prediction-market/GiveAllowance";
import { TokenBalance } from "~~/components/prediction-market/TokenBalance";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function PredictionBuySellShare({ optionIndex, colorScheme }: { optionIndex: number; colorScheme: string }) {
  const [inputBuyAmount, setInputBuyAmount] = useState<bigint>(BigInt(0));
  const tokenBuyAmount = parseEther((inputBuyAmount || BigInt(0)).toString());
  const [inputSellAmount, setInputSellAmount] = useState<bigint>(BigInt(0));
  const tokenSellAmount = parseEther((inputSellAmount || BigInt(0)).toString());

  const { data: deployedContractData } = useDeployedContractInfo({ contractName: "PredictionMarketChallenge" });
  const contractAddress = deployedContractData?.address;

  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketChallenge",
  });

  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

  const { data: totalPriceInEth } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "getBuyPriceInEth",
    args: [optionIndex, tokenBuyAmount],
    watch: true,
  });

  const { data: sellTotalPriceInEth } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "getSellPriceInEth",
    args: [optionIndex, tokenSellAmount],
    watch: true,
  });

  const erc20Abi = [
    {
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
  ] as const;

  const { data: totalSupply } = useReadContract({
    abi: erc20Abi,
    address: prediction?.[8] as string,
    functionName: "totalSupply",
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

  const token1Address = prediction[8 + optionIndex];
  const option = prediction[1 + optionIndex];
  const token1Reserve = prediction[5 + optionIndex] as bigint;
  const token2Reserve = prediction[6 - optionIndex] as bigint;
  const ethCollateral = prediction[11];

  const etherToReceive = totalSupply
    ? (parseEther((inputBuyAmount || BigInt(0)).toString()) * ethCollateral) / totalSupply
    : 0n;
  const etherToWin = totalPriceInEth ? etherToReceive - totalPriceInEth : 0n;

  return (
    <div className="max-w-lg mx-auto p-4 bg-white rounded-xl shadow-lg space-y-4">
      <ProbabilityDisplay
        token1Reserve={token1Reserve ?? BigInt(0)}
        token2Reserve={token2Reserve ?? BigInt(0)}
        tokenAddress={token1Address as string}
      />

      <div className="flex justify-center">
        <TokenBalance tokenAddress={token1Address as string} option={option as string} redeem={false} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Buy Section */}
        <div className={`bg-${colorScheme}-50 p-3 rounded-lg`}>
          <h2 className={`text-lg font-semibold text-${colorScheme}-800 mb-2`}>Buy {option}</h2>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Amount to buy"
              className="input input-bordered input-sm w-full"
              onChange={e => setInputBuyAmount(BigInt(e.target.value))}
            />

            {totalPriceInEth && (
              <>
                <div className="text-sm">ETH needed: {formatEther(totalPriceInEth)}</div>

                <ProbabilityDisplay
                  token1Reserve={(token1Reserve ?? BigInt(0)) - parseEther((inputBuyAmount || BigInt(0)).toString())}
                  token2Reserve={token2Reserve ?? BigInt(0)}
                  tokenAddress={token1Address as string}
                  label="New Probability"
                />

                {totalSupply && (
                  <div className="text-sm">
                    You can get: Ξ{formatEther(etherToReceive)}
                    (winning Ξ{formatEther(etherToWin)})
                  </div>
                )}
              </>
            )}

            <button
              className={`btn btn-sm w-full btn-primary text-white`}
              disabled={!totalPriceInEth}
              onClick={async () => {
                try {
                  await writeYourContractAsync({
                    functionName: "buyTokensWithETH",
                    args: [optionIndex, tokenBuyAmount],
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

        <div className="bg-base-100 p-3 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Sell {option}</h2>
          <div className="space-y-2">
            <input
              type="number"
              placeholder="Amount to sell"
              className="input input-bordered input-sm w-full"
              onChange={e => setInputSellAmount(BigInt(e.target.value))}
            />

            {sellTotalPriceInEth && (
              <>
                <div className="text-sm">ETH to receive: {formatEther(sellTotalPriceInEth)}</div>
                <ProbabilityDisplay
                  token1Reserve={(token1Reserve ?? BigInt(0)) + parseEther((inputSellAmount || BigInt(0)).toString())}
                  token2Reserve={token2Reserve ?? BigInt(0)}
                  tokenAddress={token1Address as string}
                  label="New Probability"
                />
              </>
            )}

            <div className="flex gap-2">
              <GiveAllowance
                tokenAddress={token1Address as string}
                spenderAddress={contractAddress ?? ""}
                amount={inputSellAmount.toString()}
                showInput={false}
              />
              <button
                className="btn btn-sm flex-1 btn-primary text-white"
                onClick={async () => {
                  try {
                    await writeYourContractAsync({
                      functionName: "sellTokensForEth",
                      args: [optionIndex, tokenSellAmount],
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
    </div>
  );
}
