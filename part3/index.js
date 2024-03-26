require('dotenv').config()
const express = require('express')
const path = require('path')
const { phonebookSchema, Phonebook } = require('./models/phonebook')

const app = express()
const PORT = process.env.PORT || 3001
app.use(express.json())

app.use(express.static(path.join(__dirname, 'dist')))

app.get('/', (req, res, next) => {
    next(new Error('Testing'))
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

app.get('/info', async (request, response,next) => {
    const persons = await Phonebook.find({}).select('-_id -__v')
    const param1 = persons.length
    const param2 = getCurrentDateTime()
    response.send(`Phonebook has info for ${param1} people <br/><br/>${param2}`)
})


app.get('/api/persons', async (request, response, next) => {
  try {
    const persons = await Phonebook.find({}).select('-_id -__v')
    response.json(persons)
  } catch (error) {
    next(error)
  }
})

async function generateSequentialId(next) {
  try {
    const lastPerson = await Phonebook.findOne({}, {}, { sort: { 'id': -1 } }).exec()
    if (lastPerson) {
      return lastPerson.id + 1
    } else {
      return 1
    }
  } catch (error) {
    next(error)
  }
}

app.get('/api/persons/:id', async (request, response, next) => {
    const id_ = request.params.id
    try {
        const person = await Phonebook.findOne({ id: id_ }).select('-_id -__v')
        if (!person) {
            const error = new Error('Person not found')
            error.status = 404
            throw error
        }
        response.json(person)
    } catch (error) {
        next(error)
    }
})


app.post('/api/persons', async (request, response, next) => {
  try {
    const { name, number } = request.body
    if (!name || !number) {
      const error = new Error('Name or number missing')
        error.status = 500
        throw error
    }
    const id = await generateSequentialId(next)
    const person = new Phonebook({ id, name, number })
    const savedPerson = await person.save()
    response.json(savedPerson)
  } catch (error) {
    next(error)
  }
})

app.delete('/api/persons/:id', async (request, response, next) => {
    const id = Number(request.params.id)
    console.log(id)
    try {
      const deletedPerson = await Phonebook.findOneAndDelete({ id })
      if (!deletedPerson) {
        const error = new Error('Person not found')
        error.status = 404
        throw error
      }
      response.send(`${id} Deleted!`)
    } catch (error) {
     next(error)
    }
})


app.put('/api/persons/:id', async (request, response, next) => {
    const id_ = request.params.id
    const body = request.body
    try {
        const updatedPerson = await Phonebook.findOneAndUpdate(
            { id: id_ }, body, { new: true } 
        )
        if (!updatedPerson) {
            const error = new Error('Person not found')
            error.status = 404
            throw error
        }
        response.json(updatedPerson)
    } catch (error) {
        next(error)
    }
})


app.use((err, req, res, next) => { 
    console.error(err.stack) 
    const status = err.status || 500
    res.status(status).json({ error: err.message })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
