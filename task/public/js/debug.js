document.addEventListener('DOMContentLoaded', () => {
    // Simple debug function to test result display
    async function debugResults() {
      console.log("Debug mode enabled");
      
      // Create a container for displaying debug info
      const debugContainer = document.createElement('div');
      debugContainer.classList.add('debug-container', 'alert', 'alert-info', 'mt-4');
      debugContainer.innerHTML = `
        <h3>Debug Mode</h3>
        <p>Testing results display...</p>
        <div id="apiResponse" class="mt-3">Loading API response...</div>
      `;
      
      document.querySelector('.container').appendChild(debugContainer);
      
      try {
        // Make API request to test endpoint
        const response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            targetCompany: 'Virgin Media'
          })
        });
        
        const responseText = await response.text();
        
        try {
          // Try to parse as JSON
          const data = JSON.parse(responseText);
          console.log("API response parsed:", data);
          
          // Display in debug container
          document.getElementById('apiResponse').innerHTML = `
            <strong>Status:</strong> ${response.status} ${response.statusText}<br>
            <strong>Results count:</strong> ${data.results ? data.results.length : 'No results array'}<br>
            <strong>Data structure:</strong> <pre>${JSON.stringify(data, null, 2)}</pre>
          `;
          
          // If we have results, show them
          if (data.results && data.results.length > 0) {
            const resultsContainer = document.getElementById('resultsContainer');
            if (resultsContainer) {
              resultsContainer.classList.remove('d-none');
              document.getElementById('relationshipCount').textContent = data.results.length;
              
              // Attempt to display results
              try {
                displayResultsSimple(data.results);
              } catch (displayError) {
                console.error("Error displaying results:", displayError);
                document.getElementById('apiResponse').innerHTML += `
                  <div class="alert alert-danger mt-3">
                    <strong>Display Error:</strong> ${displayError.message}
                  </div>
                `;
              }
            }
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          document.getElementById('apiResponse').innerHTML = `
            <div class="alert alert-danger">
              <strong>Parse Error:</strong> ${parseError.message}<br>
              <strong>Raw Response:</strong> <pre>${responseText}</pre>
            </div>
          `;
        }
      } catch (fetchError) {
        console.error("Fetch error:", fetchError);
        document.getElementById('apiResponse').innerHTML = `
          <div class="alert alert-danger">
            <strong>Fetch Error:</strong> ${fetchError.message}
          </div>
        `;
      }
    }
    
    // Simple results display function
    function displayResultsSimple(results) {
      const competitorResults = document.getElementById('competitorResults');
      if (!competitorResults) {
        throw new Error('competitorResults element not found');
      }
      
      competitorResults.innerHTML = '';
      
      results.forEach(result => {
        const { competitor, findings } = result;
        
        findings.forEach(finding => {
          const resultItem = document.createElement('div');
          resultItem.classList.add('card', 'mb-4');
          resultItem.innerHTML = `
            <div class="card-header">
              <h5>${competitor}</h5>
              <span class="badge bg-${finding.confidence === 'High' ? 'success' : finding.confidence === 'Medium' ? 'info' : 'secondary'}">
                ${finding.confidence} Confidence
              </span>
            </div>
            <div class="card-body">
              <h6>${finding.title}</h6>
              <p>${finding.snippet}</p>
              <div class="relationship-details">
                <p><strong>Type:</strong> ${finding.relationship}</p>
                <p><strong>Timeframe:</strong> ${finding.year}</p>
              </div>
              <a href="${finding.link}" class="btn btn-sm btn-outline-primary" target="_blank">View Source</a>
            </div>
          `;
          
          competitorResults.appendChild(resultItem);
        });
      });
    }
    
    // Add a debug button
    const debugButton = document.createElement('button');
    debugButton.classList.add('btn', 'btn-warning', 'mt-3');
    debugButton.textContent = 'Debug Mode';
    debugButton.addEventListener('click', debugResults);
    
    // Add it after the start analysis button
    const startButton = document.getElementById('startAnalysis');
    if (startButton) {
      startButton.parentNode.appendChild(debugButton);
    } else {
      // If start button not found, add to the container
      document.querySelector('.container').appendChild(debugButton);
    }
  });