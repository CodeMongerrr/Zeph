// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Create2.sol";
import "./ISmartOps.sol";
import "./DomainOps.sol";
import "./DomainToken.sol";
import "./TokenFactory.sol";
import "./OpsFactory.sol";

contract DomainFactory is ERC721, Ownable {
    struct DomainInfo {
        address opsContract;
        address tokenContract;
        address owner;
        string name;
    }

    mapping(uint256 => DomainInfo) public domains;
    uint256 public domainCounter;

    event DomainRegistered(
        uint256 indexed domainId,
        address indexed owner,
        address opsContract,
        address tokenContract
    );

    constructor() ERC721("Zeph Domain", "ZDOM") Ownable(msg.sender) {}

    function registerDomain(string calldata name) external returns (uint256) {
        uint256 domainId = ++domainCounter;
        _safeMint(msg.sender, domainId);

        // Deploy ERC20 token for subscriptions
        address token = TokenFactory.deployToken(
            string.concat(name, " Token"),
            string.concat("Z-", name),
            msg.sender
        );

        // Deploy Ops contract for lifecycle management
        address ops = OpsFactory.deployOps(msg.sender);

        domains[domainId] = DomainInfo({
            opsContract: ops,
            tokenContract: token,
            owner: msg.sender,
            name: name
        });

        emit DomainRegistered(domainId, msg.sender, ops, token);
        return domainId;
    }

    function getDomainInfo(
        uint256 domainId
    ) external view returns (DomainInfo memory) {
        return domains[domainId];
    }

    function transferDomain(uint256 domainId, address newOwner) external {
        require(ownerOf(domainId) == msg.sender, "Not domain owner");
        _transfer(msg.sender, newOwner, domainId);
        domains[domainId].owner = newOwner;
        DomainOps(domains[domainId].opsContract).transferOwnership(newOwner);
        DomainToken(domains[domainId].tokenContract).transferOwnership(
            newOwner
        );
    }
}
