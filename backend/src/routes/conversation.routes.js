import { Router } from "express";
import {
  startConversation,
  askQuestion
} from "../controllers/conversation.controller.js";

const router = Router();

router.post("/start", startConversation);
router.post("/ask", askQuestion);

export default router;