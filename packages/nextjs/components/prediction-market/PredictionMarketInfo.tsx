"use client";

import { ProbabilityDisplay } from "./ProbabilityDisplay";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function PredictionMarketInfo() {
  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

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
  const reported = prediction[7];

  return (
    <div className="bg-base-100 p-6 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="bg-base-200 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <div>
              <div className={`badge ${reported ? "badge-success" : "badge-warning"}`}>
                {reported ? "Reported" : "In Progress"}
              </div>
              <p className="text-base-content">{question}</p>
            </div>
            <ProbabilityDisplay
              token1Reserve={BigInt(prediction[5])}
              token2Reserve={BigInt(prediction[6])}
              tokenAddress={prediction[8]}
              label="Chance"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
