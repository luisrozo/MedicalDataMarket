pragma solidity ^0.5.0;

import "truffle/Assert.sol";
import "truffle/DeployedAddresses.sol";
import "../contracts/IPFSInbox.sol";

contract InboxTest {

    function testAddingNewOffer() public {
        IPFSInbox inbox = IPFSInbox(DeployedAddresses.IPFSInbox());

        string memory ipfsHashExpected = "QmRQxDJFDVRSPeLn1WZcWV4L6tXap9bkQRg5bdpE5hbXH2";
        string memory keywords = "64572001,276239002,";

        uint previousNumOffers = inbox.getNumOffers();

        inbox.newOffer(ipfsHashExpected, keywords);

        string memory ipfsHash = inbox.getOfferById(0);
        uint newNumOffers = inbox.getNumOffers();

        Assert.equal(ipfsHashExpected, ipfsHash, "IPFS hash must match");
        Assert.equal(0, previousNumOffers, "Contract must stock 0 offers after deployed");
        Assert.equal(1, newNumOffers, "Contract must stock 1 offers after create first offer");
    }
    
}