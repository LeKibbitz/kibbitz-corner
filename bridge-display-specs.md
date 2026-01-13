# Bridge Generator V2 - Display Specifications

## Current State
- Setup mode with form inputs
- Mitchell display mode with sections
- Toggle between modes
- Basic fullscreen functionality

## Target State - Full Screen Display

### Display Rules
- **Default Mode**: Full screen by default
- **Background**: No white backgrounds, smooth visible colors
- **Table Numbers**: Horizontal display, number only
- **Table Stickers**: Match section banner colors
- **Section Banners**: Always visible (even single section)

### UI Controls in Banner
- Section count buttons: 1, 2, 3
- Algorithm toggle: "1-4-7" (current) vs "TBD" (new)
- Both triggers page refresh on change

### Full Screen Mode
- Clean interface - only important info
- No control buttons visible
- Discreet but visible exit fullscreen button
- Optimized for public display

### Color Scheme
- Section A: Green tones
- Section B: Blue tones
- Section C: Orange/Red tones
- Smooth gradients, no harsh contrasts

## Implementation Flow
1. CSS: Full screen default, color updates
2. HTML: Add banner controls
3. JS: Button handlers with refresh
4. Clean fullscreen interface
5. Table display optimization