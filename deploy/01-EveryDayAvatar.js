
const { ethers, network } = require('hardhat');
const { networkConfig, developmentChains } = require('../helper-hardhat-config');
const avatarComponents = require('../scripts/asset_data.json');
const { verify } = require('../utils/verify');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await network.config.chainId;

  //Deploy EAData
  const eaData = await deploy("AvatarNameData",{
    from:deployer,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  });

  //addManyComponents
  let attrIds = [];
  let catIds = [];
  let nameArr = [];
  for (var i = 0; i < avatarComponents.assets.length; i++) {
    let compJson = avatarComponents.assets[i];
    attrIds.push(compJson.assetId);
    catIds.push(compJson.categoryId);
    nameArr.push(compJson.name);
  }

  log(`AvatarNameData Calling addManyComponents...`);
  const avatarNameData = await ethers.getContract("AvatarNameData");
  const eaTxn = await avatarNameData.addManyComponents(attrIds, catIds, nameArr);
  await eaTxn.wait(1);

  //Deploy EverydayAvatar
  const everydayAvatarArgs = [eaData.address]
  const everydayAvatar = await deploy("EverydayAvatar",{
    from: deployer,
    args: everydayAvatarArgs,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1
  });



  const everydayAvatarContract = await ethers.getContract("EverydayAvatar");
  //set forwarder
  const trustedForwarder = networkConfig[chainId]["trustedForwarder"] || "";
  const eTxn = await everydayAvatarContract.setTrustedForwarder(trustedForwarder);
  await eTxn.wait(1);

  // Verify the deployment
  if (!developmentChains.includes(network.name) && process.env.POLYGONSCAN_API_KEY) {
      log("Verifying...")
      await verify(everydayAvatar.address, everydayAvatarArgs)
  }

};
module.exports.tags = ["all", "main"];
