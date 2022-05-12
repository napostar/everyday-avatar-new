import { Text } from "@chakra-ui/react";
import React from "react";
import avaAssets from "../../utils/avatarAssets";
import AvatarAssets from "./AvatarAssets";

const AvatarBuilder = ({newAvatar, makeAvatar}) => {
  const {BACKGROUNDS, HEAD,FACE,CLOTHES} = avaAssets();
  return (
    <>
      <Text fontSize="2xl">Backgrounds</Text>
      <AvatarAssets
        assets={BACKGROUNDS}
        makeAvatarHandler={makeAvatar}
        category="bg"
        selectedAsset={newAvatar.bg}
      />

      <Text fontSize="2xl">Head Accessories</Text>
      <AvatarAssets
        assets={HEAD}
        makeAvatarHandler={makeAvatar}
        category="head"
        selectedAsset={newAvatar.head}
      />

      <Text fontSize="2xl">Face Accessories</Text>
      <AvatarAssets
        assets={FACE}
        makeAvatarHandler={makeAvatar}
        category="face"
        selectedAsset={newAvatar.face}
      />

      <Text fontSize="2xl">Clothes</Text>
      <AvatarAssets
        assets={CLOTHES}
        makeAvatarHandler={makeAvatar}
        category="clothes"
        selectedAsset={newAvatar.clothes}
      />
    </>
  );
};

export default AvatarBuilder;
