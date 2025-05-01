document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startAnalysis');
    const loadingSection = document.getElementById('loadingSection');
    const progressBar = document.getElementById('progressBar');
    const resultsContainer = document.getElementById('resultsContainer');
    const competitorResults = document.getElementById('competitorResults');
    const relationshipCount = document.getElementById('relationshipCount');

    const resultItemTemplate = document.getElementById('resultItemTemplate');
    
    startButton.addEventListener('click', async () => {
      startButton.disabled = true;
      loadingSection.classList.remove('d-none');
      
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += 5;
        if (progress > 95) clearInterval(progressInterval);
        progressBar.style.width = `${progress}%`;
      }, 300);
      
      try {
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

        setTimeout(() => {
          loadingSection.classList.add('d-none');
          displayResults(data.results);

          resultsContainer.classList.remove('d-none');

          startButton.disabled = false;
        }, 1000);
        
      } catch (error) {
        console.error('Error:', error);

        loadingSection.classList.add('d-none');
        alert('An error occurred during analysis. Please try again.');

        startButton.disabled = false;
      }
    });
    
    function displayResults(results) {
      competitorResults.innerHTML = '';
      relationshipCount.textContent = results.length;
      
      results.forEach(result => {
        const { competitor, findings } = result;
        
        findings.forEach(finding => {
          const resultItem = resultItemTemplate.content.cloneNode(true);
          resultItem.querySelector('.competitor-name').textContent = competitor;

          const confidenceBadge = resultItem.querySelector('.confidence-badge');
          confidenceBadge.textContent = `${finding.confidence} Confidence`;
          confidenceBadge.classList.add(`confidence-${finding.confidence.toLowerCase()}`);
          
          resultItem.querySelector('.finding-title').textContent = finding.title;
          resultItem.querySelector('.finding-snippet').textContent = finding.snippet;
          resultItem.querySelector('.relationship-type').textContent = finding.relationship;
          resultItem.querySelector('.relationship-year').textContent = finding.year;
          
          const sourceLink = resultItem.querySelector('.source-link');
          sourceLink.href = finding.link;

          competitorResults.appendChild(resultItem);
        });
      });
    }
  });