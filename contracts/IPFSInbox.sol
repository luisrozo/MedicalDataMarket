pragma solidity ^0.5.0;

contract IPFSInbox {
    
    // Structures
    mapping (address => string) ipfsInbox;

    // Offer
    struct Offer {
        string ipfsHash;
        string keywords;
    }

    uint numOffers;
    mapping (uint => Offer) offers;

    function newOffer(string memory _ipfsHash, string memory _keywords) public {
        uint256 offerID = numOffers++;
        offers[offerID] = Offer(_ipfsHash, _keywords);

        emit claimFileUploaded(_ipfsHash, _keywords);
    }

    // function getOffersByScheme(string memory _keywords) public {

    // }
    
    // Events
    event claimFileUploaded(string _ipfsHash, string _keywords);

    event ipfsUploaded(string _ipfsHash, address _address);
    event inboxResponse(string response);
    
    // Modifiers
    //modifier notFull (string _string) {bytes memory stringTest =  bytes(_string); require (stringTest.length == 0); _;}
    
    // An empty constructor that creates an instance of the contract
    constructor() public {}
    
    function uploadIPFS(string memory _ipfsHash) public
    {   
        address owner = msg.sender;
        ipfsInbox[owner] = _ipfsHash;
        emit ipfsUploaded(_ipfsHash, owner);
    }
    
    function getIPFS() public
    {
        string memory ipfs_hash = ipfsInbox[msg.sender];
        if(bytes(ipfs_hash).length == 0) {
            emit inboxResponse("Empty Inbox");
        } else {
            emit inboxResponse(ipfs_hash);
        }
    }
}
