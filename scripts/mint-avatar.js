const { getNamedAccounts, ethers, network } = require("hardhat");
const { moveBlocks } = require("../utils/move-blocks");


async function mintAvatar() {
    const {deployer} = await getNamedAccounts();
    const everydayAvatar = await ethers.getContract("EverydayAvatar");

    console.log("Minting avatar...");
    const mintTx = await everydayAvatar.mintAvatar(deployer, [3], [24], {
        from: deployer,
        value: ethers.utils.parseEther("1")
    })
    const mintTxReceipt = await mintTx.wait(1);
    console.log(`---- Minted Avatar TokenId ${mintTxReceipt.events[2].args.tokenId.toString()} -----`);
    let tokenURI = Buffer.from(
        mintTxReceipt.events[2].args.tokenURI.replace("data:application/json;base64,", ""),
    "base64"
    ).toString();
    console.log(tokenURI);

    if (network.config.chainId == 31337) {
        await moveBlocks(2, (sleepAmount = 1000))
    }
}

mintAvatar()
  .then(() => process.exit(0))
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
