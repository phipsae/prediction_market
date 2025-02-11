"use client";

import { PredictionBuySellShare } from "./PredictionBuySellShare";
import { Redeem } from "./Redeem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export function OverviewBuySellShares() {
  const { data: isReported } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getReported",
    args: [BigInt(0)],
  });

  return (
    <div className="max-w-6xl mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Prediction Buy/Sell Options</h2>
      <div className={`flex flex-col gap-6 ${isReported ? "opacity-50 pointer-events-none" : ""}`}>
        <div className="flex-1 bg-base-200 rounded-lg p-4 border-4 border-green-500">
          <h3 className="text-xl font-semibold text-center mb-4 text-green-500">YES Option</h3>
          <PredictionBuySellShare optionIndex={0} colorScheme="green" />
        </div>
        <div className="flex-1 bg-base-200 rounded-lg p-4 border-4 border-red-500">
          <h3 className="text-xl font-semibold text-center mb-4 text-red-500">NO Option</h3>
          <PredictionBuySellShare optionIndex={1} colorScheme="red" />
        </div>
      </div>
      <div className={`mt-6 w-full ${!isReported ? "opacity-50 pointer-events-none" : ""}`}>
        <Redeem />
      </div>
    </div>
  );
}
