require('dotenv').config()
const express = require('express')
const path = require('path')
const { phonebookSchema, Phonebook } = require('./models/phonebook')

const app = express()
const PORT = process.env.PORT || 3001
app.use(express.json())

app.use(express.static(path.join(__dirname, 'dist')))

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
