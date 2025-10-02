// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {MultisigStorage} from "../libraries/LibMultisigStorage.sol";

contract MultisigFacet {
    constructor(address[] memory owners, uint256 requiredSignatures) {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();
        require(owners.length > 0, "At least one owner required");
        require(requiredSignatures > 0 && requiredSignatures <= owners.length, "Invalid number of required signatures");

        ms._owners = owners;
        ms._requiredSignatures = requiredSignatures;
    }

    function submitTransaction(address to, uint256 value, bytes memory data) public {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();
        MultisigStorage.Transaction storage transaction = MultisigStorage.TRANSACTION_STORAGE();
        require(isOwner(msg.sender), "Not an owner!");
        require(to != address(0), "Invalid destination address");
        require(value >= 0, "Invalid value");

        uint256 transactionId = ms._transactions.length;
        ms._transactions.push();
        transaction = ms._transactions[transactionId];
        transaction.to = to;
        transaction.value = value;
        transaction.data = data;
        transaction.executed = false;

        emit MultisigStorage.TransactionCreated(transactionId, to, value, data);
    }

    function signTransaction(uint256 transactionId) public {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();
        MultisigStorage.Transaction storage transaction = MultisigStorage.TRANSACTION_STORAGE();

        require(transactionId < ms._transactions.length, "Invalid transaction ID");
        transaction = ms._transactions[transactionId];
        require(!transaction.executed, "Transaction already executed");
        require(isOwner(msg.sender), "Only owners can sign transactions");
        require(!transaction.signatures[msg.sender], "Transaction already signed by this owner");

        transaction.signatures[msg.sender] = true;
        emit MultisigStorage.TransactionSigned(transactionId, msg.sender);
        if (countSignatures(transaction) == ms._requiredSignatures) {
            executeTransaction(transactionId);
        }
    }

    function executeTransaction(uint256 transactionId) private {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();
        MultisigStorage.Transaction storage transaction = MultisigStorage.TRANSACTION_STORAGE();
        require(transactionId < ms._transactions.length, "Invalid transaction ID");
        transaction = ms._transactions[transactionId];
        require(!transaction.executed, "Transaction already executed");
        require(countSignatures(transaction) >= ms._requiredSignatures, "Insufficient valid signatures");

        transaction.executed = true;
        (bool success,) = transaction.to.call{value: transaction.value}(transaction.data);
        require(success, "Transaction execution failed");
        emit MultisigStorage.TransactionExecuted(transactionId, msg.sender);
    }

    // HELPERS

    function isOwner(address account) public view returns (bool) {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();

        for (uint256 i = 0; i < ms._owners.length; i++) {
            if (ms._owners[i] == account) {
                return true;
            }
        }
        return false;
    }

    function countSignatures(MultisigStorage.Transaction storage transaction) private view returns (uint256) {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();

        uint256 count = 0;
        for (uint256 i = 0; i < ms._owners.length; i++) {
            if (transaction.signatures[ms._owners[i]]) {
                count++;
            }
        }
        return count;
    }

    function getTransaction(uint256 transactionId)
        public
        view
        returns (address, uint256, bytes memory, bool, uint256)
    {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();
        MultisigStorage.Transaction storage transaction = MultisigStorage.TRANSACTION_STORAGE();

        require(transactionId < ms._transactions.length, "Invalid transaction ID");

        transaction = ms._transactions[transactionId];
        return (transaction.to, transaction.value, transaction.data, transaction.executed, countSignatures(transaction));
    }

    function getOwners() public view returns (address[] memory) {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();

        return ms._owners;
    }

    function getRequiredSignatures() public view returns (uint256) {
        MultisigStorage.MultisigDataStorage storage ms = MultisigStorage.MULTISIG_STORAGE();

        return ms._requiredSignatures;
    }

    receive() external payable {}
}
