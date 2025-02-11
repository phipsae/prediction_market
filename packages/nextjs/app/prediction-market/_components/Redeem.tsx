"use client";

import { useState } from "react";
import { GiveAllowance } from "./GiveAllowance";
import { TokenBalance } from "./TokenBalance";
import { parseEther } from "viem";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function Redeem() {
  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const tokenAmount = parseEther((amount || BigInt(0)).toString());

  const { data: deployedContractData } = useDeployedContractInfo("PredictionMarketTradingWOTime");
  const contractAddress = deployedContractData?.address;

  const { data: winningOptionId } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getWinningOptionId",
    args: [BigInt(0)],
  });

  const { data: isReported } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getReported",
    args: [BigInt(0)],
  });

  console.log("winningOptionId", winningOptionId);

  const { data: getOptionsToken } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getOptionsToken",
    args: [BigInt(0), BigInt(winningOptionId ?? 0)],
  });

  const { data: winningOption } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getOptions",
    args: [BigInt(0), BigInt(winningOptionId ?? 0)],
  });

  const tokenAddress = getOptionsToken;

  console.log("tokenAddress", tokenAddress);

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketTradingWOTime",
  });

  const handleRedeem = async () => {
    try {
      await writeContractAsync({
        functionName: "redeemWinningTokens",
        args: [BigInt(0), tokenAmount],
      });
    } catch (error) {
      console.error("Error redeeming tokens:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Redeem Winning Tokens</h2>
      {isReported && tokenAddress && winningOptionId !== undefined && winningOption && (
        <TokenBalance tokenAddress={tokenAddress} option={winningOption} />
      )}
      {tokenAddress && contractAddress && (
        <GiveAllowance tokenAddress={tokenAddress} spenderAddress={contractAddress} />
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
