// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

library MultisigStorage {
    bytes32 constant MULTISIG_POSITION = keccak256("diamond.standard.multisig.storage");
    bytes32 constant TRANSACTION_POSITION = keccak256("diamond.standard.transaction.storage");

    struct Transaction {
        address to;
        uint256 value;
        bytes data;
        bool executed;
        mapping(address => bool) signatures;
    }

    struct MultisigDataStorage {
        uint256 _requiredSignatures;
        address[] _owners;
        Transaction[] _transactions;
    }

    event TransactionCreated(uint256 transactionId, address to, uint256 value, bytes data);
    event TransactionSigned(uint256 transactionId, address signer);

    event TransactionExecuted(uint256 transactionId, address executer);

    function MULTISIG_STORAGE() internal pure returns (MultisigDataStorage storage ms) {
        bytes32 position = MULTISIG_POSITION;

        assembly {
            ms.slot := position
        }
    }

    function TRANSACTION_STORAGE() internal pure returns (Transaction storage ts) {
        bytes32 position = TRANSACTION_POSITION;

        assembly {
            ts.slot := position
        }
    }
}
