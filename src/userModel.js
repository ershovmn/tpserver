const mongoose = require('mongoose')

const Schema = mongoose.Schema

let user = new Schema({
    sockeID: {type: String},
    userName: {type: String},
})

module.exports = mongoose.model('User', user)