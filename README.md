<img src="/avatarapp/src/everydayLogo.png" width="900">

# Everyday Avatar

Everyday Avatar is an NFT profile picture project, inspired by paper doll toys. Just like real paper dolls, this dynamic NFT project lets you swap out what your Avatar is wearing or how it looks, whenever you want.

**Avatar Maker** is the backend component for our dApp, 
[and can be found here. ](https://github.com/Hussainzz/avatar-maker)

## Technology Used
This repo contains the Smart Contracts and dApp front end. 

Hardhat is used locally for Smart Contract development, read the instructions below for getting started. Everyday Avatar is implemented as an ERC721 NFT token. The `tokenURI(tokenID)` endpoint was updated to return the on-chain attributes dynamically instead of pointing to static metadata. Everyday Avatar is *(planned to be)* deployed on the Polygon network.

React was chosen for the front end because many web3 tools are natively built for react based sites. We've utilized the APIs by [Moralis](https://moralis.io/) to communicate with our smart contract as well as display the NFTs from our collection.

Node.js runs the avatar-maker backend, where the images for our dynamic NFTs are generated and published to IPFS.

## Installation

###Hardhat Installation
Follow the instructions at: https://hardhat.org/getting-started/
```
$ git clone https://github.com/Hussainzz/everyday-avatar.git
$ cd everyday-avatar
$ npm install
$ npx hardhat compile
```
###React Installation
Our react dApp was built using create-react-app, and all the files are located in the `/avatarapp` subfolder.  For further instructions view the readme [there](https://github.com/Hussainzz/everyday-avatar/tree/main/avatarapp#readme).


## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## License

[MIT]([https://choosealicense.com/licenses/mit/](https://choosealicense.com/licenses/mit/))
