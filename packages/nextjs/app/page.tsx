import type { NextPage } from "next";
import { OverviewBuySellShares } from "~~/components/user/OverviewBuySellShares";
import { PredictionMarketInfo } from "~~/components/user/PredictionMarketInfo";
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
        <div className="bg-base-100 p-4 rounded-lg shadow-lg max-w-2xl mx-auto mt-6">
          <p className="text-base-content">
            Place a bet on the outcome you believe in and stand a chance to win ETH. If others follow your lead and bet
            on the same outcome, you can sell your bet before the final result to secure a profit—or simply wait for the
            outcome to see if you win.
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch mt-6">
          <OverviewBuySellShares />
        </div>
      </div>
    </>
  );
};

export default Prediction;
