/* global ethers */
/* eslint prefer-const: "off" */
const { FacetCutAction } = require("./libraries/diamond.js");

async function removeFunction() {
  // 1. get selector
  const ERC20Facet = await ethers.getContractFactory("ERC20Facet");
  const selectorToRemove = ERC20Facet.interface.getFunction("mint").selector;

  // 2. prepare cut
  const removeCut = [
    {
      facetAddress: ethers.ZeroAddress,
      action: FacetCutAction.Remove,
      functionSelectors: [selectorToRemove],
    },
  ];

  // 3. execute diamondCut
  const diamondCut = await ethers.getContractAt(
    "IDiamondCut",
    "0x0fB7c2404dA9f2d5955c4894e0BbEfc0CDF5D5B1",
  );
  const tx = await diamondCut.diamondCut(removeCut, ethers.ZeroAddress, "0x");
  await tx.wait();

  console.log("Function removed:", selectorToRemove);
}

// and properly handle errors.
if (require.main === module) {
  removeFunction()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.removeFunction = removeFunction;
