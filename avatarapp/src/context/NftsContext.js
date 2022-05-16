
import React,{useState, useEffect, useContext} from 'react'
import { useMoralis } from 'react-moralis';
import everyDayAvatar from "../contract/EverydayAvatar.json"

const NftContext = React.createContext();

export function useNfts() {
  return useContext(NftContext);
}

const NftsContext = ({children}) => {
  const [allNFTs, setAllNFTs] = useState([]);

  const { isInitialized, Moralis } = useMoralis();
  const [fetchingNfts, setFetchingNfts] = useState(true);


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
  },[isInitialized])

  const fetchAllNfts = async () => {
    let nfts = await fetchNFTsForContract();
    for(let n in nfts) {
      if(nfts[n]){
        // const token_uri = await getTokenData(nfts[n].token_id);
        // if(token_uri !== null){
        //   nfts[n].token_uri = token_uri;
        // }
        if(nfts[n].token_uri !== null){
          let json = parseToken(nfts[n].token_uri);
          if(json.token_uri !== null){
            nfts[n].token_uri = json;
          }
        }
      }
    }
    return nfts;
  }

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
        address: process.env.REACT_APP_CONTRACT_ADDRESS,
        function_name: "tokenURI",
        abi: everyDayAvatar.abi,
        params: {
          tokenId: tokenId,
        },
      };

      let tokenJson = await Moralis.Web3API.native.runContractFunction(options);

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
    return null;
  };

  const refreshNfts = async () => {
    setFetchingNfts(true);
    const nfts = await fetchAllNfts();
    setAllNFTs(nfts);
    setFetchingNfts(false);
  }

  const fetchNFTsForContract = async () => {
    const options = {
      chain: 'mumbai',
      address: process.env.REACT_APP_CONTRACT_ADDRESS,
    };
    const polygonNFTs = await Moralis.Web3API.token.getNFTOwners(options);
    return polygonNFTs.result;
  };

  return (
    <NftContext.Provider value={{
      allNFTs,fetchingNfts,refreshNfts,getTokenData
      }}>
      {children}
    </NftContext.Provider>
  )
}

export default NftsContext