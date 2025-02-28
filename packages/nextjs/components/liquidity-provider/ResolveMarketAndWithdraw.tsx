"use client";

import { LPFinalTokenBalance } from "~~/components/liquidity-provider/LPFinalTokenBalance";
import { TokenBalance } from "~~/components/user/TokenBalance";
import { useScaffoldContract, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export function ResolveMarketAndWithdraw() {
  const { data: prediction, isLoading } = useScaffoldReadContract({
    contractName: "PredictionMarketChallenge",
    functionName: "prediction",
  });

  const { data: predictionMarketContract } = useScaffoldContract({
    contractName: "PredictionMarketChallenge",
  });

  const { writeContractAsync } = useScaffoldWriteContract({
    contractName: "PredictionMarketChallenge",
  });

  if (isLoading)
    return (
      <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Resolve Market and Withdraw ETH</h2>
        <p className="text-base-content">Loading prediction market...</p>
      </div>
    );

  if (!prediction || !predictionMarketContract)
    return (
      <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Resolve Market and Withdraw ETH</h2>
        <p className="text-base-content">No prediction market found</p>
      </div>
    );

  const tokenValue = prediction[4];
  const predictionOutcome1 = prediction[1];
  const predictionOutcome2 = prediction[2];
  const isReported = prediction[7];
  const optionToken1 = prediction[8];
  const winningToken = prediction[10];
  const lpRevenue = prediction[12];
  const winningOption = winningToken === optionToken1 ? predictionOutcome1 : predictionOutcome2;

  if (!isReported) return <></>;

  const handleWithdraw = async () => {
    try {
      await writeContractAsync({
        functionName: "resolveMarketAndWithdraw",
      });
    } catch (error) {
      console.error("Error redeeming tokens:", error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-base-100 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-4">Resolve Market and Withdraw ETH</h2>
      <div className="flex flex-row gap-4 items-center">
        <LPFinalTokenBalance
          tokenAddress={winningToken as string}
          winningOption={winningOption}
          address={predictionMarketContract.address as string}
          tokenValue={tokenValue}
          lpRevenue={lpRevenue}
        />
        <div className="flex gap-4">
          <button className="btn btn-primary" onClick={handleWithdraw}>
            Withdraw ETH
          </button>
        </div>
      </div>
    </div>
  );
}
