import React, { useState } from 'react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import logoImg from '../img/kyvor_logo.png'; // Adjust the path if necessary
// import checkBoxImg from '../img/check-box.png';
// import warningImg from '../img/warning.png';
// import stopImg from '../img/stop.png';
// import blueCircleImg from '../img/record.png';


const PharmacogenomicsTest = () => {
  const [patientDetails, setPatientDetails] = useState({
    patientID: '',
    name: '',
    age: '',
    sex: '',
  });
  const [physicianInfo, setPhysicianInfo] = useState('');
  const [specimen, setSpecimen] = useState({ type: '', date: '' });
  const [, setExcelData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState('');

  // Automatically set the report date to today's date
  const reportDate = new Date().toLocaleDateString();

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
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      setExcelData(parsedData);
    };
    reader.readAsArrayBuffer(file);
  };

  const generatePDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const addHeader = () => {
      // Add logo
      doc.addImage(logoImg, 'PNG', 40, 14, 100, 60); // Adjust size and position as needed

      // Add MEDLYTx text
      doc.setFontSize(36);
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#7c5dac');
      doc.text('MEDLY', 401, 70); // Adjust position as needed
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#5f5f5e');
      doc.text('Tx', 530, 69); // Adjust position as needed

      // Draw horizontal line
      const lineY = 85;
      doc.setDrawColor('#000');
      doc.setLineWidth(0.2);
      doc.line(20, lineY, 580, lineY);
    };

    const addFooter = (pageNumber) => {
      if (pageNumber > 1) {
        const footerY = 841; // Y position for footer (adjust as needed)
        const footerHeight = 30; // Height of the footer

        // Background color
        doc.setFillColor('#e0dcdc');
        doc.rect(0, footerY - footerHeight, 600, footerHeight, 'F');

        // Text color
        doc.setFontSize(10.5);
        doc.setFont("helvetica", "bold");
        doc.setTextColor('#000');

        // Page number
        doc.text(`Page ${pageNumber}`, 20, footerY - 10);

        // Patient ID
        doc.text(`Patient ID: ${patientDetails.patientID}`, 210, footerY - 10);

        // Patient Name
        doc.text(`Patient Name: ${patientDetails.name}`, 410, footerY - 10);
      }
    };


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
        ['Blue Circle', 'Limited Pharmacogenomic (PGx) Impact: Pharmacogenetic variations do not exert a significant influence on drug response, and current evidence lacks substantial genotype-related support regarding drug-gene interactions.']
      ];

      // Draw table headers
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(tableData[0][0], contentX + 20, tableStartY);
      doc.text(tableData[0][1], contentX + 90, tableStartY);

      // Draw table rows
      doc.setFont('helvetica', 'normal');
      for (let i = 1; i < tableData.length; i++) {
        const rowY = tableStartY + i * rowHeight;
        doc.text(tableData[i][0], contentX + 20, rowY);
        doc.text(tableData[i][1], contentX + 90, rowY, { maxWidth: contentWidth - 120 });
      }

      // Add a colored horizontal line inside the box
      const lineY = tableStartY + tableData.length * rowHeight + 20;
      doc.setLineWidth(2);
      doc.setDrawColor(124, 93, 172); // RGB equivalent of #7c5dac
      doc.line(contentX - 14, lineY, contentX + contentWidth + 15, lineY);

      // Add second paragraph inside the box
      const secondParagraphY = lineY + 20;
      const secondParagraph = `Medications are reported with icons to indicate and categorize evidence based on the recommending authority.`;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(secondParagraph, contentX + 90, secondParagraphY, { maxWidth: contentWidth / .2 });


      // Add second table inside the box
      const secondTableStartY = secondParagraphY + 20;
      const secondTableData = [
        ['Icon', 'Description'],
        ['★', 'FDA Biomarker: Mentioned in FDA table of pharmacogenomic biomarkers.'],
        ['%', 'Professional Guideline: Type of action needed for patient genotype is available in Professional Guideline (CPIC, DPWG).'],
        ['☆', 'Mentioned in FDA Drug Label: FDA label mentions involvement of the pharmacogene in the drug metabolism.'],
        ['⊕', 'Additional Testing: Additional laboratory testing indicated in FDA label for the drug.']
      ];

      // Draw second table headers
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(secondTableData[0][0], contentX + 20, secondTableStartY);
      doc.text(secondTableData[0][1], contentX + 90, secondTableStartY);

      // Draw second table rows
      doc.setFont('helvetica', 'normal');
      for (let i = 1; i < secondTableData.length; i++) {
        const rowY = secondTableStartY + i * rowHeight;
        doc.text(secondTableData[i][0], contentX + 20, rowY);
        doc.text(secondTableData[i][1], contentX + 90, rowY, { maxWidth: contentWidth - 120 });
      }

      // Add horizontal row after the box   
      const lineAfterBoxY = boxY + boxHeight + 8; // Position after the box
      doc.setDrawColor('#000');
      doc.setLineWidth(0.5);
      doc.line(contentX / 1.5, lineAfterBoxY, contentX / 1.5 + contentWidth / .95, lineAfterBoxY);

      // Add the paragraph after the horizontal row
      const paragraphAfterLineY = lineAfterBoxY + 12; // Position the paragraph below the line
      const findingsParagraph = `All findings mentioned in this report are based on genomic alterations found in the tested patient’s DNA sample. Treating physician’s decision is final. For more information on important disclaimers please refer Annexure B.`;
      doc.setFontSize(10);
      doc.text(findingsParagraph, contentX / .50, paragraphAfterLineY, { maxWidth: contentWidth / 1.10 });

    };

    // second page 
    const addSecondPageContent = (align = 'left') => {
      // Define box dimensions and properties
      const boxX = 15; // X position of the box
      const boxY = 100; // Y position of the box
      const boxWidth = 570; // Width of the box
      const boxHeight = 690; // Total height of the box

      // Draw rounded rectangle box (outer border)
      doc.setFillColor('#FFFFFF'); // Set background color
      doc.setDrawColor('#000'); // Set border color
      doc.setLineWidth(0.5); // Set border thickness
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 25, 25, 'S'); // Add border radius

      // Add "Table of Contents" header and center it within the box
      doc.setFontSize(15);
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#000');
      doc.text('Table of Contents', boxX + boxWidth / 2, boxY + 30, { align: 'center' }); // Centered inside the box

      // Define table data
      const tableData = [
        { medicalCondition: "Patient’s Current Medication list", pageNo: "3" },
        { medicalCondition: "Allergy", pageNo: "4" },
        { medicalCondition: "Analgesic / Anesthesiology", pageNo: "4" },
        { medicalCondition: "Anti-Coagulant / Anti-Platelet", pageNo: "4" },
        { medicalCondition: "Anti-Inflammatory", pageNo: "4" },
        { medicalCondition: "Cardiovascular", pageNo: "4, 5" },
        { medicalCondition: "Dietary", pageNo: "5" },
        { medicalCondition: "Endocrinology", pageNo: "5" },
        { medicalCondition: "Gastroenterology", pageNo: "5" },
        { medicalCondition: "Genetic Disease", pageNo: "6" },
        { medicalCondition: "Immunosuppression", pageNo: "6" },
        { medicalCondition: "Infectious Disease", pageNo: "6" },
        { medicalCondition: "Neurology", pageNo: "7" },
        { medicalCondition: "Oncology - Chemo Therapy", pageNo: "7" },
        { medicalCondition: "Oncology - Hormone Therapy", pageNo: "8" },
        { medicalCondition: "Oncology - Targeted Therapy", pageNo: "8" },
        { medicalCondition: "Oral Contraceptives", pageNo: "8" },
        { medicalCondition: "Psychiatry", pageNo: "9" },
        { medicalCondition: "Pulmonary", pageNo: "9" },
        { medicalCondition: "Rheumatology", pageNo: "9" },
        { medicalCondition: "Sleep Medicine", pageNo: "10" },
        { medicalCondition: "Urology", pageNo: "10" },
        { medicalCondition: "MEDLYTx Key Findings - #", pageNo: "11, 12, 13" },
      ];

      // Set font size and style for table content
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      // Define table positions and styling
      const tocX = 35; // X position of the first column (Medical Condition)
      const pageNoX = 450; // X position of the second column (Page No)
      let tocY = boxY + 50; // Adjusted Y position for the table content (gap added after the header)

      // Define table column widths
      const colWidth1 = 400; // Width for Medical Condition column
      // const colWidth2 = 170;  // Width for Page No column

      // Header (Medical Condition and Page No) with colored lines around it
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#000');

      // Align header text based on 'align' parameter
      const headerAlign = align === 'right' ? 'right' : 'left';
      const pageNoAlign = align === 'right' ? 'right' : 'right'; // Page numbers stay aligned to the right
      const headerGapX = align === 'right' ? 0 : 20;

      doc.text('Medical Condition', tocX / .48 + headerGapX / .4, tocY / .93, { align: headerAlign });
      doc.text('Page No', pageNoX + headerGapX, tocY / .93, { align: pageNoAlign });

      // Add horizontal lines above and below the header
      doc.setDrawColor('#7c5dac');
      doc.setLineWidth(1.5);
      doc.line(tocX - 20, tocY - 5, pageNoX + 135, tocY - 5); // Line above header
      doc.line(tocX - 20, tocY + 20, pageNoX + 135, tocY + 20); // Line below header

      // Add gap after the header
      tocY += 40; // Increase gap for content

      // Add table rows with borders and vertical line between the columns
      tableData.forEach((item, index) => {
        // Set font for table content
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        // Align content based on 'align' parameter
        // const contentAlign = align === 'right' ? 'right' : 'left';
        const contentGapX = align === 'right' ? 0 : 132;
// Add a background color for the "Medical Condition" column
doc.setFillColor('#d3d3d3'); // Set background color for the Medical Condition column
doc.rect(tocX - 20, tocY - 19.5, colWidth1 - 70, 24, 'F'); // Draw filled rectangle for background

        // Add content to Medical Condition column
        doc.text(item.medicalCondition, tocX + contentGapX, tocY, { align: 'center' });
        // Add content to Page No column (keep aligned to right)
        doc.text(item.pageNo, pageNoX + contentGapX / 50, tocY, { align: 'center' });

        // Set line color to black before drawing the vertical line
        doc.setDrawColor('#000');
        doc.setLineWidth(0.5);
        const verticalLineX = tocX + colWidth1 - 90; // Adjusted left from previous position
        doc.line(verticalLineX, tocY - 45, verticalLineX, tocY + 5); // Vertical line in black

        // Add line between rows (instead of box row borders)
        doc.setLineWidth(0.5);
        doc.setDrawColor('#000'); // Line color for rows
        doc.line(tocX - 20, tocY + 5, pageNoX + 135, tocY + 5); // Horizontal line between rows

        // Move down for the next row
        tocY += 25; // Adjust row height and space between rows
      });
    };

    // third Page
    const addThirdPageContent = () => {
      // Define box dimensions and properties
      const boxX = 15; // X position of the box
      const boxY = 100; // Y position of the box
      const boxWidth = 570; // Width of the box
      const boxHeight = 690; // Total height of the box

      // Draw rounded rectangle box (outer border)
      doc.setFillColor('#FFFFFF'); // Set background color
      doc.setDrawColor('#000'); // Set border color
      doc.setLineWidth(0.5); // Set border thickness
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 25, 25, 'S'); // Add border radius

    };


    // fourteenth page
    const addFourteenthPageContent = (align = 'left') => {
      // Define box dimensions and properties
      const boxX = 15; // X position of the box
      const boxY = 100; // Y position of the box
      const boxWidth = 570; // Width of the box
      const boxHeight = 690; // Total height of the box

      // Draw rounded rectangle box (outer border)
      doc.setFillColor('#FFFFFF'); // Set background color
      doc.setDrawColor('#000'); // Set border color
      doc.setLineWidth(0.5); // Set border thickness
      doc.roundedRect(boxX, boxY, boxWidth, boxHeight, 25, 25, 'S'); // Add border radius

      // Add "Table of Contents" header and center it within the box
      doc.setFontSize(15);
      doc.setFont("helvetica", "normal");
      doc.setTextColor('#000');
      doc.text('Genotype & Phenotype - Key Genes', boxX + boxWidth / 2, boxY + 30, { align: 'center' }); // Centered inside the box

      // Define table data
      const tableData = [
        { gene: "ABCG2", genotype: "rs2231142, GG", phenotype: "Normal Risk" },
        { gene: "CYP1A2", genotype: "rs762551, CA", phenotype: "Extensive Metabolizer" },
        { gene: "CYP2A6", genotype: "*1/*1", phenotype: "Normal Metabolism" },
        { gene: "CYP2B6", genotype: "*1/*5", phenotype: "Normal Metabolizer" },
        { gene: "CYP2C19", genotype: "*2/*2", phenotype: "Poor Metabolizer" },
        { gene: "CYP2C9", genotype: "*1/*1", phenotype: "Normal Metabolizer" },
        { gene: "CYP2D6", genotype: "*13/*41", phenotype: "Intermediate Metabolizer" },
        { gene: "CYP3A4", genotype: "*1/*1", phenotype: "Normal Metabolizer" },
        { gene: "CYP3A5", genotype: "*3/*3", phenotype: "Poor Metabolizer" },
        { gene: "CYP4F2", genotype: "*1/*1", phenotype: "Normal Metabolizer" },
        { gene: "DPYD", genotype: "*5/*9", phenotype: "Normal" },
        { gene: "G6PD", genotype: "*B/*B", phenotype: "Normal" },
        { gene: "HLA-A", genotype: "Negative for HLA-A*31:01", phenotype: "Normal risk" },
        { gene: "HLA-B", genotype: "Negative for HLA-B*15:02, *58:01, *57:01", phenotype: "Normal risk" },
        { gene: "HLA-DRB1", genotype: "Negative for HLA-DRB1*07:01", phenotype: "Normal risk" },
        { gene: "IFNL3", genotype: "rs12979860, CT", phenotype: "Favourable response genotype" },
        { gene: "MTHFR", genotype: "rs1801133, GG", phenotype: "Variable response" },
        { gene: "NUDT15", genotype: "*1/*1", phenotype: "Normal Metabolizer" },
        { gene: "OPRM1", genotype: "rs1799971, AG", phenotype: "Reduced Response" },
        { gene: "SLC22A1", genotype: "rs628031, GG", phenotype: "Normal Response" },
        { gene: "SLCO1B1", genotype: "*1/ *19", phenotype: "Indeterminate" },
        { gene: "TPMT", genotype: "*1/*1", phenotype: "Normal Metabolizer" },
        { gene: "UGT1A1", genotype: "*1/*80+*28", phenotype: "Intermediate Metabolizer" },
        { gene: "VKORC1", genotype: "rs9923231, CC", phenotype: "Normal risk" },
      ];

      // Set font size and style for table content
      doc.setFontSize(12);
      doc.setFont("helvetica", "normal");

      // Define table positions and styling
      const tocX = 35; // X position of the first column (Gene)
      const genotypeX = 260; // X position of the second column (Genotype)
      const phenotypeX = 460; // X position of the third column (Phenotype)
      let tocY = boxY + 50; // Adjusted Y position for the table content (gap added after the header)

      // Header (Gene, Genotype, Phenotype) with colored lines around it
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#FFFFFF'); // Set text color to white
      doc.setFillColor('#7c5dac'); // Set background color to #7c5dac

      // Draw background color for the header
      doc.rect(tocX - 20, tocY - 11, phenotypeX - tocX + 145, 16, 'F'); // Fill rectangle with color

      // Align header text
      doc.text('Gene', tocX / .5, tocY / 1, { align: 'center' });
      doc.text('Genotype', genotypeX, tocY / 1, { align: 'center' });
      doc.text('Phenotype', phenotypeX, tocY / 1, { align: 'center' });

      // Add horizontal lines above and below the header
      doc.setDrawColor('#000');
      doc.setLineWidth(0.5);
      // doc.line(tocX - 20, tocY - 1, phenotypeX + 125, tocY - 1); // Line above header
      doc.line(tocX - 20, tocY +6, phenotypeX + 125, tocY + 6); // Line below header

      // Add vertical lines between columns
      const secondVerticalLineX = genotypeX - 20;
      const thirdVerticalLineX = phenotypeX - 20;
      const lineStartY = boxY + 45;
      const lineEndY = tocY + 455;

      // Draw vertical lines
      doc.line(secondVerticalLineX / 1.5, lineStartY, secondVerticalLineX / 1.5, lineEndY / .951);
      doc.line(thirdVerticalLineX / 1.2, lineStartY, thirdVerticalLineX / 1.2, lineEndY / .951);

      // Add gap after the header
      tocY += 20; // Increase gap for content

      // Add table rows with borders and vertical lines between the columns
      tableData.forEach((item) => {
       // Add background color to the "Gene" column
    doc.setFillColor('#d3d3d3'); // Set background color for "Gene" column
    doc.rect(tocX - 19, tocY - 14, 143, 19, 'F'); // Draw rectangle behind the "Gene" text

    // Set font for table content
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor('#000'); // Reset text color to black

        // Add content to Gene column
        doc.text(item.gene, tocX / .5, tocY, { align: 'center' });
        // Add content to Genotype column
        doc.text(item.genotype, genotypeX, tocY, { align: 'center' });
        // Add content to Phenotype column
        doc.text(item.phenotype, phenotypeX, tocY, { align: 'center' });

        // Add line between rows
        doc.setLineWidth(0.5);
        doc.line(tocX - 20, tocY + 5, phenotypeX + 125, tocY + 5); // Horizontal line between rows

        // Move down for the next row
        tocY += 20; // Adjust row height and space between rows
      });
      // Add the paragraph note after the table
      const noteText = "Note: The PGx interpretations are based on the patients genotype and phenotype summary given above.";
      const noteX = tocX;
      const noteY = tocY + 20; // Add some space after the table

      // Set the font and color for the note
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor('#000');

      // Add the note to the PDF
      doc.text(noteText, noteX / 1.8, noteY);

    };

    const addFifteenthPageContent = (align = "left") => {
      const boxX = 15;
      const boxY = 100;
      const boxWidth = 570;
      const boxHeight = 700; // Adjust this based on your content height
      const borderRadius = 5; // Border radius for the box
      
      // Add a box around the content with rounded corners
      doc.setDrawColor(0); // Set border color (black)
      doc.setLineWidth(1); // Set border thickness
      doc.roundedRect(boxX, boxY + 450, boxWidth, boxHeight / 7, borderRadius, borderRadius); // Draw rounded rectangle
  
      // Set font color for the text
      doc.setTextColor('#000');
  
      // Draw the "A" in "ANNEXURE" larger
      doc.setFontSize(17); // Larger font size for "A"
      doc.setFont("helvetica", "bold");
      doc.text('A', boxX + boxWidth / 2 - 100, boxY + 30, { align: 'center' });
  
      // Draw the rest of "NNEXURE"
      doc.setFontSize(12); // Regular font size for the rest
      doc.setFont("helvetica", "bold");
      doc.text('NNEXURE', boxX + boxWidth / 2 - 93, boxY + 30, { align: 'left' });
  
      // Draw the larger "A"
      doc.setFontSize(17); // Larger font size for "A"
      doc.setFont("helvetica", "bold");
      doc.text('A', boxX + boxWidth / 2 - 20, boxY + 30, { align: 'center' });
  
      // Draw the dash and smaller text "- DISCLAIMERS"
      doc.setFontSize(12); // Regular font size
      doc.setFont("helvetica", "bold");
      doc.text(' - ', boxX + boxWidth / 2 - 15, boxY + 30, { align: 'left' });
  
      // Draw the larger "D"
      doc.setFontSize(17); // Larger font size for "D"
      doc.setFont("helvetica", "bold");
      doc.text('D', boxX + boxWidth / 2 + 4, boxY + 30, { align: 'center' });
  
      // Draw the rest of "ISCLAIMERS"
      doc.setFontSize(12); // Regular font size for the rest
      doc.setFont("helvetica", "bold");
      doc.text('ISCLAIMERS', boxX + boxWidth / 2 + 11, boxY + 30, { align: 'left' });
  
      // Add "General:" heading and the content text
      let currentY = boxY + 60; // Set Y position after the title
  
      // Add "General:" heading
      doc.setFontSize(12); // Slightly larger font size for the heading
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#4F4D57');
      doc.text('General:', boxX + 5, currentY);
  
      // Move down for the paragraph text
      currentY += 15; // Increase space between heading and content
  
      // Set the font to "Regular 400" for the paragraph content
      doc.setFontSize(9.1); // Regular font size for the content
      doc.setFont("helvetica", "normal"); // Use "normal" for Regular 400 font
      doc.setTextColor('#4F4D57');
  
      const generalContent = "This report is based solely on scientific information obtained from various databases including USFDA, CPIC, PharmGKB, and DPWG. It should be noted that other genetic variations as well as environmental and social factors may also have an impact on a patient's response, such as smoking, diet, social and familial factors, medical conditions, and drug-to-drug interactions. Therefore, the gene-drug associations presented in this report do not provide a guarantee of effectiveness or ineffectiveness for any particular treatment. It is important to carefully monitor the administration of any medication regardless of the predicted genotype-phenotype interaction. Additionally, the genotype-predicted interactions and annotations included in this report are current as of the date of its generation and the database version used at that time. It is possible that new information may become available and updates to the report can be requested as the pharmacogenomic database is updated over time.";
  
      const additionalContent1 = "Any decisions regarding treatment based on this report must be made by the treating physician, after assessing all information about the patient’s health conditions. This includes but is not limited to other current/past medical conditions, family history, physical examinations, and other diagnostic tests taken. The final decision to select any, all or none of the recommended drugs/therapies is at the treating physician’s discretion.";
  
      const additionalContent2 = "Kyvor Genomics Inc. disclaims and makes no representation or warranty relating to the inferences drawn from its review of scientific literature, including information and conclusions relating to therapies that are included or eliminated from this report. There is no guarantee that any third party will provide reimbursement for any of the tests performed or any treatment decision made based on the results.";
  
      const lineHeight = 12; // Line height for paragraphs
      const maxWidth = 570; // Define the width for the content text to wrap within
  
      const wrapText = (text, maxWidth) => {
          const words = text.split(' ');
          let lines = [];
          let currentLine = words[0];
  
          for (let i = 1; i < words.length; i++) {
              const word = words[i];
              const width = doc.getTextWidth(currentLine + " " + word);
              if (width < maxWidth) {
                  currentLine += " " + word;
              } else {
                  lines.push(currentLine);
                  currentLine = word;
              }
          }
          lines.push(currentLine);
          return lines;
      };
  
      // Wrap and render the general content
      let wrappedText = wrapText(generalContent, maxWidth);
      wrappedText.forEach((line) => {
          doc.text(line, boxX + 5, currentY);
          currentY += lineHeight; // Move Y position for the next line
      });
  
      // Add some space before the new paragraphs
      currentY += 10; // Adjust this spacing as needed
  
      // Wrap and render the first additional paragraph content
      wrappedText = wrapText(additionalContent1, maxWidth);
      wrappedText.forEach((line) => {
          doc.text(line, boxX + 5, currentY - 10);
          currentY += lineHeight; // Move Y position for the next line
      });
  
      // Add some space before the next paragraph
      currentY += 10; // Adjust this spacing as needed
  
      // Wrap and render the second additional paragraph content
      wrappedText = wrapText(additionalContent2, maxWidth);
      wrappedText.forEach((line) => {
          doc.text(line, boxX + 5, currentY - 11);
          currentY += lineHeight; // Move Y position for the next line
      });
  
      currentY += 60; // Adjust the Y position to add space after the content
  
      // Add "Limitations:" heading
      doc.setFontSize(12); // Font size for the heading
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#4F4D57');
      doc.text('Limitations:', boxX + 6, currentY - 60);
  
      currentY += 15; // Move down for the bullet points
  
      // Add the limitations points
      const limitationsContent = [
          "•     Variants not detected by the assay that was performed may impact the phenotype.",
          "•     The mutations have not been validated by Sanger sequencing."
      ];
  
      // Set font size and style for limitations content
      doc.setFontSize(10); // Slightly smaller font size for the bullet points
      doc.setFont("helvetica", "normal"); // Regular font style for content
      doc.setTextColor('#4F4D57');
  
      limitationsContent.forEach((line) => {
          doc.text(line, boxX + 6, currentY - 55); // Add bullet points with left padding
          currentY += lineHeight; // Move Y position for the next line
      });

      // Add "T_MTx_VS1" content above the dash
      const tmTxVs1Y = currentY + 120; // Adjust the Y position for the "T_MTx_VS1" content
      doc.setFontSize(30); // Font size for T_MTx_VS1 text
      doc.setFont("helvetica", "bold");
      doc.setTextColor('#F5F7F8');
      doc.text('T_MTx_VS1', boxX + 286, tmTxVs1Y); // Position of T_MTx_VS1 text
  
  
      // Add a dash for the signature
      const signatureDashY = currentY + 130; // Adjust the Y position for the signature dash
      const signatureTextY = signatureDashY + 15; // Adjust the Y position for the signature text
  
      doc.setDrawColor(0); // Set color for the dash line
      doc.setLineWidth(0.5); // Set line thickness for the dash
      doc.line(boxX + boxWidth / 2, signatureDashY, boxX + boxWidth / 1.08, signatureDashY); // Draw the dash line for the signature
  
      // Add the "Electronic Signature" text
      doc.setFontSize(10); // Font size for the signature text
      doc.setFont("helvetica", "normal");
      doc.setTextColor('#000')
      doc.text('Electronic Signature', boxX + boxWidth / 2, signatureTextY, { align: 'left' });
  
      // Add the name and title below the signature
      doc.setFontSize(10); // Font size for the name and title
      doc.setFont("helvetica", "normal");
      doc.text('Abilesh M Gunasekar, Founder & CEO', boxX + boxWidth / 2 + .51, signatureTextY + 15);
  };
  
  
  
  
    
    
    
    
    




    // Create a PDF with 15 pages
    for (let i = 1; i <= 15; i++) {
      if (i > 1) doc.addPage(); // Add a new page after the first

      addHeader();
      if (i === 1) {
        addFirstPageContent();
      } else if (i === 2) {
        addSecondPageContent();
      } else if (i === 3) {
        addThirdPageContent();
      } else if (i === 14) {
        addFourteenthPageContent();
      } else if (i === 15) {
        addFifteenthPageContent();
      }
      addFooter(i);
    }

    // Create Blob URL for preview and download
    const pdfBlob = doc.output('blob');
    const pdfUrl = URL.createObjectURL(pdfBlob);
    setPdfUrl(pdfUrl);

  };


  return (
    <div>
      <h2>Pharmacogenomics Test</h2>
      <form>
        <label>
          Patient ID:
          <input type="text" name="patientID" value={patientDetails.patientID} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Name:
          <input type="text" name="name" value={patientDetails.name} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Age:
          <input type="text" name="age" value={patientDetails.age} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Sex:
          <input type="text" name="sex" value={patientDetails.sex} onChange={handleInputChange} />
        </label>
        <br />
        <label>
          Physician Information:
          <input type="text" value={physicianInfo} onChange={handlePhysicianChange} />
        </label>
        <br />
        <label>
          Specimen Type:
          <input type="text" name="type" value={specimen.type} onChange={handleSpecimenChange} />
        </label>
        <br />
        <label>
          Specimen Date:
          <input type="date" name="date" value={specimen.date} onChange={handleSpecimenChange} />
        </label>
        <br />
        <label>
          Upload Excel File:
          <input type="file" accept=".xlsx" onChange={handleFileUpload} />
        </label>
        <br />
        <button type="button" onClick={generatePDF}>Generate PDF</button>
      </form>
      {pdfUrl && (
        <div>
          <h3>Preview:</h3>
          <iframe
            src={pdfUrl}
            width="100%"
            height="500px"
            title="PDF Preview"
          ></iframe>
          <a href={pdfUrl} download="pharmacogenomics-report.pdf">Download PDF</a>
        </div>
      )}
    </div>
  );
};

export default PharmacogenomicsTest;
