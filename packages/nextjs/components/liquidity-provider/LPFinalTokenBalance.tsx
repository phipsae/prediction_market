"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatEther } from "viem";
import { useBlockNumber, useReadContract } from "wagmi";
import { erc20Abi } from "~~/components/constants";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";

export function LPFinalTokenBalance({
  tokenAddress,
  address,
  tokenValue,
  winningOption,
  lpRevenue,
}: {
  tokenAddress: string;
  address: string;
  tokenValue: bigint;
  winningOption: string;
  lpRevenue: bigint;
}) {
  const { data: balance, queryKey } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [address],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return (
    <div>
      <div className="flex flex-row items-center gap-2">
        <h3 className="text-lg text-center font-medium flex flex-col gap-1">
          <div>
            Redeembale &quot;{winningOption}&quot; Token Balance:{" "}
            <span className="text-gray-700">{balance ? formatEther(balance) : "0"} tokens</span> worth{" "}
            {tokenValue && balance ? formatEther((tokenValue * balance) / BigInt(10 ** 18)) : "0"} ETH
          </div>
          <div>
            and LP Revenue:{" "}
            <span className="text-gray-700">{lpRevenue ? Number(formatEther(lpRevenue)).toFixed(4) : "0"} ETH</span>
            <br />
            <strong>Withdraw in total:</strong>
            {balance && tokenValue && lpRevenue
              ? (
                  Number(formatEther((tokenValue * balance) / BigInt(10 ** 18))) + Number(formatEther(lpRevenue))
                ).toFixed(4)
              : "0"}{" "}
            ETH
          </div>
        </h3>
      </div>
    </div>
  );
}
