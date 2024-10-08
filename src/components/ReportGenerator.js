import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';

const ReportGenerator = () => {
    const [patientData, setPatientData] = useState({
        patientId: '',
        name: '',
        age: '',
        sex: ''
    });
    const [file, setFile] = useState(null);
    const [excelData, setExcelData] = useState([]);
    const [headers, setHeaders] = useState([]);

    const handleChange = (e) => {
        setPatientData({
            ...patientData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const binaryStr = event.target.result;
                const workbook = XLSX.read(binaryStr, { type: 'binary' });
                const sheetName = workbook.SheetNames[0];
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

                // Extract headers and data separately
                setHeaders(sheet[0]); // first row as headers
                setExcelData(sheet.slice(1)); // rest as data
            };
            reader.readAsBinaryString(file);
        }
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Adding patient details to the first page
        doc.text(`Patient Report`, 10, 10);
        doc.text(`Patient ID: ${patientData.patientId}`, 10, 20);
        doc.text(`Name: ${patientData.name}`, 10, 30);
        doc.text(`Age: ${patientData.age}`, 10, 40);
        doc.text(`Sex: ${patientData.sex}`, 10, 50);

        // Generating content for 15 pages based on Excel data
        for (let page = 1; page <= 15; page++) {
            if (page !== 1) doc.addPage();

            doc.text(`Page ${page}`, 10, 10);

            headers.forEach((header, colIndex) => {
                const yPositionHeader = 20;
                doc.text(`${header}`, 10 + colIndex * 40, yPositionHeader);

                excelData.forEach((row, rowIndex) => {
                    const yPosition = 30 + rowIndex * 10;
                    doc.text(`${row[colIndex] || ''}`, 10 + colIndex * 40, yPosition);
                });
            });
        }

        doc.save('Patient_Report.pdf');
    };

    return (
        <div>
            <h2>Pharmacogenomics Report Generator</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Patient ID:</label>
                    <input type="text" name="patientId" value={patientData.patientId} onChange={handleChange} required />
                </div>
                <div>
                    <label>Name:</label>
                    <input type="text" name="name" value={patientData.name} onChange={handleChange} required />
                </div>
                <div>
                    <label>Age:</label>
                    <input type="number" name="age" value={patientData.age} onChange={handleChange} required />
                </div>
                <div>
                    <label>Sex:</label>
                    <select name="sex" value={patientData.sex} onChange={handleChange} required>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                    </select>
                </div>
                <div>
                    <label>Upload Excel File:</label>
                    <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} required />
                </div>
                <button type="submit">Generate Report</button>
            </form>

            {excelData.length > 0 && (
                <div>
                    <h3>Report Preview</h3>
                    <table>
                        <thead>
                            <tr>
                                {headers.map((header, index) => (
                                    <th key={index}>{header}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {excelData.map((row, rowIndex) => (
                                <tr key={rowIndex}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}>{cell}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={generatePDF}>Download PDF</button>
                </div>
            )}
        </div>
    );
};

export default ReportGenerator;
