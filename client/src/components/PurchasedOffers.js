import React, { Component } from "react";
import Web3 from 'web3';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import ipfs from './../ipfs';
import {
    Nav,
    Navbar,
    NavbarBrand,
    NavItem,
    NavLink,
    } from 'reactstrap';

import styles from './navbarStyle';

class PurchasedOffers extends Component {

    state = {
        web3: null,
        account: '',
        offers: [],
        printTable: false,
        usersData: [],
        printRecordTable: false,
        scheme: ''
    }

    getProps=() => {
        return {
            style: {
                marginBottom: "50px",
                marginRight: "250px",
                marginLeft: "250px",
                marginTop: "50px"
            }
        }
      }

    componentWillMount = async () => {
        document.title = "Medical Data Market - Ofertas compradas";
        const web3 = new Web3(Web3.givenProvider || "http://localhost:3000");
        const accounts = await web3.eth.getAccounts();

        this.setState({ web3, account: accounts[0] }, () => { this.loadCustomerOffers(); });
    }

    loadCustomerOffers() {
        let customersOffers = JSON.parse(localStorage.getItem('customersOffers'));
        let offersGotByCustomer = [];

        if(customersOffers !== null && this.state.account in customersOffers) {
            offersGotByCustomer = customersOffers[this.state.account];
        }

        let offers = JSON.parse(localStorage.getItem("offers"));
        let customerOffers = [];

        for(var i = 0; i < offersGotByCustomer.length; i++) {
            let offer = offers.filter(offer => offer.id === offersGotByCustomer[i])[0];
            customerOffers.push(offer);
        }

        this.setState({ offers: customerOffers, printTable: true });
    }

    loadRecords(offerId) {
        this.setState({ printRecordTable: false, selectedOfferId: offerId });

        let patientHashes = JSON.parse(localStorage.getItem("patientHashes"));
        let offerSelected = JSON.parse(localStorage.getItem("offers")).filter(offer => offer.id === offerId)[0];
        let accountsDataToPrint = offerSelected.accounts;

        let usersData = [];

        for(var i = 0; i < accountsDataToPrint.length; i++) {
            let currentAccount = accountsDataToPrint[i];
            let currentIPFS = patientHashes[currentAccount].hash;

            ipfs.get(currentIPFS, function(err, files) {
                files.forEach((file) => {
                    let data = JSON.parse(file.content);
                    usersData.push(data);

                    if(usersData.length === accountsDataToPrint.length) {
                        this.setState({ scheme: patientHashes[currentAccount].scheme, usersData, printRecordTable: true });
                    }

                });
            }.bind(this));

        }
    }

    getColumns() {
        let scheme = this.state.scheme;

        let userColumns = [
            {
                Header: "Población",
                accessor: "poblacion",
            },
            {
                Header: "Edad",
                accessor: "edad"
            }
        ];

        if(scheme.includes("enfermedad")) {
            userColumns.push({ Header: "Enfermedad", accessor: "enfermedad", filterable: true });
        }
        if(scheme.includes("tratamiento")) {
            userColumns.push({ Header: "Tratamiento", accessor: "tratamiento", filterable: true });
        }
        if(scheme.includes("alergia")) {
            userColumns.push({ Header: "Alergia", accessor: "alergia", filterable: true });
        }
        if(scheme.includes("ultimacita")) {
            userColumns.push({ Header: "Última cita", accessor: "ultimacita", filterable: true });
        }

        return userColumns;
    }

    getRecordsRows() {
        let data = [];

        for(var i = 0; i < this.state.usersData.length; i++) {
            
            let dataValue = {
                poblacion: this.state.usersData[i].town,
                edad: this.state.usersData[i].age
            }

            if(this.state.usersData[i].checkIllness) {
                dataValue['enfermedad'] = this.state.usersData[i].illness;
            }
            if(this.state.usersData[i].checkTreatment) {
                dataValue['tratamiento'] = this.state.usersData[i].treatment;
            }
            if(this.state.usersData[i].checkAllergy) {
                dataValue['alergia'] = this.state.usersData[i].allergy;
            }
            if(this.state.usersData[i].checkLastAppointment) {
                dataValue['ultimacita'] = this.state.usersData[i].lastAppointment;
            }

            data.push(dataValue);

        }

        return data;
    }

