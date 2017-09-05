const { Client } = require('pg')
const GpClient = require('./geoportail')
const areaCompute = require('./area2')
var geojsonArea = require('geojson-area')
const turf = require('@turf/turf')

const bbox = (pointsRaw) => turf.bbox(turf.lineString(pointsRaw))

require('dotenv').config()
const key = process.env.API_KEY
const pg = new Client(process.env.POSTGRES)
const address = '24 rue de strasbourg armentieres'

pg.connect().then(()=> console.log(`connected`));
//const getArea = require('./area')(pg);
const gpClient = GpClient(key)

//coordist.distance({x:2.5, y:3.4}, {x:7.12, y:8}, true)
gpClient.findAddress(address).then(address => {
  return address.suggestedLocations[0].position
}).then(position => {
  return gpClient.fetchParcelInfo(position.x, position.y)
}).then(result => {
  const parcel = result.locations[0].placeAttributes
  console.log(JSON.stringify(result.locations[0], null, 2))
  console.log(`Parcel number ${JSON.stringify(parcel)}`)

  gpClient.fetchParcelVectors(parcel.department, parcel.commune, parcel.number, parcel.section, parseInt(parcel.sheet)).then(featureCollection => {
    const area = featureCollection.features[0].geometry.coordinates[0]
    const parcelFeature = featureCollection.features[0]
    gpClient.fetchBuildingsVectors(bbox(area[0])).then((collection) => {
      return collection.features.filter(feature => turf.intersect(parcelFeature, feature))
    }).then(batiments => console.log(JSON.stringify(batiments, null, 2)))
  })
})