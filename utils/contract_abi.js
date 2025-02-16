export const CONTRACT_ABI = [
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "intentId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deposit",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "hashedProductLink",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "hashedShippingAddr",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        }
      ],
      "name": "IntentCreated",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "previousOwner",
          "type": "address"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "OwnershipTransferred",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "intentId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "solver",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "solverHashedProductLink",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "solverHashedShippingAddr",
          "type": "bytes32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "finalPrice",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "solverFee",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "solverPayout",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "leftoverBuyerRefund",
          "type": "uint256"
        }
      ],
      "name": "ProofSubmitted",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "uint256",
          "name": "intentId",
          "type": "uint256"
        },
        {
          "indexed": true,
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "Refunded",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "solver",
          "type": "address"
        }
      ],
      "name": "SolverRemoved",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "solver",
          "type": "address"
        }
      ],
      "name": "SolverWhitelisted",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "SOLVER_FEE_BPS",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "_hashedProductLink",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_hashedShippingAddr",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_seconds",
          "type": "uint256"
        }
      ],
      "name": "createIntent",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "name": "intents",
      "outputs": [
        {
          "internalType": "address",
          "name": "buyer",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "deposit",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "hashedProductLink",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "hashedShippingAddr",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "deadline",
          "type": "uint256"
        },
        {
          "internalType": "bool",
          "name": "fulfilled",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "solver",
          "type": "address"
        }
      ],
      "name": "isSolverWhitelisted",
      "outputs": [
        {
          "internalType": "bool",
          "name": "",
          "type": "bool"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "nextIntentId",
      "outputs": [
        {
          "internalType": "uint256",
          "name": "",
          "type": "uint256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_intentId",
          "type": "uint256"
        }
      ],
      "name": "refund",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "solver",
          "type": "address"
        }
      ],
      "name": "removeWhitelistedSolver",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "renounceOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_intentId",
          "type": "uint256"
        },
        {
          "internalType": "bytes32",
          "name": "_solverHashedProductLink",
          "type": "bytes32"
        },
        {
          "internalType": "bytes32",
          "name": "_solverHashedShippingAddr",
          "type": "bytes32"
        },
        {
          "internalType": "uint256",
          "name": "_finalPrice",
          "type": "uint256"
        }
      ],
      "name": "submitProof",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "newOwner",
          "type": "address"
        }
      ],
      "name": "transferOwnership",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "solver",
          "type": "address"
        }
      ],
      "name": "whitelistSolver",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ]