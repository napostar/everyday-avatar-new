import React from "react";
import { Box, Text, Image, useColorMode } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import everydayLogo from '../../everydayLogo.png'
const Logo = (props) => {
  const {colorMode} = useColorMode();
  return (
    <Box {...props}>
      <Link to={"/"}>
        
        <Image maxWidth={'200%'} src={everydayLogo} alt='EVERYDAY AVATAR' />
        
      </Link>
    </Box>
  );
};

export default Logo;
