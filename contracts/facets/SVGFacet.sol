// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/utils/Base64.sol";

contract SVGFacet {
    function tokenURI(uint256 /*_tokenId*/ ) public pure returns (string memory) {
        string memory svg = string(
            abi.encodePacked(
                '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">',
                '<circle cx="100" cy="100" r="90" fill="#ff007a" />',
                '<text x="100" y="120" font-family="Arial" font-size="50" fill="white" text-anchor="middle">STK</text>',
                "</svg>"
            )
        );

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "MyToken",',
                        '"description": "A token with an on-chain SVG icon.",',
                        '"image": "data:image/svg+xml;base64,',
                        Base64.encode(bytes(svg)),
                        '"}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }
}
