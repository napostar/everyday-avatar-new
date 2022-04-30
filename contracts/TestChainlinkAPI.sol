//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";


contract GenericLargeResponse is ChainlinkClient {
  using Chainlink for Chainlink.Request;

  // variable bytes returned in a single oracle response
  bytes public data;
  string public image_url;


  constructor(
  ) {
    setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
    setChainlinkOracle(0xedaa6962Cf1368a92e244DdC11aaC49c0A0acC37);
  }

  /**
   * @notice Request variable bytes from the oracle
   */
  function requestBytes(
  )
    public
  {
    bytes32 specId = "881231241d2c4d9797fd8b9f5baab786";
    uint256 payment = 0;
    Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.fulfillBytes.selector);
    req.add("get","https://everydayavatar.free.beeceptor.com/img/101");
    req.add("path", "data,result");
    sendOperatorRequest(req, payment);
  }

  event RequestFulfilled(
    bytes32 indexed requestId,
    bytes indexed data
  );

  /**
   * @notice Fulfillment function for variable bytes
   * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
   */
  function fulfillBytes(
    bytes32 requestId,
    bytes memory bytesData
  )
    public
    recordChainlinkFulfillment(requestId)
  {
    emit RequestFulfilled(requestId, bytesData);
    data = bytesData;
    image_url = string(data);
  }

}