const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const io = require('socket.io').listen(8000)

const newGameGem = require('./fieldGenerator')
const Game = require('./modelGame')
const User = require('./userModel')

let app = express()

mongoose.connect('mongodb+srv://tehnarenok:tehnarenok@cluster0-oi3cn.mongodb.net/test?retryWrites=true&w=majority', 
    { useNewUrlParser: true, useUnifiedTopology: true }, 
    (err)  => {
        if(err) console.log(err)
        else console.log('database active')
    })

app.get('/', (req, res) => {
    res.send('Hello')
})

io.set('log level', 1);

io.sockets.on('connection', (socket) => {
    console.log(socket.id)
    socket.on('myname', (data) => {
        console.log(data)
        User.findOne({userName : data}, (err, user) => {
            if(err) console.log(err)
            if(!user) {
                let newUser = new User({sockeID: socket.id, userName: data}) 
                newUser.save()
                return
            }
            user.update({sockeID: socket.id})
        })
    })
    socket.on('gametype', (data) => {
        console.log('gametype')
        let gameType = parseInt(data)
        console.log('data', data)
        Game.findOne({'typeGame' : gameType, 'startGame' : false}, (err, game) => {
            if(err) {
                console.log('hi', err)
                return 
            }
            console.log(game)
            if(game) {
                User.findOne({sockeID: socket.id}, (err, user) => {
                    if(err) console.log('hwekgr', err)
                    console.log('id', socket.id)
                    Game.findByIdAndUpdate(game.id, {'startGame' : true, 'player2ID' : user.userName}, (err, startedGame) => {
                        if(err) {
                            console.log(err)
                            return
                        }
                        if(startedGame) {
                            let {game1, game2} = newGameGem(gameType)
                            try {
                                User.findOne({userName: game.player1ID}, (err, user1) => {
                                    io.sockets.sockets[user1.sockeID].emit('startGame', game1)
                                    io.sockets.sockets[socke.id].emit('startGame', game2)
                                })
                            } catch {
                                console.log('err')
                            }
                        }
                    })
                }) 
            } else {
                User.findOne({sockeID: socket.id}, (err, user) => {
                    console.log('user', user, socket.id)
                    let createdGame = new Game({player1ID: user.userName, player2ID: null, startGame: false, typeGame: gameType})
                    createdGame.save(() => {
                        socket.json.send({event: 'createdgame'})
                    })
                })
            }
        })
    })
    socket.on('move', (data) => {
        console.log('move')
        User.findOne({sockeID: socket.id}, (err, user1) => {
            Game.findOne({player1ID: user1.userName}, (err, game) => {
                if(game) {
                    let idPlayer = game.player2ID
                    User.findOne({userName: idPlayer}, (err, user2) => {
                        io.sockets.sockets[user2.sockeID].json.send('move', data)
                    })
                } else {
                    Game.findOne({player2ID: user1.userName}, (err, game1) => {
                        if(game) {
                            let idPlayer = game.player1ID
                            User.findOne({userName: idPlayer}, (err, user2) => {
                                io.sockets.sockets[user2.sockeID].json.send('move', data)
                            })
                        }
                    })
                }
            })
        })
    })
    socket.on('gameend', () => {
        Game.findOneAndDelete({player1ID: socket.id})
        Game.findOneAndDelete({player2ID: socket.id})
    })
    socket.on('disconnect', () => {
        console.log('deetet', socket.id)
        Game.remove({player1ID: socket.id})
        Game.remove({player2ID: socket.id})
        console.log('disconnect')
    })
})


app.listen(8080, () => {
    console.log('Server started')
})
