const axios = require('axios');
require('dotenv').config()

const getCoords = async (address) => { 
    let coordinates = [];
    const coords = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params:{
            address: address,
            key: process.env.REACT_APP_API_KEY
            }
        })
        const location = coords.data.results[0].geometry.location
        coordinates.push(location.lat)
        coordinates.push(location.lng)
    return coordinates;
}

module.exports = { getCoords };