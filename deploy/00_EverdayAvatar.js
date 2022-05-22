
const avatarComponents = require('../scripts/asset_data.json');

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  //Deploy EAData
  const eaData = await deploy("AvatarNameData",{
    from:deployer,
    log: true
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
  const avatarNameData = await ethers.getContractAt(
    "AvatarNameData", eaData.address, await ethers.getSigner()
  );
  const eaTxn = await avatarNameData.addManyComponents(attrIds, catIds, nameArr);
  await eaTxn.wait(1);

  //Deploy EverydayAvatar
  const everydayAvatar = await deploy("EverydayAvatar",{
    from: deployer,
    args: [eaData.address],
    log: true
  });

  const everydayAvatarContract = await ethers.getContractAt(
    "EverydayAvatar", everydayAvatar.address, await ethers.getSigner()
  );
  //set mumbai forwarder
  const eTxn = await everydayAvatarContract.setTrustedForwarder('0x9399bb24dbb5c4b782c70c2969f58716ebbd6a3b');
  await eTxn.wait(1);

};
module.exports.tags = ["all", "main"];
