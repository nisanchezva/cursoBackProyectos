// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

app.use((req, res, next) => {
  console.log(`Tipo de petición: ${req.method}`);
  console.log(`URI: ${req.originalUrl}`);
  next(); // Pasar al siguiente middleware o ruta
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

app.get("/api/:date",function(req,res){

let date = req.params.date;
let unixDate;
let utcDate;

if(isNaN(new Date(date))){
  if(isNaN(new Date(Number(date)))){
    return res.json({ error : "Invalid Date"  });
  }else{
    date = Number(date);
  }
}

unixDate = new Date(date).getTime();
utcDate = new Date(date).toUTCString();
console.log(unixDate + "  " + utcDate)
res.json({"unix": unixDate, "utc": utcDate})

});

app.get("/api",function(req,res){
let date = new Date();
unixDate = new Date(date).getTime();
utcDate = new Date(date).toUTCString();

  res.json({"unix": unixDate, "utc": utcDate})
});



// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
