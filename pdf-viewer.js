// Function to render a PDF file in a specified div
function renderPDF(url, canvasContainerId) {
    // Load the PDF
    pdfjsLib.getDocument(url).promise.then(function(pdf) {
        // Get the first page
        pdf.getPage(1).then(function(page) {
            var scale = 1.5;
            var viewport = page.getViewport({ scale: scale });

            // Prepare canvas using PDF page dimensions
            var canvas = document.createElement("canvas");
            var context = canvas.getContext("2d");
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            // Append the canvas to the specified div
            var container = document.getElementById(canvasContainerId);
            container.appendChild(canvas);

            // Render PDF page into canvas context
            var renderContext = {
                canvasContext: context,
                viewport: viewport
            };
            page.render(renderContext);
        });
    });
}

// Render PDFs in their respective divs
window.onload = function() {
    renderPDF('path/to/your/pdf1.pdf', 'pdf-viewer-1');
    renderPDF('path/to/your/pdf2.pdf', 'pdf-viewer-2');
    renderPDF('path/to/your/pdf3.pdf', 'pdf-viewer-3');
};

// Functions for page navigation
var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null;

function renderPage(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then(function(page) {
        var scale = 1.5;
        var viewport = page.getViewport({ scale: scale });

        var canvas = document.querySelector('#pdf-viewer-1 canvas');
        var context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        var renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        var renderTask = page.render(renderContext);

        renderTask.promise.then(function() {
            pageRendering = false;
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    document.getElementById('page_num').textContent = num;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function nextPage() {
    if (pageNum >= pdfDoc.numPages) {
        return;
    }
    pageNum++;
    queueRenderPage(pageNum);
}

function prevPage() {
    if (pageNum <= 1) {
        return;
    }
    pageNum--;
    queueRenderPage(pageNum);
}

// Load the PDF and setup page count display
function loadPDF(url) {
    pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page_count').textContent = pdfDoc.numPages;
        renderPage(pageNum);
    });
}
