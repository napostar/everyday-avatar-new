import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Stack,
  Image,
  Text,
  Button,
  useColorMode,
  Spinner,
  useToast,
  Container,
  SimpleGrid,
  Box,
  Heading,
  Link,
  List,
  ListItem,
  Badge,
  Flex
} from "@chakra-ui/react";
import mergeImages from "merge-images";
import imageToBase64 from "image-to-base64/browser";
import {
  useMoralis,
  useWeb3ExecuteFunction
} from "react-moralis";
import everyDayAvatar from "../../contract/EverydayAvatar.json";
import { useParams } from "react-router-dom";
import avaAssets from "../../utils/avatarAssets";
import AvatarBuilder from "../ui/AvatarBuilder";
import { useNfts } from "../../context/NftsContext";
import Avatar from '../ui/Avatar';
import Mints from "../../components/sections/Mints";
import { useBiconomy } from "../../context/BiconomyProvider";
import isIPFS from 'is-ipfs';
import { CheckCircleIcon } from "@chakra-ui/icons";


export default function ViewAvatar() {
  let { tokenId } = useParams(); 
  const toast = useToast();
  const {allNFTs, getTokenData} = useNfts();
  const {isBiconomyInitialized, contract:everydayAvatarContract, biconomyProvider, dappBalance} = useBiconomy()
  
  const didMountRef = useRef(false);

  const [fetchingToken, setFetchingToken] = useState(true);
  const [metaTxnLoading, setMetaTxnLoading] = useState(false);
  const [ipfsItLoading, setIpfsItLoading] = useState(false);
  const [disableUpdateMint, setDisableUpdateMint] = useState(false);

  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [fetchingOwnedNfts, setFetchingOwnedNfts] = useState(true);

  const [resetNft, setResetNft] = useState(true);
  const [nftData, setNftData] = useState(null);
  const [avatarData, setAvatarData] = useState([]);

  const [oldAvatar, setOldAvatar] = useState(null);

  const [newAvatar, setNewAvatar] = useState({
    bg: null,
    head: null,
    face: null,
    clothes: null
  });
  const [src, setSrc] = useState(null);
  const { colorMode } = useColorMode();

  const {BG,H,F,C, BACKGROUNDS, HEAD,FACE,CLOTHES,compoMapping} = avaAssets();
  const [request, setRequest] = useState({
    [BG]: null,
    [H]: null,
    [F]:null,
    [C]:null
  });

  const { data, error, fetch } = useWeb3ExecuteFunction();
  const { isAuthenticated, isInitialized, user, Moralis } = useMoralis();

  useEffect(() => {
    let fetch = true;
    if(isInitialized && isAuthenticated){
      (async () => {
        const nfts = await fetchOwnedContracts();
        if(fetch){
          setOwnedNFTs(nfts);
          setFetchingOwnedNfts(false);
        }
      })();
    }
    return () => {
      fetch = false;
    }
  },[isInitialized, isAuthenticated])

  useEffect(() => {
    let setJ = true;
    if(isInitialized) {
        //if(didMountRef.current){
          (async () => {
            const tJson =  await getTokenURIData();
            if(setJ){
              if(tJson != null){
                setNftData(tJson);
              }
              setFetchingToken(false);
            }
          })()
        //}
    }
    
    return () =>{
      setJ = false;
    }
  },[isAuthenticated, isInitialized, tokenId, didMountRef.current])

  useEffect(() => {
      if(didMountRef.current){
        const bgAsset = getAssetTraitData(BG,BACKGROUNDS,'Background');
        const headAsset = getAssetTraitData(H,HEAD,'Head');
        const faceAsset = getAssetTraitData(F,FACE,'Face');
        const clothesAsset = getAssetTraitData(C,CLOTHES,'Clothes');

        setNewAvatar({
            bg: bgAsset,
            head: headAsset,
            face: faceAsset,
            clothes: clothesAsset
        });

        if(oldAvatar === null){
          setOldAvatar({
            bg: bgAsset,
            head: headAsset,
            face: faceAsset,
            clothes: clothesAsset
          })
        }
      }
      didMountRef.current = true;
      
      return () => {
        setResetNft(true);
      }
  },[nftData, tokenId]);

  const getAssetTraitData = (category, components, trait) => {
    let attr = nftData.attributes.find(n => n.trait_type === trait);
    let asset = {
      assetId:'none',
      category: category,
      name: 'None'
    };
    if(typeof attr !== 'undefined'){
      asset = components.find(a => a.name === attr.value)
    }
    return asset
  }

  const getTokenURIData = async() => {
      try {
        let tokenJson = await getTokenData(tokenId);
        if(tokenJson){    
          tokenJson.isIpfs = false
          if(tokenJson.image && tokenJson.image.includes('ipfs')){
            const cid = tokenJson.image.split('//')[1];
            if(isIPFS.cid(cid)){
              tokenJson.image = `https://ipfs.io/ipfs/${cid}`
              tokenJson.isIpfs = true;
            }
          }          
          return tokenJson;
        }
      } catch (error) {
        return null;
      }
    return null;
  }

  useEffect(() => {
    if (data) {
      if (typeof data.hash !== "undefined") {
        toast({
          title: "Avatar Updated",
          description: `Txn ${data.hash}`,
          status: "success",
          position: "bottom-right",
          duration: 9000,
          isClosable: true,
        });
      }
    }
  }, [data]);

  useEffect(() => {
    if (error) {
      let message = (typeof error.data != "undefined") ? error.data.message: error.message
      toast({
        title: "Error",
        description: message,
        status: "error",
        position: "bottom-right",
        duration: 9000,
        isClosable: true,
      });
    }
  }, [error]);

  useEffect(() => {
    let genAvatar = true;
    (async () => {
      const mergeArray = await generateAva();
      if(genAvatar){
        if(mergeArray.length){
          setAvatarData([...mergeArray]);
        }else{
          await resetNftHandler();
        }
      }
    })()
    return () => {
      genAvatar = false;
    }
  }, [newAvatar]);



  const getSrcObj = async (category) => {
    if (category !== null) {
      if(category.assetId !== 'none'){
        const base64Strng = await imageToBase64(
          require(`../../avatarComponents/${category.assetId}.png`).default
        );
        const categoryIdx = avatarData.findIndex(
          (a) => a.categoryId === category.categoryId
        );
        if (categoryIdx !== -1) {
          let tmp = [...avatarData];
          let updateAvatar = { ...tmp[categoryIdx] };
          updateAvatar.src = `data:image/png;base64,${base64Strng}`;
          updateAvatar.assetId = category.assetId;
          return updateAvatar;
        } else {
          return {
            src: `data:image/png;base64,${base64Strng}`,
            x: 0,
            y: 0,
            categoryId: category.categoryId,
            assetId: category.assetId,
          };
        }
      }else{
        return null;
      }
    }
  };

  const generateAva = async () => {
    const bg = newAvatar.bg;
    const head = newAvatar.head;
    const face = newAvatar.face;
    const clothes = newAvatar.clothes;

    let mergeArray = [];

    if (bg !== null) {
      const bgSrc = await getSrcObj(bg);
      if(bgSrc !== null){
        mergeArray.push(bgSrc);
      }
    }

    if (head !== null) {
      const headSrc = await getSrcObj(head);
      if(headSrc !== null){
        mergeArray.push(headSrc);
      }
    }

    if (face !== null) {
      const faceSrc = await getSrcObj(face);
      if(faceSrc !== null){
        mergeArray.push(faceSrc);
      }
    }

    if (clothes !== null) {
      const clothesSrc = await getSrcObj(clothes);
      if(clothesSrc !== null){
        mergeArray.push(clothesSrc);
      }
    }
    
    return mergeArray;
  };

  useEffect(() => {
    if (avatarData.length) {
      mergeImages(avatarData)
        .then((src) => setSrc(src))
        .catch((err) => console.log(err));
    }
  }, [avatarData]);

  const makeAvatar = (category, asset) => {
    let updatedAvatarData = {
      ...newAvatar,
      [category]: asset
    };
    setNewAvatar(updatedAvatarData);

    let tokenTemp = nftData;
    let attrIdx = -1;
    if(category === 'bg'){
      attrIdx = tokenTemp.attributes.findIndex(n => n.trait_type === 'Background');
    }else if(category === 'head'){
      attrIdx = tokenTemp.attributes.findIndex(n => n.trait_type === 'Head');
    }else if(category === 'face'){
      attrIdx = tokenTemp.attributes.findIndex(n => n.trait_type === 'Face');
    }else if(category === 'clothes'){
      attrIdx = tokenTemp.attributes.findIndex(n => n.trait_type === 'Clothes');
    }
    if(attrIdx !== -1){
      tokenTemp.attributes[attrIdx]['value'] = asset.name;
      if(tokenTemp.image.includes('ipfs')){
        if(JSON.stringify(updatedAvatarData) !== JSON.stringify(oldAvatar)){
          tokenTemp.isIpfs = false
        }else{
          tokenTemp.isIpfs = true
        }
      }
     
      setNftData(tokenTemp);
    }

    let v = null
    if(oldAvatar[category] !== null){
      if((asset.assetId !== 'none')&&(oldAvatar[category].assetId !== asset.assetId)){
        v = asset.assetId;
      }
    }
    if(asset.assetId === 'none'){
      v = 0;
    }
    setRequest(prevState => {
      return {
        ...prevState,
        [compoMapping[category]]: v
      }
    })

    if(resetNft){
      setResetNft(false);
    }
  };


  //Gasless Update Avatar
  const updateAvatarBico = async (categories, assets) => {
   
    try {
      const txn = await everydayAvatarContract.methods.updateAvatar(tokenId, categories, assets).send({
        from: user.attributes.ethAddress,
        signatureType: biconomyProvider.EIP712_SIGN
      })
      if(typeof txn.transactionHash !== 'undefined'){
        toast({
          title: "Avatar Updated",
          description: `Txn ${txn.transactionHash}`,
          status: "success",
          position: "bottom-right",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (err) {
      toast({
        title: "",
        description: err.message,
        status: "error",
        position: "bottom-right",
        duration: 9000,
        isClosable: true,
      });
    }
    
  }

  //Mint NFT Transaction
  const updateMintedAvatar = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        status: "error",
        position: "bottom-right",
        duration: 9000,
        isClosable: true,
      });
      return;
    }

    if(!isBiconomyInitialized){
      alert('Biconomy not initialized');return;
    }

    let categories = [];
    let assets = [];

    if(JSON.stringify(newAvatar) === JSON.stringify(oldAvatar)){
      toast({
        title: "",
        description: "Nothing to Update",
        status: "info",
        position: "bottom-right",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    
    Object.entries(request)
      .filter(([, value]) => ((value !== null)))
      .forEach(([key, value]) => {
        categories.push(parseInt(key))
        assets.push(parseInt(value))
      });

    if(categories.length && assets.length){
      setMetaTxnLoading(true);
      setDisableUpdateMint(true);
      setResetNft(true);
      if(dappBalance >= 1){
        await updateAvatarBico(categories, assets)
      }else{
        let options = {
          contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
          functionName: "updateAvatar",
          abi: everyDayAvatar.abi,
          params: {
            tokenId: tokenId,
            attrId: categories,
            attrValue: assets,
          }
        };
        const updateMintTxn = await fetch({ params: options });
        if (updateMintTxn) {
          await updateMintTxn.wait(1);
        }
      }
      await getNewTokenData();
      setResetNft(false);
      setMetaTxnLoading(false);
      setDisableUpdateMint(false);
    }
  };

  const fetchOwnedContracts = async() => {
    try {
      const options = {
        chain: "mumbai",
        address: user.attributes.ethAddress,
        token_address: process.env.REACT_APP_CONTRACT_ADDRESS,
      };
      const polygonNFTs = await Moralis.Web3API.account.getNFTsForContract(options);
      const nfts = polygonNFTs.result;
      if(nfts.length){
        for(let n in nfts) {
          if(nfts[n]){
            let token_uri = await getTokenData(nfts[n].token_id);
            if(token_uri !== null){
              nfts[n].token_uri = token_uri;
            }else if(nfts[n].token_uri){
              let oldURI = Buffer.from(
                nfts[n].token_uri.replace("data:application/json;base64,", ""),
                "base64"
              ).toString();
              if(oldURI){
                nfts[n].token_uri = JSON.parse(oldURI)
              }
            }
            if(nfts[n].token_uri){
              nfts[n].token_uri.isIpfs = false
              if(nfts[n].token_uri.image && nfts[n].token_uri.image.includes('ipfs')){
                const cid = nfts[n].token_uri.image.split('//')[1];
                if(isIPFS.cid(cid)){
                  nfts[n].token_uri.image = `https://ipfs.io/ipfs/${cid}`
                  nfts[n].token_uri.isIpfs = true;
                }
              } 
            }
          }
        }
        return nfts;
      }
      return [];
    } catch (error) {
      return [];
    }
  }

  const ipfsItHandler = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Error",
        description: "Please connect your wallet",
        status: "error",
        position: "bottom-right",
        duration: 9000,
        isClosable: true,
      });
      return;
    }
    setIpfsItLoading(true);
    if(!resetNft){
      setResetNft(true);
    }
    setDisableUpdateMint(true);
    let options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      functionName: "requestNewImage",
      abi: everyDayAvatar.abi,
      params: {
        tokenId: tokenId,
      }
    };
    const request = await fetch({ params: options });
    if (request) {
      await request.wait(1);
    }
    await resetNftHandler()
    setIpfsItLoading(false);
    setResetNft(false);
    setDisableUpdateMint(false);
   
  }

  const refreshOwnedNfts = async () => {
    setFetchingOwnedNfts(true);
    const nfts = await fetchOwnedContracts();
    setOwnedNFTs(nfts);
    setFetchingOwnedNfts(false);
  }


  const resetNftHandler = async () => {
    didMountRef.current = false;
    setFetchingToken(true);
    setNftData(null);
    setRequest({
      [BG]: null,
      [H]: null,
      [F]:null,
      [C]:null
    })
    const tJson = await getTokenURIData();
    if(tJson != null){
      setNftData(tJson);
    }
     setFetchingToken(false);
  }

  const getNewTokenData = async () => {
    const tJson = await getTokenURIData();
    if(tJson != null){
      setNftData(tJson);
    }
  }

  
  const showControls = useCallback(() => {
    const nft = allNFTs.find((n) => n.token_id === tokenId);
    return (src !== null)&&(isAuthenticated) && (nft?.owner_of) && (nft.owner_of.toLowerCase() === user.attributes.ethAddress.toLowerCase());
  },[isAuthenticated,allNFTs, user, tokenId, src])

  return (
    <Container maxW={"6xl"} py={12}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        {(showControls()) ? 
         ( <>
         <Stack spacing={4} w={"full"} maxW={"md"}>
            <AvatarBuilder makeAvatar={makeAvatar} newAvatar={newAvatar} addNone={true}/>
          </Stack>
                  <Stack>
                  {(!fetchingToken) ? (
                    <Stack>
                      {(nftData !== null)? 
                         <>
                         <Box w="350px">
                            <Image id="your-avatar" alt={"Your Avatar"} src={src} />
                          </Box>
                          <Box >
                              <Heading fontSize="xl" marginTop="2">
                                <Link
                                  textDecoration="none"
                                  _hover={{ textDecoration: "none" }}
                                >
                                  {(nftData?.name)?nftData?.name:'Name not found'}
                                  {nftData.isIpfs && 
                                  <Badge ml='1' fontSize='0.8em' colorScheme='green'>
                                    IPFS <CheckCircleIcon/>
                                  </Badge>}
                                </Link>
                              </Heading>
                            
                              <Text as="p" fontSize="sm" marginTop="2">
                                  {(nftData?.description)?nftData?.description:'Description not found'}
                              </Text>
          
                              {(nftData?.attributes) && (
                                <>
                                  <Text mt={2} fontWeight={600}>Traits</Text>
                                  <List >
                                    {nftData.attributes.map((attr, idx) => (
                                        <ListItem key={idx} fontSize="sm" padding="1">
                                          {attr.trait_type} - 
                                          <Badge variant='outline' colorScheme='blue'>{attr.value}</Badge></ListItem>
                                    ))}
                                  </List>
                                </>
                              )}
                          </Box>
                         </>
                        :
                        <Box><Text>Token Not Found</Text></Box>
                      }
                    </Stack>
                  ) : (
                    <div
                      style={{
                        padding: "200px",
                      }}
                    >
                      <Spinner
                        thickness="4px"
                        speed="0.90s"
                        emptyColor="gray.200"
                        color="blue.500"
                        size="xl"
                      />
                    </div>
                  )}
                  <Flex>
                    <Box>
                    <Button
                    pt={8}
                    mt={5}
                    bg={colorMode === "dark" ? "customB.500" : "primary.500"}
                    color={["white"]}
                    _hover={{
                      bg: ["primary.100", "primary.100", "primary.600", "primary.600"],
                    }}
                    borderRadius="8px"
                    py="4"
                    px="4"
                    lineHeight="1"
                    size="md"
                    onClick={updateMintedAvatar}
                    isLoading={metaTxnLoading}
                    disabled={disableUpdateMint}
                  >
                    Update Avatar
                  </Button>
                    </Box>
        
                    <Box pl={4}>
                  <Button
                    pt={8}
                    mt={5}
                    bg={colorMode === "dark" ? "customB.500" : "primary.500"}
                    color={["white"]}
                    _hover={{
                      bg: ["primary.100", "primary.100", "primary.600", "primary.600"],
                    }}
                    borderRadius="8px"
                    py="4"
                    px="4"
                    lineHeight="1"
                    size="md"
                    disabled={resetNft}
                    onClick={resetNftHandler}
                  >
                    Reset
                  </Button>
                    </Box>

                    {
                      ((nftData) && (!nftData.isIpfs) && (!nftData.image.includes('ipfs'))) && 
                      <Box pl={4}>
                        <Button
                          pt={8}
                          mt={5}
                          py="4"
                          px="4"
                          lineHeight="1"
                          size='md'
                          border='2px'
                          borderColor='customB.500'
                          onClick={ipfsItHandler}
                          isLoading={ipfsItLoading}
                        >
                          IPFS IT
                        </Button>
                      </Box>
                    }
                    
                  </Flex>
                </Stack>
          </>)
            : (
                <Avatar src={src} nftData={nftData} fetchingToken={fetchingToken}/>
            )
        }
     
      </SimpleGrid>
    
      {isAuthenticated && <Mints allNFTs={ownedNFTs} fetchingNfts={fetchingOwnedNfts} refreshNfts={refreshOwnedNfts} title="Owned NFTs"/>}
    </Container>
  );
}
