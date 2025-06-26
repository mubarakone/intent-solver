// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "SolverWhitelist.sol";

/**
 * @title ShoppingIntentEscrow
 * @dev Allows a buyer to create an intent to buy a product by depositing ETH as escrow (also the price cap).
 *      The buyer stores the *hashed* product link and the *hashed* shipping address on-chain.
 *      Solver sees the plaintext off-chain, then submits matching hashed values plus the final price.
 *      If final price + solver fee is within the deposit, solver gets paid, leftover refunded to the buyer.
 * 
 * Flow Summary:
 * 1. Buyer calls createIntent(...) with:
 *      - hashedProductLink
 *      - hashedShippingAddress
 *      - deposit = msg.value (also the price cap).
 * 2. Buyer shares plaintext data (productLink, shippingAddress) with solver off-chain (in the front-end).
 * 3. Solver toggles visibility to see the plaintext, then computes hashed versions and calls submitProof(...),
 *    passing in:
 *      - _intentId
 *      - solverHashedProductLink
 *      - solverHashedShippingAddress
 *      - finalPrice (plaintext uint256)
 * 4. Contract compares solverHashed* with buyer’s hashed*.
 * 5. If match, and (finalPrice + solverFee <= deposit), solver is paid. Any leftover deposit is refunded to the buyer.
 */

