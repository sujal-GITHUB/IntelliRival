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
    try {
      startButton.disabled = true;
      loadingSection.classList.remove('d-none');
      const statusElement = document.getElementById('analysisStatus');
      
      // Simulate progress updates
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress <= 100) {
          progressBar.style.width = `${progress}%`;
          statusElement.textContent = getStatusMessage(progress);
        }
      }, 500);
      
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
    
      clearInterval(progressInterval);
      progressBar.style.width = '100%';
      
      // Update in the setTimeout block
      setTimeout(() => {
        // Hide loading section
        loadingSection.classList.add('d-none');
        
        // Show results container
        resultsContainer.classList.remove('d-none');
        
        // Check if we have valid data structure
        if (data && data.insights) {
            // Initialize charts with the complete data object
            initializeCharts(data);
            
            // Display other results
            if (data.competitors) {
                displayResults(data.competitors);
            }
            
            if (data.overview) {
                updateOverviewMetrics(data.overview);
            }
            
            if (data.insights) {
                displayInsights(data.insights);
            }
        } else {
            console.error('Invalid data format:', data);
            alert('Analysis completed but the data format was unexpected.');
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

  function displayInsights(insights) {
    const insightsContainer = document.createElement('div');
    insightsContainer.className = 'insights-container mb-4';
    
    // Create insights card with error handling for data formatting
    insightsContainer.innerHTML = `
        <div class="card">
            <div class="card-header bg-info text-white">
                <h5 class="mb-0">Key Insights</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <!-- Top Competitors Section -->
                    <div class="col-md-6 mb-3">
                        <h6>Top Competitors by Relationship Strength</h6>
                        <ul class="list-unstyled">
                            ${(insights.strongestCompetitors || []).map(comp => {
                                // Ensure strength is a valid number
                                const strength = parseFloat(comp.strength) || 0;
                                return `
                                    <li class="mb-2">
                                        <strong>${comp.name || 'Unknown'}</strong>: Score ${strength.toFixed(2)}
                                        <br>
                                        <small class="text-muted">
                                            ${comp.findings || 0} findings (${comp.highConfidence || 0} high confidence)
                                        </small>
                                    </li>
                                `;
                            }).join('')}
                        </ul>
                    </div>
                    
                    <!-- Technologies Section -->
                    <div class="col-md-6 mb-3">
                        <h6>Technology Focus Areas</h6>
                        <ul class="list-unstyled">
                            ${(insights.technologies || []).map(tech => `
                                <li class="mb-2">
                                    <strong>${tech.name}</strong>: ${tech.count || 0} mentions
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <!-- Relationship Types Section -->
                    <div class="col-md-6">
                        <h6>Relationship Types Distribution</h6>
                        <ul class="list-unstyled">
                            ${(insights.relationshipTypes || []).map(type => `
                                <li class="mb-2">
                                    <strong>${type.type || 'Unknown'}</strong>: ${type.count || 0} instances
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                    
                    <!-- Timeline Section -->
                    <div class="col-md-6">
                        <h6>Activity Timeline</h6>
                        <ul class="list-unstyled">
                            ${(insights.timeline || []).map(year => `
                                <li class="mb-2">
                                    <strong>${year.year || 'Unknown'}</strong>: ${year.count || 0} activities
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Insert insights before the competitor results
    resultsContainer.insertBefore(insightsContainer, competitorResults);
  }
});

function initializeCharts(data) {
    requestAnimationFrame(() => {
        try {
            // Clear existing charts
            Chart.helpers.each(Chart.instances, (instance) => {
                instance.destroy();
            });

            // 1. Top Competitors Chart
            const competitorCtx = document.getElementById('competitorStrengthChart');
            if (competitorCtx && data.insights.strongestCompetitors) {
                const topCompetitors = data.insights.strongestCompetitors;
                
                new Chart(competitorCtx, {
                    type: 'bar',
                    data: {
                        labels: topCompetitors.map(c => c.name),
                        datasets: [{
                            label: 'Relationship Strength',
                            data: topCompetitors.map(c => c.strength),
                            backgroundColor: 'rgba(54, 162, 235, 0.8)'
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Top 5 Competitors by Strength'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 5
                            }
                        }
                    }
                });
            }

            // 2. Technologies Distribution Chart
            const technologiesCtx = document.getElementById('technologiesChart');
            if (technologiesCtx && data.metrics && data.metrics.topTechnologies) {
                const techData = data.metrics.topTechnologies
                    .filter(tech => tech.name !== 'No specific technologies mentioned')
                    .slice(0, 5); // Get top 5 technologies

                console.log('Technology data for chart:', techData); // Debug log

                new Chart(technologiesCtx, {
                    type: 'pie',
                    data: {
                        labels: techData.map(t => t.name || t.tech), // Handle both name and tech properties
                        datasets: [{
                            data: techData.map(t => t.count),
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(255, 206, 86, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(153, 102, 255, 0.8)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Top 5 Technologies'
                            },
                            legend: {
                                position: 'right',
                                labels: {
                                    boxWidth: 12
                                }
                            }
                        }
                    }
                });
            } else {
                console.warn('Technologies chart: Missing required data', {
                    hasContext: !!technologiesCtx,
                    hasMetrics: !!data.metrics,
                    hasTopTech: !!(data.metrics && data.metrics.topTechnologies)
                });
            }

            // 3. Timeline Chart
            const timelineCtx = document.getElementById('timelineChart');
            if (timelineCtx && data.metrics.timeline) {
                const timelineData = data.metrics.timeline
                    .filter(item => item.year !== 'Year not found')
                    .sort((a, b) => parseInt(a.year) - parseInt(b.year));

                new Chart(timelineCtx, {
                    type: 'line',
                    data: {
                        labels: timelineData.map(t => t.year),
                        datasets: [{
                            label: 'Activities',
                            data: timelineData.map(t => t.count),
                            borderColor: 'rgba(75, 192, 192, 1)',
                            backgroundColor: 'rgba(75, 192, 192, 0.2)',
                            tension: 0.1,
                            fill: true
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Activity Timeline'
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        }
                    }
                });
            }

            // 4. Relationship Types Chart
            const relationshipCtx = document.getElementById('relationshipChart');
            if (relationshipCtx && data.metrics.relationshipTypes) {
                const relationshipData = data.metrics.relationshipTypes;

                new Chart(relationshipCtx, {
                    type: 'doughnut',
                    data: {
                        labels: relationshipData.map(r => r.type),
                        datasets: [{
                            data: relationshipData.map(r => r.count),
                            backgroundColor: [
                                'rgba(255, 159, 64, 0.8)',
                                'rgba(75, 192, 192, 0.8)',
                                'rgba(54, 162, 235, 0.8)',
                                'rgba(153, 102, 255, 0.8)'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            title: {
                                display: true,
                                text: 'Relationship Types Distribution'
                            },
                            legend: {
                                position: 'right',
                                labels: {
                                    boxWidth: 12
                                }
                            }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Error initializing charts:', error);
            console.group('Debug Data');
            console.log('Data structure:', JSON.stringify(data, null, 2));
            console.log('Error details:', error.message);
            console.groupEnd();
        }
    });
}

function getStatusMessage(progress) {
    if (progress < 25) return 'Gathering competitor data...';
    if (progress < 50) return 'Analyzing relationships...';
    if (progress < 75) return 'Processing findings...';
    if (progress < 90) return 'Generating insights...';
    return 'Finalizing results...';
}