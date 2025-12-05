import { db, initDB } from "../db/index.js";
import { provider } from "../utils/provider.js";
import { DomainFactoryArtifact } from "../config/contracts.js";
import { ethers } from "ethers";


console.log("domainControllers loaded");
let factory;

(async () => {
  await initDB();
  console.log("DB initialized in domainControllers");
  const FACTORY_ADDR = process.env.DOMAIN_FACTORY_ADDRESS;
  if (!FACTORY_ADDR) {
    console.error("❌ DOMAIN_FACTORY_ADDRESS missing in .env");
    return;
  }
  factory = new ethers.Contract(FACTORY_ADDR, DomainFactoryArtifact.abi, provider);
  console.log("✅ DomainFactory contract connected:", FACTORY_ADDR);
})();
export async function getAllDomains(req, res) {
  try {
    console.log("getAllDomains called");
    // read from on-chain counter for truth
    const countBn = await factory.domainCounter();
    const count = Number(countBn.toString());
    const out = [];
    for (let i = 1; i <= count; i++) {
      const info = await factory.domains(i);
      console.log("Fetched domain:", i, info);
      out.push({
        domainId: i,
        name: info.name,
        owner: info.owner,
        opsContract: info.opsContract,
        tokenContract: info.tokenContract
      });
    }
    res.json(out);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function getDomainById(req, res) {
  try {
    const id = Number(req.params.id);
    const info = await factory.domains(id);
    res.json({
      domainId: id,
      name: info.name,
      owner: info.owner,
      opsContract: info.opsContract,
      tokenContract: info.tokenContract
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export async function lookupDomain(req, res) {
  try {
    const name = req.query.name;
    if (!name) return res.status(400).json({ error: "name required" });
    const countBn = await factory.domainCounter();
    const count = Number(countBn.toString());
    for (let i = 1; i <= count; i++) {
      const info = await factory.domains(i);
      if (info.name === name) {
        return res.json({
          domainId: i,
          name: info.name,
          owner: info.owner,
          opsContract: info.opsContract,
          tokenContract: info.tokenContract
        });
      }
    }
    res.json(null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}

export function healthcheck(req, res) {
  res.json({ status: "ok" });
}