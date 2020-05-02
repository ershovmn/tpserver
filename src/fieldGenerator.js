const colors = [
    '#026d35',
    '#5b23a4',
    '#05f0e4',
    '#e30000',
    '#ff3ac2',
    '#fd791a',
    '#1c9bfd',
    '#dde026',
    '#08b35c',
    '#b8b8b8',
    '#bb92fc',
]

const newGame = (type) => {
    let props = arrayProps[type]
    let field = generateField({fieldType : props.fieldType, size : props.size, countColors : props.countColors})

    while(field.lines[props.size.y - 1][props.size.x - 1].color === field.lines[0][0].color) {
        field.lines[props.size.y - 1][props.size.x - 1].color = colors[Math.floor(Math.random() * props.countColors)]
    }

    field.lines[props.size.y - 1][props.size.x - 1].neighbors.forEach((item) => {
        let color = field.lines[props.size.y - 1][props.size.x - 1].color
        while(color === field.lines[item.y][item.x].color) {
            field.lines[item.y][item.x].color = colors[Math.floor(Math.random() * props.countColors)]
        }
    })

    field.lines[0][0].neighbors.forEach((item) => {
        let color = field.lines[0][0].color
        while(color === field.lines[item.y][item.x].color) {
            field.lines[item.y][item.x].color = colors[Math.floor(Math.random() * props.countColors)]
        }
    })

    field.lines[props.size.y - 1][props.size.x - 1].who = 1
    field.lines[0][0].who = 0

    let game1 = {
        field : field,
        typeGame : props.typeGame,
        countColors : props.countColors,
        complexity : props.complexity,
        move : 0,
        player1 : {
            color : field.lines[0][0].color,
            score : 1,
            front: field.lines[0][0].neighbors,
            start: {
                x: 0, y: 0
            }
        },
        player2 : {
            color : field.lines[props.size.y - 1][props.size.x - 1].color,
            score : 1,
            front: field.lines[props.size.y - 1][props.size.x - 1].neighbors,
            start: {
                x: props.size.x - 1, y: props.size.y - 1
            }
        }
    }

    let field2 = JSON.parse(JSON.stringify(field))

    field2.lines[props.size.y - 1][props.size.x - 1].who = 0
    field2.lines[0][0].who = 1

    let game2 = {
        field : field2,
        typeGame : props.typeGame,
        countColors : props.countColors,
        complexity : props.complexity,
        move : 1,
        player1 : {
            color : field.lines[props.size.y - 1][props.size.x - 1].color,
            score : 1,
            front: field.lines[props.size.y - 1][props.size.x - 1].neighbors,
            start: {
                x: props.size.x - 1, y: props.size.y - 1
            }
        },
        player2 : {
            color : field.lines[0][0].color,
            score : 1,
            front: field.lines[0][0].neighbors,
            start: {
                x: 0, y: 0
            }
        }
    }

    return {game1, game2}
}

const arrayProps = [
    {
        fieldType : 1,
        size : {
            x : 9, y: 15 
        },
        typeGame: 1,
        countColors: 7,
        complexity: -1,
    },
    {
        fieldType : 1,
        size : {
            x : 24, y: 40 
        },
        typeGame: 1,
        countColors: 7,
        complexity: -1,
    },
    {
        fieldType : 1,
        size : {
            x : 45, y: 75 
        },
        typeGame: 1,
        countColors: 7,
        complexity: -1,
    }
]

const generateField = (props) => {
    let lines = []

    for (let i = 0; i < props.size.y; i++) {
        let line = []
        for (let j = 0; j < props.size.x; j++) {
            let neighbors = []
            if(i > 0) neighbors.push({x: j, y: i - 1})
            if(j > 0) neighbors.push({x: j - 1, y: i})
            if(i < props.size.y - 1) neighbors.push({x: j, y: i + 1})
            if(j < props.size.x - 1) neighbors.push({x: j + 1, y: i})
            line.push({
                color : colors[Math.floor(Math.random() * props.countColors)],
                who : -1,
                neighbors: neighbors
            })
        }
        lines.push(line)
    }


    let field = {
        size : props.size,
        lines : lines
    }

    return(field)
}

module.exports = newGame