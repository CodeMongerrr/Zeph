import { provider } from "../utils/provider.js";
import { DomainOpsArtifact } from "../config/contracts.js";
import { ethers } from "ethers";

export async function getOpsState(req, res) {
  try {
    const { opsAddress } = req.params;
    const contract = new ethers.Contract(opsAddress, DomainOpsArtifact.abi, provider);
    const [version, uri] = await contract.getCurrentVersion();
    const paused = await contract.getStatus();
    res.json({ opsAddress, version, uri, paused });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}