# Interactive Image Dithering

A responsive HTML5 web application that allows users to apply various dithering algorithms to images with different color palettes.

## Features

- **Multiple Dithering Algorithms**:
  - Floyd-Steinberg (error diffusion)
  - Bayer matrix (ordered dithering)
  - Ordered dithering (pattern-based)

- **Color Palette Options**:
  - 1-bit Monochrome (black and white)
  - 4-color CGA (black, cyan, magenta, white)
  - 8-bit Web-safe (216 colors)

- **Interactive Controls**:
  - Threshold adjustment for monochrome dithering
  - Resolution scaling to control output size
  - Real-time preview of dithered results

- **User-Friendly Interface**:
  - Drag-and-drop file upload
  - Side-by-side comparison of original and dithered images
  - Download functionality for processed artwork
  - Responsive design for mobile and desktop

## How to Use

1. **Upload an Image**:
   - Drag and drop an image onto the upload area, or
   - Click "Select a file" to choose an image from your device

2. **Adjust Settings**:
   - Select a dithering algorithm
   - Choose a color palette
   - Adjust the threshold (for monochrome palette)
   - Set the resolution scale as needed

3. **Process and Download**:
   - Click "Process Image" to apply the dithering
   - View the result in the preview area
   - Click "Download Result" to save the dithered image

## Technical Details

This application is built using:
- HTML5 Canvas for image processing
- JavaScript for dithering algorithms and UI interaction
- CSS Grid and Flexbox for responsive layout
- No external libraries or dependencies

## Browser Compatibility

The application works in all modern browsers that support HTML5 Canvas:
- Chrome
- Firefox
- Safari
- Edge

## License

This project is open source and available for personal and commercial use.

## Credits

Created as a demonstration of image dithering techniques using web technologies. 