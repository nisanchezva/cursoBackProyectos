require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const dns = require('dns');
const urlParser = require('url');

const app = express();
const mongoClient = new MongoClient(process.env.MONGO_URI);
const databaseName = "urlshortener";
const collectionName = "urls";

// Configuración básica
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${process.cwd()}/views/index.html`);
});

// Punto final de la API
app.get('/api/welcome', (req, res) => {
  res.json({ message: 'Welcome to the URL Shortener API!' });
});

app.post('/api/shorturl', async (req, res) => {
  const originalUrl = req.body.url;

  // Validación de la URL
  const dnslookup = dns.lookup(urlParser.parse(originalUrl).hostname, async (error, address) => {
    if (!address) {
      return res.json({ error: "invalid url" });
    }

    const totalUrls = await mongoClient.db(databaseName).collection(collectionName).countDocuments();
    const shortUrlId = totalUrls;

    const urlEntry = { originalUrl, shortUrl: shortUrlId };
    await mongoClient.db(databaseName).collection(collectionName).insertOne(urlEntry);

    res.json({ original_url: originalUrl, short_url: shortUrlId });
  });
});

app.get('/api/shorturl/:shortUrlId', async (req, res) => {
  const { shortUrlId } = req.params;
  const urlEntry = await mongoClient.db(databaseName).collection(collectionName).findOne({ shortUrl: +shortUrlId });

  if (urlEntry) {
    res.redirect(urlEntry.originalUrl);
  } else {
    res.status(404).json({ error: "Short URL not found" });
  }
});

(async () => {
  try {
    await mongoClient.connect();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection failed', error);
  }
})();
