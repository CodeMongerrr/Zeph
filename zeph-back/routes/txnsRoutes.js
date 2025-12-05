import express from "express";
import {
  prepareRegister,
  prepareDeploy,
  preparePause,
  prepareTransfer
} from "../controllers/txnsControllers.js";

const router = express.Router();

router.post("/prepare-register", prepareRegister); // body: { name, from }
router.post("/prepare-deploy", prepareDeploy);     // body: { opsAddress, versionHash, uri, from }
router.post("/prepare-pause", preparePause);       // body: { opsAddress, from }
router.post("/prepare-transfer", prepareTransfer); // body: { domainId, newOwner, from }

export default router;