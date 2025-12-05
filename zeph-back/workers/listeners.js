import { provider } from "../utils/provider.js";
import { DomainFactoryArtifact, DomainOpsArtifact } from "../config/contracts.js";
import { db, initDB } from "../db/index.js";
import { ethers } from "ethers";

await initDB();

export async function startListener() {
  const FACTORY_ADDR = process.env.DOMAIN_FACTORY_ADDRESS;
  const factory = new ethers.Contract(FACTORY_ADDR, DomainFactoryArtifact.abi, provider);

  console.log("🔔 Starting event listener for DomainFactory...");

  // DomainRegistered events
  factory.on("DomainRegistered", async (domainIdBn, owner, opsContract, tokenContract, event) => {
    const domainId = Number(domainIdBn.toString());
    const block = await provider.getBlock(event.blockNumber);
    db.data.events.push({
      txHash: event.transactionHash,
      event: "DomainRegistered",
      domainId,
      owner,
      opsContract,
      tokenContract,
      blockNumber: event.blockNumber,
      timestamp: block.timestamp
    });
    // update domains cache
    db.data.domains = db.data.domains || [];
    db.data.domains.push({
      domainId,
      name: "(unknown until read)", // name isn't in event for simple version; we could call factory.domains(domainId)
      owner,
      opsContract,
      tokenContract,
      registeredAt: block.timestamp
    });
    await db.write();
    console.log("📌 DomainRegistered indexed:", domainId);
  });

  // SiteDeployed events from any DomainOps contract (we need to watch generically)
  // Option: poll domain list and attach listeners to ops contracts as they appear
  // attach listeners for existing domains on startup:
  if (db.data.domains) {
    for (const d of db.data.domains) {
      attachOpsListener(d.opsContract);
    }
  }

  // when new domain registered, attach ops listener automatically
  factory.on("DomainRegistered", (domainIdBn, owner, opsContract) => {
    attachOpsListener(opsContract);
  });
}

function attachOpsListener(opsAddr) {
  try {
    const ops = new ethers.Contract(opsAddr, DomainOpsArtifact.abi, provider);
    ops.on("SiteDeployed", async (versionHash, uri, deployer, event) => {
      const block = await provider.getBlock(event.blockNumber);
      db.data.events.push({
        txHash: event.transactionHash,
        event: "SiteDeployed",
        opsAddr,
        versionHash,
        uri,
        deployer,
        blockNumber: event.blockNumber,
        timestamp: block.timestamp
      });
      // update domain by opsAddr
      const d = db.data.domains.find(x => x.opsContract === opsAddr);
      if (d) {
        d.landingHash = uri;
        d.version = versionHash;
        d.deployedAt = block.timestamp;
      }
      await db.write();
      console.log("📌 SiteDeployed recorded for ops:", opsAddr);
    });

    ops.on("SitePaused", async (by, event) => {
      const block = await provider.getBlock(event.blockNumber);
      db.data.events.push({ txHash: event.transactionHash, event: "SitePaused", opsAddr, by, blockNumber: event.blockNumber, timestamp: block.timestamp });
      const d = db.data.domains.find(x => x.opsContract === opsAddr);
      if (d) d.paused = true;
      await db.write();
    });

    ops.on("SiteResumed", async (by, event) => {
      const block = await provider.getBlock(event.blockNumber);
      db.data.events.push({ txHash: event.transactionHash, event: "SiteResumed", opsAddr, by, blockNumber: event.blockNumber, timestamp: block.timestamp });
      const d = db.data.domains.find(x => x.opsContract === opsAddr);
      if (d) d.paused = false;
      await db.write();
    });

    console.log("🔗 Attached ops listeners to", opsAddr);
  } catch (err) {
    console.error("attachOpsListener err", err);
  }
}