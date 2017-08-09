const Gp = require("geoportal-access-lib")
const GeoportalWfsClient = require('./libs/geoportal-wfs-client')

require('dotenv').config()
const key = process.env.API_KEY
const address = '24 rue de strasbourg armentieres'
const client = new GeoportalWfsClient(key)

const findAddress = (address) => {
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
}

const fetchParcel = (x, y) => {
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
}

findAddress(address).then(address => {
  return address.suggestedLocations[0].position
}).then(position => {
  return fetchParcel(position.x, position.y)
}).then(result => {
  const parcel = result.locations[0].placeAttributes
  console.log('Parcel informations')
  console.log(JSON.stringify(parcel, null, 2))

  var params = {
    code_dep: parcel.department,
    code_com: parcel.commune,
    numero: parcel.number,
    _limit: 1
  };

  client.getFeatures("BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle",params)
    .then(function(featureCollection){
      console.log('\n\nParcel vectors')
      console.log(JSON.stringify(featureCollection, null, 2));
    })
    .catch(function(err){
        console.log(err);
    })
})