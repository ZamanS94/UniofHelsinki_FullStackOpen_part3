const mongoose = require('mongoose')
require('dotenv').config()

const url = process.env.MONGODB_URI

mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB')
})
.catch(error => {
  console.error('Error connecting to MongoDB:', error.message)
})

const phonebookSchema = new mongoose.Schema({
  id: Number,
  name: {
    type: String,
    minLength: 5,
    required: true
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /^(\d+-\d+)$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number. It should contain exactly one hyphen (-).`
    }
  }
})


const Phonebook = mongoose.model('Phonebook', phonebookSchema)

module.exports = {
  phonebookSchema: phonebookSchema,
  Phonebook: Phonebook,
  mongoose: mongoose
}