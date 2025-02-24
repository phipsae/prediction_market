"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useWriteContract } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";

const erc20Abi = [
  {
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
    type: "function",
  },
] as const;

export function GiveAllowance({ tokenAddress, spenderAddress }: { tokenAddress: string; spenderAddress: string }) {
  const [amount, setAmount] = useState<string>("");

  console.log("tokenAddress From GiveAllowance", tokenAddress);
  console.log("spenderAddress From GiveAllowance", spenderAddress);

  const { writeContractAsync: approveToken } = useWriteContract();

  const handleApprove = async () => {
    try {
      await approveToken({
        abi: erc20Abi,
        address: tokenAddress,
        functionName: "approve",
        args: [spenderAddress, parseEther(amount || "0")],
      });
      notification.success("Tokens approved successfully");
    } catch (error) {
      console.error("Error approving tokens:", error);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="number"
        placeholder="Amount to approve"
        className="input input-bordered input-sm w-full border-gray-300 focus:border-gray-500"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />
      <button className="btn btn-sm w-full bg-gray-600 hover:bg-gray-700 text-white" onClick={handleApprove}>
        Approve Tokens
      </button>
    </div>
  );
}
