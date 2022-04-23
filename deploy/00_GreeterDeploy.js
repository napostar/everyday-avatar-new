

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  const greeterC = await deploy("Greeter",{
    from: deployer,
    args: ['Initializing EveryDay AVATAR']
  });

  const greeterContract = await ethers.getContractAt(
    "Greeter", greeterC.address, await ethers.getSigner()
  );
  await greeterContract.setGreeting("Greeting From EveryDay AVATAR");
  
};
module.exports.tags = ["Greeter"];
