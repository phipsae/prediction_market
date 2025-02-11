"use client";

import { formatEther } from "viem";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

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

  const { data: token1Reserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getTokenReserve",
    args: [BigInt(0), BigInt(0)],
  });

  ///   Token 2
  const { data: predictionOutcome2 } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getOptions",
    args: [BigInt(0), BigInt(1)],
  });

  const { data: token2Reserve } = useScaffoldReadContract({
    contractName: "PredictionMarketTradingWOTime",
    functionName: "getTokenReserve",
    args: [BigInt(0), BigInt(1)],
  });

  console.log(token1Reserve);

  return (
    <h1>
      Prediction Question: {predictionQuestion}
      <br />
      ETH Reserve: {formatEther(BigInt(ethReserve ?? 0))}
      LP Reserve in ETH: {formatEther(BigInt(lpReserve ?? 0))}
      <br />
      {/* Token1 */}
      {predictionOutcome1}
      token1Reserve: {formatEther(BigInt(token1Reserve ?? 0))}
      <br />
      {/* Token2 */}
      {predictionOutcome2}
      token2Reserve: {formatEther(BigInt(token2Reserve ?? 0))}
    </h1>
  );
}
