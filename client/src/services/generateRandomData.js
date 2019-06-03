import { initOwner } from './retrieveOwnerData';

export function generateData() {    

    var Mockaroo = require('mockaroo');
    var client = new Mockaroo.Client({
        apiKey: 'a4d41710'
    });

    return client.generate({
        count: 1,
        fields: [{
            name: 'town',
            type: 'City'
        }, {
            name: 'age',
            type: 'Number',
            min: 20,
            max: 70
        }, {
            name: 'illness',
            type: 'Custom List',
            values: ['Urticaria', 'Cicatriz', 'Fibromatosis', 'Infección', 'Fístula', 'Intoxicación', 'Pólipo', 'Quiste', 'Úlcera']
        }, {
            name: 'treatment',
            type: 'Custom List',
            values: ['Antihistamínicos', 'Corticoides', 'Povidona yodada', 'Radioterapia', 'Amoxicilina - Ácido clavulánico', 'Gasometría', 'Cirujía']
        }, {
            name: 'allergy',
            type: 'Custom List',
            values: ['Ninguna', 'Cinc', 'Suero', 'Etanol', 'Látex', 'Nefopam', 'Estriol', 'Hierro', 'Oxazepam', 'Propofol', 'Aspirina']
        }, {
            name: "lastAppointment",
            type: 'Date',
            min: '01/01/2017',
            max: '12/31/2018',
            format: '%d/%m/%y'
        }]
    }).then(function(record) {

        var patient = initOwner();

        patient.town = record.town;
        patient.age = parseInt(record.age);
        patient.illness = record.illness;
        patient.treatment = record.treatment;
        patient.allergy = record.allergy;
        patient.lastAppointment = record.lastAppointment;
        patient.eth = 1;

        return patient;

    });      
}