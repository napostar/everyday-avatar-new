
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
  await deploy("EverydayAvatar",{
    from: deployer,
    args: [eaData.address],
    log: true
  });
};
module.exports.tags = ["all", "main"];
