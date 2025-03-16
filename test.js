/**
 * Test script for the Interactive Image Dithering application
 * This script will run some basic tests to ensure the application is working correctly
 */

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', runTests);

function runTests() {
    console.log('Running diagnostic tests...');
    
    // Test 1: Check if all required DOM elements are present
    testDOMElements();
    
    // Test 2: Check if the canvas contexts can be created
    testCanvasContexts();
    
    // Test 3: Test the color palette functions
    testColorPalettes();
    
    // Test 4: Test the dithering algorithms with a simple test image
    testDitheringAlgorithms();
    
    console.log('Diagnostic tests completed');
}

function testDOMElements() {
    console.log('Testing DOM elements...');
    
    const requiredElements = [
        { id: 'drop-area', name: 'Drop Area' },
        { id: 'file-input', name: 'File Input' },
        { id: 'algorithm-select', name: 'Algorithm Select' },
        { id: 'palette-select', name: 'Palette Select' },
        { id: 'threshold-slider', name: 'Threshold Slider' },
        { id: 'threshold-value', name: 'Threshold Value' },
        { id: 'scale-slider', name: 'Scale Slider' },
        { id: 'scale-value', name: 'Scale Value' },
        { id: 'process-btn', name: 'Process Button' },
        { id: 'download-btn', name: 'Download Button' },
        { id: 'original-canvas', name: 'Original Canvas' },
        { id: 'dithered-canvas', name: 'Dithered Canvas' },
        { id: 'original-loader', name: 'Original Loader' },
        { id: 'dithered-loader', name: 'Dithered Loader' },
        { id: 'error-modal', name: 'Error Modal' },
        { id: 'error-message', name: 'Error Message' }
    ];
    
    let allElementsPresent = true;
    
    for (const element of requiredElements) {
        const el = document.getElementById(element.id);
        if (!el) {
            console.error(`Missing DOM element: ${element.name} (${element.id})`);
            allElementsPresent = false;
        }
    }
    
    if (allElementsPresent) {
        console.log('All required DOM elements are present');
    } else {
        console.error('Some DOM elements are missing');
    }
}

function testCanvasContexts() {
    console.log('Testing canvas contexts...');
    
    const originalCanvas = document.getElementById('original-canvas');
    const ditheredCanvas = document.getElementById('dithered-canvas');
    
    if (!originalCanvas || !ditheredCanvas) {
        console.error('Canvas elements not found');
        return;
    }
    
    try {
        const originalCtx = originalCanvas.getContext('2d');
        const ditheredCtx = ditheredCanvas.getContext('2d');
        
        if (originalCtx && ditheredCtx) {
            console.log('Canvas contexts created successfully');
            
            // Test drawing on the canvas
            originalCanvas.width = 100;
            originalCanvas.height = 100;
            originalCtx.fillStyle = 'red';
            originalCtx.fillRect(0, 0, 100, 100);
            
            ditheredCanvas.width = 100;
            ditheredCanvas.height = 100;
            ditheredCtx.fillStyle = 'blue';
            ditheredCtx.fillRect(0, 0, 100, 100);
            
            console.log('Canvas drawing test successful');
        } else {
            console.error('Failed to create canvas contexts');
        }
    } catch (error) {
        console.error('Error testing canvas contexts:', error);
    }
}

function testColorPalettes() {
    console.log('Testing color palettes...');
    
    try {
        // Test monochrome palette
        const monochromePalette = ColorPalettes.monochrome(128);
        console.log('Monochrome palette:', monochromePalette);
        
        // Test CGA palette
        const cgaPalette = ColorPalettes.cga();
        console.log('CGA palette:', cgaPalette);
        
        // Test web-safe palette
        const webSafePalette = ColorPalettes.webSafe();
        console.log('Web-safe palette length:', webSafePalette.length);
        
        // Test findClosestColor
        const testColor = [100, 150, 200];
        const closestMonochrome = ColorPalettes.findClosestMonochromeColor(testColor[0], testColor[1], testColor[2], 128);
        const closestCGA = ColorPalettes.findClosestColor(testColor[0], testColor[1], testColor[2], cgaPalette);
        const closestWebSafe = ColorPalettes.findClosestColor(testColor[0], testColor[1], testColor[2], webSafePalette);
        
        console.log('Closest monochrome color for', testColor, ':', closestMonochrome);
        console.log('Closest CGA color for', testColor, ':', closestCGA);
        console.log('Closest web-safe color for', testColor, ':', closestWebSafe);
        
        console.log('Color palette tests successful');
    } catch (error) {
        console.error('Error testing color palettes:', error);
    }
}

function testDitheringAlgorithms() {
    console.log('Testing dithering algorithms...');
    
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 10;
        canvas.height = 10;
        const ctx = canvas.getContext('2d');
        
        // Create a simple test image (gradient)
        for (let y = 0; y < 10; y++) {
            for (let x = 0; x < 10; x++) {
                const r = Math.floor(x * 25.5);
                const g = Math.floor(y * 25.5);
                const b = 128;
                
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(x, y, 1, 1);
            }
        }
        
        // Get the image data
        const imageData = ctx.getImageData(0, 0, 10, 10);
        
        // Test each dithering algorithm with each palette
        const algorithms = ['floyd-steinberg', 'bayer', 'ordered'];
        const palettes = ['1bit', 'cga', 'websafe'];
        
        for (const algorithm of algorithms) {
            for (const palette of palettes) {
                console.log(`Testing ${algorithm} with ${palette} palette...`);
                
                let colorPalette;
                let findClosestColorFn;
                const threshold = 128;
                
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
                }
                
                let ditheredImageData;
                
                switch (algorithm) {
                    case 'floyd-steinberg':
                        ditheredImageData = Dithering.floydSteinberg(imageData, findClosestColorFn);
                        break;
                    case 'bayer':
                        ditheredImageData = Dithering.bayer(imageData, findClosestColorFn);
                        break;
                    case 'ordered':
                        ditheredImageData = Dithering.ordered(imageData, findClosestColorFn);
                        break;
                }
                
                console.log(`${algorithm} with ${palette} palette successful`);
            }
        }
        
        console.log('Dithering algorithm tests successful');
    } catch (error) {
        console.error('Error testing dithering algorithms:', error);
    }
}

// Run the tests
console.log('Test script loaded'); 