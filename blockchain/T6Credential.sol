// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title T6Credential
 * @dev Soulbound Token (SBT) for TSEA-X Platform.
 * Non-transferable ERC721 token representing a verified credential.
 */
contract T6Credential is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    struct CredentialMetadata {
        string courseId;
        string grade;
        string instructorSignature;
        uint256 issueDate;
    }

    mapping(uint256 => CredentialMetadata) public credentials;
    mapping(address => bool) public authorizedIssuers;

    event CredentialIssued(address indexed to, uint256 indexed tokenId, string courseId);

    constructor() ERC721("T6 Credential", "T6C") Ownable(msg.sender) {}

    modifier onlyIssuer() {
        require(authorizedIssuers[msg.sender] || owner() == msg.sender, "Caller is not an authorized issuer");
        _;
    }

    function setIssuer(address issuer, bool status) external onlyOwner {
        authorizedIssuers[issuer] = status;
    }

    function issueCredential(
        address to,
        string memory courseId,
        string memory grade,
        string memory instructorSignature
    ) external onlyIssuer {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);

        credentials[tokenId] = CredentialMetadata({
            courseId: courseId,
            grade: grade,
            instructorSignature: instructorSignature,
            issueDate: block.timestamp
        });

        emit CredentialIssued(to, tokenId, courseId);
    }

    /**
     * @dev Soulbound: Block transfers.
     */
    function _update(address to, uint256 tokenId, address auth) internal override(ERC721) returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert("T6Credential: Soulbound token - Transfer not allowed");
        }
        return super._update(to, tokenId, auth);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        // In production, this would return a JSON metadata URL (IPFS/Arweave)
        // For now, we return a placeholder
        return string(abi.encodePacked("https://api.tsea-x.com/credentials/", Strings.toString(tokenId)));
    }
}
