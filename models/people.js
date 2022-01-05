const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
console.log(url, typeof(url))
mongoose.connect(url)
    .then(result => console.log('connected to database'))
    .catch(error => console.log('error connection to database'))

const personSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        minlength: 3
    },
    number: {
        type: String,
        required: true,
        minlength: 8
    }
})

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})

module.exports = new mongoose.model('Person', personSchema)


