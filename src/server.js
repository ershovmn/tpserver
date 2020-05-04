const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const socketIO = require('socket.io')

const http = require('http')

const newGameGem = require('./fieldGenerator')
const Game = require('./modelGame')

const PORT = process.env.PORT || 8000

let app = express()
    .use(cors())
    .use(function(req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        
        // Add this
        if (req.method === 'OPTIONS') {
        
            res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, OPTIONS');
            res.header('Access-Control-Max-Age', 120);
            return res.status(200).json({});
        }
        
        next();
    })
    .get('/', (req, res) => {
        res.send('hello')
    })
    .listen(PORT)

let io = socketIO(app)

mongoose.connect('mongodb+srv://tehnarenok:tehnarenok@cluster0-oi3cn.mongodb.net/test?retryWrites=true&w=majority', 
    { useNewUrlParser: true, useUnifiedTopology: true }, 
    (err)  => {
        if(err) console.log(err)
        else console.log('database active')
    })

io.origins((origin, callback) => {
    callback(null, true);
});

io.on('connection', (socket) => {
    try {
        console.log(socket.id)
        socket.on('gametype', (data) => {
            let gameType = parseInt(data)
            //console.log('data', data)
            Game.findOne({'typeGame' : gameType, 'startGame' : false}, (err, game) => {
                if(err) {
                    //console.log(err)
                    return 
                }
                console.log(game)
                if(game) {
                    Game.findByIdAndUpdate(game.id, {'startGame' : true, 'player2ID' : socket.id}, (err, startedGame) => {
                        if(err) {
                            //console.log(err)
                            return
                        }
                        if(startedGame) {
                            let {game1, game2} = newGameGem(gameType)
                            //console.log(startedGame.player2ID)
                            try {
                                socket.emit('startGame', game2)
                                io.sockets.sockets[startedGame.player1ID].emit('startGame', game1, () => {
                                    //console.log('afhvwgtabfj')
                                })
                            } catch(err) {
                                //console.log(err)
                            }
                        }
                    })
                } else {
                    let createdGame = new Game({player1ID: socket.id, player2ID: null, startGame: false, typeGame: gameType})
                    createdGame.save(() => {
                        socket.send('createdgame', {})
                    })
                }
            })
        })
        socket.on('move', (data) => {
            //console.log('move', socket.id, data)
            Game.findOne({player1ID: socket.id}, (err, game) => {
                if(game) {
                    let idPlayer = game.player2ID
                    //console.log('1', idPlayer)
                    io.sockets.sockets[idPlayer].emit('move', {data: data})
                } else {
                    Game.findOne({player2ID: socket.id}, (err, game1) => {
                        if(game1) {
                            let idPlayer = game1.player1ID
                            //console.log('2', idPlayer)
                            io.sockets.sockets[idPlayer].emit('move', {data: data})
                        }
                    })
                }
            })
        })
        socket.on('gameend', () => {
            Game.findOne({player1ID : socket.id}, (err, game) => {
                if(game) {
                    let idPlayer = game.player2ID
                    try {
                        io.sockets.sockets[idPlayer].emit('gameend')
                    } catch {}
                } else {
                    Game.findOne({player2ID : socket.id}, (err, game1) => {
                        let idPlayer = game.player1ID
                        try {
                            io.sockets.sockets[idPlayer].emit('gameend')
                        } catch {}
                    })
                }
            })
            Game.deleteOne({player1ID: socket.id}, (err, res) => {
                //console.log(err, res)
            })
            Game.deleteOne({player2ID: socket.id}, (err, res) => {
                //console.log(err, res)
            })
        })
        socket.on('disconnect', () => {
            console.log('deetet', socket.id)
            Game.deleteOne({player1ID: socket.id}, (err, res) => {
                //console.log(err, res)
            })
            Game.deleteOne({player2ID: socket.id}, (err, res) => {
                //console.log(err, res)
            })
            //console.log('disconnect')
        })
    } catch(err) {

    }
})
