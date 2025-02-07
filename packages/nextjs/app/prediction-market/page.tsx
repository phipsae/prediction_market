import { PredictionBuyShare } from "./_components/PredictionBuyShare";
import { PredictionMarketInfo } from "./_components/PredictionMarketInfo";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Prediciton Market",
  description: "Easy implmentation of Prediciton Market",
});

const PredictionMarket: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-10">
        <h1 className="text-4xl my-0">Prediciton Market</h1>
        {/* Show predictions / create prediction --> create in depoly script*/}
        {/* Show info related to prediction market lp etc. */}
        <PredictionMarketInfo />
        {/* Make it possible to trade on the market */}
        <PredictionBuyShare />
        {/* Report a prediction */}
        {/* Redeem winning tokens */}
        <p className="text-neutral">
          You can debug & interact with your deployed contracts here.
          <br /> Check{" "}
          <code className="italic bg-base-300 text-base font-bold [word-spacing:-0.5rem] px-1">
            packages / nextjs / app / debug / page.tsx
          </code>
        </p>
      </div>
    </>
  );
};

export default PredictionMarket;
