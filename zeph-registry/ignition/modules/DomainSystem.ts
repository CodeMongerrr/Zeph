import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DomainSystem = buildModule("DomainSystem", (m) => {
  // Deploy the libraries first
  const tokenFactoryLib = m.library("TokenFactory");
  const opsFactoryLib = m.library("OpsFactory");

  // Deploy the supporting contracts
  const domainOps = m.contract("DomainOps", [m.getAccount(0)]);
  const domainToken = m.contract("DomainToken", ["Sample Token", "Z-SMP", m.getAccount(0)]);

  // Link libraries explicitly in DomainFactory
  const domainFactory = m.contract("DomainFactory", [], {
    libraries: {
      TokenFactory: tokenFactoryLib,
      OpsFactory: opsFactoryLib,
    },
  });

  return { domainFactory, domainOps, domainToken, tokenFactoryLib, opsFactoryLib };
});

export default DomainSystem;
