"use client";

import { useState } from "react";
import { GiveAllowance } from "./GiveAllowance";
import { TokenBalance } from "./TokenBalance";
import { parseEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function Redeem() {
  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const tokenAmount = parseEther((amount || BigInt(0)).toString());

  const { data: deployedContractData } = useDeployedContractInfo({ contractName: "PredictionMarket" });
  const contractAddress = deployedContractData?.address;

  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "prediction",
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarket",
  });

  if (isLoading) return (
    <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
      <p className="text-base-content">Loading prediction market...</p>
    </div>
  );

  if (!prediction) return (
    <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
      <p className="text-base-content">No prediction market found</p>
    </div>
  );

  const winningOptionId = prediction[7];
  const isReported = prediction[8];
  const tokenAddress = prediction[3 + Number(winningOptionId)];
  const winningOption = prediction[1 + Number(winningOptionId)];

  const handleRedeem = async () => {
    try {
      await writeContractAsync({
        functionName: "redeemWinningTokens",
        args: [tokenAmount],
      });
    } catch (error) {
      console.error("Error redeeming tokens:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
      {isReported && tokenAddress && winningOptionId !== undefined && winningOption && (
        <TokenBalance tokenAddress={tokenAddress as string} option={winningOption as string} />
      )}
      {tokenAddress && contractAddress && (
        <GiveAllowance tokenAddress={tokenAddress as string} spenderAddress={contractAddress} />
      )}

      <div className="flex gap-4">
        <input
          type="number"
          placeholder="Amount to redeem"
          className="input input-bordered flex-1"
          onChange={e => setAmount(BigInt(e.target.value))}
        />
        <button className="btn btn-primary" onClick={handleRedeem}>
          Redeem Tokens
        </button>
      </div>
    </div>
  );
}
