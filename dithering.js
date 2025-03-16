/**
 * Dithering.js
 * A collection of image dithering algorithms and color palette functions
 */

class Dithering {
    /**
     * Apply Floyd-Steinberg dithering algorithm
     * @param {ImageData} imageData - The original image data
     * @param {Function} findClosestColor - Function to find the closest color in the palette
     * @returns {ImageData} - The dithered image data
     */
    static floydSteinberg(imageData, findClosestColor) {
        if (!imageData || !findClosestColor) {
            throw new Error('Invalid parameters for Floyd-Steinberg dithering');
        }
        
        try {
            // Create a copy of the image data to avoid modifying the original
            const width = imageData.width;
            const height = imageData.height;
            const data = new Uint8ClampedArray(imageData.data);
            const output = new Uint8ClampedArray(data);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Get current pixel color
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    
                    // Find the closest color in the palette
                    const closestColor = findClosestColor(r, g, b);
                    
                    if (!closestColor || closestColor.length < 3) {
                        throw new Error('Invalid color returned from palette');
                    }
                    
                    // Set the output pixel to the closest color
                    output[idx] = closestColor[0];
                    output[idx + 1] = closestColor[1];
                    output[idx + 2] = closestColor[2];
                    output[idx + 3] = data[idx + 3]; // Keep original alpha
                    
                    // Calculate quantization error
                    const errorR = r - closestColor[0];
                    const errorG = g - closestColor[1];
                    const errorB = b - closestColor[2];
                    
                    // Distribute error to neighboring pixels
                    // Right pixel (x+1, y)
                    if (x + 1 < width) {
                        data[(y * width + x + 1) * 4] += errorR * 7 / 16;
                        data[(y * width + x + 1) * 4 + 1] += errorG * 7 / 16;
                        data[(y * width + x + 1) * 4 + 2] += errorB * 7 / 16;
                    }
                    
                    // Bottom-left pixel (x-1, y+1)
                    if (x - 1 >= 0 && y + 1 < height) {
                        data[((y + 1) * width + x - 1) * 4] += errorR * 3 / 16;
                        data[((y + 1) * width + x - 1) * 4 + 1] += errorG * 3 / 16;
                        data[((y + 1) * width + x - 1) * 4 + 2] += errorB * 3 / 16;
                    }
                    
                    // Bottom pixel (x, y+1)
                    if (y + 1 < height) {
                        data[((y + 1) * width + x) * 4] += errorR * 5 / 16;
                        data[((y + 1) * width + x) * 4 + 1] += errorG * 5 / 16;
                        data[((y + 1) * width + x) * 4 + 2] += errorB * 5 / 16;
                    }
                    
                    // Bottom-right pixel (x+1, y+1)
                    if (x + 1 < width && y + 1 < height) {
                        data[((y + 1) * width + x + 1) * 4] += errorR * 1 / 16;
                        data[((y + 1) * width + x + 1) * 4 + 1] += errorG * 1 / 16;
                        data[((y + 1) * width + x + 1) * 4 + 2] += errorB * 1 / 16;
                    }
                }
            }
            
