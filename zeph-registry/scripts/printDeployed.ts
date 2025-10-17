import hre from "hardhat";
import DomainSystem from "../ignition/modules/DomainSystem";

async function main() {
  const { domainFactory, domainOps, domainToken } =
    await hre.ignition.deploy(DomainSystem);

  console.log("DomainFactory deployed at:", domainFactory.address);
  console.log("DomainOps deployed at:", domainOps.address);
  console.log("DomainToken deployed at:", domainToken.address);
}

main().catch(console.error);
