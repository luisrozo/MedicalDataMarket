import React, { Component } from 'react';
import { NavLink } from 'react-router-dom';

class OwnerData extends Component {

  render() {
    const ownerData = JSON.parse(localStorage.getItem('ownerData'));
    return (
      <div>
        <NavLink to="/buyOffers">Comprar ofertas</NavLink><br />
        <NavLink to="/purchasedOffers">Ver ofertas compradas</NavLink>
        <center>
        <h1> Tus datos personales </h1><h3>Estos son los datos que has autorizado para ser vendidos</h3>

        <label>
            <b>Nombre</b> 
            <br /> 
            {ownerData.name}
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