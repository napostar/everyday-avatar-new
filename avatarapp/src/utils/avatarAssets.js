import components from "../assets.json";

export default function avaAssets() {
    const BG = 1;
    const H = 2;
    const F = 3;
    const C = 4;

    const compoMapping = {
      'bg': BG,
      'head': H,
      'face': F,
      'clothes': C,
    }
  
    const BACKGROUNDS = components.assets.filter(
      (asset) => asset.categoryId === BG
    );
    const HEAD = components.assets.filter((asset) => asset.categoryId === H);
    const FACE = components.assets.filter((asset) => asset.categoryId === F);
    const CLOTHES = components.assets.filter((asset) => asset.categoryId === C);

    return {
        BG,H,F,C,BACKGROUNDS, HEAD,FACE,CLOTHES,compoMapping
    }
}