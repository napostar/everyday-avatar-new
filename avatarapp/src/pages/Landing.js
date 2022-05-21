import React from "react";

import Hero from "../components/sections/Hero";
import LandingLayout from "../components/layouts/LandingLayout";
import Developers from "../components/sections/Developers";
import Mints from "../components/sections/Mints";
import { useNfts } from "../context/NftsContext";


export default function Landing() {
  const {allNFTs, fetchingNfts, refreshNfts} = useNfts()
  return (
    <LandingLayout>
      <Hero
        title="EVERYDAY AVATAR"
        subtitle="are a collection of profile picture NFTs that are completely customizable"
        ctaText="MINT NOW"
        ctaLink="/mint-nft"
      />
      <Mints allNFTs={allNFTs} fetchingNfts={fetchingNfts} refreshNfts={refreshNfts}/>
      <Developers/>
    </LandingLayout>
  );
}