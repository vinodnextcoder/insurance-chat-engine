import axios from "axios";

// 🔹 helper function (carrier simulation)
const callCarrierAPI = async (carrier, data) => {
  let premium = carrier.base;

  const { property, coverage, risk_profile } = data;

  if (property.location?.toLowerCase().includes("fl")) {
    premium += 400;
  }

  if (property.year_built < 2000) premium += 200;
  if (coverage.wind_hail) premium += 250;
  if (coverage.hurricane) premium += 350;
  if (risk_profile.claims_history > 0) premium += 300;

  premium += Math.floor(Math.random() * 200);

  const fees = Math.round(premium * 0.05);
  const taxes = Math.round(premium * 0.08);

  return {
    carrier: carrier.name,
    premium,
    fees,
    taxes,
    total_premium: premium + fees + taxes
  };
};

// ✅ MAIN FUNCTION (USED BY CONTROLLER)
export const calculateQuotes = async (data) => {
  const carriers = [
    { name: "Liberty Mutual (Mock)", base: 950 },
    { name: "State Farm (Mock)", base: 1050 },
    { name: "Allstate (Mock)", base: 1000 }
  ];

  const results = await Promise.all(
    carriers.map((c) => callCarrierAPI(c, data))
  );

  return results.sort((a, b) => a.total_premium - b.total_premium);
};