const express = require('express')
const { json } = require('express')
const morgan = require('morgan')

const app = express()

app.use(express.static('dist'))

app.use(morgan('tiny'))

morgan.token('body', req => {
    return JSON.stringify(req.body)
  })

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))

let persons = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    },
    {
        "id": 5,
        "name": "Pinky",
        "number": "39-23-6423122"
    }
]
app.use(express.json())

app.get('/', (request, response) => {
    response.send('<h1>Hello World!!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})


function checkTime(i) {
  if (i < 10) {
    i = "0" + i
  }
  return i
}

function getCurrentDateTime() {
  var now = new Date()
  var days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  var months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  var day = days[now.getDay()]
  var month = months[now.getMonth()]
  var date = now.getDate()
  var year = now.getFullYear()
  var h = now.getHours()
  var m = now.getMinutes()
  var s = now.getSeconds()
  m = checkTime(m)
  s = checkTime(s)

  return `${day} ${month} ${date} ${year} ${h}:${m}:${s}  GMT+0200 (Eastern European Standard Time)`
}

app.get('/info', (request, response) => {
  const param1 = persons.length;
  const param2 = getCurrentDateTime();
  response.send(`Phonebook has info for ${param1} people <br/><br/>${param2}`)
})

const generateId = () => {
    const maxId = persons.length > 0
        ? Math.max(...persons.map(n => n.id))
        : 0
    return maxId + 1
}

app.post('/api/persons', (request, response) => {
    const body = request.body
    console.log(request.body)


if (!body.name || !body.number) {
    response.status(400).json({ error: "Name or number is missing" })
}

    let value = false 
    persons.map(person => {
        if(person.name==body.name) {value = true}
    })

    if(value){
        response.status(400).json({ error: "Name must be unique" })
    }
    else{
        const person = {
            id: generateId(),
            name: body.name,
            number: body.number,
            
        }
        persons = persons.concat(person)
        response.json(person)
    }
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).send('Person not found')
    }
})

app.delete('/delete/:id', (request, response) => {
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)
    response.send(`${id} Deleted!`)
})

const PORT = 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)

})