# Shopping Intent Escrow Smart Contracts

## Contract Location
- **Network:** Base Sepolia Testnet
- **Contract Address:** `0x6eff10719ff6d40a5b4874b2244a97caf768a150`
- **Explorer Link:** [View on BaseScan](https://sepolia.basescan.org/address/0x6eff10719ff6d40a5b4874b2244a97caf768a150#code)

## Overview

This system consists of two smart contracts that implement a privacy-preserving escrow mechanism for e-commerce purchases. The contracts enable buyers to create purchase intents with encrypted product and shipping information, while allowing whitelisted solvers to fulfill these orders.

## Contract Architecture

### 1. ShoppingIntentEscrow.sol
**Primary Contract** - Handles the escrow logic and order fulfillment

#### Key Features
- **Privacy-First Design**: Product links and shipping addresses are stored as hashed values on-chain
- **Escrow Protection**: Buyer deposits ETH as both payment and price cap
- **Solver Fee System**: Built-in 2% solver fee (200 basis points)
- **Time-Based Deadlines**: Orders must be fulfilled within specified timeframes
- **Automatic Refunds**: Buyers can reclaim deposits if orders aren't fulfilled by deadline

#### Core Functions

**`createIntent()`**
- Creates a new shopping intent with hashed product and shipping data
- Requires ETH deposit (serves as price cap)
- Sets deadline for order fulfillment
- Emits `IntentCreated` event

**`submitProof()`**
- Allows whitelisted solvers to fulfill orders
- Validates hashed product link and shipping address
- Ensures final price + fees don't exceed deposit
- Pays solver and refunds excess to buyer
- Emits `ProofSubmitted` event

**`refund()`**
- Enables buyers to reclaim deposits after deadline expires
- Only callable by original buyer
- Prevents double-spending through fulfillment checks

#### Security Features
- **ReentrancyGuard**: Prevents reentrancy attacks
- **Hash Verification**: Ensures data integrity through cryptographic hashing
- **Access Control**: Only whitelisted solvers can fulfill orders
- **Deposit Validation**: Prevents overspending through price caps

### 2. SolverWhitelist.sol
**Access Control Contract** - Manages solver permissions

#### Key Features
- **Whitelist Management**: Owner can add/remove solver addresses
- **Access Verification**: Provides modifier for restricted functions
- **Event Logging**: Tracks whitelist changes

#### Core Functions

**`whitelistSolver(address solver)`**
- Adds solver to whitelist (owner only)
- Emits `SolverWhitelisted` event

**`removeWhitelistedSolver(address solver)`**
- Removes solver from whitelist (owner only)
- Emits `SolverRemoved` event

**`isSolverWhitelisted(address solver)`**
- Public view function to check solver status

## Workflow

### Step 1: Intent Creation
1. Buyer hashes product link and shipping address off-chain
2. Buyer calls `createIntent()` with hashed data and ETH deposit
3. Intent is stored on-chain with unique ID

### Step 2: Off-Chain Coordination
1. Buyer shares plaintext product link and shipping address with solver
2. Solver reviews order details and pricing
3. Solver computes matching hashes for verification

### Step 3: Order Fulfillment
1. Solver calls `submitProof()` with computed hashes and final price
2. Contract verifies hash matches and price validity
3. Solver receives payment (final price + 2% fee)
4. Buyer receives refund for any unused deposit

### Step 4: Fallback Protection
1. If deadline passes without fulfillment, buyer can call `refund()`
2. Full deposit is returned to buyer
3. Intent is marked as fulfilled to prevent future claims

## Technical Specifications

- **Solidity Version:** ^0.8.20
- **Dependencies:** OpenZeppelin (Ownable, ReentrancyGuard)
- **License:** MIT
- **Solver Fee:** 2% (200 basis points)
- **Gas Optimization:** Uses mappings and structs for efficient storage

## Events

### ShoppingIntentEscrow Events
- `IntentCreated`: New purchase intent registered
- `ProofSubmitted`: Order successfully fulfilled
- `Refunded`: Deposit returned to buyer

### SolverWhitelist Events
- `SolverWhitelisted`: New solver added to whitelist
- `SolverRemoved`: Solver removed from whitelist

## Security Considerations

- **Hash Collision Resistance**: Uses keccak256 for cryptographic security
- **Reentrancy Protection**: ReentrancyGuard prevents recursive calls
- **Integer Overflow**: Solidity 0.8+ built-in overflow protection
- **Access Control**: Ownable pattern for administrative functions
- **Time-Based Security**: Deadline mechanism prevents indefinite locks

## Use Cases

- **E-commerce Privacy**: Buyers can make purchases without revealing personal data on-chain
- **Price Protection**: Deposit system prevents price manipulation
- **Decentralized Fulfillment**: Multiple solvers can compete to fulfill orders
- **Trust Minimization**: Smart contract handles payments and refunds automatically