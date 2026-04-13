import {
  createSession,
  getSession,
  updateSession
} from "../store/session.store.js";

import { getNextStep } from "../services/ai.service.js";

export const startConversation = (req, res) => {
  const sessionId = createSession();

  res.json({
    sessionId,
    message: "Hi! What type of insurance are you looking for?"
  });
};

export const askQuestion = async (req, res) => {
  console.log("Received request body:", req.body);
  const { sessionId, userInput } = req.body;
  console.log("Received user input:", userInput, "for session:", sessionId);

  const session = getSession(sessionId);

  if (!session) {
    return res.status(400).json({ error: "Invalid session" });
  }

  session.history.push({ role: "user", content: userInput });

  const aiResponse = await getNextStep(
    session.data,
    session.history
  );

  if (!aiResponse.isInsurance) {
    return res.json({
      message: aiResponse.message,
      collectedData: session.data
    });
  }

  session.data = {
    ...session.data,
    ...aiResponse.extractedData
  };

  session.history.push({
    role: "assistant",
    content: aiResponse.message
  });

  updateSession(sessionId, session);

  res.json({
    message: aiResponse.message,
    collectedData: session.data
  });
};