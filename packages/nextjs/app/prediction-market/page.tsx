import type { NextPage } from "next";
import { OverviewBuySellShares } from "~~/components/prediction-market/OverviewBuySellShares";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Prediciton Market",
  description: "Easy implmentation of Prediciton Market",
});

const PredictionMarket: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-4 md:p-10">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          <PredictionMarketInfo />
          <OverviewBuySellShares />
        </div>
      </div>
    </>
  );
};

export default PredictionMarket;
