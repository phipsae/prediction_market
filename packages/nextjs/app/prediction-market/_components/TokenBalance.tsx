"use client";

import { formatEther } from "viem";
import { useAccount, useReadContract } from "wagmi";

const erc20Abi = [
  {
    inputs: [{ name: "account", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
    type: "function",
  },
] as const;

export function TokenBalance({ tokenAddress, option }: { tokenAddress: string; option: string }) {
  const { address } = useAccount();

  const { data: balance } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  console.log("balance", balance);

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-2">Token Balance of {option}</h3>
      <p className="text-gray-700">Balance: {balance ? formatEther(balance) : "0"} tokens</p>
    </div>
  );
}
