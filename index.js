const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()

app.use(cors())
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

let persons = [
    { id: 1, name: 'Arto Hellas', number: '040-123456' },
    { id: 2, name: 'Ada Lovelace', number: '39-44-5323523' },
    { id: 3, name: 'Dan Abramov', number: '12-43-234345' },
    { id: 4, name: 'Mary Poppendieck', number: '39-23-6423122' }
  ]

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/info', (request, response) => {
    let text = 
    `<div>
        <p>Phonebook has info for ${persons.length} people</p>
        <p>${new Date()}</p>
    </div>`

    response.send(text)
})

app.get('/api/persons/:id', (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if (person === undefined) {
        response.status(404).end()
    } else {
        response.json(person)
    }
    
})

app.delete('/api/persons/:id', (request, response) => { 
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    console.log(persons)
    response.status(202).end()
})

app.post('/api/persons', (request, response) => {
    const id = Math.floor(Math.random() * 10000)
    const body = request.body
    const nameExists = persons.find(person => person.name === body.name)

    let error = { error: 'name key must exist' }
    if (!body.name || !body.number || nameExists) {
        if (!body.number) {
            error = { error: 'number key must exist' }
        } else if (nameExists) {
            error = { error: 'name must be unique' }
        }
        return response.status(400).json(error)
    }

    const person = {
        id: id, 
        name: body.name, 
        number: body.number
    }

    persons.push(person)
    console.log(persons)
    response.json(person)
})


const PORT = 3001
app.listen(PORT, () => {
    console.log('Server is listening')
})