import axios from "axios";

export const buildPayload = (data) => {
  return {
    applicant: {
      name: data.name,
      address: data.address
    },
    property: {
      type: data.propertyType,
      year_built: data.yearBuilt
    },
    coverage: {
      wind_hail: data.windHail,
      hurricane: data.hurricane
    },
    risk_profile: {
      claims_history: data.claims
    }
  };
};
export const sendToCarrierAPI = async (payload) => {
  try {
    // 🏢 Mock multiple carriers
    const carriers = [
      {
        name: "Carrier A",
        baseRate: 900
      },
      {
        name: "Carrier B",
        baseRate: 1100
      },
      {
        name: "Carrier C",
        baseRate: 1000
      }
    ];

    // 🧮 Generate quotes dynamically
    const quotes = carriers.map((carrier) => {
      let premium = carrier.baseRate;

      // 📍 Risk adjustments (simple underwriting logic)
      if (payload.coverage?.wind_hail) {
        premium += 200;
      }

      if (payload.coverage?.hurricane) {
        premium += 300;
      }

      if (payload.property?.year_built < 2000) {
        premium += 150;
      }

      // 🎲 Add randomness (simulate real pricing variation)
      premium += Math.floor(Math.random() * 200);

      return {
        carrier: carrier.name,
        premium,
        currency: "USD",
        deductible: payload.coverage?.wind_hail ? 5000 : 2500,
        coverage: payload.coverage,
        underwriting_status: "eligible",
        disclaimer: "Final premium subject to underwriting approval"
      };
    });

    // 🏆 Sort by cheapest (useful for UI)
    quotes.sort((a, b) => a.premium - b.premium);

    return {
      success: true,
      quotes,
      recommended: quotes[0] // cheapest
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};


export const generateMultiQuotes = async (data) => {
  // simulate multiple carriers
  const carriers = [
    "Carrier A",
    "Carrier B",
    "Carrier C"
  ];

  return carriers.map((carrier) => {
    const base = 800 + Math.random() * 1000;

    return {
      carrier,
      premium: Math.round(base),
      deductible: data.windHail ? 5000 : 2500,
      coverage: {
        wind_hail: data.windHail,
        hurricane: data.hurricane
      },
      disclaimer: "Subject to underwriting approval"
    };
  });
};