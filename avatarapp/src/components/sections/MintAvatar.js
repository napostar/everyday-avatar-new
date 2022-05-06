import React,{useState, useEffect} from 'react'
import { Flex, Stack, Image, Text, Button, useColorMode, Grid, GridItem, Spinner } from "@chakra-ui/react";
import components from "../../assets.json";
import AvatarAssets from "../ui/AvatarAssets";
import mergeImages from "merge-images";
import imageToBase64 from 'image-to-base64/browser'


export default function MintAvatar() {
  const [avatarData, setAvatarData] = useState([]);

  //setting some default asset
  const [newAvatar, setNewAvatar] = useState({
    bg:   {
      "assetId":34,
      "categoryId":1,
      "cid":"QmYqLD3Yze1YvtasPjccCc7gDEt3SnhHot56JHPcs6n89b",
      "name":"Faded Black"
   },
    head:  {
      "assetId":9,
      "categoryId":2,
      "cid":"QmVzDruPKhdqR83hcwJKorj8VNJCrkVFWoaqcCFWA7qPBC",
      "name":"Santa Cap"
   },
    face:  {
      "assetId":28,
      "categoryId":3,
      "cid":"QmR3EnWpQrMk9dzCGaty82Wert8FGRFnJAriHDZY4b1EV7",
      "name":"Goggles"
   },
    clothes:{
      "assetId":6,
      "categoryId":4,
      "cid":"QmbmWnDvSb1j6Z4UJ5kiZ5fyZ2ckKaX6FD1nmwftnxVRsn",
      "name":"Sport 1"
   }
  });
  const [src, setSrc] = useState(null);
  const {colorMode} = useColorMode();

  const BG = 1;
  const H = 2;
  const F = 3;
  const C = 4;
  
  const BACKGROUNDS = components.assets.filter(asset => asset.categoryId === BG);
  const HEAD = components.assets.filter(asset => asset.categoryId === H);
  const FACE = components.assets.filter(asset => asset.categoryId === F);
  const CLOTHES = components.assets.filter(asset => asset.categoryId === C);

  
  useEffect(() => {
    generateAva()
  },[newAvatar])

  const getSrcObj = async (category) => {
    if(category !== null){
      const base64Strng = await imageToBase64(`https://ipfs.io/ipfs/${category.cid}`)
      const categoryIdx = avatarData.findIndex(a => a.categoryId === category.categoryId);
      if(categoryIdx !== -1) {
        let tmp = [...avatarData];
        let updateAvatar = {...tmp[categoryIdx]}
        updateAvatar.src = `data:image/png;base64,${base64Strng}`
        updateAvatar.assetId = category.assetId
        return updateAvatar;
      }else{
        return {
          src: `data:image/png;base64,${base64Strng}`,
          x: 0, y: 0 , categoryId: category.categoryId, assetId:category.assetId
        }
      }
    }
  }

  const generateAva = async () => {
    const bg = newAvatar.bg;
    const head = newAvatar.head;
    const face = newAvatar.face;
    const clothes = newAvatar.clothes;

    let mergeArray = [];
    
    if(bg !== null){
      const bgSrc = await getSrcObj(bg);
      mergeArray.push(bgSrc);
    }

    if(head !== null){
      const headSrc = await getSrcObj(head);
      mergeArray.push(headSrc);
    }

    if(face !== null){
      const faceSrc = await getSrcObj(face);
      mergeArray.push(faceSrc);
    }

    if(clothes !== null){
      const clothesSrc = await getSrcObj(clothes);
      mergeArray.push(clothesSrc);
    }

    if(mergeArray.length){
      setAvatarData([...mergeArray]);
    }
  }

  useEffect(() => {
    if((avatarData.length)){
      mergeImages(avatarData)
      .then((src) => setSrc(src))
      .catch((err) => console.log(err));
    }
  }, [avatarData]);

  const makeAvatar = (category, asset) => {
    setNewAvatar(prevS => ({
      ...prevS,
      [category]: asset
    }))
  }

  //Mint NFT Transaction
  const mintNowHandler = async () => {
    const assets = [
      addLeadingZeros(newAvatar.bg.assetId, 4),
      addLeadingZeros(newAvatar.head.assetId,4),
      addLeadingZeros(newAvatar.face.assetId,4),
      addLeadingZeros(newAvatar.clothes.assetId,4) 
    ];
    alert('Minting Your Nft Now '+assets.toString());
  }

  function addLeadingZeros(num, totalLength) {
    return String(num).padStart(totalLength, '0');
  }

  return (
    <Stack minH={"60vh"} direction={{ base: "column", md: "row" }}>
     
      <Flex p={8} flex={1} align={"left"} justify={"left"}>
        <Stack spacing={4} w={"full"} maxW={"md"}>
          <Text fontSize='2xl'>Backgrounds</Text>
          <AvatarAssets assets={BACKGROUNDS} makeAvatarHandler={makeAvatar} category="bg" selectedAsset={newAvatar.bg}/>

          <Text fontSize='2xl'>Head Accessories</Text>
          <AvatarAssets assets={HEAD} makeAvatarHandler={makeAvatar} category="head" selectedAsset={newAvatar.head}/>

          <Text fontSize='2xl'>Face Accessories</Text>
          <AvatarAssets assets={FACE} makeAvatarHandler={makeAvatar} category="face" selectedAsset={newAvatar.face}/>
          
          <Text fontSize='2xl'>Clothes</Text>
          <AvatarAssets assets={CLOTHES} makeAvatarHandler={makeAvatar} category="clothes" selectedAsset={newAvatar.clothes}/>
        </Stack>
      </Flex>
      <Flex>
          <Grid gap={2} p={1}>
              <GridItem rowSpan={2}>

                {(src !== null) ?
                  <Image
                    id="your-avatar"
                    alt={"Your Avatar"}
                  
                    src={
                      src
                    }
                  /> : 
                  <div style={{
                    padding:"200px"
                  }}>
                    <Spinner
                      thickness='4px'
                      speed='0.90s'
                      emptyColor='gray.200'
                      color='blue.500'
                      size='xl'
                    />
                  </div>
              }
                
                <Button
                  mt={5}
                    bg={(colorMode === 'dark')?"customB.500":"primary.500"}
                    color={["white"]}
                    _hover={{
                      bg: ["primary.100", "primary.100", "primary.600", "primary.600"]
                    }}
                    borderRadius="8px"
                    py="4"
                    px="4"
                    lineHeight="1"
                    size="md"
                    onClick={mintNowHandler}
                  >
                    Mint Avatar
                  </Button>
              </GridItem >
          </Grid>
      </Flex>
    </Stack>
  );
}
