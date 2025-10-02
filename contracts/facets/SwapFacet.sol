// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {TokenStorage} from "../libraries/LibTokenStorage.sol";

contract SwapFacet {
    function swapTokenForETH(address to, uint256 _amount) external {
        TokenStorage.ERC20Storage storage token = TokenStorage.TOKENSTORAGE();
        require(_amount > 0, "Invalid amount");

        uint256 tokenAmount = (_amount * 1e18) / 1e7;

        token._balances[msg.sender] -= tokenAmount;

        (bool success,) = to.call{value: tokenAmount}("");

        require(success);
    }

    function swapEthForToken(uint256 _amount) external payable {
        TokenStorage.ERC20Storage storage token = TokenStorage.TOKENSTORAGE();

        require(_amount > 0, "Invalid amount");

        uint256 tokenAmount = (_amount * 1e11);

        token._balances[msg.sender] += tokenAmount;
    }
}
