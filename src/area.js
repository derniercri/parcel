String.prototype.format = function () {
    var args = [].slice.call(arguments);
    return this.replace(/(\{\d+\})/g, function (a){
        return args[+(a.substr(1,a.length-2))||0];
    });
};

const queryString = "SELECT ST_Area(ST_Transform(the_geom,26986)) As sqm FROM (SELECT ST_GeomFromText('POLYGON(({0}))',2249) ) As foo(the_geom);"

const query = (points) => queryString.format(pointsToString(points))
const pointsToString = (points) => points.reduce((acc, point) => { return `${acc}, ${pointToString(point)}`}, '').replace(', ', '')
const pointToString = (point) => `${point[0]} ${point[1]}`
const getArea = (client, area) => client.query(query(area)).then(res => res.rows[0].sqm)

module.exports = (client) => (area) => getArea(client, area)