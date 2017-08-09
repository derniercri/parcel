const Gp = require("geoportal-access-lib")
const GeoportalWfsClient = require('./libs/geoportal-wfs-client')

require('dotenv').config()
const key = process.env.API_KEY
const username = process.env.USER
const password = process.env.PASSWORD
const referer = process.env.REFERER
const address = '24 rue de strasbourg armentieres'

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

var client = new GeoportalWfsClient(key,{})

client.getTypeNames()
.then((typeNames) => {
    console.log(typeNames);
})
.catch((err) =>{
    console.log(err);
})

findAddress(address).then(address => {
  return address.suggestedLocations[0].position
}).then(position => {
  return fetchParcel(position.x, position.y)
}).then(result => {
  console.log(JSON.stringify(result.locations[0], null, 2))
})