import React, { Component } from 'react';
import {
  Nav,
  Navbar,
  NavbarBrand,
  NavItem,
  NavLink,
} from 'reactstrap';

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
        <h1> Tus datos personales </h1><h3>Estos son los datos que has autorizado para ser vendidos</h3>

        <label>
            <b>Población</b> 
            <br /> 
            {ownerData.town}
          </label>
          <br /><br />

          <label>
            <b>Edad</b> 
            <br /> 
            {ownerData.age}
          </label>
          <br /><br />

          {ownerData.checkIllness && 
            <React.Fragment>
              <label>
                <b>Enfermedad</b> 
                <br /> 
                {ownerData.illness}
              </label>
              <br /><br />
            </React.Fragment>
          }

          {ownerData.checkAllergy && 
            <React.Fragment>
              <label>
                <b>Alergia</b> 
                <br /> 
                {ownerData.allergy}
              </label>
              <br /><br />
            </React.Fragment>
          }

          {ownerData.checkTreatment && 
            <React.Fragment>
              <label>
                <b>Tratamiento</b> 
                <br /> 
                {ownerData.treatment}
              </label>
              <br /><br />
            </React.Fragment>
          }

          {ownerData.checkLastAppointment && 
            <React.Fragment>
              <label>
                <b>Última cita</b> 
                <br /> 
                {ownerData.lastAppointment}
              </label>
              <br /><br />
            </React.Fragment>
          }

          <label>Ganarás <b><span style={{color: 'blue'}}> {ownerData.eth} ETH </span></b> por la venta de estos datos</label>
      </center></div>
    );
  }
};

export default OwnerData;