pragma solidity ^0.5.0;

contract IPFSInbox {
    
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

    function getOfferById(uint _id) public view returns (string memory) {
        return offers[_id].ipfsHash;
    }

    function send(address _from, address payable[] memory _toAccounts) public payable {
        require(msg.value > 0);

        uint numAccounts = _toAccounts.length;
        uint amountToTransfer = msg.value / numAccounts;

        for (uint i = 0; i < numAccounts; i++) {
            _toAccounts[i].transfer(amountToTransfer);
        }      
    }
    
    // Event
    event claimFileUploaded(string _ipfsHash, string _keywords);

}
