import React from "react";
import { Avatar, Text } from "@chakra-ui/react";
import HorizontalScroll from "react-horizontal-scrolling";

const AvatarAssets = ({ category, assets, makeAvatarHandler, selectedAsset }) => {
  const selectedStyle = {
    background: "white"
  }
  return (
    <HorizontalScroll>
      {assets.map((asset, idx) => (
        <div key={idx} style={{padding: "2px"}}>
        <Avatar
          style={((typeof selectedAsset.assetId !== "undefined") && (selectedAsset.assetId === asset.assetId))?selectedStyle:{}}
          onClick={() => makeAvatarHandler(category, asset)}
         _hover={{
            background: "white",
            cursor: "pointer"
          }}
          p={1}
          bg="grey"
          size={"2xl"}
          src={
            `https://ipfs.io/ipfs/${asset.cid}`
          }
          alt={asset.name}
          mb={4}
          pos={"relative"}
          borderRadius="2xl"
        />
        <Text fontSize='md' align={'center'}>{asset.name}</Text>
        </div>
      ))}
    </HorizontalScroll>
  );
};

export default AvatarAssets;
