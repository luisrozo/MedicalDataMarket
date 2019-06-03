import ipfs from './../ipfs';

export function retrieveData(userHash) {

    return ipfs.get(userHash)
        .then(function(files) {
            files.forEach((file) => {
                var patientIPFS = JSON.parse(file.content);
      
                var owner = {
                  town: patientIPFS.town,
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
        town: "",
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