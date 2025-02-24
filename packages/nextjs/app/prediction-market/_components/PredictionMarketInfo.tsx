"use client";

import { ReportPrediction } from "./ReportPrediction";
import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function PredictionMarketInfo() {
  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

  const { data: initialTokenAmount, isLoading: isLoadingInitialTokenAmount } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "INITIAL_TOKEN_AMOUNT",
  });

  const calculateOption1Chance = (_token1Reserve: bigint, _token2Reserve: bigint) => {
    if (_token1Reserve === undefined || _token2Reserve === undefined || initialTokenAmount === undefined) return 0;

    if (_token1Reserve === initialTokenAmount && _token2Reserve === initialTokenAmount) return 0.5;

    const token1Supply = Number(formatEther(initialTokenAmount)) - Number(formatEther(_token1Reserve));
    const token2Supply = Number(formatEther(initialTokenAmount)) - Number(formatEther(_token2Reserve));

    const option1Chance = token1Supply / (token1Supply + token2Supply);

    return Number(option1Chance);
  };

  if (isLoading)
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
        <p className="text-base-content">Loading prediction market...</p>
      </div>
    );

  if (!prediction)
    return (
      <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>
        <p className="text-base-content">No prediction market found</p>
      </div>
    );

  const question = prediction[0];
  const predictionOutcome1 = prediction[1];
  const predictionOutcome2 = prediction[2];
  // const oracle = prediction[3];
  // const intitalTokenRatio = prediction[4];
  const token1Reserve = prediction[5];
  const token2Reserve = prediction[6];
  const reported = prediction[7];
  const optionToken1 = prediction[8];
  // const optionToken2 = prediction[9];
  const winningToken = prediction[10];
  const ethCollateral = prediction[11];
  const lpTradingRevenue = prediction[12];

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Prediction Market Info</h2>

      <div className="space-y-6">
        <div className="bg-base-200 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Question</h3>
          <p className="text-base-content">{question}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-base-200 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Probability</h3>
            <div
              className={`radial-progress ${
                reported
                  ? winningToken === optionToken1
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
                    ? winningToken === optionToken1
                      ? 100
                      : 0
                    : calculateOption1Chance(token1Reserve ?? BigInt(0), token2Reserve ?? BigInt(0)) * 100,
                } as any
              }
            >
              {reported
                ? winningToken === optionToken1
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
                {Number(formatEther(BigInt(ethCollateral ?? 0))).toFixed(4)} ETH
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">LP Revenue</div>
              <div className="stat-value text-secondary">
                {Number(formatEther(BigInt(lpTradingRevenue ?? 0))).toFixed(4)} ETH
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
