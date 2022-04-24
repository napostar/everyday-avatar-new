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

/**
 * The Everyday Avatar project was designed with the following requirements/features:
 *   -Unlimited mints (technically limited to the range of uint256...)
 *   -Customizable On-Chain Attributes with the power of EIP-3664
 *   -Utilizes Chainlink Any-API to update the token's IPFS image when it's visual attributes are changed
 *   - 
 */
contract EverydayAvatar is ERC721, ERC721URIStorage, ERC3664Updatable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;
	
	//TODO need to finalize the list of attribute categories
	uint constant BODY = 1;
    uint constant HEAD = 2;
    uint constant EYES = 3;
    uint constant HAIR = 4;

    constructor() ERC721("Everyday Avatar", "EA") ERC3664("") {
        //TODO mint/create ERC3664 attribute categories
		ERC3664._mint(BODY, "body", "Body", "");
		ERC3664._mint(HEAD, "head", "Head", "");
		ERC3664._mint(EYES, "eyes", "Eyes", "");
		ERC3664._mint(HAIR, "hair", "Hair", "");
    }
	
	//mint an avatar with the provided attributes, which will come from the dApp UI (ie user selection)
    function mintAvatar(address to, uint256[] memory attr, uint256[] memory attrValue) public payable {
		//TODO add asserts
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        
        for(uint i=0; i < attr.length ; i++){
			ERC3664.attach(tokenId, attr[i], attrValue[i]);
        }
    }
	
	//TODO function to build json metadata
	//TODO implement payment withdraw function
	//TODO implement function to update token image URI from oracle (use '_setTokenURI(tokenId, uri)' )
	//TODO implement chainlink Any-API when attributes change
	//TODO implement function to update token attributes (scoped to only the token owner)
	

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC3664) returns (bool)
    {
        return ERC721.supportsInterface(interfaceId) || ERC3664.supportsInterface(interfaceId);
    }
}