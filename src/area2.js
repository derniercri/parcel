const turf = require('@turf/turf')

module.exports = (rawPolygones) => turf.area(turf.polygon(rawPolygones))