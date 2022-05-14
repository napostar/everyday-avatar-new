
import React,{useState, useEffect, useContext} from 'react'
import { useMoralis, useMoralisWeb3Api } from 'react-moralis';
import everyDayAvatar from "../contract/EverydayAvatar.json"

const NftContext = React.createContext();

export function useNfts() {
  return useContext(NftContext);
}

const NftsContext = ({children}) => {
  const [allNFTs, setAllNFTs] = useState([]);

  const Web3Api = useMoralisWeb3Api();
  const { isInitialized, chainId, isWeb3Enabled, Moralis } = useMoralis();
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
  },[isWeb3Enabled])

  const fetchAllNfts = async () => {
    let nfts = await fetchNFTsForContract();
    for(let n in nfts) {
      if(nfts[n]){
        const token_uri = await getTokenData(nfts[n].token_id);
        if(token_uri !== null){
          nfts[n].token_uri = token_uri;
        }
      }
    }
    return nfts;
  }

  const getTokenData = async (tokenId) => {
    if (isWeb3Enabled) {
      let options = {
        contractAddress: process.env.REACT_APP_CONTRACT_ADDRESS,
        functionName: "tokenURI",
        abi: everyDayAvatar.abi,
        params: {
          tokenId: tokenId,
        },
      };

      let tokenJson = await Moralis.executeFunction(options);

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
      chain: chainId,
      address: process.env.REACT_APP_CONTRACT_ADDRESS,
    };
    const polygonNFTs = await Web3Api.token.getNFTOwners(options);
    //console.log(polygonNFTs)
    return polygonNFTs.result;
  };

  return (
    <NftContext.Provider value={{
      allNFTs,fetchingNfts,refreshNfts
      }}>
      {children}
    </NftContext.Provider>
  )
}

export default NftsContext