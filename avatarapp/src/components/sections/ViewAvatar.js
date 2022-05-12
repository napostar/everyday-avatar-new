import React, { useState, useEffect } from "react";
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

export default function ViewAvatar() {
  let { tokenId } = useParams(); 
  const toast = useToast();
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

  const {BG,H,F,C, BACKGROUNDS, HEAD,FACE,CLOTHES} = avaAssets();
  const [request, setRequest] = useState({
    [BG]: null,
    [H]: null,
    [F]:null,
    [C]:null
  });

  const { data, error, fetch, isFetching } = useWeb3ExecuteFunction();
  const { isAuthenticated, Moralis, isWeb3Enabled } = useMoralis();

  useEffect(() => {
    let setJ = true;
    if(isAuthenticated && isWeb3Enabled) {
        if(nftData == null){
          (async () => {
            const tJson =  await getTokenData();
            if(setJ){
              if(tJson != null){
                setNftData(tJson);
              }
            }
          })()
        }
    }
    return () =>{
      setJ = false;
    }
  },[isAuthenticated, isWeb3Enabled])

  useEffect(() => {
      if(nftData !== null){
        let bgAttr = nftData.attributes.find(n => n.trait_type === 'Background');
        let bgAsset = BACKGROUNDS.find(a => a.name === bgAttr.value)

        let headAttr = nftData.attributes.find(n => n.trait_type === 'Head');
        let headAsset = HEAD.find(a => a.name === headAttr.value)

        let faceAttr = nftData.attributes.find(n => n.trait_type === 'Face');
        let faceAsset = FACE.find(a => a.name === faceAttr.value)

        let clothesAttr = nftData.attributes.find(n => n.trait_type === 'Clothes');
        let clothesAsset = CLOTHES.find(a => a.name === clothesAttr.value)
        
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

      return () => {
        setResetNft(true);
      }
  },[nftData]);

  const getTokenData = async() => {
    // await deactivateWeb3();
    // await Moralis.enableWeb3();
    
    if(isWeb3Enabled){
      let options = {
          contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
          functionName: "tokenURI",
          abi: everyDayAvatar.abi,
          params: {
            tokenId: tokenId,
          },
        };
      
      let tokenJson = await Moralis.executeFunction(options);
      
      if(tokenJson){
          tokenJson = Buffer.from(tokenJson.replace("data:application/json;base64,", ""), "base64").toString();
          if(tokenJson){
              tokenJson = JSON.parse(tokenJson)
              return tokenJson;
          }
      }
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
      let message = (typeof error.data.message != undefined) ? error.data.message: error.message
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
        }
      }
    })()
    return () => {
      genAvatar = false;
    }
  }, [newAvatar]);

  const getSrcObj = async (category) => {
    if (category !== null) {
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
      mergeArray.push(bgSrc);
    }

    if (head !== null) {
      const headSrc = await getSrcObj(head);
      mergeArray.push(headSrc);
    }

    if (face !== null) {
      const faceSrc = await getSrcObj(face);
      mergeArray.push(faceSrc);
    }

    if (clothes !== null) {
      const clothesSrc = await getSrcObj(clothes);
      mergeArray.push(clothesSrc);
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
    setNewAvatar((prevS) => ({
      ...prevS,
      [category]: asset,
    }));

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
      setNftData(tokenTemp);
    }

    if(oldAvatar[category] !== null){
      let v = null
      if(oldAvatar[category].assetId !== asset.assetId){
        v = asset.assetId;
      }
      setRequest(prevState => {
        return {
          ...prevState,
          [oldAvatar[category].categoryId]: v
        }
      })
    }

    if(resetNft){
      setResetNft(false);
    }
  };

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
      .filter(([, value]) => value !== null)
      .forEach(([key, value]) => {
        categories.push(parseInt(key))
        assets.push(parseInt(value))
      });

    if(categories.length && assets.length){
      let options = {
        contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
        functionName: "updateAvatar",
        abi: everyDayAvatar.abi,
        params: {
          tokenId: tokenId,
          attrId: categories,
          attrValue: assets,
        },
        //msgValue: Moralis.Units.ETH(10),
      };
  
      const updateMintTxn = await fetch({ params: options });
      if (updateMintTxn) {
        await updateMintTxn.wait(1);
      }
    }
  };

  const resetNftHandler = async () => {
    setNftData(null);
    setRequest({
      [BG]: null,
      [H]: null,
      [F]:null,
      [C]:null
    })
    const tJson = await getTokenData();
    if(tJson != null){
      setNftData(tJson);
    }
  }


  return (
    <Container maxW={"6xl"} py={12}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Stack spacing={4} w={"full"} maxW={"md"}>
          <AvatarBuilder makeAvatar={makeAvatar} newAvatar={newAvatar}/>
        </Stack>
        <Stack>
          {src !== null ? (
            <Stack>
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
            isLoading={isFetching}
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
          </Flex>

        </Stack>
      </SimpleGrid>
    </Container>
  );
}
