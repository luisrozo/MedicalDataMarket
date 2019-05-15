pragma solidity ^0.5.0;

contract IPFSInbox {
    
    // Offer
    struct Offer {
        string ipfsHash;
        string keywords;
    }

    uint numOffers;
    mapping (uint => Offer) offers;

    function newOffer(string memory _ipfsHash, string memory _keywords) 
        public 
    {
        uint256 offerID = numOffers++;
        offers[offerID] = Offer(_ipfsHash, _keywords);

        emit claimFileUploaded(_ipfsHash, _keywords);
    }

    function getOfferById(uint _id)
        public
        view 
        returns (string memory) 
    {
        return offers[_id].ipfsHash;
    }

    function send(address _from, address payable[] memory _toAccounts)
        public 
        payable 
    {
        require(msg.value > 0);

        uint numAccounts = _toAccounts.length;
        uint amountToTransfer = msg.value / numAccounts;

        for (uint i = 0; i < numAccounts; i++) {
            _toAccounts[i].transfer(amountToTransfer);
        }      
    }

    function recover(bytes32 hash, bytes memory signature)
        internal
        pure
        returns (address)
    {
        bytes32 r;
        bytes32 s;
        uint8 v;

        if (signature.length != 65) {
            return (address(0));
        }

        assembly {
            r := mload(add(signature, 0x20))
            s := mload(add(signature, 0x40))
            v := byte(0, mload(add(signature, 0x60)))
        }

        if (v < 27) {
            v += 27;
        }

        if (v != 27 && v != 28) {
            return (address(0));
        } else {
            return ecrecover(hash, v, r, s);
        }

    }
    
    // Event
    event claimFileUploaded(string _ipfsHash, string _keywords);

}
