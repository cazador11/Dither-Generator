/**
 * Interactive Image Dithering Application
 * Main application logic
 */

// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const algorithmSelect = document.getElementById('algorithm-select');
const paletteSelect = document.getElementById('palette-select');
const thresholdSlider = document.getElementById('threshold-slider');
const thresholdValue = document.getElementById('threshold-value');
const scaleSlider = document.getElementById('scale-slider');
const scaleValue = document.getElementById('scale-value');
const processBtn = document.getElementById('process-btn');
const downloadBtn = document.getElementById('download-btn');
const originalCanvas = document.getElementById('original-canvas');
const ditheredCanvas = document.getElementById('dithered-canvas');
const originalLoader = document.getElementById('original-loader');
const ditheredLoader = document.getElementById('dithered-loader');
const errorModal = document.getElementById('error-modal');
const errorMessage = document.getElementById('error-message');
const closeBtn = document.querySelector('.close-btn');

// Canvas contexts
let originalCtx = null;
let ditheredCtx = null;

// Application state
let originalImage = null;
let currentImageData = null;
let currentDitheredImageData = null;

// Event listeners
document.addEventListener('DOMContentLoaded', initApp);

/**
 * Initialize the application
 */
function initApp() {
    console.log('Initializing application...');
    
    try {
        // Initialize canvas contexts
        if (originalCanvas && ditheredCanvas) {
            originalCtx = originalCanvas.getContext('2d');
            ditheredCtx = ditheredCanvas.getContext('2d');
            console.log('Canvas contexts initialized successfully');
        } else {
            console.error('Canvas elements not found');
            showError('Canvas elements not found. Please refresh the page.');
            return;
        }
        
        // Set up drag and drop events
        setupDragAndDrop();
        
        // Set up file input
        fileInput.addEventListener('change', handleFileSelect);
        
        // Set up control events
        thresholdSlider.addEventListener('input', updateThresholdValue);
        scaleSlider.addEventListener('input', updateScaleValue);
        
        // Set up button events
        processBtn.addEventListener('click', processImage);
        downloadBtn.addEventListener('click', downloadImage);
        
        // Set up error modal
        closeBtn.addEventListener('click', closeErrorModal);
        
        // Update initial values
        updateThresholdValue();
        updateScaleValue();
        
        console.log('Application initialized successfully');
        
        // Hide error modal if it's showing on load
        errorModal.classList.add('hidden');
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Failed to initialize the application. Please refresh the page.');
    }
}

/**
 * Set up drag and drop functionality
 */
function setupDragAndDrop() {
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
}

/**
 * Prevent default drag and drop behaviors
 * @param {Event} e - The event object
 */
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

/**
 * Highlight the drop area
 */
function highlight() {
    dropArea.classList.add('highlight');
}

/**
 * Remove highlight from the drop area
 */
function unhighlight() {
    dropArea.classList.remove('highlight');
}

/**
 * Handle dropped files
 * @param {Event} e - The drop event
 */
function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length > 0) {
        handleFiles(files);
    }
}

/**
 * Handle file selection from input
 * @param {Event} e - The change event
 */
function handleFileSelect(e) {
    const files = e.target.files;
    
    if (files.length > 0) {
        handleFiles(files);
    }
}

/**
 * Process the selected files
 * @param {FileList} files - The list of files
 */
function handleFiles(files) {
    const file = files[0];
    
    console.log('Processing file:', file.name, file.type);
    
    // Check if the file is an image
    if (!file.type.match('image.*')) {
        showError('Please select a valid image file (JPG, PNG, GIF, BMP).');
        return;
    }
    
    // Show loading indicator
    originalLoader.classList.remove('hidden');
    
    // Load the image
    const reader = new FileReader();
    
    reader.onload = function(e) {
        console.log('File loaded successfully');
        const img = new Image();
        
        img.onload = function() {
            console.log('Image loaded successfully:', img.width, 'x', img.height);
            // Store the original image
            originalImage = img;
            
            // Draw the original image
            drawOriginalImage();
            
            // Enable the process button
            processBtn.disabled = false;
            
            // Hide loading indicator
            originalLoader.classList.add('hidden');
        };
        
        img.onerror = function(err) {
            console.error('Error loading image:', err);
            showError('Failed to load the image. Please try another file.');
            originalLoader.classList.add('hidden');
        };
        
        img.src = e.target.result;
    };
    
    reader.onerror = function(err) {
        console.error('Error reading file:', err);
        showError('Failed to read the file. Please try again.');
        originalLoader.classList.add('hidden');
    };
    
    reader.readAsDataURL(file);
}

/**
 * Draw the original image on the canvas
 */
