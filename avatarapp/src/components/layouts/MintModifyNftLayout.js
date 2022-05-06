import React from "react";
import { Flex } from "@chakra-ui/react";
import Header from "../sections/Header";

export default function MintModifyNftLayout(props) {
  return (
    <Flex
      direction="column"
      align="center" 
      m="0 auto"
      {...props}
    >
      <Header />
      {props.children}
    </Flex>
  );
}