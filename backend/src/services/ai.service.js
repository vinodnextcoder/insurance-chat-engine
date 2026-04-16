import axios from "axios";

const URL = "https://openrouter.ai/api/v1/chat/completions";

export const getNextStep = async (data, history) => {
  const systemPrompt = `
You are a licensed US insurance assistant.

STRICT RULES:
- ONLY ask insurance-related questions
- Ask ONE question at a time
- NEVER answer unrelated queries
- Redirect non-insurance questions

COMPLIANCE:
- No guarantees
- No pricing promises
- Always say: subject to underwriting

GOAL:
Collect:
- applicant
- property
- coverage (wind_hail, hurricane)
- risk_profile

CURRENT DATA:
${JSON.stringify(data)}

RETURN JSON ONLY:
{
  "message": "",
  "extractedData": {},
  "isInsurance": true
}
`;

  const messages = [
    { role: "system", content: systemPrompt },
    ...history
  ];

  try {
    const res = await axios.post(
      URL,
      {
        model: process.env.OPENROUTER_MODEL,
        messages,
        temperature: 0.2
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = res.data.choices[0].message.content;

    return JSON.parse(content);

  } catch (err) {
    console.error("AI API Error:", err.response ? err.response.data : err.message);
    console.error("AI Error:", err.message);

    return {
      message: "What is your property address?",
      extractedData: {},
      isInsurance: true
    };
  }
};

export const enrichDataWithAI = async (data) => {
  // Basic validation (can later call LLM)
  const requiredFields = [
    "name",
    "address",
    "propertyType",
    "yearBuilt"
  ];

  const missingFields = requiredFields.filter(
    (field) => !data[field]
  );

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    data
  };
};