import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

export async function extractData(message) {
  const prompt = `
Extract JSON from this input:

"${message}"

Return:
{
 "property_type": "",
 "primary_residence": "",
 "year_built": "",
 "square_feet": "",
 "construction": "",
 "prior_claims": ""
}
`;

  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "nvidia/nemotron-3-super-120b-a12b:free",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    console.log("AI response:", res.data.choices[0].message.content);

    return JSON.parse(res.data.choices[0].message.content);
  } catch (err) {
    console.error("AI error:", err.message);
    return {};
  }
}