    render() {
        let hasOffersToShow = true;

        if(this.state.offers.length === 0) {
            hasOffersToShow = false;
        } else {
            var offersColumns = [];
            var data = [];

            if(this.state.printTable) {
                offersColumns = [
                    {
                        Header: "Esquema",
                        accessor: "esquema",
                        filterable: true,
                    },
                    {
                        Header: "Núm. Registros",
                        accessor: "numReg",
                        filterable: true,
                    },
                    {
                        Header: "Precio (ETH)",
                        accessor: "precio",
                        filterable: true,
                    }
                ]
                
                for (var i = 0; i < this.state.offers.length; i++) {
                    let dataValue = {
                        id: this.state.offers[i].id,
                        esquema: this.state.offers[i].esquema,
                        numReg: this.state.offers[i].accounts.length,
                        precio: this.state.offers[i].precio
                    }
                    data.push(dataValue);
                }
            }
            
            var recordsColumns = [];
            var recordsData = [];

            if(this.state.printRecordTable) {
                recordsColumns = this.getColumns();
                recordsData = this.getRecordsRows();
            }
        }

        let profits = JSON.parse(localStorage.getItem("usersProfit"));
        let userProfit = 0;
        if(profits !== null && this.state.account in profits) {
            userProfit = profits[this.state.account];
        }
        
        return (
            <div>
                <Navbar style={styles.navBarStyle} color="dark" light expand="md">
                    <NavbarBrand style={styles.navBarBrandStyle} href="/ownerData">Medical Data Market</NavbarBrand>
                    <Nav className="ml-auto" navbar>
                        <NavItem>
                            <NavLink disabled style={styles.navBarProfitStyle}><i>Tu beneficio: {userProfit} ETH</i></NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink style={styles.navBarTextStyle} href="/ownerData">Mis datos</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink style={styles.navBarTextStyle} href="/buyOffers">Comprar Ofertas</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink disabled style={styles.navBarSelectedTextStyle} href="/purchasedOffers">Ver ofertas compradas</NavLink>
                        </NavItem>
                    </Nav>
                </Navbar>
                <center>
                <h1>Tus ofertas</h1>

                { hasOffersToShow ?
                   <React.Fragment>
                       <h3>Estas son las ofertas que has comprado</h3>
                        <h5><i>Haz click en una fila para ver los registros de una oferta</i></h5> 

                        { this.state.printTable ?
                            <React.Fragment>
                                <ReactTable
                                    columns={offersColumns}
                                    data={data}
                                    showPagination={false}
                                    minRows={0}
                                    getProps={this.getProps}
                                    defaultFilterMethod={ (filter, row, column) => {
                                        const id = filter.pivotId || filter.id
                                        return row[id] !== undefined ? String(row[id]).includes(filter.value) : true
                                    }}
                                    getTdProps={(state, rowInfo, column, instance) => {
                                        return {
                                        onClick: (e, handleOriginal) => {
                                            this.loadRecords(rowInfo.original.id)
                                        }
                                        }
                                    }}
                                    noDataText='No existen ofertas que mostrar'
                                    getTrProps={(state, rowInfo, column) => {
                                        return {
                                        style: {
                                            background: rowInfo.original.id === this.state.selectedOfferId ? 'lightcyan' : 'white'
                                        }
                                        }
                                    }}
                                    >
                                </ReactTable>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <i>Cargando ofertas compradas...</i>
                            </React.Fragment>
                        }

                        { this.state.printRecordTable ? 
                            <React.Fragment>
                                <h4>Registros de la oferta seleccionada: </h4>
                                <ReactTable
                                    columns={recordsColumns}
                                    data={recordsData}
                                    showPagination={false}
                                    minRows={0}
                                    getProps={this.getProps}
                                    >
                                </ReactTable>
                            </React.Fragment>
                            :
                            <React.Fragment>
                                <h5><i>Selecciona una fila para ver aquí los registros:</i></h5>
                            </React.Fragment>
                        }
                   </React.Fragment> 
                    :
                    <React.Fragment>
                        <h3>Aún no has comprado ninguna oferta. </h3>
                        <h5>Haz click <a href="/buyOffers">aquí</a> para comprar ofertas.</h5>
                    </React.Fragment>
                }
                
            </center></div>
        );
    }
}

export default PurchasedOffers;