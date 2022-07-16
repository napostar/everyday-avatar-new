// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Holder.sol";

/**
  * Update to provide component provisioning
  * Methods to combine with the ERC721
  * Disable Token Transfers when token is combined
  * Group Components into collections, can only mint while collection is open
*/
contract AvatarComponent is ERC1155, Ownable, ERC1155Supply, ERC1155Holder  {
    constructor() ERC1155("") {}

    //mapping component to name string
    mapping(uint => string) public _names;

    //mapping componentIds to attributes
    mapping(uint => uint) public _compAttrs;

    function provisionComponent(address account, uint256 componentId, uint256 amount, string memory name, uint256 componentType, bytes memory data)
        public
        onlyOwner
    {
        _mint(account, componentId, amount, data);
        _compAttrs[componentId] = componentType;
        _names[componentId] = name;
    }

    function mintBatch(address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        public
        onlyOwner
    {
        _mintBatch(to, ids, amounts, data);
    }

    //get the name of the component
    function componentName(uint componentId) public view returns(string memory) {
        return _names[componentId];
    }

    //batch lookup of component names
    function componentNames(uint[] memory compValues) public view returns(string[] memory) {
        string[] memory output = new string[](compValues.length);
        for(uint i=0; i < compValues.length ; i++) {
            output[i] = _names[compValues[i]];
        }
        return output;
    }

    //lookup attributeId for the given component
    function componentAttribute(uint componentId) public view returns(uint) {
        return _compAttrs[componentId];
    }

    //lookup many attributeIds for the given components
    function batchComponentAttributes(uint[] memory componentIds) public view returns (uint[] memory) {
        uint[] memory output = new uint[](componentIds.length);
        for(uint i=0 ; i < componentIds.length ; i++) {
            output[i]=_compAttrs[componentIds[i]];
        }
        return output;
    }

    // The following functions are overrides required by Solidity.

    function _beforeTokenTransfer(address operator, address from, address to, uint256[] memory ids, uint256[] memory amounts, bytes memory data)
        internal
        override(ERC1155, ERC1155Supply)
    {
        super._beforeTokenTransfer(operator, from, to, ids, amounts, data);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC1155, ERC1155Receiver) returns (bool)
    {
        return ERC1155.supportsInterface(interfaceId) || ERC1155Receiver.supportsInterface(interfaceId);
    }
}