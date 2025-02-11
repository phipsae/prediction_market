"use client";

import { useState } from "react";
import { GiveAllowance } from "./GiveAllowance";
import { parseEther } from "viem";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function Redeem() {
  const [amount, setAmount] = useState<bigint>(BigInt(0));
  const tokenAmount = parseEther((amount || BigInt(0)).toString());

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
      {/* <GiveAllowance tokenAddress={tokenAddress} spenderAddress={contractAddress} /> */}
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
