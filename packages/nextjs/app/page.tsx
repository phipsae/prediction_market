import type { NextPage } from "next";
import { OverviewBuySellShares } from "~~/components/prediction-market/OverviewBuySellShares";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Prediction Market",
  description: "Buy/Sell shares in a prediction market",
});

const Prediction: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-4 md:p-10">
        <PredictionMarketInfo />
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch mt-6">
          <OverviewBuySellShares />
        </div>
      </div>
    </>
  );
};

export default Prediction;
