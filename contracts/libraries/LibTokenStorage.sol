// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

library TokenStorage {
    struct ERC20Storage {
        string _name;
        string _symbol;
        uint8 _decimal;
        uint256 _totalSupply;
        mapping(address => uint256) _balances;
        mapping(address => mapping(address => uint256)) _allowances;
        address _owner;
    }

    // Set token storage pointer
    bytes32 constant ERC20_STORAGE_POSITION = keccak256("diamond.standard.erc20.storage");

    function TOKENSTORAGE() internal pure returns (ERC20Storage storage token) {
        bytes32 position = ERC20_STORAGE_POSITION;
        assembly {
            token.slot := position
        }
    }
}
