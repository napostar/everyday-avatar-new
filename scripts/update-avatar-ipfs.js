const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 1
const CID_HASH = "QmbBrh36mwu2Gm55RdhSovRQTVhdcTrWgeHdbVtvfcNPHq"


async function updateAvatarIpfs() {
    const everydayAvatar = await ethers.getContract("EverydayAvatar");

    const updateIpfsTxn = await everydayAvatar.updateToIPFS(TOKEN_ID, CID_HASH);
    const updateReceipt = await updateIpfsTxn.wait(1);

    console.log(`---- Updated Avatar IPFS For TokenId ${updateReceipt.events[0].args.tokenId.toString()} -----`);
    let tokenURI = Buffer.from(
        updateReceipt.events[0].args.tokenURI.replace("data:application/json;base64,", ""),
    "base64"
    ).toString();
    console.log(tokenURI);

    if(network.config.chainId == 31337){
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

updateAvatarIpfs()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
