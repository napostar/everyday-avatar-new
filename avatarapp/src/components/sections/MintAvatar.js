import React, { useState, useEffect } from "react";
import {
  Stack,
  Image,
  Button,
  useColorMode,
  Divider,
  Spinner,
  useToast,
  Container,
  SimpleGrid
} from "@chakra-ui/react";
import mergeImages from "merge-images";
import imageToBase64 from "image-to-base64/browser";
import {
  useMoralis,
  useWeb3ExecuteFunction
} from "react-moralis";
import everyDayAvatar from "../../contract/EverydayAvatar.json";
import Mints from "./Mints";
import avaAssets from "../../utils/avatarAssets";
import AvatarBuilder from "../ui/AvatarBuilder";
import { useNfts } from "../../context/NftsContext";

export default function MintAvatar() {
  const toast = useToast();
  const {allNFTs, fetchingNfts, refreshNfts} = useNfts()

  const [avatarData, setAvatarData] = useState([]);

  //setting some default asset
  const [newAvatar, setNewAvatar] = useState({
    bg: {
      assetId: 34,
      categoryId: 1,
      cid: "QmYqLD3Yze1YvtasPjccCc7gDEt3SnhHot56JHPcs6n89b",
      name: "Faded Black",
    },
    head: {
      assetId: 9,
      categoryId: 2,
      cid: "QmVzDruPKhdqR83hcwJKorj8VNJCrkVFWoaqcCFWA7qPBC",
      name: "Santa Cap",
    },
    face: {
      assetId: 28,
      categoryId: 3,
      cid: "QmR3EnWpQrMk9dzCGaty82Wert8FGRFnJAriHDZY4b1EV7",
      name: "Goggles",
    },
    clothes: {
      assetId: 6,
      categoryId: 4,
      cid: "QmbmWnDvSb1j6Z4UJ5kiZ5fyZ2ckKaX6FD1nmwftnxVRsn",
      name: "Sport 1",
    },
  });
  const [src, setSrc] = useState(null);
  const { colorMode } = useColorMode();

  const {BG,H,F,C} = avaAssets();

  const { data, error, fetch, isFetching } = useWeb3ExecuteFunction();
  const { isAuthenticated, user, Moralis } = useMoralis();

  useEffect(() => {
    if (data) {
      if (typeof data.hash !== "undefined") {
        toast({
          title: "Avatar Minted",
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
      let message = (typeof error.data != 'undefined') ? error.data.message: error.message
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
    let mAva = true;
    
    if (avatarData.length) {
      mergeImages(avatarData)
        .then((src) => {
          if(mAva) {
            setSrc(s => (s !== src)? src:s)
          }
        })
        .catch((err) => console.log(err));
    }
    
    return () => {
      mAva = false;
    }
  }, [avatarData]);

  const makeAvatar = (category, asset) => {
    setNewAvatar((prevS) => ({
      ...prevS,
      [category]: asset,
    }));
  };

  //Mint NFT Transaction
  const mintNowHandler = async () => {
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

    const assets = [
      newAvatar.bg.assetId,
      newAvatar.head.assetId,
      newAvatar.face.assetId,
      newAvatar.clothes.assetId,
    ];

    let opt = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      functionName: "mintFee",
      abi: everyDayAvatar.abi,
    };
    const mintFee = await Moralis.executeFunction(opt);

    let options = {
      contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
      functionName: "mintAvatar",
      abi: everyDayAvatar.abi,
      params: {
        to: user.attributes.ethAddress,
        attrId: [BG, H, F, C],
        attrValue: assets,
      },
      msgValue: Moralis.Units.ETH(Moralis.Units.FromWei(mintFee)),
    };

    const mintTxn = await fetch({ params: options });
    if (mintTxn) {
      await mintTxn.wait(1);
    }
  };

  function addLeadingZeros(num, totalLength) {
    return String(num).padStart(totalLength, "0");
  }

  return (
    <Container maxW={"6xl"} py={12}>
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Stack spacing={4} w={"full"} maxW={"md"}>
          <AvatarBuilder makeAvatar={makeAvatar} newAvatar={newAvatar}/>
        </Stack>
        <Stack>
          {src !== null ? (
            <Image id="your-avatar" alt={"Your Avatar"} src={src} />
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
            onClick={mintNowHandler}
            isLoading={isFetching}
          >
            Mint New Avatar
          </Button>
        </Stack>
      </SimpleGrid>

      <Divider mt="4"/>
      <Mints allNFTs={allNFTs} fetchingNfts={fetchingNfts} refreshNfts={refreshNfts}/>

    </Container>
  );
}
