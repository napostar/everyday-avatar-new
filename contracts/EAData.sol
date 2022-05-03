// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/*
  A storage contract to store the names of the components.  
  REQUIRED: each componentId must be unqiue, even across asset categories.
*/
contract AvatarNameData is Ownable {

    //mapping component to name string
    mapping(uint => string) public _names;

    //mapping componentIds to attributes
    mapping(uint => uint) public _compAttrs;

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

    //add a new component to data
    function addComponent(uint componentId, uint attrId, string calldata name) public onlyOwner{
        _compAttrs[componentId] = attrId;
        _names[componentId] = name;
    }

    //batch add components
    function addManyComponents(uint[] memory componentId, uint[] memory attrIds, string[] memory names) public onlyOwner {
        for(uint i=0; i < componentId.length ; i++) {
            _names[componentId[i]] = names[i];
            _compAttrs[componentId[i]] = attrIds[i];
        }
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
}