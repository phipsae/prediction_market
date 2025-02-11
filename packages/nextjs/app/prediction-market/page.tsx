import { OverviewBuySellShares } from "./_components/OverviewBuySellShares";
import { PredictionMarketInfo } from "./_components/PredictionMarketInfo";
import { ReportPrediction } from "./_components/ReportPrediction";
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
        {/* TODO: Show predictions / create prediction --> create in depoly script*/}
        <div className="flex gap-6 justify-center items-stretch">
          <PredictionMarketInfo />
          <OverviewBuySellShares />
        </div>
        <div>
          <ReportPrediction />
        </div>
      </div>
    </>
  );
};

export default PredictionMarket;
