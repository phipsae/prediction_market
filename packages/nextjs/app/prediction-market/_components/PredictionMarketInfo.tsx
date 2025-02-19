"use client";

import { ReportPrediction } from "./ReportPrediction";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function PredictionMarketInfo() {
  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "prediction",
  });

  const calculateOption1Chance = (_token1Reserve: bigint, _token2Reserve: bigint) => {
    if (_token1Reserve === undefined || _token2Reserve === undefined) return 0;

    const token1Supply = 1000 - Number(formatEther(_token1Reserve));
    const token2Supply = 1000 - Number(formatEther(_token2Reserve));

    if (token1Supply + token2Supply === 0) return 0;

    const option1Chance = token1Supply / (token1Supply + token2Supply);

    return Number(option1Chance);
  };

  if (isLoading) return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
      <p className="text-base-content">Loading prediction market...</p>
    </div>
  );

  if (!prediction) return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
      <p className="text-base-content">No prediction market found</p>
    </div>
  );

  const reported = prediction[8];
  const winningOptionId = prediction[7];
  const token1Reserve = prediction[5];
  const token2Reserve = prediction[6];
  const ethReserve = prediction[12];
  const lpReserve = prediction[13];
  const predictionOutcome1 = prediction[1];
  const predictionOutcome2 = prediction[2];

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>

      <div className="space-y-6">
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Question</h3>
          <p className="text-base-content">{prediction[0]}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Probability</h3>
            <div
              className={`radial-progress ${reported
                ? winningOptionId === BigInt(0)
                  ? "text-success"
                  : "text-error"
                : calculateOption1Chance(token1Reserve ?? BigInt(0), token2Reserve ?? BigInt(0)) > 0.5
                  ? "text-success"
                  : calculateOption1Chance(token1Reserve ?? BigInt(0), token2Reserve ?? BigInt(0)) === 0.5
                    ? "text-neutral"
                    : "text-error"
                }`}
              style={
                {
                  "--value": reported
                    ? winningOptionId === BigInt(0)
                      ? 100
                      : 0
                    : calculateOption1Chance(token1Reserve ?? BigInt(0), token2Reserve ?? BigInt(0)) * 100,
                } as any
              }
            >
              {reported
                ? winningOptionId === BigInt(0)
                  ? "100.00%"
                  : "0.00%"
                : (calculateOption1Chance(token1Reserve ?? BigInt(0), token2Reserve ?? BigInt(0)) * 100).toFixed(2) +
                "%"}
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
        <ReportPrediction />
      </div>
    </div>
  );
}
