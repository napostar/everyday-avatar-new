import React, { useContext, useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Heading,
  Image,
  Link,
  List,
  ListItem,
  Spinner,
  Text,
  useToast,
  Wrap,
  WrapItem,
} from "@chakra-ui/react";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { Link as RouterLink } from "react-router-dom";
import { useNfts } from "../../context/NftsContext";
const Mints = () => {
  const toast = useToast()
  const {allNFTs, fetchingNfts, refreshNfts} = useNfts()
  const Web3Api = useMoralisWeb3Api();

  const { isAuthenticated } = useMoralis();
  
  // useEffect(() => {
  //   let fetch = true;
  //   if(isAuthenticated && isInitialized){
  //     (async () => {
  //       const nfts = await fetchNFTsForContract();
        
  //       if(fetch){
  //         setAllNFTs(nfts);
  //       }
  //     })();
  //   }
  //   return () => {
  //     fetch = false;
  //   }
  // },[isAuthenticated, isWeb3Enabled])

  // const fetchNFTsForContract = async () => {
  //   console.log(process.env.REACT_APP_CONTRACT_ADDRESS);
  //   const options = {
  //     chain: chainId,
  //     address: process.env.REACT_APP_CONTRACT_ADDRESS,
  //   };
  //   const polygonNFTs = await Web3Api.token.getNFTOwners(options);
  //   console.log(polygonNFTs)
  //   return polygonNFTs.result;
  // };

  const reloadNFtMetadataHandler = async (tId) => {
    const options = {
      address:process.env.REACT_APP_CONTRACT_ADDRESS,
      token_id: tId,
      flag: "uri"
    }
    const reloadMetadata = await Web3Api.token.reSyncMetadata(options);
    console.log(options);
    console.log(reloadMetadata);
    toast({
      title: '',
      description: (reloadMetadata?.status)? reloadMetadata.status: "Initiated refresh",
      status: 'success',
      position: 'bottom-right',
      duration: 9000,
      isClosable: true,
    });
  }
  
  return (
    <>
      <Text fontSize='2xl' mt="4">EverydayAvatar NFTs</Text>
      {isAuthenticated &&
       <Button colorScheme='blue' size='xs' mt={2} onClick={refreshNfts} disabled={fetchingNfts}>
        Referesh
      </Button> }
     
      {(fetchingNfts) ? 
          <div style={{padding: "100px"}}>
              <Spinner
                thickness="4px"
                speed="0.90s"
                emptyColor="gray.200"
                color="blue.500"
                size="xl"
              />
          </div>
        :
        <>
          {
            allNFTs.length ? (
              <Wrap spacing="30px" marginTop="5">
                {allNFTs.map((nft, idx) => {
                  const metadata = (nft.token_uri !== null) ? nft.token_uri : JSON.parse(nft.metadata);
                  return (
                    <WrapItem width={{ base: "100%", sm: "45%", md: "45%", lg: "30%" }} key={idx}>
                      <Box w="100%">
                        <Box w="250px" borderRadius="lg" overflow="hidden">
                          <Link
                            as={RouterLink}
                            to={`/view-update/${nft.token_id}`}
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                          >
                            <Image
                              transform="scale(1.0)"
                              src={metadata?.image}
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

                        <Heading fontSize="sm" marginTop="2">
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
                            {( metadata?.description)? metadata?.description:'None'}
                        </Text>

                        {(metadata?.attributes) && (
                          <>
                            <Text mt={2} fontWeight={600}>Traits</Text>
                            <List >
                              {metadata.attributes.map((attr, idx) => (
                                  <ListItem key={idx} fontSize="sm" padding="1">
                                    {attr.trait_type} - 
                                    <Badge variant='outline' colorScheme='blue'>{attr.value}</Badge></ListItem>
                              ))}
                            </List>
                          </>
                        )}

                        
                        <Button display={'none'} colorScheme='blue' size='xs' mt={2} onClick={() => {reloadNFtMetadataHandler(nft.token_id)}}>
                          Reload NFT
                        </Button>
                      
                      </Box>
                    </WrapItem>
                  )
                })}
              </Wrap>
            ) : (
              <Heading fontSize="md" mt={"2"}>
                No NFTs Found...
              </Heading>
            )
          }
        </>
      }
    </>
  );
};

export default Mints;
