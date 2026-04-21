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
  const { sessionId, userInput } = req.body;
  // console.log("Received user input:", userInput, "for session:", sessionId);

  const session = getSession(sessionId);

  if (!session) {
    return res.status(400).json({ error: "Invalid session" });
  }

  session.history.push({ role: "user", content: userInput });

  const aiResponse = await getNextStep(
    session.data,
    session.history
  );
  console.log("AI response:", aiResponse);

  if (!aiResponse?.isInsurance) {
    return res.json({
      message: aiResponse.message,
      collectedData: {
        sessionId,
        ...session.data
      }
    });
  }

  // Destructure sessionId from extractedData to prevent overwriting
  const { sessionId: _, ...dataToMerge } = aiResponse.extractedData;
  
  session.data = {
    ...session.data,
    ...dataToMerge,
    sessionId: sessionId  // Explicitly preserve the correct sessionId
  };

  session.history.push({
    role: "assistant",
    content: aiResponse.message
  });

  updateSession(sessionId, session);
  console.log("Updated session data:", aiResponse.extractedData);

  res.json({
    message: aiResponse.message,
    collectedData: {
      sessionId,
      ...session.data
    }
  });
};