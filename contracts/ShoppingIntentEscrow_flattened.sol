
// File: @openzeppelin/contracts/utils/Context.sol


// OpenZeppelin Contracts v4.4.1 (utils/Context.sol)

pragma solidity ^0.8.0;

/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

// File: @openzeppelin/contracts/access/Ownable.sol


// OpenZeppelin Contracts (last updated v4.9.0) (access/Ownable.sol)

pragma solidity ^0.8.0;


/**
 * @dev Contract module which provides a basic access control mechanism, where
 * there is an account (an owner) that can be granted exclusive access to
 * specific functions.
 *
 * By default, the owner account will be the one that deploys the contract. This
 * can later be changed with {transferOwnership}.
 *
 * This module is used through inheritance. It will make available the modifier
 * `onlyOwner`, which can be applied to your functions to restrict their use to
 * the owner.
 */
abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby disabling any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}

// File: @openzeppelin/contracts/security/ReentrancyGuard.sol


// OpenZeppelin Contracts (last updated v4.9.0) (security/ReentrancyGuard.sol)

pragma solidity ^0.8.0;

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

// File: SolverWhitelist.sol


pragma solidity ^0.8.20;



/**
 * @title SolverWhitelist
 * @dev Manages whitelisted addresses for solver access.
 */
contract SolverWhitelist is Ownable {
    mapping(address => bool) private _isWhitelistedSolver;

    event SolverWhitelisted(address indexed solver);
    event SolverRemoved(address indexed solver);

    modifier onlyWhitelistedSolver() {
        require(
            _isWhitelistedSolver[msg.sender],
            "SolverWhitelist: caller not whitelisted"
        );
        _;
    }

    constructor() Ownable() {
        // No additional logic needed
    }

    function whitelistSolver(address solver) external onlyOwner {
        require(solver != address(0), "Invalid solver address");
        _isWhitelistedSolver[solver] = true;
        emit SolverWhitelisted(solver);
    }

    function removeWhitelistedSolver(address solver) external onlyOwner {
        require(
            _isWhitelistedSolver[solver],
            "Solver not currently whitelisted"
        );
        _isWhitelistedSolver[solver] = false;
        emit SolverRemoved(solver);
    }

    function isSolverWhitelisted(address solver) external view returns (bool) {
        return _isWhitelistedSolver[solver];
    }
}

// File: ShoppingIntentEscrow.sol


pragma solidity ^0.8.20;




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
