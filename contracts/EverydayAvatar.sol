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
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@opengsn/contracts/src/BaseRelayRecipient.sol";

//interface for Avatar Data Contract
interface IAvatarData  {
    function componentNames(uint[] memory attrValues) external view returns(string[] memory);
}

/**
 * The Everyday Avatar project was designed with the following requirements/features:
 *   -Unlimited mints (technically limited to the range of uint256...)
 *   -Customizable On-Chain Attributes with the power of EIP-3664
 *     -Using the value of ERC3664 attributes to represent the individual assetId for the nft collection
 *   -Utilizes Chainlink Any-API Large Responses to update a token's IPFS image when creating on-chain snapshot
 *   -Reads a Chainlink MATIC-USD price feed to keep mints pegged to a specific value in USD
 *   -Supports the openGSN EIP-2771 Gassless/Meta Transactions
 *   -
 */
contract EverydayAvatar is ERC721, ERC721URIStorage, ERC3664Updatable, Ownable, BaseRelayRecipient, ChainlinkClient   {
    using Counters for Counters.Counter;
    using Chainlink for Chainlink.Request;
    using Strings for uint256;

    //List of attribute/nft part categories (Using Invisible Friends demo content)   
    uint constant BACKGROUND = 1;
    uint constant HEAD = 2;
    uint constant FACE = 3;
    uint constant CLOTHES = 4;
    uint constant ATTR_COUNT = 4;

    //tokenId counter
    Counters.Counter private _tokenIdCounter;
    
    //Avatar Data contract
    IAvatarData compData;
    
    //Price feed for consistent mint prices
    AggregatorV3Interface internal priceFeed;
    
    //mint fee can be updated by contract owner
    uint256 public mintFee;
    
    //mapping requestId to tokenId for getting IPFS hashes
    mapping(bytes32 => uint256) private _requestMap;

    constructor(address dataContract) ERC721("Everyday Avatar", "EA") ERC3664("") {
      //Create ERC3664 attribute categories (attributeID, name, symbol, uri)
      ERC3664._mint(BACKGROUND, "bg", "Background", "");
      ERC3664._mint(HEAD, "head", "Head", "");
      ERC3664._mint(FACE, "face", "Face", "");
      ERC3664._mint(CLOTHES, "clothes", "Clothes", "");
      
      //initial mint fee will be 10 MATIC (~$15 usd) (deploying on Polygon)
      mintFee = 10 ether;

      //need to update with the actual contract (needs to be deployed first)
      compData =  IAvatarData(dataContract);
      
      //mainnet matic/usd: 0xAB594600376Ec9fD91F8e885dADF0CE036862dE0
      //mumbai matic/usd: 0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada
      priceFeed = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);
      
      //Chainlink Oracle for IPFS image CIDs
      setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
      setChainlinkOracle(0xedaa6962Cf1368a92e244DdC11aaC49c0A0acC37);
    }

    //TODO Add support for Opensea auto proxy approval
    //TODO add Meta transaction support

    //mint an avatar with the provided attributes, which will come from the dApp UI (ie user selection)
    //attrId = assetId
    //attrValue = componentId
    function mintAvatar(address to, uint256[] memory attrId, uint256[] memory attrValue) public payable {
        //require address isn't zero
        //require and check payment
        //require arrays are greater than zero, and less than ATRR_COUNT
        //require values are the correct type for their attribute
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
              
        for(uint i=0; i < attrId.length ; i++){
          ERC3664.attach(tokenId, attrId[i], attrValue[i]);
        }
    }

    //update token attributes (scoped to only the token owner)
    function updateAvatar(uint256 tokenId, uint256[] memory attrId, uint256[] memory attrValue) public {
      //TODO validate user is owner using _msgSender(); (support meta transactions)
      //TODO add needed require checks
      for(uint i=0 ; i < attrId.length ; i++) {
        //Would be nice if ERC3664 had a setValue instead of just increase/decrease
        updateAttribute(tokenId, attrId[i], attrValue[i]);
      }

      //query new image URI from oracle
      //requestNewImage(tokenId);
      //TODO clear existing value in uriStorage if present
    }   

    //update the value of an attribute to the given value, because a direct setter in ERC3664 doesn't exist :(
    function updateAttribute(uint256 tokenId, uint256 attrId, uint256 newVal) internal {
        uint256 amount = attrBalances[attrId][tokenId];
        int256 offsetAmount = int256(amount) - int256(newVal);
        require(offsetAmount != 0, "Attribute value has not changed.");
        if(offsetAmount > 0) {
          decrease(tokenId, attrId, abs(offsetAmount));
        }
        else {
          increase(tokenId, attrId, abs(offsetAmount));
        }
    }
    
    //implement chainlink Any-API when attributes change
    //when the avatar changes, generate a new image and save the IPFS hash
    function requestNewImage(uint256 tokenId) public returns(bytes32){
      bytes32 _jobId = "04e9f8f6e4e8419e89d8d942566ef963";
      uint256 payment = 0;

      Chainlink.Request memory req = buildChainlinkRequest(_jobId, address(this), this.fulfillBytes.selector);
      req.add("id", string(getTokenAttributeString(tokenId)));
      bytes32 requestId = sendOperatorRequest(req, payment);
      _requestMap[requestId] = tokenId;
      return requestId;
    }
    
    event RequestFulfilled(bytes32 indexed requestId, bytes indexed data, uint256 indexed tokenId);
  
    /**
     * @notice Fulfillment function for variable bytes
     * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
     */
    function fulfillBytes(bytes32 requestId, bytes memory bytesData) public recordChainlinkFulfillment(requestId) {
      uint256 tokenId = _requestMap[requestId];
      emit RequestFulfilled(requestId, bytesData, tokenId);
      _setTokenURI(tokenId, string(abi.encodePacked("ipfs://",bytesData)));
    }
    
    //generate the attribute string that will behave like the DNA for a given token.
    function getTokenAttributeString(uint256 tokenId) internal view returns(bytes memory){
      bytes memory output;
      //go through all the attribute categories
      for(uint i=0 ; i < 4 ; i++) {
        output = abi.encodePacked(output,toFLString(balanceOf(tokenId, i+1), 4));
      }
      return output;
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
          if(i < attr.length-1) {
            output = abi.encodePacked(output, ',');
          }
        }
      
        string memory json = Base64.encode(bytes(string(abi.encodePacked(
          '{"name": "Everyday Avatar',  //would be cool if name could come from the metacore identity contract
          ' #', 
          tokenId.toString(), 
          '", "description":"Everyday Avatars are a collection of profile picture NFTs that are completely customizable. You can freely modify and update your Avatar using the dApp. Attributes are stored on-chain and this amazing flexibility is powered by EIP-3664.", "image":"', 
            _tokenURI(tokenId),
          '","attributes":['
          , output, 
          ']}'
        ))));

        return string(abi.encodePacked('data:application/json;base64,', json));
    }

    function _tokenURI(uint256 tokenId) internal view returns (string memory){
      
      //if the URIStorage value has been set, use that, otherwise create and use the baseURI
      string memory ipfsTokenURI = ERC721URIStorage.tokenURI(tokenId);
      if(bytes(ipfsTokenURI).length > 0) {
        return ipfsTokenURI;
      }
      bytes memory assetString = getTokenAttributeString(tokenId);
      return string(abi.encodePacked("https://everydayavatarapi.herokuapp.com/view-avatar/",assetString));
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

    //The following are internal helper functions

    /**
     * @dev Converts a `uint256` to its ASCII `string` representation with a fixed length. Number will be truncated if larger than will fit in length digits.
     */
    function toFLString(uint256 value, uint256 length) internal pure returns (bytes memory) {
      //this implementation is inspired by the Strings Library
      bytes memory buffer = new bytes(length);
      for(uint256 i = length ; i > 0 ; --i) {
          buffer[i-1] = bytes1(uint8(48 + uint256(value % 10)));
          value /= 10;
      }
      return buffer;
    }

    //absolute value function, because it's not built-in to solidity :(
    function abs(int256 x) private pure returns (uint256) {
      return x >= 0 ? uint256(x) : uint256(-x);
    }
    
    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC3664) returns (bool)
    {
        return ERC721.supportsInterface(interfaceId) || ERC3664.supportsInterface(interfaceId);
    }

    //The following functions are to support meta transactions

    /**
     * Optional setter for the trusted forwarder for openGSN
     */
     function setTrustedForwarder(address _trustedForwarder) public onlyOwner {
       _setTrustedForwarder(_trustedForwarder);
     }
    
    string public override versionRecipient = "2.2.0";

    function _msgSender() internal view override(Context, BaseRelayRecipient)
        returns (address sender) {
        sender = BaseRelayRecipient._msgSender();
    }

    function _msgData() internal view override(Context, BaseRelayRecipient)
        returns (bytes memory) {
        return BaseRelayRecipient._msgData();
    }

    /**
    * Override isApprovedForAll to auto-approve OS's proxy contract
    */
    function isApprovedForAll(address _owner, address _operator) public override view returns (bool isOperator) {
      // if OpenSea's ERC721 Proxy Address is detected, auto-return true
      if (_operator == address(0x58807baD0B376efc12F5AD86aAc70E78ed67deaE)) {
        return true;
      }

      // otherwise, use the default ERC721.isApprovedForAll()
      return ERC721.isApprovedForAll(_owner, _operator);
    }
}