import React, { Component } from "react";
import { NavLink } from 'react-router-dom';

class PurchasedOffers extends Component {

    render() {
        return (
            <div>
                <NavLink to="/ownerData">Tus datos</NavLink><br />
                <NavLink to="/buyOffers">Comprar ofertas</NavLink>
            </div>
        );
    }
}

export default PurchasedOffers;