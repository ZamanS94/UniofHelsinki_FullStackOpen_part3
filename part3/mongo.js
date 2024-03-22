const mongoose = require('mongoose')

const PhonebookSchema = new mongoose.Schema({
  name: String,
  number: String
})

const Phonebook = mongoose.model('Phonebook', PhonebookSchema)

const [password, ...entry] = process.argv.slice(2)
const url = `mongodb+srv://sabina37:${password}@cluster0.enthgpn.mongodb.net`

if (entry.length === 0) {
    mongoose.connect(url)
        .then(() => {
            Phonebook.find({}).then(entries => {
                console.log('All entries:')
                entries.forEach(entry => { 
                    console.log(entry)
                })
                mongoose.connection.close()
            })
        })
        .catch(error => {
            console.error('Error connecting to MongoDB:', error)
        })
}
else {
    const number = entry.pop()
    const name = entry.join(' ')

    mongoose.connect(url)
        .then(() => {
            const entryPhonebook = new Phonebook({
                name: name,
                number: number
            })

            entryPhonebook.save().then(result => {
                console.log('Entry saved with id:', result.id)
                mongoose.connection.close()
            })
        })
        .catch(error => {
            console.error('Error saving entry:', error)
            mongoose.connection.close()
        })
}
