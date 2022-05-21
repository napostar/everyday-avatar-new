import { extendTheme } from "@chakra-ui/react";
import "@fontsource/baloo-da-2"

const colors = {
  primary: {
    100: "#7e7d7d",
    200: "#27EF96",
    300: "#242021",
    400: "#242021",
    500: "#242021",
    600: "#7e7d7d",
    700: "#086F42",
    800: "#242021",
    900: "#064C2E"
  },
  customB:{
    500: "#F5793B",
    600: "#3960a9"
  }
};

const customTheme = extendTheme({ 
    config: {
      initialColorMode: "dark",
      useSystemColorMode: false,
    },
    fonts: {
        heading: 'Baloo Da 2',
        body: "Baloo Da 2",
    },
    colors
});

export default customTheme;