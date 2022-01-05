require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/people')

const app = express()

//app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(morgan(function (tokens, req, res) {
    if (req.method === 'POST') {
        tokens.body = req.body
    } else {
        tokens.body = {}
    }
    
    return [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, 'content-length'), '-',
      tokens['response-time'](req, res), 'ms',
      JSON.stringify(tokens.body)
    ].join(' ')
  }))


app.get('/api/persons', (request, response) => {
    Person.find({}).then(people => {
        response.json(people)
    })
})

app.get('/info', (request, response) => {
    Person.find({})
        .then(people => {
            console.log(people)
            let text = 
            `<div>
                <p>Phonebook has info for ${people.length} people</p>
                <p>${new Date()}</p>
            </div>`

            response.send(text)
        })
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
        .then(person => {
            if (person) {
                response.json(person)
            } else {
                response.status(404).end()
            }
        })
        .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response) => {
    const body = request.body
    const person = {
        number: body.number
    }
    Person.findByIdAndUpdate(request.params.id, person, {new:true})
        .then(updatedPerson => {
            response.json(updatedPerson)
        })
})

app.delete('/api/persons/:id', (request, response) => { 
    Person.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(202).end()
        })
})

app.post('/api/persons', (request, response, next) => {
    const body = request.body

    /*
    let error = { error: 'name key must exist' }
    if (!body.name || !body.number || nameExists) {
        if (!body.number) {
            error = { error: 'number key must exist' }
        } else if (nameExists) {
            error = { error: 'name must be unique' }
        }
        return response.status(400).json(error)
    }*/

    const person = new Person({
        name: body.name, 
        number: body.number
    })

    person.save().then(person => {
        response.json(person)
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
    console.error(error.message)
    if (error.name === 'CastError') {
        return response.status(400).send({error:'malformatted id'})
    } else if (error.name === 'ValidationError') {
        return response.status(400).json({error : error.message})
    }
    next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('Server is listening')
})