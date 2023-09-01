const express = require('express');
const morgan = require('morgan');
const app = express();

// const requestLogger = (request, response, next) => {
//   console.log('Method:', request.method);
//   console.log('Path:  ', request.path);
//   console.log('Body:  ', request.body);
//   console.log('---');
//   next();
// };

morgan.token('req-body', (request) => {
  return JSON.stringify(request.body);
});

app.use(express.json());
//app.use(requestLogger);
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
  response.json(persons);
});

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (!person) {
    return response.status(404).end();
  }

  response.json(person);
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

app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number missing',
    });
  }

  if (persons.find((person) => person.name === body.name)) {
    return response.status(400).json({
      error: 'name must be unique',
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  const newPersons = persons.concat(person);

  response.json(newPersons);
});

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id);
  const newPersons = persons.filter((person) => person.id !== id);

  response.json(newPersons);
});

// middleware after routes
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};
app.use(unknownEndpoint);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