            return new ImageData(output, width, height);
        } catch (error) {
            console.error('Error in Floyd-Steinberg dithering:', error);
            throw new Error('Failed to apply Floyd-Steinberg dithering: ' + error.message);
        }
    }

    /**
     * Apply Bayer matrix dithering algorithm
     * @param {ImageData} imageData - The original image data
     * @param {Function} findClosestColor - Function to find the closest color in the palette
     * @returns {ImageData} - The dithered image data
     */
    static bayer(imageData, findClosestColor) {
        if (!imageData || !findClosestColor) {
            throw new Error('Invalid parameters for Bayer dithering');
        }
        
        try {
            const width = imageData.width;
            const height = imageData.height;
            const data = imageData.data;
            const output = new Uint8ClampedArray(data.length);
            
            // 8x8 Bayer matrix
            const bayerMatrix = [
                [0, 48, 12, 60, 3, 51, 15, 63],
                [32, 16, 44, 28, 35, 19, 47, 31],
                [8, 56, 4, 52, 11, 59, 7, 55],
                [40, 24, 36, 20, 43, 27, 39, 23],
                [2, 50, 14, 62, 1, 49, 13, 61],
                [34, 18, 46, 30, 33, 17, 45, 29],
                [10, 58, 6, 54, 9, 57, 5, 53],
                [42, 26, 38, 22, 41, 25, 37, 21]
            ];
            
            // Normalize the matrix values to the range [0, 1]
            const normalizedMatrix = bayerMatrix.map(row => 
                row.map(val => (val + 0.5) / 64 - 0.5)
            );
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Get current pixel color
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    
                    // Apply threshold using Bayer matrix
                    const threshold = normalizedMatrix[y % 8][x % 8] * 255;
                    
                    // Adjust colors based on threshold
                    const adjustedR = Math.min(255, Math.max(0, r + threshold));
                    const adjustedG = Math.min(255, Math.max(0, g + threshold));
                    const adjustedB = Math.min(255, Math.max(0, b + threshold));
                    
                    // Find the closest color in the palette
                    const closestColor = findClosestColor(adjustedR, adjustedG, adjustedB);
                    
                    if (!closestColor || closestColor.length < 3) {
                        throw new Error('Invalid color returned from palette');
                    }
                    
                    // Set the output pixel to the closest color
                    output[idx] = closestColor[0];
                    output[idx + 1] = closestColor[1];
                    output[idx + 2] = closestColor[2];
                    output[idx + 3] = data[idx + 3]; // Keep original alpha
                }
            }
            
            return new ImageData(output, width, height);
        } catch (error) {
            console.error('Error in Bayer dithering:', error);
            throw new Error('Failed to apply Bayer dithering: ' + error.message);
        }
    }

    /**
     * Apply ordered dithering algorithm
     * @param {ImageData} imageData - The original image data
     * @param {Function} findClosestColor - Function to find the closest color in the palette
     * @returns {ImageData} - The dithered image data
     */
    static ordered(imageData, findClosestColor) {
        if (!imageData || !findClosestColor) {
            throw new Error('Invalid parameters for Ordered dithering');
        }
        
        try {
            const width = imageData.width;
            const height = imageData.height;
            const data = imageData.data;
            const output = new Uint8ClampedArray(data.length);
            
            // 4x4 ordered dithering matrix
            const orderedMatrix = [
                [0, 8, 2, 10],
                [12, 4, 14, 6],
                [3, 11, 1, 9],
                [15, 7, 13, 5]
            ];
            
            // Normalize the matrix values to the range [0, 1]
            const normalizedMatrix = orderedMatrix.map(row => 
                row.map(val => (val + 0.5) / 16 - 0.5)
            );
            
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const idx = (y * width + x) * 4;
                    
                    // Get current pixel color
                    const r = data[idx];
                    const g = data[idx + 1];
                    const b = data[idx + 2];
                    
                    // Apply threshold using ordered matrix
                    const threshold = normalizedMatrix[y % 4][x % 4] * 255;
                    
                    // Adjust colors based on threshold
                    const adjustedR = Math.min(255, Math.max(0, r + threshold));
                    const adjustedG = Math.min(255, Math.max(0, g + threshold));
                    const adjustedB = Math.min(255, Math.max(0, b + threshold));
                    
                    // Find the closest color in the palette
                    const closestColor = findClosestColor(adjustedR, adjustedG, adjustedB);
                    
                    if (!closestColor || closestColor.length < 3) {
                        throw new Error('Invalid color returned from palette');
                    }
                    
                    // Set the output pixel to the closest color
                    output[idx] = closestColor[0];
                    output[idx + 1] = closestColor[1];
                    output[idx + 2] = closestColor[2];
                    output[idx + 3] = data[idx + 3]; // Keep original alpha
                }
            }
            
            return new ImageData(output, width, height);
        } catch (error) {
            console.error('Error in Ordered dithering:', error);
            throw new Error('Failed to apply Ordered dithering: ' + error.message);
        }
    }
}

