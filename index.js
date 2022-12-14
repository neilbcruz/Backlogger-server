const express = require('express');
const cors = require('cors');
const PORT = process.env.PORT || 8080;
const app = express();
const jwt = require('jsonwebtoken');

require('dotenv').config();

app.use(express.json());
app.use(cors());


app.get('/', (_req, res) => {
    res.send('express is working!');
})

const gamesRoute = require('./routes/gamesRoute')
app.use('/games', gamesRoute)

const profileRoute = require('./routes/profileRoute');
app.use('/profile', profileRoute)

const secretKey = process.env.SECRET_KEY;

function authorize(req, res, next) {

  const {authorization} = req.headers
  const token = authorization.split(" ")[1];

  jwt.verify(token, secretKey, (err, decoded) => {
    if (err) {
      res.status(403)
      .json({ success: false, message: 'No Token.'})
    } else {
      req.decoded = decoded;
    }
    next()
  })
}

const users = {}

app.post('/register', (req, res) => {
  const { username, name, password } = req.body;
  users[username] = {
    name,
    password
  };
  res.json({ success: 'true' });
});

// Login end point
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users[username];

  if (!!user && user.password === password) {
      const token = jwt.sign({ name: user.name, username }, secretKey);
      res.json({token})
  } else {
    res.status(401).json({
      error: {
        message: "Login failed",
      },
    });
  }
});

app.get('/user', authorize, (req, res) => {
  res.json(req.decoded);
});

app.listen(
  PORT,
  console.log(`listening on ${PORT}`)
)