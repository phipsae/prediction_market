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
      <div className="flex flex-row items-center gap-2">
        <h3 className="text-lg text-center font-medium">
          Token Balance of {option}:{" "}
          <span className="text-gray-700">{balance ? formatEther(balance) : "0"} tokens</span>{" "}
        </h3>
      </div>
    </div>
  );
}
