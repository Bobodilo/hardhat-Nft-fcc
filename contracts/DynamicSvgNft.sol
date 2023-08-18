// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// Mint
// Store info somewhere
// Show X and show Y

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "base64-sol/base64.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract DynamicSvgNft is ERC721 {
    uint256 private s_tokenCounter;
    string private s_lowImageURI;
    string private s_highImageURI;
    string private constant base64EncodedSvgPrefix = "data: image/svg+xml;base64";
    AggregatorV3Interface internal immutable i_priceFeed;
    mapping(uint256 => int256) public s_tokenIdToHighValue;

    event CreatedNFT(uint256 indexed tokenId, int256 highValue);

    constructor(
        address priceFeedAddress,
        string memory lowSvg,
        string memory highSvg
    ) ERC721("Dynamic SVG NFT", "DSN") {
        s_tokenCounter = 0;
        s_lowImageURI = svgToimageURI(lowSvg);
        s_highImageURI = svgToimageURI(highSvg);
        i_priceFeed = AggregatorV3Interface(priceFeedAddress);
    }

    function svgToimageURI(string memory svg) public pure returns (string memory) {
        string memory svgBased64Encoded = Base64.encode(bytes(string(abi.encodePacked(svg))));
        return string(abi.encodePacked(base64EncodedSvgPrefix, svgBased64Encoded));
    }

    function mint(int256 highValue) public {
        s_tokenIdToHighValue[s_tokenCounter] = highValue;
        _safeMint(msg.sender, s_tokenCounter);
        s_tokenCounter = s_tokenCounter + 1;

        emit CreatedNFT(s_tokenCounter, highValue);
    }

    function _baseURI() internal pure override returns (string memory) {
        return "data:application/json;based64,";
    }

    //data:image/svg+xml;based64,
    //data:application/json;base64,

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        // Encode our json to base64
        require(_exists(tokenId), "URI Query for nonexistent token");
        // string memory imageURI = "hi";
        (, int256 price, , , ) = i_priceFeed.latestRoundData();
        string memory imageURI = s_lowImageURI;
        if (price >= s_tokenIdToHighValue[tokenId]) {
            imageURI = s_highImageURI;
        }

        //Return a base64 of the string
        return
            // Encast into a string and get the full URI
            string(
                // apend to the initial part for json object =>  //data:application/json;base64,
                abi.encodePacked(
                    _baseURI(),
                    //encode in base64
                    Base64.encode(
                        // encode in bytes
                        bytes(
                            // concat
                            abi.encodePacked(
                                //create a json string
                                '{"name":"',
                                name(),
                                '", "description":"An NFT that changes based on the Chainlink Feed",',
                                '"attributes": "[{"trait_type": "coolness", "value": 100}]"',
                                imageURI,
                                '"}'
                            )
                        )
                    )
                )
            );
    }

    function getLowSVG() public view returns (string memory) {
        return s_lowImageURI;
    }

    function getHighSVG() public view returns (string memory) {
        return s_highImageURI;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return i_priceFeed;
    }

    function getTokenCounter() public view returns (uint256) {
        return s_tokenCounter;
    }
}
