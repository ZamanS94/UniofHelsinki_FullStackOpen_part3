require('dotenv').config()
const express = require('express')
const path = require('path')
const { phonebookSchema, Phonebook, mongoose } = require('./models/phonebook')

const app = express()
const PORT = process.env.PORT || 3001
app.use(express.json())

app.use(express.static(path.join(__dirname, 'dist')))

const counterSchema = new mongoose.Schema({
  _id: String,
  seq: { type: Number, default: 0 }
})
const Counter = mongoose.model('Counter', counterSchema)

phonebookSchema.pre('save', async function(next) {
  try {
    if (!this.id) {
      const counter = await Counter.findOneAndUpdate(
        { _id: 'phonebookId' },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      )
      this.id = counter.seq
    }
    next()
  } catch (error) {
    next(error)
  }
})

app.get('/api/persons', async (request, response) => {
  try {
    const persons = await Phonebook.find({}).select('-_id -__v')
    response.json(persons)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

app.post('/api/persons', async (request, response) => {
  try {
    const { name, number } = request.body
      
    if (!name || !number) {
      throw ('Name and number are required')
    }
        
    const person = new Phonebook({ name, number })
    const savedPerson = await person.save()
    response.json(savedPerson)
  } catch (error) {
    console.log(error)
    return response.status(400).json({ error: error })
  }
})

app.get('/api/persons/:id', async (request, response) => {
  const { id } = request.params
  try {
    const person = await Phonebook.findOne({ id }).select('-_id -__v')
    if (!person) {
      return response.status(404).json({ error: 'Person not found' })
    }
    response.json(person)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

app.put('/api/persons/:id', async (request, response) => {
  const id = Number(request.params.id)
  const body = request.body

  try {
    const personToUpdate = await Phonebook.findOne({ id })
    personToUpdate.name = body.name
    personToUpdate.number = body.number
    const updatedPerson = await personToUpdate.save()
    response.json(updatedPerson)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

app.delete('/api/persons/:id', async (request, response) => {
  const id = Number(request.params.id)

  try {
    const deletedPerson = await Phonebook.findOneAndDelete({ id })
    if (!deletedPerson) {
      return response.status(404).json({ error: 'Person not found' })
    }
    response.send(`${id} Deleted!`)
  } catch (error) {
    response.status(500).json({ error: error.message })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
