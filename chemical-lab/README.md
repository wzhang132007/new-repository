# Chemical Laboratory Simulator

An interactive chemical laboratory simulation where users can mix colored chemical substances in beakers to create different reactions, then pour them into a distillation apparatus for a final spectacular effect!

## Features

### Scene 1: Beaker Mixing Station

- **6 Beakers**: Each beaker can hold exactly 3 chemical substances
- **6 Chemical Substances**: Yellow, Blue, Green, Purple, Red, and Orange
- **Dynamic Reactions**: Different combinations of chemicals create unique reactions:
  - 💥 **Explosions**: Red-Yellow-Blue, Red-Red-Red, Orange-Red-Yellow
  - 🫧 **Bubbles**: Blue-Green-Yellow, Blue-Blue-Green, Green-Yellow-Blue
  - 💨 **Steam/Gas**: Purple-Yellow-Green, Purple-Purple-Blue, Green-Green-Green
  - 💎 **Crystals**: Blue-Purple-Red, Yellow-Purple-Blue
  - ✨ **Glow**: Purple-Green-Yellow, Blue-Yellow-Purple
  - ❄️ **Freeze**: Blue-Blue-Blue, Blue-Purple-Green
  - ⚗️ **Neutral**: All other combinations

### Scene 2: Distillation Apparatus

- **6-Branch Distillation System**: Pour completed beakers into the apparatus
- **Visual Mixing**: Watch as chemicals flow through the branches
- **Final Reactions**: Based on the combination of all 6 beakers:
  - 💥💥💥 **Mega Explosion**: 4+ explosion reactions
  - 🫧🫧🫧 **Bubble Overflow**: 4+ bubble reactions
  - 💨💨💨 **Gas Cloud**: 4+ steam reactions
  - 🎆 **Spectacular Reaction**: Mixed reaction types
  - ✅ **Perfectly Balanced**: All stable/neutral reactions

## How to Use

### Scene 1 Instructions

1. **Select a Chemical**: Click on one of the colored chemical substances (Yellow, Blue, Green, Purple, Red, Orange)
2. **Add to Beaker**: Click on a beaker to add the selected chemical to it
3. **Fill Beakers**: Add 3 substances to each beaker (you can use the same substance multiple times)
4. **Watch Reactions**: Each completed beaker will show its unique reaction
5. **Complete All 6**: Fill all 6 beakers to unlock Scene 2

### Scene 2 Instructions

1. **Pour Beakers**: Click the beaker buttons to pour each mixture into the distillation apparatus
2. **Watch the Branches**: See the chemicals flow into the 6-branch system
3. **Trigger Final Reaction**: Once all 6 beakers are poured, click "Trigger Final Reaction"
4. **Enjoy the Show**: Watch the spectacular final effect!

## Controls

### Scene 1
- **Clear Selected Beaker**: Click the button, then click on a beaker to clear it
- **Proceed to Scene 2**: Unlocks when all 6 beakers are complete

### Scene 2
- **Back to Scene 1**: Return to the beaker mixing station
- **Reset Laboratory**: Clear all progress and start over
- **Trigger Final Reaction**: Activate the final chemical reaction (available when all beakers are poured)

## Technical Details

### File Structure
```
chemical-lab/
├── index.html       # Main HTML structure
├── styles.css       # Styling and animations
├── script.js        # Game logic and interactions
└── README.md        # This file
```

### Technologies Used
- HTML5
- CSS3 (with animations and gradients)
- Vanilla JavaScript (ES6+)
- SVG for the distillation apparatus

### Responsive Design
- Optimized for desktop (1200px+)
- Tablet support (768px - 1199px)
- Mobile support (< 768px)

## Reaction Combinations Guide

Here are some interesting combinations to try:

| Substances | Reaction | Effect |
|------------|----------|---------|
| Red + Yellow + Blue | 💥 Explosion | Explosive Mixture |
| Blue + Green + Yellow | 🫧 Bubbles | Fizzy Solution |
| Purple + Yellow + Green | 💨 Steam | Toxic Gas |
| Blue + Purple + Red | 💎 Crystal | Crystal Formation |
| Purple + Green + Yellow | ✨ Glow | Bioluminescence |
| Blue + Blue + Blue | ❄️ Freeze | Deep Freeze |

Feel free to experiment with different combinations!

## Tips

1. You can add the same substance multiple times to a beaker
2. Order doesn't matter - "Red-Blue-Green" = "Blue-Green-Red"
3. Clear a beaker anytime before moving to Scene 2
4. Try to create all explosions for the Mega Explosion finale!
5. Mix different reaction types for a Spectacular Reaction

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Getting Started

Simply open `index.html` in your web browser to start the chemical laboratory simulator!

## Future Enhancements

- More chemical substances
- Additional reaction types
- Sound effects
- Save/Load experiments
- Achievement system
- Educational chemistry facts

---

**Enjoy your chemical experiments!** 🧪⚗️🔬
