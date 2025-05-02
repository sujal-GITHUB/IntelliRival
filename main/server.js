const express = require('express');
const cors = require('cors');
const path = require('path');
const { analyzeCompetitors } = require('./analyzer');

const app = express();
const PORT = process.env.PORT || 3000;

// Set up view engine and static files
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(cors());

// Home page route
app.get('/', (req, res) => {
  res.render('index', { 
    title: 'Competitive Intelligence Tool',
    company: 'Infosys',
    target: 'Virgin Media'
  });
});

// API endpoint to run analysis
app.post('/api/analyze', async (req, res) => {
  try {
    const targetCompany = req.body.targetCompany || 'Virgin Media';
    
    console.log(`Running analysis for target: ${targetCompany}`);
    
    // Run the analysis
    const { results, analysis } = await analyzeCompetitors(targetCompany);
    
    // Format the response
    const formattedResponse = {
      overview: {
        targetCompany,
        analysisDate: new Date().toISOString(),
        totalCompetitors: analysis.overview.totalCompetitors,
        competitorsFound: analysis.overview.competitorsFound,
        highConfidenceFindings: analysis.overview.highConfidenceFindings
      },
      metrics: analysis.metrics,
      insights: analysis.insights,
      competitors: results.map(result => ({
        name: result.competitor,
        findings: result.findings,
        summary: {
          totalFindings: result.summary.totalFindings,
          highConfidence: result.summary.highConfidence,
          latestActivity: result.summary.latestActivity,
          keyTechnologies: result.summary.keyTechnologies,
          relationshipStrength: result.summary.relationshipStrength
        }
      }))
    };

    // Cache the formatted results
    global.cachedResults = formattedResponse;
    
    console.log(`Analysis complete. Found ${formattedResponse.competitors.length} competitors with relationships.`);
    return res.json(formattedResponse);
    
  } catch (error) {
    console.error('Error during analysis:', error);
    res.status(500).json({ 
      error: 'Analysis failed', 
      message: error.message 
    });
  }
});

// Results page route with data
app.get('/results', (req, res) => {
  res.render('results', { 
    title: 'Analysis Results',
    company: 'Infosys',
    target: 'Virgin Media',
    data: global.cachedResults || null
  });
});

// Direct results page - simpler approach for debugging
app.get('/direct-results', (req, res) => {
  res.render('direct-results');
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on : http://localhost:${PORT}`);
});