import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./routes/index.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    message: "Welcome to the Insurance Quote API",
    timestamp: new Date().toISOString()
  });
});
app.use("/api", routes);

export default app;