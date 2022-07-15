const { ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");

const TOKEN_ID = 1


async function updateAvatar() {
    const everydayAvatar = await ethers.getContract("EverydayAvatar");

    const updateTxn = await everydayAvatar.updateAvatar(TOKEN_ID, [3], [29]);
    const updateReceipt = await updateTxn.wait(1);

    console.log(`---- Updated Avatar TokenId ${updateReceipt.events[1].args.tokenId.toString()} -----`);
    let tokenURI = Buffer.from(
        updateReceipt.events[1].args.tokenURI.replace("data:application/json;base64,", ""),
    "base64"
    ).toString();
    console.log(tokenURI);

    if(network.config.chainId == 31337){
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

updateAvatar()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
