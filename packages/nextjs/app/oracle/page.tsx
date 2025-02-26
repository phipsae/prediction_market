import type { NextPage } from "next";
import { OracleAddress } from "~~/components/oracle/OracleAddress";
import { ReportPrediction } from "~~/components/oracle/ReportPrediction";
import { PredictionMarketInfo } from "~~/components/prediction-market/PredictionMarketInfo";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Oracle",
  description: "Easy Oracle implmentation",
});

const Oracle: NextPage = () => {
  return (
    <>
      <div className="container mx-auto text-center mt-8 bg-secondary p-4 md:p-10">
        <div className="flex flex-col md:flex-row justify-center gap-0">
          <OracleAddress />
          <PredictionMarketInfo />
          <ReportPrediction />
        </div>
      </div>
    </>
  );
};

export default Oracle;
