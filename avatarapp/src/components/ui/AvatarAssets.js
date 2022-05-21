import React from "react";
import { Avatar, Text } from "@chakra-ui/react";
import HorizontalScroll from "react-horizontal-scrolling";

const AvatarAssets = ({ category, assets, makeAvatarHandler, selectedAsset, addNone=false }) => {
  if((addNone)&&(assets.length)){
    const none = assets.find(a => ((a.category === category) && (a.assetId === 'none')))
    if(!none){
      assets.unshift({
        assetId:'none',
        category: category,
        name: 'None'
      });
    }
  }
  const selectedStyle = {
    background: "white"
  }
  return (
    <HorizontalScroll>
      {assets.map((asset, idx) => (
        <div key={idx} style={{padding: "2px"}}>
          <Avatar
            style={((selectedAsset) && (typeof selectedAsset.assetId !== "undefined") && (selectedAsset.assetId === asset.assetId))?selectedStyle:{}}
            onClick={() => makeAvatarHandler(category, asset)}
          _hover={{
              background: "white",
              cursor: "pointer"
            }}
            p={1}
            bg="grey"
            size={"2xl"}
            src={
              require(`../../avatarComponents/${asset.assetId}.png`).default
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
