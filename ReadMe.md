# 🌀 Zeph — Decentralized DomainOps Registry

Zeph is a decentralized platform for owning, deploying, and managing web domains directly on-chain. Every domain is an NFT with its own lifecycle management smart contract and community token.

## 🚀 Key Features

- **Domain as NFT** — ERC-721 token representing domain ownership
- **Dedicated Ops Contract** — Per-domain lifecycle management (deploy, pause, resume)
- **Community Token** — ERC-20 subscription tokens for access control
- **On-Chain Infrastructure** — Fully decentralized operations
- **Ownership Transfer** — NFT transfer automatically transfers admin rights
- **Event Indexing** — Complete audit trail of all operations

## 🧱 Architecture

```
User → Frontend (React/Web3Modal) → Backend (Node/Express) → DomainFactory

DomainFactory deploys:
├─ Domain NFT (ERC-721)
├─ DomainOps Contract (lifecycle management)
└─ DomainToken Contract (ERC-20 access tokens)
```

| Component | Tech | Purpose |
|-----------|------|---------|
| DomainFactory | Solidity | NFT minting, contract deployment |
| DomainOps | Solidity | Content lifecycle management |
| DomainToken | Solidity | Token-gated access control |
| Backend API | Node/Express | Event indexing, metadata cache |
| Frontend | React/Web3 | Marketplace + management dashboard |

## 🔄 Domain Registration Flow

1. User selects domain → Pays 0.01 ETH
2. `DomainFactory.registerDomain()` mints NFT
3. Factory auto-deploys DomainOps + DomainToken contracts
4. Backend indexes event + caches metadata
5. Domain appears in marketplace

## 🛠 DomainOps Functions

| Function | Description |
|----------|-------------|
| `deploySite(versionHash, landingHash, privateHash)` | Deploy new IPFS version |
| `pauseSite()` / `resumeSite()` | Maintenance control |
| `grantAccess()` / `revokeAccess()` | Access management |
| `logAction()` | On-chain audit logging |
| `getCurrentVersion()` | Fetch live content metadata |

## 🌐 Tech Stack

**Smart Contracts:** Solidity, OpenZeppelin  
**Storage:** Lighthouse/IPFS  
**Frontend:** Next.js/React, Web3Modal  
**Backend:** Express.js, ethers.js, LowDB  
**Infrastructure:** Avail, HyperSync, Blockscout  
**Wallet:** MetaMask

## 🔌 API Endpoints

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/domains` | GET | List all domains |
| `/api/domains/:id` | GET | Get domain metadata |
| `/api/domains/register` | POST | Register new domain |
| `/api/domains/:id/state` | GET | Fetch lifecycle state |
| `/health` | GET | Service health check |

All transactions are user-signed from the browser.

## 🎯 Vision & Roadmap

**DomainOps as a Service** — Website DevOps automated through smart contracts and user-owned governance.

- 🔁 Secondary marketplace for domain NFTs
- 🤖 AI-powered domain rarity scoring
- 🎟 Token-gated analytics dashboard
- 🛠 AI agent automation
- ⚡ Parallel execution benchmarking (Arcology)
- 🔗 Auto-explorer via Blockscout Autoscout
- 🧱 Interoperability via Avail Nexus

## 🧪 Security

- Role-based access control with OpenZeppelin Ownable
- Reentrancy protection on critical functions
- Complete event logging for transparency
- No centralized upgrades without governance

Audits and test coverage in progress.

## 🙌 Team

**Aditya** — Smart Contracts, Architecture  
**Gabriel** — DevOps, Backend & Systems

---

Built for decentralized domain ownership and lifecycle management.