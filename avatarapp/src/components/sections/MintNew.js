import React, { useState, useEffect } from "react";
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
import { CheckCircleIcon } from '@chakra-ui/icons'
import { useMoralisQuery, useMoralisWeb3Api, useMoralis } from "react-moralis";
import { Link as RouterLink } from "react-router-dom";

const MintNew = ({title="EverydayAvatar NFTs", owned=false, setAllNFTs=false}) => {

  const toast = useToast()
  
  const Web3Api = useMoralisWeb3Api();
  const {user, isAuthenticated} = useMoralis();

  // const [skip, setSkip] = useState(0);
  // const [limit, setLimit] = useState(5);
  const [refreshNow, setRefereshNow] = useState(false);
  const { data:allNFTs, error, isLoading:fetchingNfts } = useMoralisQuery(
    "AllMintedAvatars", query => {
      if(owned){
        return query.equalTo("owner",user.attributes.ethAddress.toLowerCase());
      }
      return query;
    },
    [refreshNow]
  );

  useEffect(() => {
    if(allNFTs.length && setAllNFTs){
      setAllNFTs(allNFTs);
    }
  },[allNFTs])

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

  const refreshHandler = async () => {
    setRefereshNow(!refreshNow);
  }
  
  return (
    <>
      <Text fontSize='2xl' mt="4">{title}</Text>
      {isAuthenticated &&
       <Button colorScheme='blue' size='xs' mt={2} onClick={refreshHandler} disabled={fetchingNfts}>
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
              <Wrap spacing="30px" marginTop="5" minH="48px" >
                {allNFTs.map((nft, idx) => {
                  const nftInfo = nft.attributes;
                  const tokenURI = JSON.parse(Buffer.from(
                    nftInfo.tokenURI.replace("data:application/json;base64,", ""),
                  "base64"
                  ).toString());
                  const image = (tokenURI.image.includes("ipfs")) ? tokenURI.image.replace("ipfs://","https://everydayavatar2.infura-ipfs.io/ipfs/"): tokenURI.image 
                  
                  return (
                    <WrapItem width={{ base: "100%", sm: "45%", md: "45%", lg: "30%" }} key={idx}>
                      <Box w="100%">
                        <Box w="250px" borderRadius="lg" overflow="hidden">
                          <Link
                            as={RouterLink}
                            to={`/view-update/${nftInfo.tokenId}`}
                            textDecoration="none"
                            _hover={{ textDecoration: "none" }}
                          >
                            <Image
                              transform="scale(1.0)"
                              src={image}
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
                            {tokenURI.name}   
                            
                            {tokenURI.image.includes('ipfs') && 
                            <Badge ml='1' fontSize='0.8em' colorScheme='green'>
                              IPFS <CheckCircleIcon/>
                            </Badge>}

                          </Link>
                        </Heading>
                        <Heading fontSize="sm" marginTop="2">
                          <Text>Owner</Text>
                          <Badge ml='1' fontSize='0.8em' colorScheme='blue'>
                            {nftInfo.owner}
                          </Badge>
                        </Heading>
                        <Heading fontSize="sm" marginTop="2">
                          <Text>Token Address</Text>
                          <Badge ml='1' fontSize='0.8em' colorScheme='green'>
                            {nftInfo.contractAddress}
                          </Badge>
                        </Heading>
                        {(tokenURI?.attributes) && (
                          <>
                            <Text mt={2} fontWeight={600}>Traits</Text>
                            <List >
                              {tokenURI.attributes.map((attr, idx) => (
                                  <ListItem key={idx} fontSize="sm" padding="1">
                                    {attr.trait_type} - 
                                    <Badge variant='outline' colorScheme='blue'>{attr.value}</Badge></ListItem>
                              ))}
                            </List>
                          </>
                        )}

                        
                        <Button display={'none'} colorScheme='blue' size='xs' mt={2} onClick={() => {reloadNFtMetadataHandler(nftInfo.tokenId)}}>
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

export default MintNew;
