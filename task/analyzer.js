const competitors = require('./competitors');
const { searchCompetitorRelationship } = require('./scraper');

// Function to run the competitor analysis
async function analyzeCompetitors(targetCompany) {
  console.log(`Starting competitor analysis for target: ${targetCompany}`);
  const results = [];

  for (const competitor of competitors) {
    console.log(`Analyzing competitor: ${competitor.name}`);

    const searchResults = await searchCompetitorRelationship(competitor, targetCompany);
    if (searchResults && searchResults.length > 0) {
      results.push({
        competitor: competitor.name,
        findings: searchResults
      });
    }
  }
  
  // Sort results by confidence level
  results.sort((a, b) => {
    const aHighConfidence = a.findings.some(f => f.confidence === "High");
    const bHighConfidence = b.findings.some(f => f.confidence === "High");
    
    if (aHighConfidence && !bHighConfidence) return -1;
    if (!aHighConfidence && bHighConfidence) return 1;
    return 0;
  });
  
  console.log(`Analysis complete. Found ${results.length} competitors with potential relationships.`);
  return results;
}

module.exports = {
  analyzeCompetitors
};