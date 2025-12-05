import express from "express";
import { getOpsState } from "../controllers/opsControllers.js";

const router = express.Router();
router.get("/:opsAddress", getOpsState);

export default router;