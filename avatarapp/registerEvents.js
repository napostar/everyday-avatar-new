//const { deployments } = require("hardhat");
const Moralis = require("moralis/node");

require("dotenv").config();

const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

const serverUrl = process.env.REACT_APP_MORALIS_SERVER_URL;
const appId = process.env.REACT_APP_MORALIS_APPLICATION_ID;
const masterKey = process.env.masterKey;


async function registerEvents() {

  const checkParam = process.argv[2];

  //const everydayAvatarAbi = await (await deployments.getArtifact("EverydayAvatar")).abi;
  
  await Moralis.start({ serverUrl, appId, masterKey });
  console.log(`Preparing to Register Contract: ${contractAddress}`);

  // const avatarUpdateEventAbi = everydayAvatarAbi.filter((v, idx) => (v.type === "event" && v.name === "AvatarUpdate"))[0];
  // const avatarUpdateIPFSEventAbi = everydayAvatarAbi.filter((v, idx) => (v.type === "event" && v.name === "AvatarUpdateIPFS"))[0];

  // if((typeof avatarUpdateEventAbi == "undefined") || (typeof avatarUpdateIPFSEventAbi == "undefined")) return;

  // console.log("******** Event ABIs *********");
  // console.log(JSON.stringify(avatarUpdateEventAbi))
  // console.log("--------------------------------------------");
  // console.log(JSON.stringify(avatarUpdateIPFSEventAbi))

  if((typeof checkParam !== "undefined") && (checkParam == "checkabi")) return;

  let allMintsOptions = {
    chainId: "80001",
    address: contractAddress,
    sync_historical: true,
    topic: "AvatarUpdate(address,uint256,string)",
    abi:{
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "owner",
          type: "address"
        },
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "string",
          name: "tokenURI",
          type: "string"
        }
      ],
      name: "AvatarUpdate",
      type: "event"
    },
    tableName: "AllMints",
  };

  const recordMints = await Moralis.Cloud.run(
    "watchContractEvent",
    allMintsOptions,
    { useMasterKey: true }
  );

  console.log(recordMints);

  let allIPFSOptions = {
    chainId: "80001",
    address: contractAddress,
    sync_historical: true,
    topic: "AvatarUpdateIPFS(uint256,string,string)",
    abi:{
      "anonymous": false,
      "inputs": [
        {
          indexed: true,
          internalType: "uint256",
          name: "tokenId",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "string",
          name: "cid",
          type: "string"
        },
        {
          indexed: false,
          internalType: "string",
          name: "tokenURI",
          type: "string"
        }
      ],
      name: "AvatarUpdateIPFS",
      type: "event"
    },
    tableName: "AllIPFS",
  };

  const ipfsIt = await Moralis.Cloud.run(
    "watchContractEvent",
    allIPFSOptions,
    { useMasterKey: true }
  );
  console.log(ipfsIt);


  if ((recordMints.success) && (ipfsIt.success)) {
    console.log("Success!, Now Listening for registered events");
  } else {
    console.log("Something went wrong! :(");
  }
}

registerEvents()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
