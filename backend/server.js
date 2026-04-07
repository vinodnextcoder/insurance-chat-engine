import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { handleMessage } from "./engine.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post("/chat", async (req, res) => {
  const { session_id, message } = req.body;
  const response = await handleMessage(session_id, message);
  return res.json({ response: "This is a placeholder response." });


//   res.json(response);
});

app.get("/", async (req, res) => {
 
  return res.json({ response: "This is a placeholder response." });

//   const response = await handleMessage(session_id, message);
//   res.json(response);
});

app.listen(process.env.PORT, () => {
  console.log("Server running on port " + process.env.PORT);
});