# Medical Data Market

Esta aplicación descentralizada (dApp) está basada en **Ethereum**, **IPFS** y **React**. Consiste en que los usuarios permitan la venta de sus datos médicos, además de que estos mismos compren lotes de datos de otros usuarios. La moneda utilizada es el **Ether**.

Este proyecto se ha realizado como Trabajo Fin de Grado para el Grado en Ingeniería Informática de la Universidad de Cádiz.

![Tecnologías involucradas](https://i.imgur.com/JGqOsjq.png)

## En qué consiste

La aplicación simula un entorno clínico, donde una entidad (_custodian_) tiene registrada información clínica de sus pacientes (_owner_). Los _owner_ deciden, de todos sus datos clínicos, cuáles se pueden poner a la venta en la aplicación y cuáles no. Entonces, la entidad _custodian_ puede crear lotes de datos (_ofertas_) con los datos validados por los _owner_; estas ofertas serán vendidas en la aplicación.

Los usuarios (_customer_) pueden comprar esas ofertas, gastándose Ether, que se repartirán entre todos los usuarios que tuvieran sus datos en las ofertas compradas. Al comprar una oferta, los _customer_ tendrán acceso a todos los registros contenidos en la misma.

Todo esto, guardando la información en IPFS y las ofertas en una cadena de bloques Ethereum.

## Cómo se guarda la información

Al crear una oferta la entidad _custodian_, esta se sube a IPFS, resultando un _hash criptográfico_. Ese _hash_, junto a la firma de la entidad _custodian_, conforman un _claim file_, el cual también se sube a IPFS. El _hash_ de este fichero es lo que finalmente se sube a la cadena de bloques, junto con unos metadatos que dan información sobre los registros que aglutina la oferta.

![Proceso de subida de ofertas a blockchain](https://i.imgur.com/ZOde8BB.png)

## ¿Por qué IPFS?
El uso de IPFS permite abaratar considerablemente los costes de almacenamiento de información en la cadena de bloques Ethereum. Se utilizan 20.000 de gas para 256 bit/8 bytes (una palabra). Cada gas cuesta 4 gwei. Realizando cálculos:

-   20.000 gas por una transacción de 8 bytes x 4 gwei/gas = 80.000 gwei para 8 bytes.

-   80.000 gwei para 8 bytes x 1000bytes/8 = 10.000.000 gwei/kB = .01 Ether.

-   .01 Ether/kB x 1000kB = 10 Ether para almacenar 1Mb, costando unos 164€ cada Ether, costaría 1.640€.

Con estos cálculos, se puede observar como almacenar 1GB, en una cadena de bloques de Ethereum, costaría **1.640.000€**.

Por tanto, subiendo la información a IPFS y almacenando en la cadena de bloques únicamente el _hash criptográfico_, el espacio ahorrado es indispensable.

## Instalación

  

Para poder usar la aplicación, será necesario instalar todo lo que necesita la misma para funcionar, dentro de un sistema operativo basado en Linux:

  

-  **Navegador web** que permita el uso de almacenamiento local (*local storage*) y el uso de la extensión MetaMask. Se recomienda usar Google Chrome.

  

-  **NodeJS** (versión 8.9.4 o posterior) como gestor de paquetes.

  

-  **Ganache**. Este programa crea una cadena de bloques Ethereum de prueba cada vez que se abre, proporcionando hasta 10 cuentas distintas con 100 ETH de prueba cada una. Será la cadena de bloques sobre la que corra la aplicación.

  

-  **MetaMask**. Esta extensión de navegador web permite conectar una cadena de bloques con el navegador, permitiendo la interacción entre aplicación y cadena de bloques. Además, es necesario importar la red creada por Ganache (normalmente en la dirección http://127.0.0.1:7545), así como las cuentas Ethereum que se deseen usar en la aplicación.

  

-  **Truffle**. Para descargar el framework de desarrollo de contratos inteligentes, bastará con escribir en una consola de comandos: 
```bash
npm install -g truffle
```

Una vez instalado todo lo anterior, hay que descargar la aplicación clonando o descargando este repositorio.  

Es importante elegir una cuenta de las que ofrece MetaMask para que actúe como custodian en la aplicación. Para ello, basta con copiar la dirección de una de las cuentas y pegarla en los siguientes ficheros de la carpeta */client/src*:

-   App.js, línea 31. Con mayúsculas y minúsculas igual que en Ganache.
    
-   Dentro de la carpeta indicada, en la carpeta */components*, en el fichero BuyOffers.js, línea 35. Todas las letras en minúsculas.

Una vez hecho todo lo anterior, será necesario seguir los siguientes pasos:  

1.  Abrir Ganache.
    
2.  Abrir una terminal en la carpeta raíz del proyecto.
    
3.  Desplegar el contrato inteligente mediante los siguientes comandos: 
```bash
truffle compile
truffle migrate
```
    
4.  Copiar el fichero *IPFSInbox.json* generado en la carpeta */build/contracts* y pegarlo en la carpeta */client/src*.
    
5.  Abrir la carpeta */client* en una terminal.
    
6.  Instalar dependencias necesarias con el comando:
```bash
sudo npm install
```    
7.  Iniciar la aplicación con el comando:
```bash
sudo npm start
```
Si MetaMask ya está sincronizado con Ganache, y se han importado las cuentas, será cuestión de acceder a la dirección [localhost:3000](http://localhost:3000) para acceder a la aplicación.
