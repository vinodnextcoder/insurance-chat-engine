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
    const res = await axios.post(
      "https://mock-carrier-api.com/quote",
      payload
    );

    return {
      success: true,
      data: res.data
    };

  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};