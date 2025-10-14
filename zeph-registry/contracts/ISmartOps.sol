// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ISmartOps - Minimal DevOps-as-a-Blockchain interface
/// @notice Core on-chain operations for website lifecycle & access control

interface ISmartOps {
    /*//////////////////////////////////////////////////////////////
                              EVENTS
    //////////////////////////////////////////////////////////////*/
    event SiteDeployed(bytes32 indexed versionHash, string uri, address indexed deployer);
    event SitePaused(address indexed by);
    event SiteResumed(address indexed by);
    event AccessGranted(address indexed user, bytes32 role);
    event AccessRevoked(address indexed user);
    event ConfigUpdated(string key, string value);
    event ActionLogged(string action, string meta);

    /*//////////////////////////////////////////////////////////////
                              LIFECYCLE
    //////////////////////////////////////////////////////////////*/
    function deploySite(bytes32 versionHash, string calldata uri) external;
    function pauseSite() external;
    function resumeSite() external;

    /*//////////////////////////////////////////////////////////////
                             ACCESS CONTROL
    //////////////////////////////////////////////////////////////*/
    function grantAccess(address user, bytes32 role) external;
    function revokeAccess(address user) external;
    function hasAccess(address user, bytes32 role) external view returns (bool);

    /*//////////////////////////////////////////////////////////////
                                CONFIG
    //////////////////////////////////////////////////////////////*/
    function updateConfig(string calldata key, string calldata value) external;

    /*//////////////////////////////////////////////////////////////
                                AUDIT
    //////////////////////////////////////////////////////////////*/
    function getCurrentVersion() external view returns (bytes32 versionHash, string memory uri);
    function getStatus() external view returns (bool isPaused);
    function logAction(string calldata action, string calldata meta) external;
}