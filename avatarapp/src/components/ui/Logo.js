import React from "react";
import { Box, Text, useColorMode } from "@chakra-ui/react";
import { Link } from "react-router-dom";

const Logo = (props) => {
  const {colorMode} = useColorMode();
  return (
    <Box {...props}>
      <Link to={"/"}>
        <Text fontSize="lg" fontWeight="bold" color={(colorMode === 'dark')?"white":"primary.800"}>
          EveryDay Avatar
        </Text>
      </Link>
    </Box>
  );
};

export default Logo;
