const {ethers} = require('hardhat');

const networkConfig = {
    80001:{
        name: "mumbai",
        vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        ethUsdPriceFeed: "0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada",
        trustedForwarder: "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b",
    },
    137:{
        name: "polygon",
        vrfCoordinator: "0x7a1BaC17Ccc5b313516C5E16fb24f7659aA5ebed",
        ethUsdPriceFeed: "0xAB594600376Ec9fD91F8e885dADF0CE036862dE0",
        trustedForwarder: "0x86C80a8aa58e0A4fa09A69624c31Ab2a6CAD56b8"
    },
    31337:{
        name: 'hardhat',
        ethUsdPriceFeed: "",
        trustedForwarder: "0x9399BB24DBB5C4b782C70c2969F58716Ebbd6a3b"
    }
}

const developmentChains = ["hardhat", "localhost"]
const DECIMALS = 8
const INITIAL_PRICE_FEED_MOCK_ANSWER = 48480000
const INITIAL_PRICE = "200000000000000000000"

module.exports = {
    networkConfig,
    developmentChains,
    DECIMALS,
    INITIAL_PRICE_FEED_MOCK_ANSWER,
    INITIAL_PRICE
}