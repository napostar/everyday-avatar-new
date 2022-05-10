import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Box, Flex, Text, Button, useColorMode, useToast } from "@chakra-ui/react";
//import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import Logo from "../ui/Logo";
//import MagicLoginForm from "../ui/MagicLoginForm";
import { useMoralis, useMoralisWeb3Api } from "react-moralis";
import { CHAIN_IDS_TO_NAMES } from "../../utils/supportedChains";

const MenuItem = ({ children, isLast, to = "/", ...rest }) => {
  return (
    <Text
      mb={{ base: isLast ? 0 : 8, sm: 0 }}
      mr={{ base: 0, sm: isLast ? 0 : 8 }}
      display="block"
      {...rest}
    >
      <Link to={to}>{children}</Link>
    </Text>
  );
};

const CloseIcon = () => (
  <svg width="24" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
    <title>Close</title>
    <path
      fill="white"
      d="M9.00023 7.58599L13.9502 2.63599L15.3642 4.04999L10.4142 8.99999L15.3642 13.95L13.9502 15.364L9.00023 10.414L4.05023 15.364L2.63623 13.95L7.58623 8.99999L2.63623 4.04999L4.05023 2.63599L9.00023 7.58599Z"
    />
  </svg>
);

const MenuIcon = () => (
  <svg
    width="24px"
    viewBox="0 0 20 20"
    xmlns="http://www.w3.org/2000/svg"
    fill="white"
  >
    <title>Menu</title>
    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
  </svg>
);
 
const Header = (props) => {
  const toast = useToast();
  const [accountBalance, setAccountBalance] = useState(0);
  const [show, setShow] = React.useState(false);
  const toggleMenu = () => setShow(!show);
  const {colorMode} = useColorMode();
  const Web3Api = useMoralisWeb3Api();
  const {isAuthenticated, isInitialized, Moralis, user, authenticate, logout, isAuthenticating, web3, isWeb3Enabled, enableWeb3,chainId, authError} = useMoralis();

  useEffect(() => {
    (async()=>{
      await enableWeb3()
    })()
  },[]);


  useEffect(() => {
    if(authError){
      toast({
        title: 'Error',
        description: authError.message,
        status: 'error',
        position: 'bottom-right',
        duration: 9000,
        isClosable: true,
      })
    }
  },[authError])

  useEffect(() => {
    if(isWeb3Enabled){
      Moralis.onChainChanged(function (chain) {
        if(isAuthenticated){
          window.location.reload()
        }
        
      });
  
      Moralis.onAccountChanged(async(address)=>{
        if(isAuthenticated){
          await logout()
          window.location.reload()
        }
      });
    }
  }, [isWeb3Enabled]);
  
  useEffect(() => {
    if((isInitialized) && (isAuthenticated) && (isWeb3Enabled)) {
      (async()=>{
        const balance = await Web3Api.account.getNativeBalance({ chain: chainId });
        setAccountBalance(Moralis.Units.FromWei(balance.balance));
      })()
    }
  },[isInitialized, isAuthenticated, isWeb3Enabled])

  useEffect(() => {
    if(isWeb3Enabled){
      (async () => {
        if(isAuthenticated){
          const network = await web3.getNetwork();
          if(typeof CHAIN_IDS_TO_NAMES[network.chainId] === 'undefined'){
            toast({
              title: 'Network not supported.',
              description: "Please switch to polygon network.",
              status: 'error',
              position: 'bottom-right',
              duration: 9000,
              isClosable: true,
            })
            await logout()
          }
        }
      })()
    }
  },[isWeb3Enabled, isAuthenticated])

  const loginMetaMaskHandler = async () => {
    if(!isAuthenticated){
      await authenticate({signingMessage:"SignIn To EveryDay Avatar"});
    }
  }

  const logoutHandler = async () => {
    await logout();
  }
  
  return (
    <Flex
      as="nav"
      align="center"
      justify="space-between"
      wrap="wrap"
      w="100%"
      mb={8}
      p={8}
      bg={["primary.500", "primary.500", "transparent", "transparent"]}
      color={["white", "white", "primary.700", "primary.700"]}
      {...props}
    >
      <Flex align="center">
        <Logo
          w="150px"
          color={["white", "white", "primary.500", "primary.500"]}
        />
      </Flex>

      <Box display={{ base: "block", md: "none" }} onClick={toggleMenu}>
        {show ? <CloseIcon /> : <MenuIcon />}
      </Box>

      <Box
        display={{ base: show ? "block" : "none", md: "block" }}
        flexBasis={{ base: "100%", md: "auto" }}
      >
        <Flex
          align="center"
          justify={["center", "space-between", "flex-end", "flex-end"]}
          direction={["column", "row", "row", "row"]}
          pt={[4, 4, 0, 0]}
        >

          {/* <MenuItem>
              <MagicLoginForm/>
          </MenuItem> */}

          <MenuItem isLast>
            {(isAuthenticated && user)? 
              <Button
                size="sm"
                rounded="md"
                color={["primary.500", "primary.500", "white", "white"]}
                bg={(colorMode === 'dark')?"customB.500":"primary.500"}
                _hover={{
                  bg: ["primary.100", "primary.100", "primary.600", "primary.600"]
                }}
                onClick={logoutHandler}
              >
                {accountBalance} - {`${user.attributes.ethAddress.slice(0, 4)}...${user.attributes.ethAddress.slice(38)}`}
              </Button> : (
              <Button
                size="sm"
                rounded="md"
                color={["primary.500", "primary.500", "white", "white"]}
                bg={(colorMode === 'dark')?"customB.500":"primary.500"}
                _hover={{
                  bg: ["primary.100", "primary.100", "primary.600", "primary.600"]
                }}
                onClick={loginMetaMaskHandler}
                isLoading={isAuthenticating}
              >
                Connect Wallet
              </Button>
            )}
          </MenuItem>
          
        </Flex>
      </Box>
    </Flex>
  );
};

export default Header;