"use client";

import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

/// TODO: add total supply to calculate winning chance, if liquidty is added or removed it doenst work
export function PredictionMarketInfo() {
  const { data: predictionQuestion } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getPredictionQuestion",
    args: [BigInt(0)],
  });

  const { data: ethReserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getPredictionEthReserve",
    args: [BigInt(0)],
  });

  const { data: lpReserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getPredictionLpReserve",
    args: [BigInt(0)],
  });

  ///   Token 1
  const { data: predictionOutcome1 } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getOptions",
    args: [BigInt(0), BigInt(0)],
  });

  const { data: predictionOutcome2 } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getOptions",
    args: [BigInt(0), BigInt(1)],
  });

  const { data: token1Reserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getTokenReserve",
    args: [BigInt(0), BigInt(0)],
  });

  const { data: token2Reserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getTokenReserve",
    args: [BigInt(0), BigInt(1)],
  });

  const { data: reported } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getReported",
    args: [BigInt(0)],
  });

  const calculateOption1Chance = (_token1Reserve: bigint, _token2Reserve: bigint) => {
    const option1Chance =
      1 -
      Number(formatEther(BigInt(_token1Reserve ?? 0))) /
        Number(formatEther(BigInt(_token1Reserve ?? 0) + BigInt(_token2Reserve ?? 0)));
    return option1Chance;
  };

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>

      <div className="space-y-6">
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Question</h3>
          <p className="text-base-content">{predictionQuestion}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Probability</h3>
            <div
              className="radial-progress text-primary"
              style={
                {
                  "--value": calculateOption1Chance(token1Reserve ?? BigInt(0), token2Reserve ?? BigInt(0)) * 100,
                } as any
              }
            >
              {(calculateOption1Chance(token1Reserve ?? BigInt(0), token2Reserve ?? BigInt(0)) * 100).toFixed(2)}%
            </div>
          </div>

          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Status</h3>
            <div className={`badge ${reported ? "badge-success" : "badge-warning"}`}>
              {reported ? "Reported" : "In Progress"}
            </div>
          </div>
        </div>

        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Prize Pool</h3>
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-title">Winning Pot</div>
              <div className="stat-value text-primary">
                {Number(formatEther(BigInt(ethReserve ?? 0))).toFixed(4)} ETH
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">LP Revenue</div>
              <div className="stat-value text-secondary">
                {Number(formatEther(BigInt(lpReserve ?? 0))).toFixed(4)} ETH
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{predictionOutcome1}</h3>
            <div className="stat-value text-xs">
              {Number(formatEther(BigInt(token1Reserve ?? 0))).toFixed(4)} tokens
            </div>
          </div>

          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{predictionOutcome2}</h3>
            <div className="stat-value text-xs">
              {Number(formatEther(BigInt(token2Reserve ?? 0))).toFixed(4)} tokens
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
