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

const fetchParcelInfo = (x, y) => {
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

client.getTypeNames()
.then(function(typeNames){
    console.log(typeNames);
})
.catch(function(err){
    console.log(err);
})

const fetchParcelVectors = (dep, city, number, section, sheet) => {
  return client.getFeatures('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:parcelle',
    {
      code_dep: dep,
      code_com: city,
      numero: number,
      section: section,
      feuille: sheet,
      _limit: 10
    }
  )
}

const fetchBuildingsVectors = (dep, city, number) => {
  return client.getFeatures('BDPARCELLAIRE-VECTEUR_WLD_BDD_WGS84G:batiment',
    {
      code_dep: dep,
      code_com: city,
      numero: number,
      section: section,
      feuille: sheet,
      _limit: 10
    }
  )
}

findAddress(address).then(address => {
  return address.suggestedLocations[0].position
}).then(position => {
  return fetchParcelInfo(position.x, position.y)
}).then(result => {
  const parcel = result.locations[0].placeAttributes
  console.log('Parcel informations')
  console.log(JSON.stringify(parcel, null, 2))

  fetchParcelVectors(parcel.department, parcel.commune, parcel.number, parcel.section, parseInt(parcel.sheet)).then(featureCollection => {
    console.log('\n\nParcel vectors')
    console.log(JSON.stringify(featureCollection, null, 2));
  })

  fetchBuildingsVectors(parcel.department, parcel.commune, parcel.number).then(featureCollection => {
    console.log('\n\nBuildings vectors')
    console.log(featureCollection);
  })
})