import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { network } from "hardhat";
import { http } from "viem";
import { hardhat } from "viem/chains";

describe("DomainRegistry", async function () {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();

  it("Should emit the DeployRequested event when calling the requestDeploy() function", async function () {
    const domainRegistry = await viem.deployContract("DomainRegistry");
    
    await viem.assertions.emitWithArgs(
        domainRegistry.write.requestDeploy([owner.address]),
        domainRegistry,
        "DeployRequested",
        [owner.address]
    );

});
});