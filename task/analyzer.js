const competitors = require('./competitors');
const { searchCompetitorRelationship } = require('./scraper');

async function analyzeCompetitors(targetCompany) {
  console.log(`Starting competitor analysis for target: ${targetCompany}`);
  const results = [];
  
  if (!competitors || !Array.isArray(competitors) || competitors.length === 0) {
    console.error('Invalid or empty competitors list');
    return [];
  }

  for (const competitor of competitors) {
    console.log(`Analyzing competitor: ${competitor.name}`);
    
    try {
      const searchResults = await searchCompetitorRelationship(competitor, targetCompany);
      if (searchResults?.length > 0) {
        const validatedResults = searchResults
          .filter(result => result.title || result.snippet)
          .map(result => ({
            ...result,
            confidence: result.confidence || "Low",
            title: result.title || "Partnership Finding",
            snippet: result.snippet || "No details available",
            description: result.description || result.snippet || "No description available",
            relationship: result.relationship || "Business Relationship",
            year: result.year || "Recent",
            technologies: result.technologies || [],
            projectValue: result.projectValue || "Undisclosed",
            duration: result.duration || "Ongoing"
          }));
        
        if (validatedResults.length > 0) {
          results.push({
            competitor: competitor.name,
            findings: validatedResults,
            summary: generateSummary(validatedResults)
          });
        }
      }
    } catch (error) {
      console.error(`Error analyzing competitor ${competitor.name}:`, error);
      // Continue with next competitor
    }
  }

  // Sort and process results
  processAndSortResults(results);

  // Format results for the template
  const formattedResults = results.map(result => ({
    competitor: result.competitor,
    findings: result.findings.map(finding => ({
      title: finding.title,
      snippet: finding.snippet || finding.description,
      link: finding.link,
      confidence: finding.confidence,
      relationship: finding.relationship,
      year: finding.year,
      technologies: finding.technologies,
      projectValue: finding.projectValue,
      duration: finding.duration
    })),
    summary: {
      totalFindings: result.findings.length,
      highConfidence: result.findings.filter(f => f.confidence === 'High').length,
      latestActivity: getLatestYear(result.findings),
      keyTechnologies: getAllTechnologies(result.findings),
      relationshipStrength: calculateRelationshipStrength(result.findings)
    }
  }));

  // Enhanced analysis summary
  const analysis = {
    overview: {
      targetCompany,
      date: new Date().toISOString(),
      totalCompetitors: competitors.length,
      competitorsFound: results.length,
      highConfidenceFindings: countHighConfidenceFindings(results)
    },
    metrics: {
      topTechnologies: getTopTechnologies(results),
      timeline: analyzeTimeline(results),
      relationshipTypes: analyzeRelationshipTypes(results),
      competitorStrengths: calculateCompetitorStrengths(results)
    },
    insights: {
      strongestCompetitors: formattedResults
        .sort((a, b) => b.summary.relationshipStrength - a.summary.relationshipStrength)
        .slice(0, 5)
        .map(r => ({
          name: r.competitor,
          strength: r.summary.relationshipStrength.toFixed(2),
          findings: r.summary.totalFindings,
          highConfidence: r.summary.highConfidence
        })),
      recentActivities: formattedResults
        .flatMap(r => r.findings)
        .filter(f => f.year && f.year >= new Date().getFullYear() - 1)
        .sort((a, b) => b.year - a.year)
        .slice(0, 5),
      technologyTrends: [...new Set(formattedResults
        .flatMap(r => r.findings)
        .flatMap(f => f.technologies))]
        .slice(0, 10)
    }
  };

  // Log summary for console output
  logAnalysisSummary(analysis, formattedResults);
  
  return {
    results: formattedResults,
    analysis
  };
}

// Add helper functions for analysis
function getHighestConfidence(findings) {
  return findings.reduce((max, finding) => 
    finding.confidence === 'High' ? 'High' : 
    max === 'High' ? max : 
    finding.confidence, 'Low');
}

function getLatestYear(findings) {
  const years = findings
    .map(f => f.year)
    .filter(year => year && !isNaN(year));
  return years.length ? Math.max(...years) : null;
}

function getAllTechnologies(findings) {
  return [...new Set(findings.flatMap(f => f.technologies))];
}

function processAndSortResults(results) {
  // ... existing sorting code ...
}

function countHighConfidenceFindings(results) {
  return results.reduce((count, result) => 
    count + result.findings.filter(f => f.confidence === 'High').length, 0);
}

function getTopTechnologies(results) {
  const techCount = {};
  results.forEach(result => {
    result.findings.forEach(finding => {
      finding.technologies.forEach(tech => {
        techCount[tech] = (techCount[tech] || 0) + 1;
      });
    });
  });
  
  return Object.entries(techCount)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .map(([tech, count]) => ({ tech, count }));
}