contract ShoppingIntentEscrow is SolverWhitelist, ReentrancyGuard {
    // BPS for solver fee, e.g. 200 = 2%
    uint256 public constant SOLVER_FEE_BPS = 200;

    struct Intent {
        address buyer;                // The user who created the intent
        uint256 deposit;             // Amount of ETH locked in escrow (price cap)
        bytes32 hashedProductLink;    // keccak256(productLinkPlaintext)
        bytes32 hashedShippingAddr;   // keccak256(shippingAddressPlaintext)
        uint256 deadline;            // Time by which solver must submit
        bool fulfilled;              // True if funds already claimed or refunded
    }

    // Incrementing ID for each shopping intent
    uint256 public nextIntentId;

    // Map of intentId -> Intent
    mapping(uint256 => Intent) public intents;

    // ---- EVENTS ----

    event IntentCreated(
        uint256 indexed intentId,
        address indexed buyer,
        uint256 deposit,
        bytes32 hashedProductLink,
        bytes32 hashedShippingAddr,
        uint256 deadline
    );

    event ProofSubmitted(
        uint256 indexed intentId,
        address indexed solver,
        bytes32 solverHashedProductLink,
        bytes32 solverHashedShippingAddr,
        uint256 finalPrice,
        uint256 solverFee,
        uint256 solverPayout,
        uint256 leftoverBuyerRefund
    );

    event Refunded(
        uint256 indexed intentId,
        address indexed buyer,
        uint256 amount
    );

    // ---- FUNCTIONS ----

    /**
     * @dev Create a new shopping intent by depositing ETH as the price cap.
     *      The buyer provides pre-hashed product link and shipping address.
     * @param _hashedProductLink keccak256 hash of the product link (plaintext off-chain).
     * @param _hashedShippingAddr keccak256 hash of the shipping address (plaintext off-chain).
     * @param _seconds Timestamp after which solver can no longer claim.
     */
    function createIntent(
        bytes32 _hashedProductLink,
        bytes32 _hashedShippingAddr,
        uint256 _seconds
    ) external payable nonReentrant {
        uint256 _deadline = block.timestamp + _seconds;

        require(msg.value > 0, "Must deposit some ETH");
        require(_deadline > block.timestamp, "Deadline must be in the future");

        uint256 currentId = nextIntentId;
        nextIntentId += 1;

        intents[currentId] = Intent({
            buyer: msg.sender,
            deposit: msg.value,
            hashedProductLink: _hashedProductLink,
            hashedShippingAddr: _hashedShippingAddr,
            deadline: _deadline,
            fulfilled: false
        });

        emit IntentCreated(
            currentId,
            msg.sender,
            msg.value,
            _hashedProductLink,
            _hashedShippingAddr,
            _deadline
        );
    }

    /**
     * @dev Solver submits the "proof" in the form of hashed data,
     *      comparing them on-chain with the stored hashed intent data.
     *      `_solverHashedProductLink` = keccak256(productLinkPlaintext from ecommerce)
     *      `_solverHashedShippingAddr` = keccak256(shippingAddressPlaintext from ecommerce)
     *      `_finalPrice` is the solver's claimed final price (plaintext).
     * 
     * If these match and finalPrice + solverFee <= deposit, solver is paid out, leftover goes back to buyer.
     * 
     * @param _intentId ID of the user's intent.
     * @param _solverHashedProductLink The hash computed by the solver off-chain
     * @param _solverHashedShippingAddr The hash computed by the solver off-chain
     * @param _finalPrice The plaintext final price of the product in Wei
     */
    function submitProof(
        uint256 _intentId,
        bytes32 _solverHashedProductLink,
        bytes32 _solverHashedShippingAddr,
        uint256 _finalPrice
    ) external nonReentrant onlyWhitelistedSolver {
        Intent storage intent = intents[_intentId];
        require(intent.buyer != address(0), "Invalid intentId");
        require(!intent.fulfilled, "Intent already fulfilled");
        require(block.timestamp < intent.deadline, "Deadline passed");

        // 1) Compare the solver’s hashed data with the intent’s hashed data
        require(
            _solverHashedProductLink == intent.hashedProductLink,
            "Mismatch: hashed product link"
        );
        require(
            _solverHashedShippingAddr == intent.hashedShippingAddr,
            "Mismatch: hashed shipping address"
        );

        // 2) Price / Payment logic
        // finalPrice must be <= deposit (the buyer's price cap), minus solver fee
        // We'll compute solver fee as a fraction of finalPrice, e.g. 2% if SOLVER_FEE_BPS=200
        uint256 solverFee = (_finalPrice * SOLVER_FEE_BPS) / 10000;
        uint256 totalSolverPayout = _finalPrice + solverFee;

        require(
            totalSolverPayout <= intent.deposit,
            "Not enough deposit for finalPrice + fee"
        );

        // Mark fulfilled
        intent.fulfilled = true;

        // 3) Pay the solver
        (bool solverPaid, ) = msg.sender.call{value: totalSolverPayout}("");
        require(solverPaid, "Solver payout failed");

        // 4) Refund leftover to buyer if any
        uint256 leftover = intent.deposit - totalSolverPayout;
        uint256 buyerRefund = 0;

        if (leftover > 0) {
            buyerRefund = leftover;
            (bool buyerPaid, ) = intent.buyer.call{value: leftover}("");
            require(buyerPaid, "Buyer refund failed");
        }

        // Clear deposit
        intent.deposit = 0;

        emit ProofSubmitted(
            _intentId,
            msg.sender,
            _solverHashedProductLink,
            _solverHashedShippingAddr,
            _finalPrice,
            solverFee,
            totalSolverPayout,
            buyerRefund
        );
    }

    /**
     * @dev If no solver completes before the deadline, the buyer can reclaim their deposit.
     */
    function refund(uint256 _intentId) external nonReentrant {
        Intent storage intent = intents[_intentId];
        require(intent.buyer == msg.sender, "Not your intent");
        require(!intent.fulfilled, "Already fulfilled");
        require(block.timestamp > intent.deadline, "Deadline not yet passed");
        require(intent.deposit > 0, "No deposit to refund");

        uint256 refundAmount = intent.deposit;
        intent.deposit = 0;
        intent.fulfilled = true; // mark fulfilled so it can't be claimed later

        (bool success, ) = msg.sender.call{value: refundAmount}("");
        require(success, "Refund transfer failed");

        emit Refunded(_intentId, msg.sender, refundAmount);
    }

}
