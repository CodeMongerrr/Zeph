import path from "path";
import fs from "fs";

const loadArtifact = (name) => {
  // adjust path if your artifacts live elsewhere
  const artifactPath = path.resolve(`../zeph-registry/artifacts/contracts/${name}.sol/${name}.json`);
  if (!fs.existsSync(artifactPath)) throw new Error(`artifact not found: ${artifactPath}`);
  return JSON.parse(fs.readFileSync(artifactPath, "utf8"));
};

export const DomainFactoryArtifact = loadArtifact("DomainFactory");
export const DomainOpsArtifact = loadArtifact("DomainOps");
export const DomainTokenArtifact = loadArtifact("DomainToken");