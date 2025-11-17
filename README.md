# 3D Interactive Chemistry Lab

A full-screen, immersive 3D chemistry laboratory simulation built with Three.js. Experience realistic chemical reactions across two interactive stages.

## Features

### Stage 1 — Beaker Laboratory
- **Full 3D Environment**: Photorealistic laboratory with glass beakers, reflective surfaces, and volumetric lighting
- **6 Interactive Beakers**: Each can hold exactly 3 chemical substances
- **7 Chemical Elements**: Yellow, Blue, Green, Purple, Red, Orange, and Cyan
- **Realistic Effects**: Glass refraction, liquid shaders, particle systems, and soft shadows
- **5 Reaction Types**:
  - **Energy Burst** - Explosive micro-reactions with particle effects
  - **Color Diffusion** - Smooth CMY volumetric gradients
  - **Bubble Reaction** - Rising bubbles with physics simulation
  - **Steam/Heat** - White vapor particles with upward motion
  - **Stable Reaction** - Minimal ripple effect

### Stage 2 — Distillation Chamber
- **Complex 3D Apparatus**: Multi-branch distillation system with:
  - Central spherical reaction flask
  - 6 branching vertical glass tubes
  - Spiral condensers and metallic stand
  - Realistic glass materials with caustics
- **Drag-and-Drop Interaction**: Pour Stage 1 results into individual branches
- **Final Combined Reactions**:
  - **Major Energy Burst** - ≥3 explosion-type reactions
  - **Layered Chromatic Distillation** - All diffusion-type reactions
  - **Oscillating Thermal Reaction** - Mixed warm/cool reactions
  - **Crystal Formation** - At least 1 stable reaction
  - **Reaction Failed** - All identical reactions
  - **Complex Mixture** - Other combinations

## How to Use

### Getting Started
1. Open `chemistry-lab.html` in a modern web browser (Chrome, Firefox, or Edge recommended)
2. The application loads directly with no build process required

### Stage 1 Instructions

1. **Select a Chemical**
   - Click on one of the 7 colored buttons on the right side
   - The selected chemical will be highlighted with a white border

2. **Add to Beakers**
   - Click on any beaker to add the selected chemical
   - Each beaker can hold 3 substances (can be identical or different)
   - Watch the liquid level rise with each addition

3. **Trigger Reactions**
   - When a beaker reaches 3 substances, it automatically triggers a reaction
   - Reaction type is determined by the color combination:
     - **Red + Orange + Yellow** → Energy Burst
     - **Red + Yellow** → Energy Burst
     - **Blue + Red** → Steam (hot + cold)
     - **Green + any** → Bubble Reaction
     - **Cyan + Purple + Yellow** → Color Diffusion
     - **All same color** → Stable Reaction
     - **All cool colors (Blue/Cyan/Purple)** → Color Diffusion
     - **Other combinations** → Bubble Reaction

4. **Complete Stage 1**
   - Fill all 6 beakers to trigger automatic transition
   - Watch the white glow transition effect
   - Message displays: "Stage 1 Completed — Entering Distillation Lab..."

### Stage 2 Instructions

1. **View Your Results**
   - 6 vials appear on the left side, color-coded by their Stage 1 reactions
   - Each vial is labeled with its reaction type

2. **Pour Into Branches**
   - Drag a vial from the left panel
   - Drop it onto one of the 6 glass tubes around the apparatus
   - Watch the localized reaction in the tube

3. **Final Reaction**
   - After all 6 vials are poured, the system calculates a final outcome
   - The central flask triggers a spectacular combined reaction
   - Results screen shows the final reaction type

### Camera Controls
- **Rotate**: Left-click and drag
- **Zoom**: Mouse wheel or pinch gesture
- **Pan**: Right-click and drag (or two-finger drag)

## Technical Details

### Built With
- **Three.js** - 3D rendering engine
- **WebGL** - Hardware-accelerated graphics
- **Custom GLSL Shaders** - Realistic glass, liquid, and particle effects

### Browser Requirements
- Modern browser with WebGL 2.0 support
- Recommended: Chrome 90+, Firefox 88+, or Edge 90+
- Minimum resolution: 1280x720

### Performance
- Optimized for 60 FPS on mid-range GPUs
- Particle systems use instanced rendering
- Shader-based effects minimize CPU usage
- Automatic quality scaling based on device capabilities

## File Structure

```
.
├── chemistry-lab.html      # Main HTML file with UI structure
├── chemistry-lab.js        # Core application logic and Three.js scene
└── README.md              # This file
```

## Reaction Color Combinations Guide

### Energy Burst (Explosion)
- Red + Orange + Yellow
- Red + Yellow + any
- Creates: Orange particle burst with glow effect

### Color Diffusion
- Cyan + Purple + Yellow
- All cool colors (Blue, Cyan, Purple)
- Creates: Gentle color particles and shader effects

### Bubble Reaction
- Any combination with Green
- Creates: Rising transparent bubbles

### Steam/Heat
- Blue + Red (temperature contrast)
- Creates: White vapor particles rising upward

### Stable Reaction
- Three identical colors
- Creates: Minimal ripple effect, silent reaction

## Advanced Features

### Shader Effects
- **Glass Refraction**: Fresnel-based transparency with edge highlights
- **Liquid Rendering**: Time-based bubble animation with color mixing
- **Particle Systems**: Custom vertex/fragment shaders for explosions
- **Caustics**: Light refraction through glass surfaces

### Physics Simulation
- Gravity applied to particle systems
- Velocity-based bubble motion
- Fade-out based on particle lifetime

### Auto-Transition System
- Smooth fade effects using CSS transitions
- Scene cleanup and recreation
- Camera repositioning with easing

## Tips for Best Experience

1. **Experiment with Combinations**: Try different color mixes to discover all reaction types
2. **Watch Closely**: Each reaction has unique particle effects and timing
3. **Strategic Planning**: In Stage 1, think about what final outcome you want in Stage 2
4. **Camera Position**: Zoom in to see glass refraction details, zoom out for full apparatus view
5. **Patience**: Let each reaction fully complete before moving to the next beaker

## Known Limitations

- Drag-and-drop in Stage 2 requires precise positioning over tubes
- Particle effects may reduce performance on low-end devices
- Mobile devices may have limited shader support

## Future Enhancements

- Additional chemical elements
- More complex reaction chains
- Spectrograph analysis of final mixtures
- Save/load experiment configurations
- Multiplayer collaboration mode

## Credits

Created as an educational and artistic demonstration of WebGL capabilities and chemical reaction simulation.

**Version**: 1.0.0
**License**: MIT

---

Enjoy your experiments in the 3D Chemistry Lab! 🧪✨
