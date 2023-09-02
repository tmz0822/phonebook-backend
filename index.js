require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Person = require('./models/person');
const app = express();

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};
app.use(cors());

app.use(express.json());
app.use(express.static('dist'));
app.use(requestLogger);

morgan.token('req-body', (request) => {
  return JSON.stringify(request.body);
});

app.use(
  morgan(
    ':method :url :status :res[content-length] - :response-time ms :req-body'
  )
);

const persons = [
  {
    id: 1,
    name: 'Arto Hellas',
    number: '040-123456',
  },
  {
    id: 2,
    name: 'Ada Lovelace',
    number: '39-44-5323523',
  },
  {
    id: 3,
    name: 'Dan Abramov',
    number: '12-43-234345',
  },
  {
    id: 4,
    name: 'Mary Poppendieck',
    number: '39-23-6423122',
  },
];

app.get('/api/persons', (request, response) => {
  Person.find({}).then((people) => response.json(people));
});

app.get('/api/persons/:id', (request, response) => {
  // const id = Number(request.params.id);
  // const person = persons.find((person) => person.id === id);

  // if (!person) {
  //   return response.status(404).end();
  // }

  // response.json(person);
  Person.findById(request.params.id).then((person) => response.json(person));
});

app.get('/info', (request, response) => {
  const date = new Date();
  response.send(
    `Phonebook has info for ${persons.length} people
    <br/>
    ${date}
  `
  );
});

const generateId = () => {
  const id = persons.length > 0 ? Math.max(...persons.map((p) => p.id)) : 0;
  return id + 1;
};

app.post('/api/persons', async (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing',
    });
  }

  const personExists = await Person.exists({ name: body.name });
  console.log(personExists);

  if (personExists) {
    const person = {
      name: body.name,
      number: body.number,
    };

    Person.findByIdAndUpdate(personExists._id, person, { new: true })
      .then((updatedPerson) => {
        response.json(updatedPerson);
      })
      .catch((error) => next(error));
  } else {
    const person = new Person({
      name: body.name,
      number: body.number,
    });

    person
      .save()
      .then((savedPerson) => {
        response.json(savedPerson);
      })
      .catch((error) => next(error));
  }
});

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body;

  const person = {
    name: body.name,
    number: body.number,
  };

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then((updatedPerson) => {
      response.json(updatedPerson);
    })
    .catch((error) => next(error));
});

app.delete('/api/persons/:id', (request, response, next) => {
  // const id = Number(request.params.id);
  // const newPersons = persons.filter((person) => person.id !== id);

  // response.json(newPersons);

  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end();
    })
    .catch((error) => next(error));
});

// middleware after routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malfunctioned id' });
  }

  next(error);
};

app.use(errorHandler);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
