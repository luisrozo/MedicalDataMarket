import ipfs from './../ipfs';

export function retrieveData(userHash) {

    // ipfs.get(userHash, function (err, files) {
        // files.forEach((file) => {
        //   var patientIPFS = JSON.parse(file.content);

        //   var owner = {
        //     name: patientIPFS.name,
        //     age: patientIPFS.age,
        //     illness: patientIPFS.illness,
        //     checkIllness: patientIPFS.checkIllness,
        //     treatment: patientIPFS.treatment,
        //     checkTreatment: patientIPFS.checkTreatment,
        //     allergy: patientIPFS.allergy,
        //     checkAllergy: patientIPFS.checkAllergy,
        //     lastAppointment: patientIPFS.lastAppointment,
        //     checkLastAppointment: patientIPFS.checkLastAppointment,
        //     eth: patientIPFS.eth
        //   }
          
          //return owner;

    //     })
    // });

    return ipfs.get(userHash)
        .then(function(files) {
            files.forEach((file) => {
                var patientIPFS = JSON.parse(file.content);
      
                var owner = {
                  name: patientIPFS.name,
                  age: patientIPFS.age,
                  illness: patientIPFS.illness,
                  checkIllness: patientIPFS.checkIllness,
                  treatment: patientIPFS.treatment,
                  checkTreatment: patientIPFS.checkTreatment,
                  allergy: patientIPFS.allergy,
                  checkAllergy: patientIPFS.checkAllergy,
                  lastAppointment: patientIPFS.lastAppointment,
                  checkLastAppointment: patientIPFS.checkLastAppointment,
                  eth: patientIPFS.eth
                }
                return owner;

            })
        });

    
}

export function initOwner() {

    var owner = {
        name: "",
        age: 0,
        illness: "",
        checkIllness: false,
        treatment: "",
        checkTreatment: false,
        allergy: "",
        checkAllergy: false,
        lastAppointment: "",
        checkLastAppointment: false,
        eth: 0
    }

    return owner;
}