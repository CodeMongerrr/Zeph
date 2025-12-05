import { ethers } from "ethers";
import { DomainFactoryArtifact, DomainOpsArtifact } from "../config/contracts.js";

const FACTORY_ADDR = process.env.DOMAIN_FACTORY_ADDRESS;

// helper: build payload for front-end to call eth_sendTransaction
function buildTxPayload({ to, data, valueWei, from }) {
  const payload = { to, data };
  if (valueWei) payload.value = ethers.parseUnits(valueWei, "wei").toString ? valueWei : valueWei;
  // from should be provided by frontend (user address)
  if (from) payload.from = from;
  return payload;
}

// Register domain: encode registerDomain(name) and return tx payload w/ 0.01 ETH
export async function prepareRegister(req, res) {
  try {
    const { name, from } = req.body;
    if (!name || !from) return res.status(400).json({ error: "name + from required" });

    const iface = new ethers.Interface(DomainFactoryArtifact.abi);
    const data = iface.encodeFunctionData("registerDomain", [name]);
    const value = ethers.parseEther("0.01").toString();

    const txPayload = { to: FACTORY_ADDR, from, data, value };
    return res.json({ txPayload });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function prepareDeploy(req, res) {
  try {
    const { opsAddress, versionHash, uri, from } = req.body;
    if (!opsAddress || !versionHash || !uri || !from) return res.status(400).json({ error: "opsAddress, versionHash, uri, from required" });
    const iface = new ethers.Interface(DomainOpsArtifact.abi);
    const data = iface.encodeFunctionData("deploySite", [versionHash, uri]);
    res.json({ txPayload: { to: opsAddress, from, data } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function preparePause(req, res) {
  try {
    const { opsAddress, from } = req.body;
    if (!opsAddress || !from) return res.status(400).json({ error: "opsAddress, from required" });
    const iface = new ethers.Interface(DomainOpsArtifact.abi);
    const data = iface.encodeFunctionData("pauseSite", []);
    res.json({ txPayload: { to: opsAddress, from, data } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function prepareTransfer(req, res) {
  try {
    const { domainId, newOwner, from } = req.body;
    if (!domainId || !newOwner || !from) return res.status(400).json({ error: "domainId, newOwner, from required" });
    const iface = new ethers.Interface(DomainFactoryArtifact.abi);
    const data = iface.encodeFunctionData("transferDomain", [domainId, newOwner]);
    res.json({ txPayload: { to: FACTORY_ADDR, from, data } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}