import React from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import {
  Box,
  Button,
  Flex,
  Image,
  Heading,
  Stack,
  Text,
  useColorMode
} from "@chakra-ui/react";
import welcomeLogo from '../../everydaypreview.png';
export default function Hero({
  title,
  subtitle,
  image,
  ctaLink,
  ctaText,
  ...rest
}) {
  const {colorMode} = useColorMode();
  const navigate = useNavigate();


  const mintNftHandler = () => {
    navigate("/mint-avatar", { replace: true });
  }

  return (
    <Flex
      align="center"
      justify={{ base: "center", md: "space-around", xl: "space-between" }}
      direction={{ base: "column-reverse", md: "row" }}
      wrap="no-wrap"
      minH="70vh"
      px={8}
      mb={16}
      {...rest}
    >
      <Stack
        spacing={4}
        w={{ base: "80%", md: "40%" }}
        align={["center", "center", "flex-start", "flex-start"]}
      >
        <Heading
          as="h1"
          size="xl"
          fontWeight="bold"
          color={(colorMode === 'dark')?"white":"primary.800"}
          textAlign={["center", "center", "left", "left"]}
        >
          {title}
        </Heading>
        <Heading
          as="h2"
          size="md"
          color={(colorMode === 'dark')?"white":"primary.800"}
          opacity="0.8"
          fontWeight="normal"
          lineHeight={1.5}
          textAlign={["center", "center", "left", "left"]}
        >
          {subtitle}
        </Heading>
        
          <Button
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
            onClick={mintNftHandler}
          >
            {ctaText}
          </Button>
     
        <Text
          fontSize="xs"
          mt={2}
          textAlign="center"
          color={(colorMode === 'dark')?"white":"primary.800"}
          opacity="0.6"
        >
        </Text>
      </Stack>
      <Box w={{ base: "80%", sm: "60%", md: "50%" }} mb={{ base: 12, md: 0 }}>
        {/* TODO: Make this change every X secs */}
        <Image src={image} size="100%" rounded="1rem" shadow="2xl" />
      </Box>
    </Flex>
  );
}

Hero.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  image: PropTypes.string,
  ctaText: PropTypes.string,
  ctaLink: PropTypes.string
};

Hero.defaultProps = {
  title: "Everyday Avatar",
  subtitle:
    "are a collection of profile picture NFTs that are completely customizable",
  image: welcomeLogo,
  ctaText: "Create your account now",
  ctaLink: "/signup"
};