// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IDiamondLoupe {
    struct Facet {
        address facetAddress;
        bytes4[] functionSelectors;
    }

    /**
     * Gets all facet address and their 4 bytes function selector
     * returns facets_ Facet
     */
    function facets() external view returns (Facet[] memory facets_);

    /**
     * Get all function selector supported by specific facet
     */
    function facetFunctionSelectors(address _facet) external view returns (bytes4[] memory facetFunctionSelectors_);

    /**
     * Gets all facet address used by a diamond
     */
    function facetAddresses() external view returns (address[] memory facetAddresses_);

    /**
     * Gets the facet that supports a given selector
     */
    function facetAddress(bytes4 facetSelector_) external view returns (address facetAddress_);
}
