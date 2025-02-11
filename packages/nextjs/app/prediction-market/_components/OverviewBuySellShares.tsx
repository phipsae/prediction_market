"use client";

import { PredictionBuySellShare } from "./PredictionBuySellShare";
import { Redeem } from "./Redeem";

export function OverviewBuySellShares() {
  return (
    <div className="max-w-6xl mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Prediction Buy/Sell Options</h2>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 bg-base-200 rounded-lg p-4">
          <h3 className="text-xl font-semibold text-center mb-4 text-primary">YES Option</h3>
          <PredictionBuySellShare optionIndex={0} />
        </div>
        <div className="flex-1 bg-base-200 rounded-lg p-4">
          <h3 className="text-xl font-semibold text-center mb-4 text-primary">NO Option</h3>
          <PredictionBuySellShare optionIndex={1} />
        </div>
      </div>
      <div className="mt-6 w-full">
        <Redeem />
      </div>
    </div>
  );
}
