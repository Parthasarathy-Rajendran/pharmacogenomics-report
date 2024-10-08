import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const PDFGenerator = () => {
  const [patientDetails, setPatientDetails] = useState({
    patientID: '',
    name: '',
    age: '',
    sex: ''
  });
  const [physicianInfo, setPhysicianInfo] = useState('');
  const [specimen, setSpecimen] = useState({
    type: '',
    date: ''
  });
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');
  const [reportDate, setReportDate] = useState(new Date().toLocaleDateString()); // Initialize with current date

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientDetails({ ...patientDetails, [name]: value });
  };

  const handlePhysicianChange = (e) => {
    setPhysicianInfo(e.target.value);
  };

  const handleSpecimenChange = (e) => {
    const { name, value } = e.target;
    setSpecimen({ ...specimen, [name]: value });
  };

  const handleFileUpload = (e) => {
    setFile(e.target.files[0]);
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    
    const addFirstPageContent = () => {
      doc.setFontSize(10);
      const backgroundColor = '#e0dcdc';
      const contentX = 30; // X position of the content area
      const contentWidth = 540; // Width of the content area
      const textHeight = 9; // Height for text areas (adjusted for smaller height)
      const borderRadius = 5; // Radius for border radius
      const margin = 10; // Margin for rectangle

      // Helper function to draw background with border radius
      const drawBackgroundRect = (yPosition, width, height) => {
        doc.setFillColor(backgroundColor);
        doc.roundedRect(contentX - margin, yPosition - margin, width + 2 * margin, height + 1.2 * margin, borderRadius, borderRadius, 'F');
      };

      // Helper function to draw a line connecting two points
      const drawConnectingLine = (x1, y1, x2, y2) => {
        doc.setDrawColor('#000');
        doc.setLineWidth(0.5);
        doc.line(x1, y1, x2, y2);
      };

      // Define text positions
      const patientInfoY = 115;
      const physicianInfoY = 140;
      const reportDateY = 140; // Align with Physician Information
      const specimenY = 165;
      const lineAfterSpecimenY = specimenY + textHeight + 10; // Position for the line after Specimen section

      // Draw background for Patient Information
      drawBackgroundRect(patientInfoY, contentWidth, textHeight);
      const patientInfo = `Patient information: ${patientDetails.patientID} | ${patientDetails.sex} | ${patientDetails.age} | ${patientDetails.name}`;
      doc.setTextColor('#000');
      doc.text(patientInfo, contentX, patientInfoY + textHeight / 3);

      // Draw background for Physician Information and Report Date
      const combinedWidth = contentWidth / 2; // Width for both texts
      const combinedHeight = textHeight; // Height for both texts
      drawBackgroundRect(physicianInfoY, combinedWidth + 100, combinedHeight); // Added 10 for spacing

      // Draw Physician Information
      const physicianInfoText = `Physician information: ${physicianInfo}`;
      doc.text(physicianInfoText, contentX, physicianInfoY + textHeight / 3);

      // Draw Report Date background with even height and border radius
      const reportDateWidth = 165; // Width of the background rectangle for Report Date
      const reportDateBackgroundY = reportDateY - 10; // Adjust Y position if needed
      const reportDateHeight = textHeight + 11; // Ensure even height
      doc.setFillColor('#d3d3d3'); // Light gray background color
      doc.roundedRect(contentX + combinedWidth + 115, reportDateBackgroundY, reportDateWidth, reportDateHeight, 5, 5, 'F'); // Added rounded borders

      // Draw Report Date text on top of background
      const reportDateText = `Report Date: ${reportDate}`;
      doc.setTextColor('#000');
      doc.text(reportDateText, contentX + combinedWidth + 137, reportDateY + textHeight / 3, { align: 'left' }); // Moved to the right

      // Draw a line connecting the Physician Information and Report Date
      drawConnectingLine(contentX + combinedWidth, physicianInfoY, contentX + combinedWidth + 10, reportDateY);

      // Draw background for Specimen
      drawBackgroundRect(specimenY, contentWidth, textHeight);
      const specimenText = `Specimen: Type - ${specimen.type} | ${specimen.date}`;
      doc.text(specimenText, contentX, specimenY + textHeight / 3);

      // Draw horizontal line after Specimen section
      doc.setDrawColor('#7c5dac'); // Line color
      doc.setLineWidth(3); // Line width
      doc.line(contentX / 1.5, lineAfterSpecimenY / .95, contentX / .7 + contentWidth, lineAfterSpecimenY / .95); // Draw line

      // Add paragraph after the horizontal line
      const paragraphY = lineAfterSpecimenY + 30; // Adjust position below the horizontal line
      const paragraph = `MEDLYTx is a molecular data analytics and simulation engine based pharmacogenomics test that explores the whole exome data of the patient’s DNA. This test demystifies the complex genomic anomalies unique to that patient and provides information about how the patient may respond to the tested drugs.`;
      doc.setFontSize(13.1);
      doc.setTextColor('#000');
      doc.setFont("helvetica", "normul")
      doc.text(paragraph, contentX / 1.5, paragraphY, { maxWidth: contentWidth / .96 }); // Added maxWidth to wrap text within the content area
      
     // Add content box after the paragraph
  const boxY = paragraphY + 50; // Position after paragraph
  const boxHeight = 530; // Adjust height to fit content

  // Draw rounded rectangle with border radius
  doc.setDrawColor('#000'); // Line color
  doc.setLineWidth(1);
  doc.roundedRect(contentX / 1.8, boxY, contentWidth / .95, boxHeight, 25, 25, 'S');

  // Add heading inside the box with new styles and positions
const boxHeadingY = boxY + 20;
doc.setFontSize(15);
doc.setFont("helvetica", "bold");
doc.setTextColor('#7c5dac');
doc.text('MEDLYTx', contentX + 195, boxHeadingY); // Adjust position if needed

doc.setFontSize(15);
doc.setFont("helvetica", "bold");
doc.setTextColor('#5f5f5e');
doc.text('Reporting', contentX + 270, boxHeadingY - .5); // Adjust position as needed
  
  // Add first paragraph inside the box
  const boxParagraphY = boxHeadingY + 20;
  const boxParagraph = `According to the genotype identified in the patient, medications are classified as described below.`;
  doc.setFontSize(8);
  doc.text(boxParagraph, contentX + 90, boxParagraphY, { maxWidth: contentWidth / .2 });

  // Add first table inside the box
  const tableStartY = boxParagraphY + 20;
  const rowHeight = 30;
  const tableData = [
    ['PGx Type', 'Description'],
    ['checkBox', 'Use as Directed: The Genotype of the patient corresponds to having Normal metabolism/typical risk of adverse events.'],
    ['Warning', 'Use with Caution: Altered metabolism compared to normal, data/labels/guidelines suggest monitoring may suffice and the risk of adverse reactions / clinical impact is moderate.'],
    ['Stop', 'Increased Caution/ Reduce Dose or Avoid: Altered metabolism compared to normal, data/labels/guidelines indicate substantial dosage and monitoring modifications, cautionary measures, or contraindication for the genotype.'],
    ['Blue Circle', 'Limited Pharmacogenomic (PGx) Impact: Pharmacogenetic variations do not exert a significant influence on drug response, and current evidence lacks substantial genotype-related support.']
  ];

  doc.autoTable({
    startY: tableStartY,
    head: [tableData[0]], // Header
    body: tableData.slice(1), // Body rows
    theme: 'grid',
    margin: { left: 15, right: 15 },
    headStyles: { fillColor: '#e0dcdc', textColor: '#000', fontSize: 8 },
    bodyStyles: { fontSize: 8 },
    styles: { overflow: 'linebreak', halign: 'left', cellWidth: 'wrap' },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: 200 } }
  });

  // Add a second page for the detailed data
  doc.addPage();
  doc.setFontSize(10);
  doc.setTextColor('#000');
  doc.text("Detailed Data Analysis", 14, 20); // Adjust position if needed

  // Read and parse the uploaded Excel file
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      jsonData.forEach((row, index) => {
        const rowIndex = index + 1;
        doc.text(`Drug: ${row.drug}`, 14, 30 + rowIndex * 10);
        doc.text(`Drug Class: ${row.drugClass}`, 14, 40 + rowIndex * 10);
        doc.text(`Icon: ${row.icon}`, 14, 50 + rowIndex * 10);
        doc.text(`Type of Action: ${row.typeOfAction}`, 14, 60 + rowIndex * 10);
        doc.text(`Recommendation: ${row.recommendation}`, 14, 70 + rowIndex * 10);
      });

      doc.save('report.pdf');
    };
    reader.readAsArrayBuffer(file);
  }
};

// Trigger PDF generation when user submits the form
const handleSubmit = (e) => {
  e.preventDefault();
  generatePDF();
};

return (
  <form onSubmit={handleSubmit}>
    <input type="text" name="patientID" value={patientDetails.patientID} onChange={handleInputChange} placeholder="Patient ID" />
    <input type="text" name="name" value={patientDetails.name} onChange={handleInputChange} placeholder="Name" />
    <input type="text" name="age" value={patientDetails.age} onChange={handleInputChange} placeholder="Age" />
    <input type="text" name="sex" value={patientDetails.sex} onChange={handleInputChange} placeholder="Sex" />
    <input type="text" value={physicianInfo} onChange={handlePhysicianChange} placeholder="Physician Information" />
    <input type="text" name="type" value={specimen.type} onChange={handleSpecimenChange} placeholder="Specimen Type" />
    <input type="text" name="date" value={specimen.date} onChange={handleSpecimenChange} placeholder="Specimen Date" />
    <input type="file" onChange={handleFileUpload} />
    <button type="submit">Generate PDF</button>
  </form>
);
};
}
export default PDFGenerator;
