const express = require('express')
const app = express()
require('dotenv').config()
const morgan = require('morgan')
const mongoose = require('mongoose')
const {expressjwt} = require('express-jwt')
const cors = require('cors')
const path = require('path');

app.use(express.json())
app.use(morgan('dev'))
app.use(cors())

var whitelist = ['http://localhost:3000', 'https://rlm-frontend.onrender.com']
var corsOptionsDelegate = function (req, callback) {
  var corsOptions;
  if (whitelist.indexOf(req.header('Origin')) !== -1) {
    return { origin: true } // reflect (enable) the requested origin in the CORS response
  } else {
    return { origin: false } // disable CORS for this request
  }
  // callback(null, corsOptions) // callback expects two parameters: error and options
}

mongoose.connect(process.env.MONGODB_URI,
  () => console.log('Connected to the DB')
)

// if (process.env.NODE_ENV === 'production') {
//   //*Set static folder up in production
//   app.use(express.static('client/build'));

//   app.get('*', (req,res) => res.sendFile(path.resolve(__dirname, 'client', 'build','index.html')));
// }



app.use('/auth', require('./routes/authRouter.js'))
app.use('/api', expressjwt({ secret: process.env.SECRET, algorithms: ['HS256'] })) // req.user
app.use('/api/todo', require('./routes/todoRouter.js'))

app.use((err, req, res, next) => {
  console.log(err)
  if(err.name === "UnauthorizedError"){
    res.status(err.status)
  }
  return res.send({errMsg: err.message})
})
//static files
app.use(express.static(path.join(__dirname, "client", "build")))


app.get("*", function (req, res) {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(process.env.PORT || 9000, () => {
  console.log(`Server is running on local port 9000`)
})

