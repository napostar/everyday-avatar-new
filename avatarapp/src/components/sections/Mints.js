import React, { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Text,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useMoralis, useNFTBalances } from "react-moralis";

const Mints = () => {
  const [allNFTs, setAllNFTs] = useState([]);
  //const [reloadNft, setReloadNft] = useState(false);
  const { isAuthenticated, isInitialized, chainId, user } = useMoralis();
  const {
    getNFTBalances,
    data: nftData,
    error: nftError,
    isFetching,
  } = useNFTBalances();

  useEffect(() => {
    if (
      nftData &&
      typeof nftData.result !== "undefined" &&
      nftData.result.length
    ) {
      if ((!allNFTs.length) && (isAuthenticated)) {
        if(nftData.result.length){
          setAllNFTs(nftData.result.filter(n => n.token_address === process.env.REACT_APP_CONTRACT_ADDRESS));
        }
      }
    }
  }, [nftData]);

  useEffect(() => {
    if (nftError) {
      console.log(nftError);
    }
  }, [nftError]);

  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      if (!allNFTs.length) {
        (async () => {
          await getNFTBalances({ params: { token_address: process.env.REACT_APP_CONTRACT_ADDRESS, chain: chainId } });
        })();
      }
    }
  }, [isAuthenticated, isInitialized]);

  // const reloadNFtHandler = async () => {
  //   toast({
  //     title: '',
  //     description: "Fetching NFTs...",
  //     status: 'success',
  //     position: 'bottom-right',
  //     duration: 9000,
  //     isClosable: true,
  //   });
  // }

  return (
    <>
      <Text fontSize='2xl' mt="4">Collected NFTs</Text>
      {/* <Button colorScheme='blue' size='xs' mt={2} onClick={reloadNFtHandler} isLoading={isFetching}>
        Reload NFTs
      </Button> */}
      {allNFTs.length ? (
        <Wrap spacing="30px" marginTop="5">
          {allNFTs.map((nft, idx) => (
            <WrapItem width={{ base: "100%", sm: "45%", md: "45%", lg: "30%" }} key={idx}>
              <Box w="100%">
                <Box borderRadius="lg" overflow="hidden">
                  <Link
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                  >
                    <Image
                      transform="scale(1.0)"
                      src={nft.image}
                      alt="NO IMAGE FOUND"
                      objectFit="contain"
                      width="100%"
                      transition="0.3s ease-in-out"
                      _hover={{
                        transform: "scale(1.05)",
                      }}
                    />
                  </Link>
                </Box>

                <Heading fontSize="xl" marginTop="2">
                  <Link
                    textDecoration="none"
                    _hover={{ textDecoration: "none" }}
                  >
                    {nft.name} #{nft.token_id}
                  </Link>
                </Heading>
                <Heading fontSize="sm" marginTop="2">
                  <Text>Owner</Text>
                  <Badge ml='1' fontSize='0.8em' colorScheme='blue'>
                    {nft.owner_of}
                  </Badge>
                </Heading>
                <Heading fontSize="sm" marginTop="2">
                  <Text>Token Address</Text>
                  <Badge ml='1' fontSize='0.8em' colorScheme='green'>
                    {nft.token_address}
                  </Badge>
                </Heading>
                <Heading fontSize="sm" marginTop="2">
                  <Text>Amount</Text>
                  <Badge ml='1' fontSize='0.8em' colorScheme='purple'>
                    {nft.amount}
                  </Badge>
                </Heading>
                <Text as="p" fontSize="sm" marginTop="2">
                    {(nft?.metadata?.description)?nft?.metadata?.description:'None'}
                </Text>

                {(nft?.metadata?.attributes) && (
                  <>
                    <Text mt={2} fontWeight={600}>Traits</Text>
                    <List >
                      {nft.metadata.attributes.map((attr, idx) => (
                          <ListItem key={idx} fontSize="sm" padding="2">
                            {attr.trait_type} - 
                            <Badge variant='outline' colorScheme='blue'>{attr.value}</Badge></ListItem>
                      ))}
                    </List>
                  </>
                )}
              </Box>
            </WrapItem>
          ))}
        </Wrap>
      ) : (
        <Heading fontSize="md" mt={"2"}>
          No NFTs Found...
        </Heading>
      )}
    </>
  );
};

export default Mints;
