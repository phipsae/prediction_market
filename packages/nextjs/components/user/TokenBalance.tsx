import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { formatEther } from "viem";
import { useAccount, useBlockNumber, useReadContract } from "wagmi";
import { erc20Abi } from "~~/components/constants";
import { useSelectedNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function TokenBalance({
  tokenAddress,
  option,
  redeem,
}: {
  tokenAddress: string;
  option: string;
  redeem: boolean;
}) {
  const { address } = useAccount();

  const { data: balance, queryKey } = useReadContract({
    abi: erc20Abi,
    address: tokenAddress,
    functionName: "balanceOf",
    args: [address ?? "0x0"],
  });

  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

  const tokenValue = prediction?.[4];

  const selectedNetwork = useSelectedNetwork();
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({
    watch: true,
    chainId: selectedNetwork.id,
    query: {
      enabled: true,
    },
  });

  const tokenBalanceValue = balance && tokenValue ? (balance * tokenValue) / BigInt(10n ** 18n) : 0n;

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockNumber]);

  return (
    <>
      <div>
        <div className="flex flex-row items-center gap-2">
          <h3 className="text-lg text-center font-medium flex flex-col gap-1">
            <div>
              My Token Balance of &quot;{option}&quot;:{" "}
              <span className="text-gray-700">{balance ? formatEther(balance) : "0"} tokens</span>
            </div>
            <div className="text-gray-700 text-sm">
              ({tokenBalanceValue ? formatEther(tokenBalanceValue) : "0"}{" "}
              {redeem ? "ETH worth" : "ETH worth in case of win"})
            </div>
          </h3>
        </div>
      </div>
    </>
  );
}
