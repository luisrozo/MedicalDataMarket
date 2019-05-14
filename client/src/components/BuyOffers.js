import React, { Component } from "react";
import { NavLink } from 'react-router-dom';
import Web3 from 'web3'
import IPFSInboxContract from "./../IPFSInbox.json";
import truffleContract from "truffle-contract";
import ipfs from './../ipfs';
import { Container, Row, Col } from 'reactstrap';
import OfferCard from './OfferCard';

class BuyOffers extends Component {

    state = {
        web3: null,
        account: '',
        contract: null,
        filterIllness: false,
        filterTreatment: false,
        filterAllergy: false,
        filterLastAppointment: false,
        claimFiles: [],
        offerFiles: [],
        filteredOffers: [],
        offersChain: [],
        printOffers: false,
        filterOffers: false,

    }

    handleFilterChange = this.handleFilterChange.bind(this);
    selectOffer = this.selectOffer.bind(this);

    selectOffer(offer) {
        let filters = [];

        if(this.state.filterIllness) {
            filters.push('enfermedad');
        }
        if(this.state.filterTreatment) {
            filters.push('tratamiento');
        }
        if(this.state.filterAllergy) {
            filters.push('alergia');
        }
        if(this.state.filterLastAppointment) {
            filters.push('ultimacita');
        }

        let offerScheme = offer.esquema.split(',');
        let intersection = filters.filter(value => offerScheme.includes(value));

        return intersection.length > 0;
    }

    handleFilterChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({ [name]: value, printOffers: false }, () => {
            
            let offers = this.state.offersChain.filter(this.selectOffer);
            this.setState({ filteredOffers: offers, printOffers: true });

        });

    }

    componentWillMount = async () => {
        this.loadBlockchainData();
    }
    
    async loadBlockchainData() {
        const web3 = new Web3(Web3.givenProvider || "http://localhost:3000");
        const accounts = await web3.eth.getAccounts();

        const Contract = truffleContract(IPFSInboxContract);
        Contract.setProvider(web3.currentProvider);
        const instance = await Contract.deployed();

        this.setState({ web3, account: accounts[0], contract: instance }, () => { this.loadOffers("all"); });
    }

    loadOffers = async (schemeDataToLoad) => {
        let contract = this.state.contract;
        this.setState({ printOffers: false });
        let offers = JSON.parse(localStorage.getItem('offers'));

        if(schemeDataToLoad !== "all") {
            //filtrar offers
        }

        let offersChain = [];

        for(var i = 0; i < offers.length; i++) {
            contract.getOfferById(i, { from: this.state.account })
                .then(claimFileHash => {
                    
                    ipfs.get(claimFileHash, function(err, files) {
                        files.forEach((file) => {
                            let claimFile = JSON.parse(file.content);

                            ipfs.get(claimFile.offerFileIPFS, function(err, files) {
                                files.forEach((file) => {
                                    let offerFile = JSON.parse(file.content);
                                    offersChain.push(offerFile);

                                    if(offersChain.length === offers.length) {
                                        this.setState({ offersChain, printOffers: true });
                                    }
                                })
                            }.bind(this))                            
                        });
                    }.bind(this));

                });
        }
    }

    async buyOffer(id) {
        console.log("clicked button offer id: ", id)

        let offer = this.state.offersChain.filter(offer => offer.id === id)[0];
        let contract = this.state.contract;

        let offers = JSON.parse(localStorage.getItem('offers'));

        console.log("oferta clickada: ", offer);

        let userWei = await this.state.web3.eth.getBalance(this.state.account);
        let userEther = await this.state.web3.utils.fromWei(userWei, 'ether')
        
        if(userEther < offer.precio) {
            alert("No puedes comprar la oferta, necesitas más Ether")
        } else {

            let weiToPass = offer.precio * 1000000000000000000;
            let usersToReceiveEth = offers.filter(offer => offer.id === id)[0].accounts;

            contract.send(this.state.account, usersToReceiveEth, { from: this.state.account, value: weiToPass });

            let customersOffers = JSON.parse(localStorage.getItem('customersOffers'));
            if(customersOffers == null) {
                customersOffers = {}
            }

            if(customersOffers[this.state.account] == null) {
                customersOffers[this.state.account] = [id];
            } else {
                customersOffers[this.state.account].push(id);
            }

            localStorage.setItem('customersOffers', JSON.stringify(customersOffers));

        }
    }

    isOffersFiltered() {
        return this.state.filterIllness || this.state.filterTreatment || this.state.filterAllergy || this.state.filterLastAppointment;
    }

    render() {
        let offers = [];

        if(this.state.printOffers) {
            offers = this.isOffersFiltered() ? this.state.filteredOffers : this.state.offersChain;
        }        

        let offerCards = offers.map(offer => {
            return (
              <Col key={offer.id} sm="4">
                <OfferCard key={offer.id} buyOffer={this.buyOffer.bind(this)} offer={offer} />
              </Col>
            )
        })

        return (
            <div>
                <NavLink to="/ownerData">Tus datos</NavLink><br />
                <NavLink to="/purchasedOffers">Ver ofertas compradas</NavLink>

                <center>
                    <h1>Ofertas</h1>

                    <h3>Puedes filtrar las ofertas según el esquema deseado:</h3>
                    <label>
                        Enfermedad <input name="filterIllness" type="checkbox" checked={this.state.filterIllness || false} onChange={this.handleFilterChange} />
                        ·
                    </label>
                    <label>
                        Tratamiento <input name="filterTreatment" type="checkbox" checked={this.state.filterTreatment || false} onChange={this.handleFilterChange} />
                        ·
                    </label>
                    <label>
                        Alergia <input name="filterAllergy" type="checkbox" checked={this.state.filterAllergy || false} onChange={this.handleFilterChange} />
                        ·
                    </label>
                    <label>
                        Última cita <input name="filterLastAppointment" type="checkbox" checked={this.state.filterLastAppointment || false} onChange={this.handleFilterChange} />
                    </label>

                    { this.state.printOffers ? 
                        <React.Fragment>
                            <Container fluid>
                                <Row>
                                    {offerCards}
                                </Row>
                            </Container>
                        </React.Fragment>
                        :
                        <React.Fragment>
                            <p><i>Cargando ofertas...</i></p>
                        </React.Fragment>
                    }
                    
                </center>
            </div>

        );
    }
}

export default BuyOffers;