import {
    Badge,
    Box,
    Heading,
    Image,
    Link,
    List,
    ListItem,
    Spinner,
    Stack,
    Text,
  } from "@chakra-ui/react";
  import React from "react";
  
  const Avatar = ({ nftData, src, fetchingToken }) => {
    return (
      <>
        {!fetchingToken ? (
           <> {
              (nftData !== null)?
              <>
                  <Stack spacing={4} w={"full"} maxW={"md"}>
                  <Image id="your-avatar" alt={"Your Avatar"} src={src} />
                  </Stack>
                  <Stack>
                  <Box>
                      <Heading fontSize="xl" marginTop="2">
                      <Link textDecoration="none" _hover={{ textDecoration: "none" }}>
                          {nftData?.name ? nftData?.name : "Name not found"}
                      </Link>
                      </Heading>
      
                      <Text as="p" fontSize="sm" marginTop="2">
                      {nftData?.description
                          ? nftData?.description
                          : "Description not found"}
                      </Text>
      
                      {nftData?.attributes && (
                      <>
                          <Text mt={2} fontWeight={600}>
                          Traits
                          </Text>
                          <List>
                          {nftData.attributes.map((attr, idx) => (
                              <ListItem key={idx} fontSize="sm" padding="1">
                              {attr.trait_type} -
                              <Badge variant="outline" colorScheme="blue">
                                  {attr.value}
                              </Badge>
                              </ListItem>
                          ))}
                          </List>
                      </>
                      )}
                  </Box>
                  </Stack>
              </>    
              :
              <Box>
                  <Heading fontSize="lg" marginTop="2">Token no found :(</Heading>
              </Box>
            }
          </>
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
      </>
    );
  };
  
  export default Avatar;
  