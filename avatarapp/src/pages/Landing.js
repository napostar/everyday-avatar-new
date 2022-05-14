import React from "react";

import Hero from "../components/sections/Hero";
import LandingLayout from "../components/layouts/LandingLayout";
import Developers from "../components/sections/Developers";
import Mints from "../components/sections/Mints";


export default function Landing() {
  return (
    <LandingLayout>
      <Hero
        title="Everyday Avatars"
        subtitle="are a collection of profile picture NFTs that are completely customizable"
        ctaText="MINT NOW"
        ctaLink="/mint-nft"
      />
      <Mints/>
      <Developers/>
    </LandingLayout>
  );
}