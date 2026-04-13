import {
  buildPayload,
  sendToCarrierAPI
} from "../services/quote.service.js";

export const generateQuote = (req, res) => {
  const { sessionData } = req.body;

  const payload = buildPayload(sessionData);

  res.json({
    status: "ready",
    payload
  });
};

export const sendToCarrier = async (req, res) => {
  const { payload } = req.body;

  const result = await sendToCarrierAPI(payload);

  res.json(result);
};