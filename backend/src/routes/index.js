import { Router } from "express";
import conversationRoutes from "./conversation.routes.js";
import quoteRoutes from "./quote.routes.js";

const router = Router();

router.use("/conversation", conversationRoutes);
router.use("/quote", quoteRoutes);

export default router;