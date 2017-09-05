const Gp = require("geoportal-access-lib")
const GeoportalWfsClient = require('./../libs/geoportal-wfs-client')

module.exports = key => {
    const client = new GeoportalWfsClient(key)
    
    return {
        findAddress: (address) => {
            return new Promise((resolve,reject) => {
                Gp.Services.autoComplete({
                    apiKey : key,
                    text : address,      
                    filterOptions : {
                        type : ["StreetAddress"]
                    },
                    onSuccess : (result) => {
                        resolve(result)
                    },
                    onFailure: (err) => {
                        reject(err)
                    }
                })
            })
        },
        fetchParcelInfo: (x, y) => {
            return new Promise((resolve, reject) => {
                Gp.Services.reverseGeocode({
                    apiKey : key, 
                    position : { 
                        x,
                        y
                    },
                    filterOptions : {
                        type : ["CadastralParcel"]
                    },
                    onSuccess:  (result) => {
                        resolve(result)
                    },
                    onFailure: (err) => {
                        reject(err)
                    }
                })
            })
        },
        fetchParcelVectors: (dep, city, number, section, sheet) => {
            return client.getFeatures(
                'BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle',
                {
                    code_dep: dep,
                    code_com: city,
                    numero: number,
                    section: section,
                    feuille: sheet,
                    _limit: 10
                }
            )
        },
        /*fetchBuildingsVectors: () => {
            return client.getFeatures(
                'ADRESSE-PREMIUM.LIEN.PARCELLE:lien_adresse_parcelle',
                {
                    _limit: 10
                }
            )
        }*/
        fetchBuildingsVectors: (bbox) => {
            return client.getFeatures(
                'BDTOPO_BDD_WLD_WGS84G:bati_remarquable,BDTOPO_BDD_WLD_WGS84G:bati_indifferencie',
                {
                    bbox: `${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}`,
                    _limit: 10
                }
            )
        }
    }
}