import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  Box,
  chakra,
  Container,
  Stack,
  Text,
  useColorModeValue,
  VisuallyHidden,
  Image,
  Link,
} from "@chakra-ui/react";
import everydayLogo from "../../everydayLogo.png";

const Logo = () => {
  return <Image maxWidth={"15%"} src={everydayLogo} alt="EVERYDAY AVATAR" />;
};

export default function Footer() {
  return (
    <Box
      bg={useColorModeValue("gray.50", "gray.900")}
      color={useColorModeValue("gray.700", "gray.200")}
    >
      <Container
        as={Stack}
        maxW={"8xl"}
        py={4}
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justify={{ base: "center", md: "space-between" }}
        align={{ base: "center", md: "center" }}
      >
        <Logo />
        <Text fontSize='xs'>© 2022 Everyday Avatar. All rights reserved</Text>
        <Stack direction={"row"} spacing={6}>
          <Link href={`https://mumbai.polygonscan.com/address/${process.env.REACT_APP_CONTRACT_ADDRESS}`} isExternal>
            Everyday Avatar Contract <ExternalLinkIcon mx="2px" />
          </Link>
        </Stack>
      </Container>
    </Box>
  );
}
