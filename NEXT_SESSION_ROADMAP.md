# Next Session Roadmap

**Created**: 2026-01-28
**Session Goal**: Phase 3 - Blockchain Credentials Integration 🔗

---

## 🎯 SESSION OBJECTIVES

### Primary Goal: Implement Real Blockchain Integration
Move from simulated/mocked blockchain services to real Web3 integration using Polygon (Amoy Testnet) or simulated local node.

---

## 📋 TASK CHECKLIST

### Task 1: Smart Contract Development
**Files**: `blockchain/contracts/T6Credential.sol`
1. Finalize the SBT (Soulbound Token) contract.
2. Ensure metadata URI support (IPFS compatibility).
3. Add minting role restrictions (only Institution/Admin can mint).

### Task 2: Backend Web3 Integration
**Files**: `backend/services/blockchain_service.py`
1. Replace mock logic with `web3.py`.
2. Implement `mint_credential` using a private key (server-side minting).
3. Implement `verify_credential` by querying the contract.

### Task 3: Wallet Integration (Frontend)
**Files**: `frontend/src/components/DigitalWallet.tsx`
1. Integrate `ethers.js` or `wagmi`.
2. Allow students to connect MetaMask (optional, for viewing ownership).
3. Display contract address and transaction hashes for minted credentials.

### Task 4: IPFS Metadata Storage (Optional/Simulated)
1. Decide on IPFS provider (Pinata) or internal API proxy.
2. Store credential JSON metadata before minting.

---

## 🔬 TESTING CHECKLIST

- [ ] Smart Contract compiles and deploys to testnet/local
- [ ] Backend can mint a credential (transaction success)
- [ ] Frontend displays the minted credential with Tx Hash
- [ ] Public verification link works

---

## 📁 KEY FILES

- `blockchain/T6Credential.sol`
- `backend/services/blockchain_service.py`
- `frontend/src/components/DigitalWallet.tsx`
- `backend/main.py` (Credential endpoints)

---

## 🎓 STATUS RECAP

**Completed**: 
- ✅ Cloud IDE (Multi-language + Persistence)
- ✅ Socratic Tutor (All Phases)
- ✅ Instructor Dashboard
- ✅ Phase 1, 2, 4, 5, 6, 7

**Next Up**: 
- 🔄 Phase 3: Blockchain (The Vault)
