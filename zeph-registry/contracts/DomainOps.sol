// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./ISmartOps.sol";

contract DomainOps is ISmartOps, Ownable {
    bool private paused;
    bytes32 private currentVersion;
    string private currentURI;

    mapping(address => bytes32) private roles;

    constructor(address owner_) Ownable(owner_) {}

    /*//////////////////////////////////////////////////////////////
                             LIFECYCLE
    //////////////////////////////////////////////////////////////*/
    function deploySite(bytes32 versionHash, string calldata uri) external onlyOwner {
        currentVersion = versionHash;
        currentURI = uri;
        paused = false;
        emit SiteDeployed(versionHash, uri, msg.sender);
    }

    function pauseSite() external onlyOwner {
        paused = true;
        emit SitePaused(msg.sender);
    }

    function resumeSite() external onlyOwner {
        paused = false;
        emit SiteResumed(msg.sender);
    }

    /*//////////////////////////////////////////////////////////////
                             ACCESS CONTROL
    //////////////////////////////////////////////////////////////*/
    function grantAccess(address user, bytes32 role) external onlyOwner {
        roles[user] = role;
        emit AccessGranted(user, role);
    }

    function revokeAccess(address user) external onlyOwner {
        delete roles[user];
        emit AccessRevoked(user);
    }

    function hasAccess(address user, bytes32 role) external view returns (bool) {
        return roles[user] == role;
    }

    /*//////////////////////////////////////////////////////////////
                                CONFIG
    //////////////////////////////////////////////////////////////*/
    function updateConfig(string calldata key, string calldata value) external onlyOwner {
        emit ConfigUpdated(key, value);
    }

    /*//////////////////////////////////////////////////////////////
                                AUDIT
    //////////////////////////////////////////////////////////////*/
    function getCurrentVersion() external view returns (bytes32, string memory) {
        return (currentVersion, currentURI);
    }

    function getStatus() external view returns (bool) {
        return paused;
    }

    function logAction(string calldata action, string calldata meta) external onlyOwner {
        emit ActionLogged(action, meta);
    }
}