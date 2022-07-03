const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_PRICE_FEED_MOCK_ANSWER } = require("../helper-hardhat-config");


module.exports = async function ({getNamedAccounts, deployments}){
    const {deployer} = await getNamedAccounts();
    const {deploy, log} =  deployments;

    log("------------------------------------------");
    if(developmentChains.includes(network.name)){
        log("Local network detected deploying mocks...");
        await deploy("MockV3Aggregator",{
            from:deployer,
            log: true,
            args: [DECIMALS, INITIAL_PRICE_FEED_MOCK_ANSWER]
        });
        log("Mocks Deployed...");
    }
    log("------------------------------------------");
}

module.exports.tags = ["all", "mocks"];