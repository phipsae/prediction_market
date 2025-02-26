"use client";

import { useState } from "react";
import { GiveAllowance } from "~~/components/prediction-market/GiveAllowance";
import { TokenBalance } from "~~/components/prediction-market/TokenBalance";
import { parseEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function Redeem() {
  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const tokenAmount = parseEther((amount || BigInt(0)).toString());

  const { data: deployedContractData } = useDeployedContractInfo({ contractName: "PredictionMarketChallenge" });
  const contractAddress = deployedContractData?.address;

  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketChallenge",
  });

  if (isLoading)
    return (
      <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
        <p className="text-base-content">Loading prediction market...</p>
      </div>
    );

  if (!prediction)
    return (
      <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
        <p className="text-base-content">No prediction market found</p>
      </div>
    );

  const predictionOutcome1 = prediction[1];
  const predictionOutcome2 = prediction[2];
  const isReported = prediction[7];
  const optionToken1 = prediction[8];
  const winningToken = prediction[10];
  const tokenAddress = winningToken === optionToken1 ? prediction[8] : prediction[9];
  const winningOption = winningToken === optionToken1 ? predictionOutcome1 : predictionOutcome2;

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
      {isReported && tokenAddress && winningOption && (
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
