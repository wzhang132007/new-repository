# Orange - Multi-Page Interactive Design

This project is a complete HTML/CSS/JS implementation of the Figma design with three interactive pages.

## Files Included
- `index.html` - Main HTML structure with all three pages
- `styles.css` - All styling and animations
- `script.js` - Navigation logic and interactive features

## Features

### 📄 Three Pages
1. **Page 1 (pg1)**: White background with large house-fly image
2. **Page 2 (pg2)**: Brown/tan background (#575039) with clickable text
3. **Page 3 (pg3)**: White background with smaller house-fly image and drawing

### 🎯 Navigation
- **Click on "text test"** to navigate between pages:
  - Page 1 → Page 2
  - Page 2 → Page 3
  - Page 3 → Page 1 (cycles back)
- **Navigation buttons** at bottom-right for easy testing
- **Keyboard controls**:
  - Right Arrow → Next page
  - Left Arrow → Previous page
- **Touch/Swipe support** for mobile devices

### ✨ Interactive Effects
- Smooth fade transitions between pages
- Hover effects on clickable text
- Subtle parallax effect on images (follows mouse movement)
- Entrance animations when pages load
- Responsive scaling for smaller screens

### 🎨 Design Details
- Uses **Jacquard 12** font from Google Fonts
- Maintains exact positioning and sizing from Figma
- All images fetched from Figma API (valid for 7 days)
- Preserves all node IDs as data attributes

## How to Use

1. Open `index.html` in a web browser
2. Click on the "text test" to navigate forward
3. Use navigation buttons or keyboard arrows for manual control
4. On mobile/tablet, swipe left/right to navigate

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile responsive with touch support
- Requires JavaScript enabled

## Customization

### To change navigation flow:
Edit the `navigateTo()` calls in `index.html` or modify the logic in `script.js`

### To adjust animations:
Modify transition properties in `styles.css` and animation keyframes in `script.js`

### To add new pages:
1. Add new page div in `index.html`
2. Add styling in `styles.css`
3. Update page order array in `script.js`

## Notes
- Image assets are hosted on Figma's server and expire after 7 days
- Design is optimized for 1440x1024 viewport
- Scales responsively for smaller screens
- All data-node-id attributes preserved for Figma reference

## Development
To make changes:
1. Edit the respective files
2. Refresh browser to see changes
3. No build process required - pure HTML/CSS/JS

Enjoy exploring the design! 🎨
