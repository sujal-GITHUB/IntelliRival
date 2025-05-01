const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

// Function to search Google for relationship between competitor and target company
async function searchCompetitorRelationship(competitor, targetCompany) {
    try {
      const searchTerm = `${competitor.name} working with ${targetCompany} partnership case study`;
      const encodedSearch = encodeURIComponent(searchTerm);
  
      const searchUrl = `https://serpapi.com/search.json?q=${encodedSearch}&api_key=${process.env.SERPAPI_KEY}`;
      console.log(`Searching for: ${searchTerm}`);
  
      const response = await axios.get(searchUrl);
      const searchResults = response.data.organic_results || [];
  
      return searchResults.map(result => ({
        title: result.title,
        link: result.link,
        snippet: result.snippet
      }));
    } catch (error) {
      console.error(`Error searching for ${competitor.name} + ${targetCompany}:`, error.message);
      return [];
    }
  }

// Function to extract text from a web page
async function extractContentFromUrl(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      timeout: 5000
    });
    
    const $ = cheerio.load(response.data);
    
    // Extract text content from main content areas
    const bodyText = $('body').text();
    const mainContent = bodyText.replace(/\\s+/g, ' ').trim();
    
    return mainContent;
  } catch (error) {
    console.error(`Error extracting content from ${url}:`, error.message);
    return null;
  }
}

// Function to analyze content for a relationship
function analyzeContent(content, competitor, targetCompany) {
  if (!content) return null;
  
  // Check if content contains both company names within close proximity
  const competitorRegex = new RegExp(`\\b${competitor.name}\\b|\\b${competitor.shortName}\\b`, 'i');
  const targetRegex = new RegExp(`\\b${targetCompany}\\b`, 'i');
  
  const hasCompetitor = competitorRegex.test(content);
  const hasTarget = targetRegex.test(content);
  
  // Check for relationship indicators
  const relationshipTerms = [
    'partnership', 'client', 'collaboration', 'project', 'engagement',
    'contract', 'agreement', 'work with', 'working with', 'case study',
    'success story', 'implementation', 'transformation', 'solution'
  ];
  
  let relationshipFound = false;
  let relationshipType = '';
  
  if (hasCompetitor && hasTarget) {
    for (const term of relationshipTerms) {
      if (content.toLowerCase().includes(term)) {
        relationshipFound = true;
        relationshipType = term;
        break;
      }
    }
  }
  
  return relationshipFound ? relationshipType : null;
}

module.exports = {
  searchCompetitorRelationship,
  extractContentFromUrl,
  analyzeContent
};