const { ethers, network, deployments } = require("hardhat")
const fs = require("fs");

const dappContractDir = './avatarapp/src/contract/';

module.exports = async function () {
    if(process.env.UPDATE_DAPP){
        console.log("Updating Dapp with newly deployed address & ABI...");
        
        await updateAbi();
        //await updateAddress();
        console.log("Done!");
    }
}

async function updateAbi(){
    const everydayAvatar = await deployments.getArtifact("EverydayAvatar");
    fs.writeFileSync(`${dappContractDir}EverydayAvatar.json`, JSON.stringify(everydayAvatar.abi));
}

async function updateAddress(){
    const everydayAvatar = await ethers.getContract("EverydayAvatar");
    const everydayAvatarAddress = everydayAvatar.address;
    const chainId = network.config.chainId;

    const addressMappingFile = `${dappContractDir}addresses.json`;
    const addresses = JSON.parse(fs.readFileSync(addressMappingFile, 'utf8'));

    if(chainId in addresses) {
        if(!addresses[chainId]["EverydayAvatar"].includes(everydayAvatarAddress)){
            addresses[chainId]["EverydayAvatar"].push(everydayAvatarAddress);
        }
    }else{
        addresses[chainId] = { EverydayAvatar: [everydayAvatarAddress]}
    }
    fs.writeFileSync(addressMappingFile, JSON.stringify(addresses));
}

module.exports.tags = ["all", "dapp"]