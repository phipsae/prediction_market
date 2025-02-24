"use client";

import { PredictionBuySellShare } from "~~/components/prediction-market/PredictionBuySellShare";
import { Redeem } from "~~/components/prediction-market/Redeem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function OverviewBuySellShares() {
  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

  if (isLoading)
    return (
      <div className="max-w-6xl mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
        <p className="text-base-content">Loading prediction market...</p>
      </div>
    );

  if (!prediction)
    return (
      <div className="max-w-6xl mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
        <p className="text-base-content">No prediction market found</p>
      </div>
    );

  const reported = prediction[7];

  return (
    <div className="max-w-6xl mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      {reported ? (
        <div className="mt-6 w-full">
          <Redeem />
        </div>
      ) : (
        <div className="flex gap-6">
          <div className="flex-1 bg-base-200 rounded-lg p-4 border-4 border-green-500">
            <h3 className="text-xl font-semibold text-center mb-4 text-green-500">{prediction[1]} Option</h3>
            <PredictionBuySellShare optionIndex={0} colorScheme="green" />
          </div>
          <div className="flex-1 bg-base-200 rounded-lg p-4 border-4 border-red-500">
            <h3 className="text-xl font-semibold text-center mb-4 text-red-500">{prediction[2]} Option</h3>
            <PredictionBuySellShare optionIndex={1} colorScheme="red" />
          </div>
        </div>
      )}
    </div>
  );
}
