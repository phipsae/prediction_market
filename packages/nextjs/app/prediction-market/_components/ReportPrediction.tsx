"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function ReportPrediction() {
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0);
  const { address } = useAccount();

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarket",
  });

  const { data: oracleAddress } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "oracle",
  });

  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarket",
    functionName: "prediction",
  });

  const isOracle = address === oracleAddress;

  const handleReport = async () => {
    try {
      await writeContractAsync({
        functionName: "report",
        args: [BigInt(selectedOutcome)],
      });
    } catch (error) {
      console.error("Error reporting outcome:", error);
    }
  };

  if (!prediction) return null;

  return (
    <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Report Prediction Outcome</h2>
      {!isOracle && <p className="text-error text-center mb-4">Only the oracle can report prediction outcomes</p>}
      <div className="flex gap-4">
        <select
          className="select select-bordered flex-1"
          value={selectedOutcome}
          onChange={e => setSelectedOutcome(Number(e.target.value))}
          disabled={!isOracle}
        >
          <option value={0}>{prediction[1]}</option>
          <option value={1}>{prediction[2]}</option>
        </select>
        <button className="btn btn-primary" onClick={handleReport} disabled={!isOracle}>
          Report Outcome
        </button>
      </div>
    </div>
  );
}
