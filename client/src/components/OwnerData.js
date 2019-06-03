import React, { Component } from 'react';
import {
    Nav,
    Navbar,
    NavbarBrand,
    NavItem,
    NavLink,
} from 'reactstrap';

import { Col, Row, Form, FormGroup, Label, Input, Jumbotron } from 'reactstrap';

import styles from './navbarStyle';

class OwnerData extends Component {

    componentDidMount() {
        document.title = "Medical Data Market - Mis datos";
    }

    render() {
        const ownerData = JSON.parse(localStorage.getItem('ownerData'));
        const account = localStorage.getItem("account");

        let profits = JSON.parse(localStorage.getItem("usersProfit"));
        let userProfit = 0;
        if(profits !== null && account in profits) {
            userProfit = profits[account];
        }

        const formStyle = {
            width: "700px",
        }

        const colStyle = {
            textAlign: "left",
            fontSize: "150%"
        }

        const inputStyle = {
			border: "none",
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
                    <NavLink disabled style={styles.navBarSelectedTextStyle} href="/ownerData">Mis datos</NavLink>
                    </NavItem>
                    <NavItem>
                    <NavLink style={styles.navBarTextStyle} href="/buyOffers">Comprar Ofertas</NavLink>
                    </NavItem>
                    <NavItem>
                    <NavLink style={styles.navBarTextStyle} href="/purchasedOffers">Ver ofertas compradas</NavLink>
                    </NavItem>
                </Nav>
            </Navbar>
            <center>
            <h2> Tus datos personales </h2><h4>Estos son los datos que has autorizado para ser vendidos</h4><br />

            <Form style={formStyle} id="data" className="scep-form" >
                <Row form>
                    <Col style={colStyle} md={6}>
                        <FormGroup>
                            <Label>Población</Label>
                            <Input style={inputStyle} readOnly size="60" name="town" type="text" value={ownerData.town} />
                        </FormGroup>
                    </Col>
                    <Col style={colStyle} md={6}>
                        <FormGroup>
                            <Label>Edad</Label>
                            <Input style={inputStyle} readOnly size="60" name="age" type="text" value={ownerData.age} />
                        </FormGroup>
                    </Col>
                </Row>

                {ownerData.checkIllness && 
                <React.Fragment>
                    <FormGroup style={colStyle}>
                        <Label>Enfermedad</Label>
                        <Input style={inputStyle} readOnly size="60" name="illness" type="text" value={ownerData.illness} />
                    </FormGroup>
                </React.Fragment>
                }

                {ownerData.checkTreatment && 
                <React.Fragment>
                    <FormGroup style={colStyle}>
                        <Label>Tratamiento</Label>
                        <Input style={inputStyle} readOnly size="60" name="treatment" type="text" value={ownerData.treatment} />
                    </FormGroup>
                </React.Fragment>
                }

                {ownerData.checkAllergy && 
                <React.Fragment>
                    <FormGroup style={colStyle}>
                        <Label>Alergia</Label>
                        <Input style={inputStyle} readOnly size="60" name="allergy" type="text" value={ownerData.allergy} />
                    </FormGroup>
                </React.Fragment>
                }

                {ownerData.checkLastAppointment && 
                <React.Fragment>
                    <FormGroup style={colStyle}>
                        <Label>Última cita</Label>
                        <Input style={inputStyle} readOnly size="60" name="lastAppointment" type="text" value={ownerData.lastAppointment} />
                    </FormGroup>
                </React.Fragment>
                }

            </Form>

            <Jumbotron style={{ borderStyle: "groove", width: "700px" }}>
                <p className="lead">Ganarás</p>
                <h1 className="display-4" style={{color: 'blue'}}>{ownerData.eth || 0} Ether</h1>
                <p className="lead">cada vez que un usuario compre una oferta que contenga tus datos.</p>
            </Jumbotron>

            </center></div>
        );
    }
};

export default OwnerData;