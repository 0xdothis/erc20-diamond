/* global ethers */
/* eslint prefer-const: "off" */

const { getSelectors, FacetCutAction } = require("./libraries/diamond.js");

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
  const diamondCutFacet = await DiamondCutFacet.deploy();
  await diamondCutFacet.waitForDeployment();
  const diamondCutAddress = await diamondCutFacet.getAddress();
  console.log("DiamondCutFacet deployed:", diamondCutAddress);

  await diamondCutFacet.deploymentTransaction().wait(2);

  await verify(diamondCutAddress, []);

  // Deploy DiamondInit
  const DiamondInit = await ethers.getContractFactory("DiamondInit");
  const diamondInit = await DiamondInit.deploy();
  await diamondInit.waitForDeployment();
  const diamondInitAddress = await diamondInit.getAddress();
  console.log("DiamondInit deployed:", diamondInitAddress);

  await diamondInit.deploymentTransaction().wait(2);

  await verify(diamondInitAddress, []);

  // deploy facets
  console.log("");
  console.log("Deploying facets");
  const FacetNames = ["DiamondLoupeFacet", "OwnershipFacet", "ERC20Facet"];
  const cut = [];
  for (const FacetName of FacetNames) {
    const Facet = await ethers.getContractFactory(FacetName);
    const facet = await Facet.deploy();
    await facet.waitForDeployment();
    const facetCA = await facet.getAddress();
    console.log(`${FacetName} deployed: ${facetCA}`);

    cut.push({
      facetAddress: facetCA,
      action: FacetCutAction.Add,
      functionSelectors: getSelectors(facet),
    });

    await facet.deploymentTransaction().wait(2);

    await verify(facetCA, []);
  }

  // deploy Diamond and Mint using delegatecall in the Diamond.sol constructor
  const Diamond = await ethers.getContractFactory("Diamond");
  const diamond = await Diamond.deploy(
    contractOwner.address,
    diamondCutAddress,
    "SIMPLE TOKEN",
    "STK",
    18,
    10000000,
    cut[2].facetAddress,
    "0x40c10f19000000000000000000000000e2cd6bbad217c1495b023dba35b40236280dc3560000000000000000000000000000000000000000000000000000000000989680",
  );
  await diamond.waitForDeployment();
  const diamondCA = await diamond.getAddress();
  console.log("Diamond deployed:", diamondCA);

  await diamond.deploymentTransaction().wait(2);

  await verify(diamondCA, [
    contractOwner.address,
    diamondCutAddress,
    "SIMPLE TOKEN",
    "STK",
    18,
    10000000,
    cut[2].facetAddress,
    "0x40c10f19000000000000000000000000e2cd6bbad217c1495b023dba35b40236280dc3560000000000000000000000000000000000000000000000000000000000989680",
  ]);

  // upgrade diamond with facets
  console.log("");
  console.log("Diamond Cut:", cut);
  const diamondCut = await ethers.getContractAt("IDiamondCut", diamondCA);
  let tx;
  let receipt;
  // call to init function
  let functionCall = diamondInit.interface.encodeFunctionData("init");
  tx = await diamondCut.diamondCut(cut, diamondInitAddress, functionCall);
  console.log("Diamond cut tx: ", tx.hash);
  receipt = await tx.wait();
  if (!receipt.status) {
    throw Error(`Diamond upgrade failed: ${tx.hash}`);
  }
  console.log("Completed diamond cut");
  // return diamond.address
}

// We recommend this pattern to be able to use async/await everywhere
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
