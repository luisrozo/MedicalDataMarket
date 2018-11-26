pragma solidity 0.4.24;

contract IPFSInbox {
    
    // Structures
    mapping (address => string) ipfsInbox;
    
    // Events
    event ipfsUploaded(string _ipfsHash, address _address);
    event inboxResponse(string response);
    
    // Modifiers
    modifier notFull (string _string) {bytes memory stringTest =  bytes(_string); require (stringTest.length == 0); _;}
    
    // An empty constructor that creates an instance of the contract
    constructor() public {}
    
    function uploadIPFS(string _ipfsHash) public
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
