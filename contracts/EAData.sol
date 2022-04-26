// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/access/Ownable.sol";

/*
  A storage contract to store the names of the components.  
  REQUIRED: each componentId must be unqiue, even across asset categories.
*/
contract AvatarNameData is Ownable {

    //mapping attribute value to name string
    mapping(uint => string) public _names;

    function componentName(uint attrValue) public view returns(string memory) {
        return _names[attrValue];
    }

    function componentNames(uint[] memory attrValues) public view returns(string[] memory) {
        string[] memory output = new string[](attrValues.length);
        for(uint i=0; i < attrValues.length ; i++) {
            output[i] = _names[attrValues[i]];
        }
        return output;
    }

    function addComponent(uint value, string calldata name) public onlyOwner{
        _names[value] = name;
    }

    function addManyComponents(uint[] memory values, string[] memory names) public onlyOwner {
        for(uint i=0; i < values.length ; i++) {
            _names[values[i]] = names[i];
        }
    }
}