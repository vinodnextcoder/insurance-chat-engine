import { Router } from "express";
import {
  generateQuote,
  sendToCarrier
} from "../controllers/quote.controller.js";

const router = Router();

router.post("/generate", generateQuote);
router.post("/send", sendToCarrier);

export default router;