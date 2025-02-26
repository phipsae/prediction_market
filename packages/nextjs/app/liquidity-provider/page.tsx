import type { NextPage } from "next";
import { AddRemoveLiquidity } from "~~/components/liquidity-provider/AddRemoveLiquidty";
import { LPAddress } from "~~/components/liquidity-provider/LPAddress";
import { PredictionMarketInfoLP } from "~~/components/liquidity-provider/PredictionMarketInfoLP";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Liquidity Provider of Prediction Market",
  description: "Easy implmentation of Liquidity Provider for Prediction Market",
});

const LiquidityProvider: NextPage = () => {
  return (
    <>
      <div className="text-center mt-8 bg-secondary p-4 md:p-10">
        <div className="flex flex-col md:flex-row gap-6 justify-center items-stretch">
          <div className="md:w-1/2">
            <PredictionMarketInfoLP />
          </div>
          <div className="md:w-1/2">
            <div className="bg-base-100 p-6 rounded-xl shadow-lg">
              <div className="space-y-4">
                <div className="border-b pb-4">
                  <LPAddress />
                </div>
                <div className="border-b pb-4">
                  <PredictionMarketInfo />
                </div>
                <div>
                  <AddRemoveLiquidity />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default LiquidityProvider;
