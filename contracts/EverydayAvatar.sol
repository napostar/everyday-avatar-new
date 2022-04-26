// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
    _____                          __               ___              __            
   / ____/   _____  _______  ______/ /___ ___  __   /   |_   ______ _/ /_____ ______
  / __/ | | / / _ \/ ___/ / / / __  / __ `/ / / /  / /| | | / / __ `/ __/ __ `/ ___/
 / /___ | |/ /  __/ /  / /_/ / /_/ / /_/ / /_/ /  / ___ | |/ / /_/ / /_/ /_/ / /    
/_____/ |___/\___/_/   \__, /\__,_/\__,_/\__, /  /_/  |_|___/\__,_/\__/\__,_/_/     
                      /____/            /____/                                      
					 
*/

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./ERC3664/extensions/ERC3664Updatable.sol";
//import "https://github.com/napostar/EIP-3664/blob/main/contracts/extensions/ERC3664Updatable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

library AvatarData {

    //List of attribute/nft part categories (Using Invisible Friends demo content)   
    uint constant BACKGROUND = 1;
    uint constant HEAD = 2;
    uint constant FACE = 3;
    uint constant CLOTHES = 4;
}

interface IAvatarData  {
    function componentNames(uint[] memory attrValues) external view returns(string[] memory);
}

/**
 * The Everyday Avatar project was designed with the following requirements/features:
 *   -Unlimited mints (technically limited to the range of uint256...)
 *   -Customizable On-Chain Attributes with the power of EIP-3664
 *     -Using the value of ERC3664 attributes to represent the assetId for the nft collection
 *   -Utilizes Chainlink Any-API to update the token's IPFS image when it's visual attributes are changed
 *   - 
 */
contract EverydayAvatar is ERC721, ERC721URIStorage, ERC3664Updatable, Ownable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _tokenIdCounter;
    
    IAvatarData compData;
    AggregatorV3Interface internal priceFeed;
    
    //mint fee can be updated by contract owner
    uint256 public mintFee;

    constructor() ERC721("Everyday Avatar", "EA") ERC3664("") {
      //Create ERC3664 attribute categories (attributeID, name, symbol, uri)
      ERC3664._mint(AvatarData.BACKGROUND, "bg", "Background", "");
      ERC3664._mint(AvatarData.HEAD, "head", "Head", "");
      ERC3664._mint(AvatarData.FACE, "face", "Face", "");
      ERC3664._mint(AvatarData.CLOTHES, "clothes", "Clothes", "");
      
      //initial mint fee will be 10 MATIC (~$15 usd) (deploying on Polygon)
      mintFee = 10 ether;

      //need to update with the actual contract (needs to be deployed first)
      compData =  IAvatarData(0x0fC5025C764cE34df352757e82f7B5c4Df39A836);
      
      //mainnet matic/usd: 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
      //mumbai matic/usd: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
      priceFeed = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);
    }
	
    //mint an avatar with the provided attributes, which will come from the dApp UI (ie user selection)
    function mintAvatar(address to, uint256[] memory attrId, uint256[] memory attrValue) public payable {
		//TODO add needed require checks
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        //TODO query new image URI from oracle, for now just set it.
        _setTokenURI(tokenId, string(abi.encodePacked("ipfs://HASH/",tokenId.toString())));

        for(uint i=0; i < attrId.length ; i++){
          ERC3664.attach(tokenId, attrId[i], attrValue[i]);
        }
    }
	
    //TODO implement function to update token image URI from oracle (use '_setTokenURI(tokenId, uri)' )
    //TODO implement chainlink Any-API when attributes change
    //TODO implement function to lookup string name of attribute based on id
    
    //update token attributes (scoped to only the token owner)
    function updateAvatar(uint256 tokenId, uint256[] memory attrId, uint256[] memory attrValue) public {
      //TODO validate user is owner using _msgSender(); (support meta transactions)
      //TODO add needed require checks
      for(uint i=0 ; i < attrId.length ; i++) {
        //detatch and re-attach new ERC3664 attribute.  Would be nice if ERC3664 had a setValue instead of just increase/decrease
        remove(tokenId, attrId[i]);
        attach(tokenId, attrId[i], attrValue[i]);
      }
    }   
    
    //build the json uri for the specified tokenId
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        uint256[] memory attr = attributesOf(tokenId);
        uint256[] memory values = this.balanceOfBatch(tokenId, attr);
        bytes memory output;

        string[] memory tokenNames = compData.componentNames(values);

        for(uint i=0 ; i < attr.length ; i++) {
          output = abi.encodePacked(output, '{"trait_type":"', symbol(attr[i]), '","value":"', 
          //values[i].toString(), 
          tokenNames[i],
          '"}');
        }
      
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
          '{"name": "Everyday Avatar',  //would be cool if name could come from the metacore identity contract
          ' #', 
          tokenId.toString(), 
          '", "description":"Everyday Avatars are a collection of profile picture NFTs that are completely customizable. You can freely modify and update your Avatar using the dApp. Attributes are stored on-chain and this amazing flexibility is powered by EIP-3664.", "image":"', 
            super.tokenURI(tokenId),
          '","attributes":['
          , output, 
          ']}'
        ))));

        return string(abi.encodePacked('data:application/json;base64,', json));
    }
    
    //update the minting fee, need to keep the price at $10 usd range (using a price feeds oracle for this with a keeper to update automatically)
    function updateFee() public {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        //calculates the new mint fee (of the amount of wei that equals $10 usd)
        mintFee = (10*10**18)/(uint(price)*10**(18-priceFeed.decimals())); 
    }
    
    //withdraw function for funds (TODO look into PaymentSplitter contract)
    function ownerWithdraw(address payable to) public onlyOwner {
      to.transfer(address(this).balance);
    }
    
    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC3664) returns (bool)
    {
        return ERC721.supportsInterface(interfaceId) || ERC3664.supportsInterface(interfaceId);
    }
}