import express from "express";
import { getAllDomains, getDomainById, lookupDomain } from "../controllers/domainControllers.js";
console.log("domainRoutes loaded");
const router = express.Router();
console.log("router created");
router.get("/", getAllDomains); // GET /api/domains
router.get("/id/:id", getDomainById); // GET /api/domains/id/1
router.get("/lookup", lookupDomain); // GET /api/domains/lookup?name=domama
router.get("/health", (req, res) => res.json({ status: "ok" })); // health check
export default router;