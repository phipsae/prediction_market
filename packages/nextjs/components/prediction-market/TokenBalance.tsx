import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatEther } from "viem";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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

  const { data: balance, queryKey } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  const { data: tokenValue } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "i_initialTokenValue",
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

  const tokenBalanceValue = balance && tokenValue ? (balance * tokenValue) / BigInt(10n ** 36n) : 0n;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return (
    <div>
      <div className="flex flex-row items-center gap-2">
        <h3 className="text-lg text-center font-medium flex flex-col gap-1">
          <div>
            Token Balance of {option}:{" "}
            <span className="text-gray-700">{balance ? formatEther(balance) : "0"} tokens</span>
          </div>
          <div className="text-gray-700">
            {tokenBalanceValue ? formatEther(tokenBalanceValue) : "0"} ETH in case of win
          </div>
        </h3>
      </div>
    </div>
  );
}
