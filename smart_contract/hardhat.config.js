//

require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    goerli: {
      url: "https://eth-goerli.g.alchemy.com/v2/x1DHcSADcSrHEOfBdDMTIy5t5IxGFIVj",
      account: [
        "645e92f92918e6a8bff550348ef76400bec8241119a1547d7278c6268800eda8",
      ],
    },
  },
};
