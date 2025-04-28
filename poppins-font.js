// tools/convert-font.js
const fs = require('fs');
const path = require('path');

// Path to your TTF font
const fontPath = path.join(__dirname, '../src/assets/fonts/Poppins-Regular.ttf');

// Read the font file
fs.readFile(fontPath, (err, data) => {
  if (err) {
    console.error('Error reading font file:', err);
    return;
  }

  // Convert to base64
  const base64Font = data.toString('base64');

  // Output path for the JavaScript file
  const outputPath = path.join(__dirname, '../src/assets/fonts/poppins-font.js');

  // Create the JavaScript content with Angular-friendly approach
  const jsContent = window.poppinsNormalBase64 = "${base64Font}";

window.registerPoppinsFont = function() {
  if (typeof window.jspdf !== 'undefined' && typeof window.jspdf.jsPDF !== 'undefined') {
    try {
      const doc = new window.jspdf.jsPDF();
      doc.addFileToVFS('Poppins-Regular.ttf', window.poppinsNormalBase64);
      doc.addFont('Poppins-Regular.ttf', 'Poppins-Regular', 'normal');
      console.log('Poppins font added to jsPDF successfully');
      return true;
    } catch (e) {
      console.error('Error while adding font to jsPDF:', e);
      return false;
    }
  }
  return false;
};

// Try to register immediately if jsPDF is already loaded
window.registerPoppinsFont();fs.writeFile(outputPath, jsContent, (err) => {
    if (err) {
      console.error('Error writing JavaScript file:', err);
      return;
    }

    console.log('Font converted to base64 and JavaScript file created:', outputPath);
  });
});
