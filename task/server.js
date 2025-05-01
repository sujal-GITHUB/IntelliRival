require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

const { analyzeCompetitors } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('trust proxy', 1);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(compression());
app.use(helmet());

app.use(cors({
  origin: process.env.ALLOWED_ORIGIN || '*',
  methods: ['GET', 'POST'],
}));

app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);


app.get('/', (req, res) => {
  res.render('index', {
    title: 'Competitive Intelligence Tool',
    company: 'Infosys',
    target: 'Virgin Media',
  });
});

app.post('/api/analyze', async (req, res) => {
  try {
    const targetCompany = req.body.targetCompany || 'Virgin Media';

    if (global.cachedResults) {
      console.log('Returning cached results');
      return res.json({ results: global.cachedResults });
    }

    const results = await analyzeCompetitors(targetCompany);
    global.cachedResults = results;

    res.json({ results });
  } catch (error) {
    console.error('Error during analysis:', error);
    res.status(500).json({ error: 'Analysis failed', message: error.message });
  }
});

app.get('/results', (req, res) => {
  res.render('results', {
    title: 'Analysis Results',
    company: 'Infosys',
    target: 'Virgin Media',
  });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
