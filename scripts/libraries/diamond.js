/* global ethers */

const FacetCutAction = { Add: 0, Replace: 1, Remove: 2 };

// get function selectors from ABI
function getSelectors(contract) {
  const signatures = contract.interface.fragments
    .filter((f) => f.type === "function" && f.name !== "init")
    .map((f) => f.selector);

  signatures.contract = contract;
  signatures.remove = remove;
  signatures.get = get;
  return signatures;
}

// get function selector from function signature

function getSelector(func) {
  const abiInterface = new ethers.Interface([`function ${func}`]);
  return abiInterface.getFunction(func).selector;
}

// used with getSelectors to remove selectors from an array of selectors
// functionNames argument is an array of function signatures

function remove(functionNames) {
  const selectors = this.filter((v) => {
    for (const fn of functionNames) {
      if (v === this.contract.interface.getFunction(fn).selector) {
        return false;
      }
    }
    return true;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

// used with getSelectors to get selectors from an array of selectors
// functionNames argument is an array of function signatures
function get(functionNames) {
  const selectors = this.filter((v) => {
    for (const fn of functionNames) {
      if (v === this.contract.interface.getFunction(fn).selector) {
        return true;
      }
    }
    return false;
  });
  selectors.contract = this.contract;
  selectors.remove = this.remove;
  selectors.get = this.get;
  return selectors;
}

function removeSelectors(selectors, signatures) {
  const iface = new ethers.Interface(signatures.map((v) => `function ${v}`));
  const removeSelectors = signatures.map((v) => iface.getFunction(v).selector);
  return selectors.filter((v) => !removeSelectors.includes(v));
}

function findAddressPositionInFacets(facetAddress, facets) {
  for (let i = 0; i < facets.length; i++) {
    if (facets[i].facetAddress === facetAddress) {
      return i;
    }
  }
}

module.exports = {
  getSelectors,
  getSelector,
  FacetCutAction,
  remove,
  removeSelectors,
  findAddressPositionInFacets,
};
