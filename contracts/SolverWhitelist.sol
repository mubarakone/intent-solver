// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

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
