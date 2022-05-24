import React from "react";
import { Box, Image } from "@chakra-ui/react";
import { Link } from "react-router-dom";
import everydayLogo from '../../everydayLogo.png'
const Logo = (props) => {
  return (
    <Box {...props}>
      <Link to={"/"}>
        
        <Image maxWidth={'200%'} src={everydayLogo} alt='EVERYDAY AVATAR' />
        
      </Link>
    </Box>
  );
};

export default Logo;
