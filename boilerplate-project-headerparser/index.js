// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// Ruta para /api/whoami
app.get('S', (req, res) => {
  const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

  // Obtener el idioma preferido
  const language = req.headers['accept-language'] ? req.headers['accept-language'].split(',')[0] : 'en';

  // Obtener el software del cliente
  const userAgent = req.headers['user-agent'];
  const software = userAgent ? userAgent : 'Unknown';

  // Crear el objeto de respuesta
  const response = {
    ipaddress: ipAddress,
    language: language,
    software: software
  };

  // Enviar la respuesta JSON
  res.json(response);
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
