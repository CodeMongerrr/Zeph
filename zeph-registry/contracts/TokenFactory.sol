// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./DomainToken.sol";

library TokenFactory {
    function deployToken(string memory name, string memory symbol, address owner) external returns (address) {
        DomainToken token = new DomainToken(name, symbol, owner);
        return address(token);
    }
}