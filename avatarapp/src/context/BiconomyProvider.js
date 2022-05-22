/* eslint-disable react-hooks/exhaustive-deps */
import { createContext, useEffect, useState, useContext } from "react";
import { useChain, useMoralis } from "react-moralis";
import { Biconomy } from "@biconomy/mexa";
import Web3 from "web3";
import { networkConfigs } from "../helpers/networks";
import everydayAvatarContract from "../contract/EverydayAvatar.json";


const biconomyDappApiKey = process.env.REACT_APP_BICONOMY_DAPP_API;

const BiconomyContext = createContext({});

export function useBiconomy() {
  return useContext(BiconomyContext);
}

const BiconomyContextProvider = (props) => {
  const { children } = props;
  const {
    isWeb3Enabled,
    web3,
    isAuthenticated,
    isWeb3EnableLoading,
    enableWeb3,
    Moralis,
  } = useMoralis();
  const { chainId } = useChain();
  const [isBiconomyInitialized, setIsBiconomyInitialized] = useState(false);
  const [biconomyProvider, setBiconomyProvider] = useState({});
  const [contract, setContract] = useState({});
  const { abi } = everydayAvatarContract;
  const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS;

  useEffect(() => {
    if (isAuthenticated && !isWeb3Enabled && !isWeb3EnableLoading && chainId) {
      enableWeb3();
    }
  }, [isAuthenticated, isWeb3Enabled, chainId]);

  useEffect(() => {
    const initializeBiconomy = async () => {
      if (isBiconomyInitialized) {
        // Resetting when reinitializing
        setIsBiconomyInitialized(false);
      }
      await Moralis.enableWeb3();
      const networkProvider = new Web3.providers.HttpProvider(
        networkConfigs[chainId]?.rpcUrl
      );
      const biconomy = new Biconomy(networkProvider, {
        walletProvider: web3.provider,
        apiKey: biconomyDappApiKey,
      });
      setBiconomyProvider(biconomy);

      // This web3 instance is used to read normally and write to contract via meta transactions.
      //web3.setProvider(biconomy);
      const web3Js = new Web3(biconomy);
      
      biconomy
        .onEvent(biconomy.READY, () => {
          setIsBiconomyInitialized(true);
          const contractInst = new web3Js.eth.Contract(abi, contractAddress);
          setContract(contractInst);
        })
        .onEvent(biconomy.ERROR, () => {
          // Handle error while initializing mexa
          console.log("Biconomy Initialization Fail");
        });
    };

    if (isAuthenticated && isWeb3Enabled && chainId !== "0x1") {
      initializeBiconomy();
    }
  }, [
    isAuthenticated,
    isWeb3Enabled,
    chainId,
    abi,
    contractAddress,
    Moralis,
  ]);

  return (
    <BiconomyContext.Provider
      value={{ isBiconomyInitialized, biconomyProvider, contract }}
    >
      {children}
    </BiconomyContext.Provider>
  );
};

export default BiconomyContextProvider;
