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

async function generateSequentialId() {
  try {
    const lastDocument = await Phonebook.findOne({}, {}, { sort: { 'id': -1 } }).exec();
    if (lastDocument) {
      return lastDocument.id + 1
    } else {
      return 1
    }
  } catch (error) {
    console.error('Error finding last document:', error)
    throw error
  }
}

app.post('/api/persons', async (request, response) => {
  try {
    const { name, number } = request.body
    if (!name || !number) {
      throw new Error('Name and number are required')
    }
    const id = await generateSequentialId()
    const person = new Phonebook({ id, name, number })
    const savedPerson = await person.save()
    response.json(savedPerson)
  } catch (error) {
    console.error(error)
    return response.status(400).json({ error: error.message })
  }
});

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
