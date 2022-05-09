const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("EveryDay Avatar Unit Tests", () => {

  let everyDayAvatar;
  let EverydayAvatarContract;
  const BACKGROUND = 1;
  const HEAD = 2;
  const FACE = 3;
  const CLOTHES = 4;

  before(async () => {
    [deployer, user2, user3] = await ethers.getSigners();
    chainId = await getChainId();
    await deployments.fixture(["main"]);

    EverydayAvatarContract = await deployments.get("EverydayAvatar");

    everyDayAvatar = await ethers.getContractAt(
      "EverydayAvatar",
      EverydayAvatarContract.address
    );
  });

  it("It Should Mint Token And Get The NFT Data from tokenUri", async() => {
    const mintTxn = await everyDayAvatar.connect(deployer).mintAvatar(deployer.address,[BACKGROUND, HEAD, FACE, CLOTHES], [54,11,28,6])
    await mintTxn.wait(1);
    const exprectedData = "data:application/json;base64,eyJuYW1lIjogIkV2ZXJ5ZGF5IEF2YXRhciAjMCIsICJkZXNjcmlwdGlvbiI6IkV2ZXJ5ZGF5IEF2YXRhcnMgYXJlIGEgY29sbGVjdGlvbiBvZiBwcm9maWxlIHBpY3R1cmUgTkZUcyB0aGF0IGFyZSBjb21wbGV0ZWx5IGN1c3RvbWl6YWJsZS4gWW91IGNhbiBmcmVlbHkgbW9kaWZ5IGFuZCB1cGRhdGUgeW91ciBBdmF0YXIgdXNpbmcgdGhlIGRBcHAuIEF0dHJpYnV0ZXMgYXJlIHN0b3JlZCBvbi1jaGFpbiBhbmQgdGhpcyBhbWF6aW5nIGZsZXhpYmlsaXR5IGlzIHBvd2VyZWQgYnkgRUlQLTM2NjQuIiwgImltYWdlIjoiaHR0cHM6Ly9ldmVyeWRheWF2YXRhcmFwaS5oZXJva3VhcHAuY29tL3ZpZXctYXZhdGFyLzAwNTQwMDExMDAyODAwMDYiLCJhdHRyaWJ1dGVzIjpbeyJ0cmFpdF90eXBlIjoiQmFja2dyb3VuZCIsInZhbHVlIjoiIn0seyJ0cmFpdF90eXBlIjoiSGVhZCIsInZhbHVlIjoiIn0seyJ0cmFpdF90eXBlIjoiRmFjZSIsInZhbHVlIjoiIn0seyJ0cmFpdF90eXBlIjoiQ2xvdGhlcyIsInZhbHVlIjoiIn1dfQ=="
    const tokenData = await everyDayAvatar.tokenURI(0);

    console.log(await everyDayAvatar.balanceOf(0,1))

    expect(tokenData == exprectedData).to.be.true
  }); 
});
