import React, { useState, useEffect } from "react";
import {
  Button,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useColorMode,
  useDisclosure,
} from "@chakra-ui/react";
import { useMoralis } from "react-moralis";

const MagicLoginForm = () => {
  const [email, setEmail] = useState('');
  const {isAuthenticated, authenticate, isAuthenticating} = useMoralis();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode } = useColorMode();
  const initialRef = React.useRef();
  const finalRef = React.useRef();

  const magicLoginHandler = async () => {
    // if(email === '') return;
    // const user = await authenticate({ 
    //     provider: "magicLink",
    //     email: email,
    //     apiKey: process.env.REACT_APP_MAGIC_KEY,
    //     network: "polygon",
    // })
    // console.log(user);
    // if(typeof user !== "undefined"){
    //     setEmail('');
    //     onClose();
    // }
  }

  return (
    <>
      {!isAuthenticated &&
           <>
            <Button
            size="sm"
            rounded="md"
            color={["primary.500", "primary.500", "white", "white"]}
            bg={colorMode === "dark" ? "customB.500" : "primary.500"}
            _hover={{
                bg: ["primary.100", "primary.100", "primary.600", "primary.600"],
            }}
            onClick={onOpen}
            >SignIn With Magic</Button>
           </>
      }
      <Modal
        initialFocusRef={initialRef}
        finalFocusRef={finalRef}
        isOpen={isOpen}
        onClose={onClose}
        size="xs"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>SignIn With Magic Link</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FormControl>
              <FormLabel>Enter Email</FormLabel>
              <Input ref={initialRef} placeholder="Your Email" value={email} onChange={(e) => setEmail(e.target.value)}/>
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={magicLoginHandler} isLoading={isAuthenticating}>
              SignIn
            </Button>
            <Button onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MagicLoginForm;
