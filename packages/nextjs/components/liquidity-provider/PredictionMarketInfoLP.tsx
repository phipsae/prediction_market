"use client";

import { useEffect } from "react";
import { erc20Abi } from "../constants";
import { useQueryClient } from "@tanstack/react-query";
import { formatEther } from "viem";
import { useBlockNumber, useReadContract } from "wagmi";
import { useScaffoldReadContract, useSelectedNetwork } from "~~/hooks/scaffold-eth";

export function PredictionMarketInfoLP() {
  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

  const { data: totalSupply1, queryKey } = useReadContract({
    abi: erc20Abi,
    address: prediction?.[8] as string,
    functionName: "totalSupply",
  });

  const { data: totalSupply2, queryKey: queryKey2 } = useReadContract({
    abi: erc20Abi,
    address: prediction?.[9] as string,
    functionName: "totalSupply",
  });

  const selectedNetwork = useSelectedNetwork();
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: selectedNetwork.id,
    query: {
      enabled: true,
    },
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: queryKey2 });
  }, [blockNumber, queryClient, queryKey, queryKey2]);

  if (isLoading)
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
        <p className="text-base-content">Loading prediction market...</p>
      </div>
    );

  if (!prediction)
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
        <p className="text-base-content">No prediction market found</p>
      </div>
    );

  const predictionOutcome1 = prediction[1];
  const predictionOutcome2 = prediction[2];
  const token1Reserve = prediction[5];
  const token2Reserve = prediction[6];
  const ethCollateral = prediction[11];
  const lpTradingRevenue = prediction[12];
  const tokenValue = prediction[4];

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info for Liquidity Provider</h2>

      <div className="space-y-6">
        <div className="bg-base-200 p-4 rounded-lg">
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="text-xl">Prediciton Market Collateral</div>
              (Amount of ETH that goes to the winning token)
              <div className="stat-value text-primary pt-2">
                {Number(formatEther(BigInt(ethCollateral ?? 0))).toFixed(4)} ETH
              </div>
            </div>
            <div className="stat">
              <div className="text-xl">LP Revenue</div>
              (Token revenue when token gets bought/sold)
              <div className="stat-value text-primary pt-2">
                {Number(formatEther(BigInt(lpTradingRevenue ?? 0))).toFixed(4)} ETH
              </div>
            </div>
          </div>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <div className="stats shadow w-full">
            <div className="stat flex flex-row items-center justify-center">
              <div>
                <div className="text-xl">Token Value</div>
                <div className="text-sm">(Value of winning token in ETH)</div>
              </div>
              <div className="text-primary text-xl">{Number(formatEther(BigInt(tokenValue ?? 0))).toFixed(4)} ETH</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">{predictionOutcome1}</h2>
            <h3 className="text-lg mb-2">
              Amount of {predictionOutcome1} tokens <span className="font-bold">hold by prediction market</span>
            </h3>
            <div className="stat-value text-lg">
              {Number(formatEther(BigInt(token1Reserve ?? 0))).toFixed(2)} tokens
            </div>
            <h3 className="text-lg mb-2 pt-2">
              (Value of tokens ETH{" "}
              {Number(formatEther(BigInt(((token1Reserve ?? 0) * (tokenValue ?? 0)) / BigInt(10 ** 18)))).toFixed(2)} if
              Oracle reports {predictionOutcome1})
            </h3>
            <h3 className="text-lg mb-2 border-t pt-2">
              Amount of {predictionOutcome1} <span className="font-bold">tokens sold</span>
            </h3>
            <div className="stat-value text-lg">
              {Number(formatEther(BigInt(totalSupply1 ?? 0) - BigInt(token1Reserve ?? 0))).toFixed(2)} tokens
            </div>
            <h3 className="text-lg mb-2 pt-2">
              (Value of tokens ETH{" "}
              {Number(
                formatEther(
                  BigInt(
                    ((BigInt(totalSupply1 ?? 0) - BigInt(token1Reserve ?? 0)) * (tokenValue ?? 0)) / BigInt(10 ** 18),
                  ),
                ),
              ).toFixed(2)}{" "}
              if Oracle reports {predictionOutcome1})
            </h3>
          </div>

          <div className="bg-base-200 p-4 rounded-lg">
            <h2 className="text-2xl font-semibold mb-2">{predictionOutcome2}</h2>
            <h3 className="text-lg mb-2">
              Amount of {predictionOutcome2} tokens <span className="font-bold">hold by prediction market</span>
            </h3>
            <div className="stat-value text-lg">
              {Number(formatEther(BigInt(token2Reserve ?? 0))).toFixed(2)} tokens
            </div>
            <h3 className="text-lg mb-2 pt-2">
              (Value of tokens ETH{" "}
              {Number(formatEther(BigInt(((token2Reserve ?? 0) * (tokenValue ?? 0)) / BigInt(10 ** 18)))).toFixed(2)} if
              Oracle reports {predictionOutcome2})
            </h3>
            <h3 className="text-lg mb-2 border-t pt-2">
              Amount of {predictionOutcome2} <span className="font-bold">tokens sold</span>
            </h3>
            <div className="stat-value text-lg">
              {Number(formatEther(BigInt(totalSupply2 ?? 0) - BigInt(token2Reserve ?? 0))).toFixed(2)} tokens
            </div>
            <h3 className="text-lg mb-2 pt-2">
              (Value of tokens ETH{" "}
              {Number(
                formatEther(
                  BigInt(
                    ((BigInt(totalSupply2 ?? 0) - BigInt(token2Reserve ?? 0)) * (tokenValue ?? 0)) / BigInt(10 ** 18),
                  ),
                ),
              ).toFixed(2)}{" "}
              if Oracle reports {predictionOutcome2})
            </h3>
          </div>
        </div>
      </div>
    </div>
  );
}
