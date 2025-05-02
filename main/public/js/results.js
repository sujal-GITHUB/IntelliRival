document.addEventListener('DOMContentLoaded', async () => {
    const competitorResults = document.getElementById('competitorResults');
    const relationshipCount = document.getElementById('relationshipCount');
    const visualization = document.getElementById('visualization');
    
    const resultItemTemplate = document.getElementById('resultItemTemplate');
    
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
        throw new Error('Failed to fetch results');
      }
      
      const data = await response.json();
      
      displayResults(data.results);
      createVisualization(data.results);
      
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while loading results. Please try again.');
    }

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

    function createVisualization(results) {
      const nodes = [];
      const links = [];

      nodes.push({
        id: 'Virgin Media',
        type: 'target',
        name: 'Virgin Media',
        radius: 25
      });

      results.forEach(result => {
        const { competitor, findings } = result;

        nodes.push({
          id: competitor,
          type: 'competitor',
          name: competitor,
          radius: 15,
          confidence: findings[0].confidence
        });
        
        links.push({
          source: 'Virgin Media',
          target: competitor,
          value: findings[0].confidence === 'High' ? 3 : 
                 findings[0].confidence === 'Medium' ? 2 : 1,
          relationship: findings[0].relationship
        });
      });
      
      const width = visualization.clientWidth;
      const height = 400;

      const svg = d3.select('#visualization')
        .append('svg')
        .attr('width', width)
        .attr('height', height);

      const g = svg.append('g')
        .attr('transform', `translate(${width / 2}, ${height / 2})`);

      const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.id).distance(100))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(0, 0))
        .on('tick', ticked);

      const link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('class', 'link')
        .attr('stroke-width', d => d.value * 2)
        .attr('stroke', d => d.value === 3 ? '#28a745' : 
                           d.value === 2 ? '#17a2b8' : '#6c757d');

      const node = g.selectAll('.node')
        .data(nodes)
        .enter()
        .append('g')
        .attr('class', 'node')
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      node.append('circle')
        .attr('r', d => d.radius)
        .attr('fill', d => d.type === 'target' ? '#dc3545' : 
                         d.confidence === 'High' ? '#28a745' : 
                         d.confidence === 'Medium' ? '#17a2b8' : '#6c757d')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2);
      
      node.append('text')
        .attr('dy', d => d.type === 'target' ? -30 : -20)
        .attr('text-anchor', 'middle')
        .text(d => d.name)
        .attr('fill', '#333')
        .attr('font-weight', d => d.type === 'target' ? 'bold' : 'normal');

      function ticked() {
        link
          .attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);
        
        node
          .attr('transform', d => `translate(${d.x}, ${d.y})`);
      }

      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
      
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
      
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
    }
  });