// Right click on the script name and hit "Run" to execute
(async () => {
    try {
        console.log('Running deployWithEthers script...')
    
        const contractName = 'AvatarNameData' // Change this for other contract
        const constructorArgs = []    // Put constructor args (if any) here for your contract

        const avatarContractName = 'EverydayAvatar'

        // Note that the script needs the ABI which is generated from the compilation artifact.
        // Make sure contract is compiled and artifacts are generated
        const artifactsPath = `browser/contracts/artifacts/${contractName}.json` // Change this for different path
    
        const metadata = JSON.parse(await remix.call('fileManager', 'getFile', artifactsPath))

        const avatarArtifactsPath = `browser/contracts/artifacts/${avatarContractName}.json` // Change this for different path
    
        const avatarMetadata = JSON.parse(await remix.call('fileManager', 'getFile', avatarArtifactsPath))


        // 'web3Provider' is a remix global variable object
        const signer = (new ethers.providers.Web3Provider(web3Provider)).getSigner()
    
        let factory = new ethers.ContractFactory(metadata.abi, metadata.data.bytecode.object, signer);
        let avatarFactory = new ethers.ContractFactory(avatarMetadata.abi, avatarMetadata.data.bytecode.object, signer);

        let contract = await factory.deploy(...constructorArgs);
    
        console.log('Contract Address: ', contract.address);
    
        // The contract is NOT deployed yet; we must wait until it is mined
        await contract.deployed()
        console.log('Deployment successful.');

        //deploy avatar contract
        let avatarContract = await avatarFactory.deploy(contract.address);
        console.log('Avatar Contract Address: ', avatarContract.address)

        await avatarContract.deployed()
        console.log('Avatar Contract Deployed')

        //update avatar data contract with the initial data.
        const dataPath = `browser/contracts/data/avatar_data.json` 
    
        const jsonData = JSON.parse(await remix.call('fileManager', 'getFile', dataPath))
        var attrIds = [];
        var catIds = [];
        var nameArr = [];

        for (var i = 0; i < jsonData.assets.length; i++) {
            let compJson = jsonData.assets[i];
           attrIds.push(compJson.assetId);
           catIds.push(compJson.categoryId);
           nameArr.push(compJson.name);
        }
        console.log('finished processing, posting transaction....');
        let tx = await contract.addManyComponents(attrIds, catIds, nameArr);
        await tx.wait();
        
        console.log('finished')
        
    } catch (e) {
        console.log(e.message)
    }
})()