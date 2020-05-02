const mongoose = require('mongoose')

const Schema = mongoose.Schema

const game = new Schema({
    typeGame: {type: Number},
    player1ID: {},
    player2ID: {},
    startGame: {type: Boolean}
})

module.exports = mongoose.model('Game', game)