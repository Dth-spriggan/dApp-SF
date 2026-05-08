// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract WarrantyNFT {
    string private constant _NAME = "SilverFlag Warranty NFT";
    string private constant _SYMBOL = "SFW";
    string private constant _BASE_URI = "https://localhost/api/nft/metadata/";

    uint256 public nextTokenId;
    address private _owner;

    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    modifier onlyOwner() {
        require(msg.sender == _owner, "Only owner");
        _;
    }

    constructor(address initialOwner) {
        require(initialOwner != address(0), "Invalid owner");
        _owner = initialOwner;
        emit OwnershipTransferred(address(0), initialOwner);
    }

    function name() external pure returns (string memory) {
        return _NAME;
    }

    function symbol() external pure returns (string memory) {
        return _SYMBOL;
    }

    function owner() external view returns (address) {
        return _owner;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Invalid owner");
        emit OwnershipTransferred(_owner, newOwner);
        _owner = newOwner;
    }

    function balanceOf(address account) external view returns (uint256) {
        require(account != address(0), "Invalid owner");
        return _balances[account];
    }

    function ownerOf(uint256 tokenId) public view returns (address) {
        address tokenOwner = _owners[tokenId];
        require(tokenOwner != address(0), "Nonexistent token");
        return tokenOwner;
    }

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(_owners[tokenId] != address(0), "Nonexistent token");
        return string(abi.encodePacked(_BASE_URI, _toString(tokenId)));
    }

    function supportsInterface(bytes4 interfaceId) external pure returns (bool) {
        return
            interfaceId == 0x01ffc9a7 || // ERC165
            interfaceId == 0x80ac58cd || // ERC721
            interfaceId == 0x5b5e139f;   // ERC721Metadata
    }

    function assign(address to) external onlyOwner returns (uint256) {
        return _assign(to);
    }

    function mintTo(address to) external onlyOwner returns (uint256) {
        return _assign(to);
    }

    function _assign(address to) private returns (uint256) {
        require(to != address(0), "Invalid recipient");

        uint256 tokenId = nextTokenId;
        nextTokenId = tokenId + 1;

        _owners[tokenId] = to;
        _balances[to] += 1;

        emit Transfer(address(0), to, tokenId);
        return tokenId;
    }

    function _toString(uint256 value) private pure returns (string memory) {
        if (value == 0) {
            return "0";
        }

        uint256 digits;
        uint256 current = value;
        while (current != 0) {
            digits++;
            current /= 10;
        }

        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }

        return string(buffer);
    }
}
