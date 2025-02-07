"use client";

import { useState } from "react";
import { formatEther, parseEther } from "viem";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function PredictionBuyShare() {
  const [inputAmount, setInputAmount] = useState<bigint>(BigInt(0));
  const tokenAmount = parseEther((inputAmount || BigInt(0)).toString());

  //  buy token 1 of prediction 0
  const { writeContractAsync: writeYourContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketTrading",
  });

  const { data: initialTokenAmount } = useScaffoldReadContract({
    contractName: "PredictionMarketTrading",
    functionName: "getInitialTokenAmount",
    args: [BigInt(0)],
  });

  const { data: token1Reserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTrading",
    functionName: "getTokenReserve",
    args: [BigInt(0), BigInt(0)],
  });

  const { data: ethReserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTrading",
    functionName: "getPredictionEthReserve",
    args: [BigInt(0)],
  });

  const { data: avgPriceInEth } = useScaffoldReadContract({
    contractName: "PredictionMarketTrading",
    functionName: "avgPriceInEth",
    args: [
      initialTokenAmount ?? BigInt(0),
      token1Reserve ?? BigInt(0),
      (ethReserve ?? BigInt(0)) * BigInt(1e18),
      tokenAmount,
    ],
    watch: true,
  });
  const totalEthNeeded = avgPriceInEth ? (avgPriceInEth * tokenAmount) / BigInt(1e18) / BigInt(1e18) : undefined;

  console.log("tokenAmount", tokenAmount ? formatEther(tokenAmount) : 0);
  console.log("initialTokenAmount", initialTokenAmount ? formatEther(initialTokenAmount) : 0);
  console.log("token1Reserve", token1Reserve ? formatEther(token1Reserve) : 0);
  console.log("ethReserve", ethReserve ? formatEther(ethReserve) : 0);
  console.log("avgPriceInEth", avgPriceInEth ? formatEther(avgPriceInEth) : 0);
  console.log("totalEthNeeded", formatEther(totalEthNeeded ?? BigInt(0)));
  return (
    <>
      <div className="flex flex-col gap-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Amount of tokens to buy of token 1 &apos;yes&apos;</span>
          </label>
          <input
            type="number"
            // step="0.000000000000000001"
            placeholder="Enter amount"
            className="input input-bordered"
            onChange={e => setInputAmount(BigInt(e.target.value))}
          />
        </div>
      </div>
      {totalEthNeeded && <p>Eth needed for purchase: {formatEther(totalEthNeeded)}</p>}
      <button
        className="btn btn-primary"
        onClick={async () => {
          try {
            await writeYourContractAsync({
              functionName: "buyTokenWithETH",
              args: [BigInt(0), BigInt(0), tokenAmount],
              value: parseEther(formatEther(totalEthNeeded ?? BigInt(0))),
            });
          } catch (e) {
            console.log("totalEthNeeded", totalEthNeeded);
            console.log("avgPriceInEth", avgPriceInEth);
            console.error("Error buying tokens:", e);
          }
        }}
      >
        Buy Tokens
      </button>
    </>
  );
}
