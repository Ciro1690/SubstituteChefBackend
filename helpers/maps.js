require('dotenv').config()
const fetch = require("node-fetch")

const getCoords = async (address) => { 
    let coordinates = [];
    await fetch('https://maps.googleapis.com/maps/api/geocode/json?' + new URLSearchParams({
        address: address,
        key: process.env.REACT_APP_API_KEY,
    }))
    .then(response => response.json())
        .then(data => {
            coordinates.push(data.results[0].geometry.location.lat)
            coordinates.push(data.results[0].geometry.location.lng)
        })
    return coordinates;
}

module.exports = { getCoords };