class ColorPalettes {
    /**
     * Get 1-bit monochrome palette (black and white)
     * @param {number} threshold - Threshold value (0-255)
     * @returns {Array} - Array of colors in the palette
     */
    static monochrome(threshold = 128) {
        return [
            [0, 0, 0],       // Black
            [255, 255, 255]  // White
        ];
    }
    
    /**
     * Get 4-color CGA palette
     * @returns {Array} - Array of colors in the palette
     */
    static cga() {
        return [
            [0, 0, 0],         // Black
            [85, 255, 255],    // Cyan
            [255, 85, 255],    // Magenta
            [255, 255, 255]    // White
        ];
    }
    
    /**
     * Get 8-bit web-safe palette (216 colors)
     * @returns {Array} - Array of colors in the palette
     */
    static webSafe() {
        try {
            const palette = [];
            
            // Generate web-safe colors (6x6x6 = 216 colors)
            for (let r = 0; r < 6; r++) {
                for (let g = 0; g < 6; g++) {
                    for (let b = 0; b < 6; b++) {
                        palette.push([
                            Math.round(r * 51), // 0, 51, 102, 153, 204, 255
                            Math.round(g * 51),
                            Math.round(b * 51)
                        ]);
                    }
                }
            }
            
            return palette;
        } catch (error) {
            console.error('Error generating web-safe palette:', error);
            // Return a simple fallback palette if there's an error
            return [
                [0, 0, 0],       // Black
                [255, 0, 0],     // Red
                [0, 255, 0],     // Green
                [0, 0, 255],     // Blue
                [255, 255, 0],   // Yellow
                [0, 255, 255],   // Cyan
                [255, 0, 255],   // Magenta
                [255, 255, 255]  // White
            ];
        }
    }
    
    /**
     * Find the closest color in the palette to the given RGB color
     * @param {number} r - Red component (0-255)
     * @param {number} g - Green component (0-255)
     * @param {number} b - Blue component (0-255)
     * @param {Array} palette - Array of colors in the palette
     * @returns {Array} - The closest color in the palette
     */
    static findClosestColor(r, g, b, palette) {
        if (!palette || !Array.isArray(palette) || palette.length === 0) {
            console.error('Invalid palette provided to findClosestColor');
            return [0, 0, 0]; // Return black as fallback
        }
        
        try {
            let minDistance = Infinity;
            let closestColor = palette[0]; // Default to first color
            
            for (const color of palette) {
                if (!color || color.length < 3) {
                    continue; // Skip invalid colors
                }
                
                // Calculate Euclidean distance in RGB space
                const dr = r - color[0];
                const dg = g - color[1];
                const db = b - color[2];
                const distance = dr * dr + dg * dg + db * db;
                
                if (distance < minDistance) {
                    minDistance = distance;
                    closestColor = color;
                }
            }
            
            return closestColor;
        } catch (error) {
            console.error('Error finding closest color:', error);
            return [0, 0, 0]; // Return black as fallback
        }
    }
    
    /**
     * Find the closest color in the monochrome palette
     * @param {number} r - Red component (0-255)
     * @param {number} g - Green component (0-255)
     * @param {number} b - Blue component (0-255)
     * @param {number} threshold - Threshold value (0-255)
     * @returns {Array} - The closest color in the palette
     */
    static findClosestMonochromeColor(r, g, b, threshold) {
        try {
            // Ensure threshold is a valid number
            const validThreshold = isNaN(threshold) ? 128 : threshold;
            
            // Convert RGB to grayscale using luminance formula
            const gray = 0.299 * r + 0.587 * g + 0.114 * b;
            
            // Return black or white based on threshold
            return gray < validThreshold ? [0, 0, 0] : [255, 255, 255];
        } catch (error) {
            console.error('Error in monochrome color conversion:', error);
            return [0, 0, 0]; // Return black as fallback
        }
    }
} 