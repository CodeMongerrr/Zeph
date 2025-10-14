// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DomainOps.sol";

library OpsFactory {
    function deployOps(address owner) external returns (address) {
        DomainOps ops = new DomainOps(owner);
        return address(ops);
    }
}