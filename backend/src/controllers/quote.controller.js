import {
  calculateQuotes
} from "../services/quote.service.js";

import { getSession } from "../store/session.store.js";

// ✅ GENERATE (NOW USES SESSION)
export const generateQuote = async (req, res) => {
  const { sessionId } = req.body;

  const session = getSession(sessionId);

  if (!session) {
    return res.status(400).json({
      error: "Invalid session"
    });
  }

  // const payload = buildPayload(session.data);
  const quotes = await calculateQuotes(session.data);

  res.json({
    status: "ready",
    quotes
  });
};

// ✅ SEND (NOW USES SESSION)
export const sendToCarrier = async (req, res) => {
  const { sessionId } = req.body;

  const session = getSession(sessionId);

  if (!session) {
    return res.status(400).json({
      error: "Invalid session"
    });
  }

  const payload = buildPayload(session.data);

  const result = await sendToCarrierAPI(payload);

  res.json(result);
};