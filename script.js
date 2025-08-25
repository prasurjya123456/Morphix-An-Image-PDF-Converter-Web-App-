// PDF → Image Conversion
document.getElementById("convertPdfToImg").addEventListener("click", async () => {
  const file = document.getElementById("pdfFile").files[0];
  const format = document.getElementById("format").value;
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = "";

  if (!file) return alert("Please select a PDF file");

  const fileReader = new FileReader();
  fileReader.onload = async function () {
    const typedArray = new Uint8Array(this.result);
    const pdf = await pdfjsLib.getDocument(typedArray).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;

      // ---- Card container ----
      const card = document.createElement("div");
      card.className = "preview-card";

      // Image preview
      const img = document.createElement("img");
      img.src = canvas.toDataURL(`image/${format}`);
      img.style.maxWidth = "180px";
      img.style.height = "auto";
      card.appendChild(img);

      // Download button
      const link = document.createElement("a");
      link.href = img.src;
      link.download = `page_${i}.${format}`;
      link.innerText = `⬇ Download Page ${i}`;
      link.className = "download-btn";
      card.appendChild(link);

      outputDiv.appendChild(card);
    }
  };
  fileReader.readAsArrayBuffer(file);
});


// Image → PDF Conversion
document.getElementById("convertImgToPdf").addEventListener("click", async () => {
  const files = document.getElementById("imgFiles").files;
  const pdfOutput = document.getElementById("pdfOutput");
  pdfOutput.innerHTML = "";

  if (files.length === 0) return alert("Please select image(s)");

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();

  for (let i = 0; i < files.length; i++) {
    const imgData = await readFileAsDataURL(files[i]);

    if (i > 0) pdf.addPage();
    pdf.addImage(imgData, "JPEG", 10, 10, 180, 260);
  }

  const pdfBlob = pdf.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  // Stylish download button
  const link = document.createElement("a");
  link.href = pdfUrl;
  link.download = "converted.pdf";
  link.innerText = "⬇ Download PDF";
  link.className = "download-btn";
  pdfOutput.appendChild(link);
});


// Utility: convert file → base64
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
