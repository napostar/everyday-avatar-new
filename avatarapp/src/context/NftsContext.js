
import React,{useState, useEffect, useContext, useCallback} from 'react'
import { useMoralis } from 'react-moralis';
import everyDayAvatar from "../contract/EverydayAvatar.json"

const NftContext = React.createContext();

export function useNfts() {
  return useContext(NftContext);
}

const NftsContext = ({children}) => {
  const [allNFTs, setAllNFTs] = useState([]);

  const { isInitialized, Moralis } = useMoralis();
  const everydayAvatarAddress = process.env.REACT_APP_CONTRACT_ADDRESS

  const [fetchingNfts, setFetchingNfts] = useState(true);

  const fetchNFTsForContract = useCallback(async () => {
    const options = {
      chain: 'mumbai',
      address: process.env.REACT_APP_CONTRACT_ADDRESS,
    };
    const polygonNFTs = await Moralis.Web3API.token.getNFTOwners(options);
    return polygonNFTs.result;
  },[]);

  const fetchAllNfts = useCallback(async () => {
    let nfts = await fetchNFTsForContract();
    for(let n in nfts) {
      if(nfts[n]){
        // const token_uri = await getTokenData(nfts[n].token_id);
        // if(token_uri !== null){
        //   nfts[n].token_uri = token_uri;
        // }
        if((nfts[n].token_uri !== null) && (nfts[n].token_uri !== 'Invalid uri')){
          let json = parseToken(nfts[n].token_uri);
          if(json){
            if(json.image && json.image.includes('ipfs')){
              const cidImg = json.image.split('//')[1];
              json.image = `https://everydayavatar.infura-ipfs.io/ipfs/${cidImg}`
            }    
            nfts[n].token_uri = json;
          }

        }else if(nfts[n].metadata !== null){
          const meta = JSON.parse(nfts[n].metadata)
          
          if(meta.image && meta.image.includes('ipfs')){
            const cid = meta.image.split('//')[1];
            meta.image = `https://everydayavatar.infura-ipfs.io/ipfs/${cid}`
          }   

          nfts[n].token_uri = meta

        }else if((nfts[n].token_uri === null)||(nfts[n].token_uri == 'Invalid uri')){
          const token_uri = await getTokenData(nfts[n].token_id);
          if(token_uri !== null){

            if(token_uri.image && token_uri.image.includes('ipfs')){
              const cid = token_uri.image.split('//')[1];
              token_uri.image = `https://everydayavatar.infura-ipfs.io/ipfs/${cid}`
            }     

            nfts[n].token_uri = token_uri;
          }
        }
      }
    }
    return nfts;
  },[fetchNFTsForContract])

  useEffect(() => {
    let fetch = true;
    if(isInitialized){
      (async () => {
        const nfts = await fetchAllNfts();
        if(fetch){
          setAllNFTs(nfts);
          setFetchingNfts(false);
        }
      })();
    }
    return () => {
      fetch = false;
    }
  },[isInitialized, fetchAllNfts])


  const parseToken = (token_uri) => {
    if(token_uri !== null){
      let tokenJson = Buffer.from(  
        token_uri.replace("data:application/json;base64,", ""),
        "base64"
      ).toString();
      if (tokenJson) {
        tokenJson = JSON.parse(tokenJson);
        return tokenJson;
      }
    }
    return null
  }

  const getTokenData = async (tokenId) => {
      let options = {
        chain: "mumbai",
        address: everydayAvatarAddress,
        function_name: "tokenURI",
        abi: everyDayAvatar,
        params: {
          tokenId: tokenId,
        },
      };

      let tokenJson = await Moralis.Web3API.native.runContractFunction(options);

      try {
        if (tokenJson) {
          tokenJson = Buffer.from(
            tokenJson.replace("data:application/json;base64,", ""),
            "base64"
          ).toString();
          if (tokenJson) {
            tokenJson = JSON.parse(tokenJson);
            return tokenJson;
          }
        }
      } catch (err) {

      }
    return null;
  };

  const refreshNfts = async () => {
    setFetchingNfts(true);
    const nfts = await fetchAllNfts();
    setAllNFTs(nfts);
    setFetchingNfts(false);
  }



  return (
    <NftContext.Provider value={{
      allNFTs,fetchingNfts,refreshNfts,getTokenData
      }}>
      {children}
    </NftContext.Provider>
  )
}

export default NftsContext