// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CharapiaNft is ERC721Enumerable, Ownable {
    using Strings for uint256;

    string private _baseTokenURI;
    uint256 private _nextTokenId = 1;

    event Minted(address indexed to, uint256 indexed tokenId);

    constructor(string memory initialBaseURI) ERC721("CharapiaNft", "CHAR") {
        _baseTokenURI = initialBaseURI;
    }

    /// @notice Simple public mint - free for callers (for test/demo)
    function mint() external {
        uint256 tokenId = _nextTokenId;
        _nextTokenId += 1;
        _safeMint(msg.sender, tokenId);
        emit Minted(msg.sender, tokenId);
    }

    /// @notice Owner can mint to any address
    function ownerMint(address to) external onlyOwner {
        uint256 tokenId = _nextTokenId;
        _nextTokenId += 1;
        _safeMint(to, tokenId);
        emit Minted(to, tokenId);
    }

    /// @notice Set base URI (owner only)
    function setBaseURI(string calldata newBaseURI) external onlyOwner {
        _baseTokenURI = newBaseURI;
    }

    /// @notice tokenURI uses baseURI + tokenId
    function tokenURI(uint256 tokenId) public view override(ERC721) returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");
        if (bytes(_baseTokenURI).length == 0) {
            return "";
        }
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString()));
    }

    // The following functions are overrides required by Solidity for multiple inheritance

    // _beforeTokenTransfer signature in OZ >=4.9 includes `uint256 batchSize`
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        override(ERC721, ERC721Enumerable)
    {               
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