function drawOriginalImage() {
    if (!originalImage) {
        console.error('No original image to draw');
        return;
    }
    
    try {
        // Calculate the scale factor
        const scale = parseInt(scaleSlider.value) / 100;
        
        // Calculate the new dimensions
        const width = Math.floor(originalImage.width * scale);
        const height = Math.floor(originalImage.height * scale);
        
        console.log('Drawing image at scale:', scale, 'Dimensions:', width, 'x', height);
        
        // Set canvas dimensions
        originalCanvas.width = width;
        originalCanvas.height = height;
        ditheredCanvas.width = width;
        ditheredCanvas.height = height;
        
        // Draw the image
        originalCtx.clearRect(0, 0, width, height);
        originalCtx.drawImage(originalImage, 0, 0, width, height);
        
        // Get the image data
        currentImageData = originalCtx.getImageData(0, 0, width, height);
        console.log('Image drawn successfully');
    } catch (error) {
        console.error('Error drawing original image:', error);
        showError('Failed to process the image. Please try another file.');
    }
}

/**
 * Process the image with the selected dithering algorithm and palette
 */
function processImage() {
    if (!currentImageData) {
        console.error('No image data to process');
        showError('Please upload an image first.');
        return;
    }
    
    console.log('Processing image with dithering...');
    
    // Show loading indicator
    ditheredLoader.classList.remove('hidden');
    
    // Get selected algorithm and palette
    const algorithm = algorithmSelect.value;
    const palette = paletteSelect.value;
    const threshold = parseInt(thresholdSlider.value);
    
    console.log('Algorithm:', algorithm, 'Palette:', palette, 'Threshold:', threshold);
    
    // Process the image asynchronously
    setTimeout(() => {
        try {
            // Get the appropriate palette
            let colorPalette;
            let findClosestColorFn;
            
            switch (palette) {
                case '1bit':
                    colorPalette = ColorPalettes.monochrome();
                    findClosestColorFn = (r, g, b) => ColorPalettes.findClosestMonochromeColor(r, g, b, threshold);
                    break;
                case 'cga':
                    colorPalette = ColorPalettes.cga();
                    findClosestColorFn = (r, g, b) => ColorPalettes.findClosestColor(r, g, b, colorPalette);
                    break;
                case 'websafe':
                    colorPalette = ColorPalettes.webSafe();
                    findClosestColorFn = (r, g, b) => ColorPalettes.findClosestColor(r, g, b, colorPalette);
                    break;
                default:
                    colorPalette = ColorPalettes.monochrome();
                    findClosestColorFn = (r, g, b) => ColorPalettes.findClosestMonochromeColor(r, g, b, threshold);
            }
            
            // Apply the selected dithering algorithm
            let ditheredImageData;
            
            switch (algorithm) {
                case 'floyd-steinberg':
                    ditheredImageData = Dithering.floydSteinberg(currentImageData, findClosestColorFn);
                    break;
                case 'bayer':
                    ditheredImageData = Dithering.bayer(currentImageData, findClosestColorFn);
                    break;
                case 'ordered':
                    ditheredImageData = Dithering.ordered(currentImageData, findClosestColorFn);
                    break;
                default:
                    ditheredImageData = Dithering.floydSteinberg(currentImageData, findClosestColorFn);
            }
            
            // Store the dithered image data
            currentDitheredImageData = ditheredImageData;
            
            // Draw the dithered image
            ditheredCtx.putImageData(ditheredImageData, 0, 0);
            
            // Enable the download button
            downloadBtn.disabled = false;
            
            console.log('Image processed successfully');
        } catch (error) {
            console.error('Error processing image:', error);
            showError('An error occurred while processing the image: ' + error.message);
        } finally {
            // Hide loading indicator
            ditheredLoader.classList.add('hidden');
        }
    }, 100); // Small delay to allow the UI to update
}

/**
 * Download the dithered image
 */
function downloadImage() {
    if (!currentDitheredImageData) {
        console.error('No dithered image data to download');
        showError('Please process an image first.');
        return;
    }
    
    try {
        console.log('Preparing image for download...');
        // Create a temporary link
        const link = document.createElement('a');
        
        // Set the download attributes
        link.download = 'dithered-image.png';
        
        // Convert the canvas to a data URL
        link.href = ditheredCanvas.toDataURL('image/png');
        
        // Append to the document
        document.body.appendChild(link);
        
        // Trigger the download
        link.click();
        
        // Clean up
        document.body.removeChild(link);
        
        console.log('Image downloaded successfully');
    } catch (error) {
        console.error('Error downloading image:', error);
        showError('An error occurred while downloading the image: ' + error.message);
    }
}

/**
 * Update the threshold value display
 */
function updateThresholdValue() {
    thresholdValue.textContent = thresholdSlider.value;
}

/**
 * Update the scale value display
 */
function updateScaleValue() {
    scaleValue.textContent = `${scaleSlider.value}%`;
    
    // Redraw the original image if it exists
    if (originalImage) {
        drawOriginalImage();
    }
}

/**
 * Show an error message
 * @param {string} message - The error message to display
 */
function showError(message) {
    console.error('Error:', message);
    if (errorMessage && errorModal) {
        errorMessage.textContent = message || 'An unknown error occurred.';
        errorModal.classList.remove('hidden');
    } else {
        console.error('Error modal elements not found');
        alert(message || 'An unknown error occurred.');
    }
}

/**
 * Close the error modal
 */
function closeErrorModal() {
    if (errorModal) {
        errorModal.classList.add('hidden');
    }
} 