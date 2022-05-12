# Everyday Avatar

Everyday Avatar is an NFT profile picture project, inspired by paper doll toys. Just like real paper dolls, this dynamic NFT project lets you swap out what your Avatar is wearing, or how it looks, whenever you want.

We’ve built a dApp to mint new or modify existing Everyday Avatars. 

We've built the NFT using Solidity, with the attribute identifiers (IDs) stored on-chain. These attributes are tied to the individual components of the Avatar. This was done by leveraging the ERC-3664 standard for dynamic metadata attributes for NFTs.

To support awesome art, we decided to have the images generated off-chain, dynamically from the on-chain attributes. To minimize trust and the need for centralized servers, we built-in a 'snapshot' system where a token's image URI is replaced with a IPFS link.

We have a hybrid system where some of the metadata is built in the smart contract directly and some data, like the image url, that points to our web server. (but only some of the time) Our web service can dynamically build and generate the avatar images, layer by layer, but also can pin the generated images live to IPFS (through infura) as the images are generated. 

To minimize the trust, we decided to use Oracles to provide the IPFS data directly to our smart contract. While this is technically still a centralized solution, the hope is that this system of generating dynamic NFT token images can be standardized, and then implemented as a DON. (distributed oracle network)

## Installation

  

Use the package manager [pip]([https://pip.pypa.io/en/stable/](https://pip.pypa.io/en/stable/)) to install foobar.

  

```bash

pip install foobar

```

  

## Usage

  

```python

import foobar

  

# returns 'words'

foobar.pluralize('word')

  

# returns 'geese'

foobar.pluralize('goose')

  

# returns 'phenomenon'

foobar.singularize('phenomena')

```

  

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

  

Please make sure to update tests as appropriate.

  

## License

[MIT]([https://choosealicense.com/licenses/mit/](https://choosealicense.com/licenses/mit/))