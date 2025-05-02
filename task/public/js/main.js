document.addEventListener('DOMContentLoaded', () => {
  // Elements
  const startButton = document.getElementById('startAnalysis');
  const loadingSection = document.getElementById('loadingSection');
  const progressBar = document.getElementById('progressBar');
  const resultsContainer = document.getElementById('resultsContainer');
  const competitorResults = document.getElementById('competitorResults');
  const relationshipCount = document.getElementById('relationshipCount');
  
  // Template
  const resultItemTemplate = document.getElementById('resultItemTemplate');
  
  // Start analysis button click handler
  startButton.addEventListener('click', async () => {
    // Show loading section
    startButton.disabled = true;
    loadingSection.classList.remove('d-none');
    
    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 5;
      if (progress > 95) clearInterval(progressInterval);
      progressBar.style.width = `${progress}%`;
    }, 300);
    
    try {
      // Make API request to run analysis
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          targetCompany: 'Virgin Media'
        })
      });
      
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      
      const data = await response.json();
      
      // Log the response to console for debugging
      console.log("Analysis results:", data);
      
      // Complete progress bar
      clearInterval(progressInterval);
      progressBar.style.width = '100%';
      
      // Update the validation and display logic
      setTimeout(() => {
        // Hide loading section
        loadingSection.classList.add('d-none');
        
        // Check if we  valid results structure
        if (data && data.competitors && Array.isArray(data.competitors)) {
          // Display results using competitors array
          displayResults(data.competitors);
          
          // Show results container
          resultsContainer.classList.remove('d-none');
          
          // Display overview metrics if available
          if (data.overview) {
            updateOverviewMetrics(data.overview);
          }
          
          // Display insights if available
          if (data.insights) {
            displayInsights(data.insights);
          }
        } else {
          console.error('Invalid results format:', data);
          alert('Analysis completed but the results format was unexpected. Please try again.');
        }
        
        // Re-enable button
        startButton.disabled = false;
      }, 1000);
      
    } catch (error) {
      console.error('Error:', error);
      
      // Hide loading section and show error
      loadingSection.classList.add('d-none');
      alert('An error occurred during analysis. Please try again.');
      
      // Re-enable button
      startButton.disabled = false;
    }
  });
  
  // Update the display function to handle the new format
  function displayResults(competitors) {
    // Clear previous results
    competitorResults.innerHTML = '';
    
    // Update relationship count
    relationshipCount.textContent = competitors.length;
    
    // Generate results for each competitor
    competitors.forEach(competitor => {
      const { name, findings } = competitor;
      
      findings.forEach(finding => {
        // Clone template
        const resultItem = resultItemTemplate.content.cloneNode(true);
        
        // Update competitor name
        resultItem.querySelector('.competitor-name').textContent = name;
        
        // Update confidence badge
        const confidenceBadge = resultItem.querySelector('.confidence-badge');
        confidenceBadge.textContent = `${finding.confidence} Confidence`;
        confidenceBadge.classList.add(`confidence-${finding.confidence.toLowerCase()}`);
        
        // Update finding details
        resultItem.querySelector('.finding-title').textContent = finding.title;
        resultItem.querySelector('.finding-snippet').textContent = finding.snippet;
        resultItem.querySelector('.relationship-type').textContent = finding.relationship;
        resultItem.querySelector('.relationship-year').textContent = finding.year || 'Recent';
        
        // Update source link if available
        const sourceLink = resultItem.querySelector('.source-link');
        if (finding.link) {
          sourceLink.href = finding.link;
        } else {
          sourceLink.style.display = 'none';
        }
        
        // Add to results container
        competitorResults.appendChild(resultItem);
      });
    });
  }
  
  // Add helper function for overview metrics
  function updateOverviewMetrics(overview) {
    const metricsContainer = document.createElement('div');
    metricsContainer.className = 'overview-metrics mb-4';
    metricsContainer.innerHTML = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">Analysis Overview</h5>
          <div class="row">
            <div class="col-md-4">
              <p>Total Competitors: ${overview.totalCompetitors}</p>
            </div>
            <div class="col-md-4">
              <p>With Findings: ${overview.competitorsFound}</p>
            </div>
            <div class="col-md-4">
              <p>High Confidence: ${overview.highConfidenceFindings}</p>
            </div>
          </div>
        </div>
      </div>
    `;
    resultsContainer.insertBefore(metricsContainer, competitorResults);
  }
});