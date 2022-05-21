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
    function componentAttribute(uint componentId) external view returns(uint);
}
//TODO Update comments to NATSPEC format

/**
 * The Everyday Avatar project was designed with the following requirements/features:
 *   -Unlimited mints (technically limited to the range of uint256...)
 *   -Customizable On-Chain Attributes with the power of EIP-3664
 *     -Using the value of ERC3664 attributes to represent the individual assetId for the nft collection
 *   -Utilizes Chainlink Any-API Large Responses to update a token's IPFS image when creating on-chain snapshot
 *   -Reads a Chainlink MATIC-USD price feed to keep mints pegged to a specific value in USD
 *   -Supports the openGSN EIP-2771 Gassless/Meta Transactions (for onboarding)
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
    
    //mint fee can be updated by contract owner (in wei)
    uint256 public mintFee;

     //price to mint in USD
    uint constant usdPrice = 1;

    //mapping requestId to tokenId for getting IPFS hashes
    mapping(bytes32 => uint256) private _requestMap;

    //errors that could be thrown
    error InsufficientPayment(uint256 requiredAmount);
    error UnauthorizedOperator();
    error BadArrayLength(uint256 length);
    error AttributeArraysMismatch();
    error InvalidAttributeValue(uint256 attributeId, uint256 attributeValue);
    error DuplicateAttributes(uint256 attributeId);

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

    //validate attribute and value array inputs
    modifier validateAttributeArrays(uint256[] memory attrId, uint256[] memory attrValue) {
      //require arrays are  less than ATRR_COUNT
      if(attrId.length > ATTR_COUNT)
        revert BadArrayLength(attrId.length);

      //require arrays to be the same length
      if( (attrId.length != attrValue.length))
        revert AttributeArraysMismatch();
      
      //require no duplicates in the attribute array
      for(uint i=0; i < attrId.length ; i++){
        for(uint j=i+1; j < attrId.length ; j++ ){
          if(attrId[i] == attrId[j])
            revert DuplicateAttributes(attrId[i]);
        }
      }

      //require values are the correct type for their attribute
      //zero is valid for all attributeIds (interpreted as a remove)
      for(uint i=0; i < attrId.length ; i++){
        if((attrValue[i] != 0) && (compData.componentAttribute(attrValue[i]) != attrId[i]))
          revert InvalidAttributeValue(attrId[i], attrValue[i]);
      }
      _;
    }

    //mint an avatar with the provided attributes, which will come from the dApp UI (ie user selection)
    //attrId = assetId
    //attrValue = componentId
    function mintAvatar(address to, uint256[] memory attrId, uint256[] memory attrValue) public payable validateAttributeArrays(attrId, attrValue) {
        //require and check payment, no fee if contract owner
        if(msg.value < mintFee && _msgSender() != owner() )
          revert InsufficientPayment(mintFee);

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        for(uint i=0; i < attrId.length ; i++){
          ERC3664.attach(tokenId, attrId[i], attrValue[i]);
        }
    }

    //update token attributes (scoped to only the token owner)
    function updateAvatar(uint256 tokenId, uint256[] memory attrId, uint256[] memory attrValue) public validateAttributeArrays(attrId, attrValue) {
      //require user is owner using _msgSender()
      if(_msgSender() != ownerOf(tokenId))
        revert UnauthorizedOperator();

      for(uint i=0 ; i < attrId.length ; i++) {
        if(attrValue[i] == 0) {
          //remove attribute
          remove(tokenId, attrId[i]);
        }
        else {
          if(balanceOf(tokenId, attrId[i]) == 0 ) {
            attach(tokenId, attrId[i], attrValue[i]);
          }
          else {
            //Would be nice if ERC3664 had a setValue instead of just increase/decrease
            uint256 amount = attrBalances[attrId[i]][tokenId];
            int256 offsetAmount = int256(amount) - int256(attrValue[i]);
            
            require(offsetAmount != 0, "Attribute value has not changed.");
            if(offsetAmount > 0) {
              decrease(tokenId, attrId[i], abs(offsetAmount));
            }
            else {
              increase(tokenId, attrId[i], abs(offsetAmount));
            }
          }
        }
      }

      //clear existing ipfs hash if any
      if(bytes(ERC721URIStorage.tokenURI(tokenId)).length > 0)
        _setTokenURI(tokenId, "");
    }   

    //when requested, generate a new image and save the IPFS hash
    //using chainlink Any API Large Responses
    function requestNewImage(uint256 tokenId) public returns(bytes32) {
      bytes32 _jobId = "56b3da0f8f874c8bab6532de71af54e9";
      uint256 payment = 0;
      //custom job calls backend api:  /make-avatar
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
      _setTokenURI(tokenId, string(bytesData));
    }
    
    //generate the attribute string that will behave like the DNA for a given token.
    function getTokenAttributeString(uint256 tokenId) internal view returns(bytes memory){
      bytes memory output;
      //go through all the attribute categories
      for(uint i=0 ; i < ATTR_COUNT ; i++) {
        output = abi.encodePacked(output,toFLString(balanceOf(tokenId, i+1), 4));
      }
      return output;
    }
        
    //build the json uri on-chain for the specified tokenId
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory)
    {
        uint256[] memory attr = attributesOf(tokenId);
        uint256[] memory values = this.balanceOfBatch(tokenId, attr);
        bytes memory output;

        string[] memory tokenNames = compData.componentNames(values);

        for(uint i=0 ; i < attr.length ; i++) {
          output = abi.encodePacked(output, '{"trait_type":"', symbol(attr[i]), '","value":"',
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

    //if the URIStorage value has been set, use that, otherwise create and use the baseURI
    function _tokenURI(uint256 tokenId) internal view returns (bytes memory){
      string memory ipfsTokenURI = ERC721URIStorage.tokenURI(tokenId);

      if(bytes(ipfsTokenURI).length > 0) {
        return abi.encodePacked("ipfs://",ipfsTokenURI);
      }
      bytes memory assetString = getTokenAttributeString(tokenId);
      return abi.encodePacked("https://everydayavatarapi.herokuapp.com/view-avatar/",assetString);
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
        mintFee = (usdPrice*10**(18 + priceFeed.decimals()))/uint(price); 
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