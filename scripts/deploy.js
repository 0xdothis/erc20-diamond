/* global ethers */
/* eslint prefer-const: "off" */

const {
  getSelectors,
  FacetCutAction,
  remove,
} = require("./libraries/diamond.js");

async function verify(address, constructorArguments = []) {
  try {
    await run("verify:verify", {
      address,
      constructorArguments,
    });
    console.log(`✅ Verified: ${address}`);
  } catch (e) {
    if (e.message.toLowerCase().includes("already verified")) {
      console.log(`ℹ️ Already verified: ${address}`);
    } else {
      console.log(`❌ Verification failed for ${address}: ${e.message}`);
    }
  }
}

async function deployDiamond() {
  const accounts = await ethers.getSigners();
  const contractOwner = accounts[0];

  const DiamondCutFacet = await ethers.getContractFactory("DiamondCutFacet");
  /** const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.waitForDeployment();
  const diamondCutAddress = await diamondCutFacet.getAddress();
  console.log("DiamondCutFacet deployed:", diamondCutAddress);

  await diamondCutFacet.deploymentTransaction().wait(2);

  await verify(diamondCutAddress, []);*/

  // Deploy DiamondInit
  /** const DiamondInit = await ethers.getContractAt("DiamondInit", );
   const diamondInit = await DiamondInit.deploy();
  await diamondInit.waitForDeployment();
  const diamondInitAddress = await diamondInit.getAddress();
  console.log("DiamondInit deployed:", diamondInitAddress);

  await diamondInit.deploymentTransaction().wait(2);

  await verify(diamondInitAddress, []);*/

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = ["MultisigFacet", "SVGFacet", "SwapFacet"];
  const cut = [];
  for (const FacetName of FacetNames) {
    let facet;
    const Facet = await ethers.getContractFactory(FacetName);
    if (FacetName === "MultisigFacet") {
      facet = await Facet.deploy(
        [
          "0xb5D045Ee46F26a6d9de59CcA670D6E8f35f206D0",
          "0xE2cD6bBad217C1495B023dBa35b40236280Dc356",
          "0x5eCA53C4D237C0C05B6a670041e63ab15b7DC104",
        ],
        3,
      );
    } else {
      facet = await Facet.deploy();
    }

    await facet.waitForDeployment();
    const facetCA = await facet.getAddress();
    console.log(`${FacetName} deployed: ${facetCA}`);

    cut.push({
      facetAddress: facetCA,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });
    if (FacetName === "MultisigFacet") {
      await verify(facetCA, [
        [
          "0xb5D045Ee46F26a6d9de59CcA670D6E8f35f206D0",
          "0xE2cD6bBad217C1495B023dBa35b40236280Dc356",
          "0x5eCA53C4D237C0C05B6a670041e63ab15b7DC104",
        ],
        3,
      ]);
    } else {
      await verify(facetCA, []);
    }
  }

  // deploy Diamond and Mint using delegatecall in the Diamond.sol constructor
  /** const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    contractOwner.address,
    diamondCutAddress,
  );
  await diamond.waitForDeployment();
  const diamondCA = await diamond.getAddress();
  console.log("Diamond deployed:", diamondCA);

  await diamond.deploymentTransaction().wait(2);

  await verify(diamondCA, [contractOwner.address, diamondCutAddress]);

  // ✅ Encode ERC20Facet initializer call
  const ERC20Facet = await ethers.getContractFactory("ERC20Facet");
  const initCalldata = ERC20Facet.interface.encodeFunctionData("init", [
    "SIMPLE TOKEN", // name
    "STK", // symbol
    18, // decimals
    ethers.parseUnits("10000000", 18), // supply (10,000,000 * 10^18)
  ]);
*/

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);
  const diamondInit = await ethers.getContractAt(
    "DiamondInit",
    "0x5681006AF9deb0D2FC498732C25370a1b91a960C",
  );
  const diamondCut = await ethers.getContractAt(
    "IDiamondCut",
    "0x0fB7c2404dA9f2d5955c4894e0BbEfc0CDF5D5B1",
  );

  let tx, tx2;
  let receipt, receipt2;
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData("init");
  tx = await diamondCut.diamondCut(
    cut,
    "0x5681006AF9deb0D2FC498732C25370a1b91a960C",
    functionCall,
  );
  //tx2 = await diamondCut.diamondCut([], cut[2].facetAddress, initCalldata);
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  //receipt2 = await tx2.wait();
  if (!receipt.status /**|| /!receipt2.status*/) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");
  // return diamond.address
}

//Revome mint function
/**console.log("");
console.log("Removing function");*/

// and properly handle errors.
if (require.main === module) {
  deployDiamond()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

exports.deployDiamond = deployDiamond;
