import ipfs from './../ipfs';

export function getOffer(claimHash) {

    ipfs.get(claimHash).then((files)  => {

        files.forEach((file) => {

            let claimFile = JSON.parse(file.content);
            return claimFile.offerFileIPFS;

        });

    });
}