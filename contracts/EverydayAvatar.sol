// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "./ERC3664/extensions/ERC3664Updatable.sol";

contract MyToken is ERC721, ERC721URIStorage, ERC3664Updatable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor() ERC721("Everyday Avatar", "EA") ERC3664("") {
        //TODO mint ERC3664 attribute categories
    }

    function mintAvatar(address to, string memory uri, uint256[] memory attr, uint256[] memory attrValue) public onlyOwner {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        for(uint i=0; i < attr.length ; i++){

        }
    }

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