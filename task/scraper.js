const axios = require('axios');
require('dotenv').config();

const SERP_API_KEY = process.env.SERPAPI_KEY;

async function searchCompetitorRelationship(competitor, targetCompany) {
  try {
    console.log(`Searching relationship between ${competitor.name} and ${targetCompany}`);
    console.log('-----------------------------------');
    
    const query = encodeURIComponent(`${competitor.name} working with ${targetCompany} partnership case study`);
    const url = `https://serpapi.com/search.json?engine=google&q=${query}&api_key=${SERP_API_KEY}`;

    const response = await axios.get(url);
    const results = response.data.organic_results || [];

    const searchResults = results.map(result => {
      const content = (result.snippet || '') + ' ' + (result.title || '');
      const contentYear = extractYear(content);
      
      return {
        title: result.title || 'No title available',
        snippet: result.snippet || 'No snippet available',
        link: result.link || 'No link available',
        confidence: determineConfidence(result, competitor.name, targetCompany),
        year: contentYear || extractPublicationDate(result),
        technologies: extractTechnologies(content),
        relationship: findRelationshipType(content),
        published_date: result.published_date || null
      };
    });

    if (searchResults.length === 0) {
      console.log('\nNo results found');
    }

    return searchResults;

  } catch (error) {
    console.error(`\nSearch error for ${competitor.name}:`, error.message);
    return [];
  }
}

function determineConfidence(result, competitorName, targetCompany) {
  const content = (result.snippet || '') + (result.title || '');
  const hasCompetitor = content.toLowerCase().includes(competitorName.toLowerCase());
  const hasTarget = content.toLowerCase().includes(targetCompany.toLowerCase());
  const hasPartnership = /partnership|collaboration|agreement|contract|case study/i.test(content);

  if (hasCompetitor && hasTarget && hasPartnership) {
    return "High";
  } else if (hasCompetitor && hasTarget) {
    return "Medium";
  }
  return "Low";
}

function findRelationshipType(content) {
  if (typeof content !== 'string' || !content) return 'Unknown';
  
  const types = {
    'strategic partnership': /strategic\s+partner(ship)?/i,
    'implementation partner': /implementation\s+partner/i,
    'service provider': /service\s+provider/i,
    'technology partner': /technology\s+partner/i,
    'consulting partner': /consulting\s+partner/i,
    'system integrator': /system\s+integrator/i
  };

  for (const [type, regex] of Object.entries(types)) {
    if (regex.test(content)) return type;
  }
  
  return 'Business Relationship';
}

function extractYear(content) {
  if (typeof content !== 'string' || !content) return null;
  const yearRegex = /(20[0-2][0-9])/g;
  const years = content.match(yearRegex);
  return years ? Math.max(...years) : null;
}

function extractTechnologies(content) {
  if (typeof content !== 'string' || !content) return [];
  
  const techKeywords = [
    'AWS', 'Azure', 'Cloud', 'AI', 'ML', 'Blockchain',
    'DevOps', '5G', 'IoT', 'Analytics', 'Digital Transformation'
  ];
  
  return techKeywords
    .filter(tech => new RegExp(`\\b${tech}\\b`, 'i').test(content));
}

// Add this function alongside other extraction functions
function extractPublicationDate(result) {
    // Check for the 'published' field from search results
    if (result.published_date) {
        const date = new Date(result.published_date);
        if (!isNaN(date)) {
            return date.getFullYear().toString();
        }
    }

    // Check for date in snippet using regex
    const dateRegex = /\b(20\d{2})\b/;  // Matches years from 2000-2099
    const snippetMatch = result.snippet?.match(dateRegex);
    if (snippetMatch) {
        return snippetMatch[1];
    }

    return 'Year not found';
}

// Update the exports at the bottom of scraper.js
module.exports = {
    searchCompetitorRelationship,
    extractPublicationDate,
    determineConfidence,
    findRelationshipType,
    extractYear,
    extractTechnologies
};