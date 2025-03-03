"use client";

import { Address } from "../scaffold-eth";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function LPAddress() {
  const { data: prediction } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });
  const { address } = useAccount();

  if (!prediction)
    return (
      <div className="flex flex-col bg-base-100 p-4 rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
        <p className="text-base-content">No prediction market found</p>
      </div>
    );

  const isLp = prediction[13] === address;

  return (
    <div className="flex flex-col items-center justify-center">
      <h2 className="text-2xl font-bold text-center mb-4">Liquidity Provider</h2>
      {!isLp && <span className="text-error">You are not the Liquidity Provider</span>}
      <Address address={prediction[13]} />
    </div>
  );
}
