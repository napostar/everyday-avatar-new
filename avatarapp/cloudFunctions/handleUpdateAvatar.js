Moralis.Cloud.afterSave("AllMints", async(request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();

    logger.info(`All Mints afterSave Triggered: ${confirmed}`);

    if(!confirmed) {
        const AllMintedAvatars = Moralis.Object.extend("AllMintedAvatars");

        const owner = request.object.get("owner").toLowerCase();
        const contractAddress = request.object.get("address").toLowerCase();

        const query = new Moralis.Query(AllMintedAvatars);
        query.equalTo("contractAddress", contractAddress)
        query.equalTo("owner", owner)
        query.equalTo("tokenId", request.object.get("tokenId"))
        const mintRecord = await query.first();
        console.log(`mintRecord ${JSON.stringify(mintRecord)}`);

        if(mintRecord){
            logger.info(`Updating mintRecord's tokenURI for tokenId ${request.object.get("tokenId")}`)
            mintRecord.set("tokenURI",request.object.get("tokenURI"));
            await mintRecord.save();
        }else{
            const allMintedAvatars = new AllMintedAvatars()
            allMintedAvatars.set("contractAddress", contractAddress)
            allMintedAvatars.set("owner", owner)
            allMintedAvatars.set("tokenId", request.object.get("tokenId"))
            allMintedAvatars.set("tokenURI", request.object.get("tokenURI"))
            allMintedAvatars.set("cid", "")
    
            logger.info(`Saving... tokenId ${request.object.get("tokenId")}`)
            await allMintedAvatars.save()
        }

    }
});

Moralis.Cloud.afterSave("AllIPFS", async (request) => {
    const confirmed = request.object.get("confirmed");
    const logger = Moralis.Cloud.getLogger();
    
    logger.info(`AllIPFS afterSave Triggered: ${confirmed}`);
    if(!confirmed) {
        const AllMintedAvatars = Moralis.Object.extend("AllMintedAvatars");

        const contractAddress = request.object.get("address").toLowerCase();

        const query = new Moralis.Query(AllMintedAvatars);
        query.equalTo("contractAddress", contractAddress)
        query.equalTo("tokenId", request.object.get("tokenId"))
        const mintRecord = await query.first();

        console.log(`mintRecord ${JSON.stringify(mintRecord)}`);
        if(mintRecord){
            logger.info(`Updating mintRecord's tokenURI with newCID: ${request.object.get("cid")} for tokenId ${request.object.get("tokenId")}`)
            mintRecord.set("cid",request.object.get("cid"));
            mintRecord.set("tokenURI",request.object.get("tokenURI"));
            await mintRecord.save();
        }else{
            console.log(`No mintRecord for token ${request.object.get("tokenId")} to IPFS Hash`);
        }
    }
})