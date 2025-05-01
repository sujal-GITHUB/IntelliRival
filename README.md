# Infosys Competitor Intelligence Tool

A web application that analyzes which competitors of Infosys have worked with or are currently working with Virgin Media.

---

## 🧠 Overview

This tool simulates an AI-powered competitive intelligence system that scans publicly available information to find evidence of collaboration between **Virgin Media** and competitors of **Infosys**.

The findings include:

- ✅ Which competitors have worked with Virgin Media  
- 🔍 The nature of their collaboration/relationship  
- 🔗 Links to sources where the information was found  
- 📊 Confidence level of the findings  

---

## ✨ Features

- 📋 Detailed analysis of competitor relationships  
- 🕸️ Visual network graph of connections (via D3.js)  
- 📈 Confidence ratings for each finding  
- 🔗 Links to source material for verification  
- 📱 Responsive UI for all devices  

---

## 🏗️ Architecture

### Backend

- 🛠️ **Node.js + Express** for server-side logic  
- 🔎 Simulated web scraping and data analysis  
- 🌐 RESTful API endpoint for retrieving competitor analysis  

### Frontend

- 🎨 **HTML/CSS + Bootstrap** for responsive layout  
- 📜 JavaScript for interactivity  
- 📊 **D3.js** for graph visualization  
- 🧩 EJS templating for dynamic server-side rendering  

---

## 📁 Project Structure

infosys-competitor-analysis/
├── server.js              # Main application entry point
├── analyzer.js            # Competitor analysis module
├── scraper.js             # Web scraping simulation module
├── competitors.js         # List of Infosys competitors
├── package.json           # Project dependencies
├── public/                # Static assets
│   ├── css/
│   │   └── styles.css     # Custom styles
│   └── js/
│       ├── main.js        # Main page JavaScript
│       └── results.js     # Results page JavaScript with D3 visualization
└── views/                 # EJS templates
    ├── index.ejs          # Home page template
    └── results.ejs        # Results page template

## 🧪 Technical Approach

- **Data Collection**: Simulated web scraping/API queries for competitor relationships  
- **Data Analysis**: Assigns confidence levels and extracts relationship context  
- **Visualization**: Interactive D3.js network graph  
- **UI**: Responsive EJS + Bootstrap frontend for easy navigation and insights  

---

## ⚙️ Technical Decisions

- 🧪 Simulated data used for demo; real scraping or APIs can be plugged in later  
- 📊 D3.js chosen for powerful, flexible graph rendering  
- 🧩 EJS for clean templating with Express  
- 💻 Bootstrap for quick, responsive design  

---

## 🔮 Future Enhancements

- 🌍 Real-time web scraping from sources like press releases and news sites  
- 🧠 AI/NLP analysis to extract relationship sentiment and strength  
- 👤 User login with saved analysis sessions  
- 📤 Export options (PDF, CSV, CRM integration)  
- 🏢 Multi-company analysis capabilities  

---

## 🪪 License

This project is licensed under the **MIT License**.

---

## 🙌 Acknowledgements

- **Node.js, Express, and EJS**  
- **D3.js** for data visualization  
- **Bootstrap** for UI design  
- Simulated data modeled after real-world cases  