function analyzeTimeline(results) {
    const timeline = {};
    const currentYear = new Date().getFullYear();

    results.forEach(result => {
        result.findings.forEach(finding => {
            let year = finding.year;
            
            // Skip invalid years or years too far in the future
            if (year && !isNaN(year) && year <= currentYear + 1) {
                timeline[year] = (timeline[year] || 0) + 1;
            } else {
                timeline['Year not found'] = (timeline['Year not found'] || 0) + 1;
            }
        });
    });
    
    return Object.entries(timeline)
        .filter(([year]) => year !== 'Year not found') // Put "Year not found" at the end
        .sort(([a], [b]) => b - a)
        .concat([['Year not found', timeline['Year not found'] || 0]])
        .map(([year, count]) => ({ year, count }));
}

function analyzeRelationshipTypes(results) {
  const relationshipCount = {};
  results.forEach(result => {
    result.findings.forEach(finding => {
      relationshipCount[finding.relationship] = 
        (relationshipCount[finding.relationship] || 0) + 1;
    });
  });
  
  return Object.entries(relationshipCount)
    .sort(([,a], [,b]) => b - a)
    .map(([type, count]) => ({ type, count }));
}

function logAnalysisSummary(analysis, results) {
  console.log(`\nTarget Company: ${analysis.overview.targetCompany}`);
  console.log(`Analysis Date: ${new Date(analysis.overview.date).toLocaleDateString()}`);
  console.log(`\nSummary Statistics:`);
  console.log(`Total competitors analyzed: ${analysis.overview.totalCompetitors}`);
  console.log(`Competitors with findings: ${analysis.overview.competitorsFound}`);
  console.log(`High confidence findings: ${analysis.overview.highConfidenceFindings}`);

  console.log('\nTop Technologies:');
  analysis.metrics.topTechnologies.forEach(t => 
    console.log(`- ${t.tech}: ${t.count} mentions`));

  console.log('\nTop Competitors by Relationship Strength:');
  analysis.insights.strongestCompetitors.slice(0, 5).forEach(c => 
    console.log(`- ${c.name}: Score ${c.strength} (${c.findings} findings, ${c.highConfidence} high confidence)`));

  console.log('\nRelationship Types:');
  analysis.metrics.relationshipTypes.forEach(r => 
    console.log(`- ${r.type}: ${r.count} instances`));

  console.log('\nTimeline Analysis:');
  analysis.metrics.timeline.forEach(t => 
    console.log(`- ${t.year}: ${t.count} activities`));

  console.log('\nAnalysis complete.');
}

// Add new helper functions for analysis
function calculateRelationshipStrength(findings) {
  const factors = {
    confidence: {
      High: 3,
      Medium: 2,
      Low: 1
    },
    hasYear: 1,
    hasTechnologies: 1,
    hasDetailedRelationship: 1
  };

  return findings.reduce((total, finding) => {
    let score = factors.confidence[finding.confidence] || 1;
    
    if (finding.year) score += factors.hasYear;
    if (finding.technologies?.length > 0) score += factors.hasTechnologies;
    if (finding.relationship !== 'Business Relationship') score += factors.hasDetailedRelationship;
    
    return total + score;
  }, 0) / findings.length;
}

function extractKeyInsights(findings) {
  const insights = [];
  
  // Latest relationship
  const latestFinding = findings.reduce((latest, finding) => {
    if (!latest.year || (finding.year && finding.year > latest.year)) {
      return finding;
    }
    return latest;
  }, {});
  
  if (latestFinding.year) {
    insights.push(`Latest activity: ${latestFinding.year}`);
  }

  // Technology focus
  const allTech = findings.flatMap(f => f.technologies);
  if (allTech.length > 0) {
    const uniqueTech = [...new Set(allTech)];
    insights.push(`Key technologies: ${uniqueTech.join(', ')}`);
  }

  // Relationship type
  const relationships = findings.map(f => f.relationship)
    .filter(r => r !== 'Business Relationship');
  if (relationships.length > 0) {
    insights.push(`Primary relationship: ${relationships[0]}`);
  }

  return insights;
}

function generateSummary(findings) {
  return {
    totalFindings: findings.length,
    highestConfidence: getHighestConfidence(findings),
    latestYear: getLatestYear(findings),
    technologies: getAllTechnologies(findings),
    relationshipStrength: calculateRelationshipStrength(findings),
    keyInsights: extractKeyInsights(findings)
  };
}

function calculateCompetitorStrengths(results) {
  return results
    .map(result => ({
      competitor: result.competitor,
      strength: calculateRelationshipStrength(result.findings),
      findings: result.findings.length,
      highConfidence: result.findings.filter(f => f.confidence === 'High').length
    }))
    .sort((a, b) => b.strength - a.strength);
}

// Add this helper function near the other date-related functions
function extractPublicationDate(result) {
    // Check for the 'published' field from search results
    if (result.published_date) {
        const date = new Date(result.published_date);
        if (!isNaN(date)) {
            return date.getFullYear();
        }
    }

    // Check for date in snippet using regex
    const dateRegex = /\b(20\d{2})\b/;  // Matches years from 2000-2099
    const snippetMatch = result.snippet?.match(dateRegex);
    if (snippetMatch) {
        return parseInt(snippetMatch[1]);
    }

    return 'Year not found';
}

module.exports = {
  analyzeCompetitors
};