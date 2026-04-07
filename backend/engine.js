import { getSession } from "./session.js";
import { extractData } from "./ai.js";
import { answerCoverage } from "./knowledge.js";
import { getQuotes } from "./quotes.js";

export async function handleMessage(sessionId, message) {
  const session = getSession(sessionId);

  // Extract structured data
  const extracted = await extractData(message);

  Object.entries(extracted).forEach(([k, v]) => {
    if (v) session.property[k] = v;
  });

  const msg = message.toLowerCase();

  // Coverage questions
  if (msg.includes("landslide") || msg.includes("coverage")) {
    return { reply: answerCoverage(message) };
  }

  // Ask questions step-by-step
  if (!session.property.primary_residence) {
    return { reply: "Is this a primary residence?" };
  }

  if (!session.property.year_built) {
    return { reply: "What year was the home built?" };
  }

  if (!session.property.square_feet) {
    return { reply: "What is the square footage?" };
  }

  if (!session.property.construction) {
    return { reply: "What is the construction material?" };
  }

  if (!session.property.prior_claims) {
    return { reply: "Any prior claims?" };
  }

  // Special question (your requirement)
  if (!session.property.special) {
    session.property.special = true;
    return {
      reply:
        "That’s a hillside area. Any special considerations like foundation, retaining walls, or home office?"
    };
  }

  // Show quotes
  if (msg.includes("quote")) {
    return getQuotes();
  }

  return { reply: "Type 'show quotes' to see available policies." };
}