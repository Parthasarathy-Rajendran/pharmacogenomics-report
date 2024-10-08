import React from 'react';
import './App.css';
// import ReportGenerator from './components/ReportGenerator';
import PharmacogenomicsTest from './components/PharmacogenomicsTest';
// import PdfGenerator from './components/PdfGenerator';

function App() {
  return (
    <div className="App">
      <header className='App-header'>
        <h1>Report Generator</h1>
      </header>
      <main>
        {/* <ReportGenerator /> */}
        <PharmacogenomicsTest />
        {/* <PdfGenerator /> */}
      </main>
    </div>
  );
}

export default App;
