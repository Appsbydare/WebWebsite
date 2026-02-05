# Work Section Configuration Guide

## Overview
The Work Section component now supports extensive customization through a `config` prop. This allows you to adjust the layout, sizing, and positioning without modifying the component code.

## Configuration Options

### `laptopScale`
- **Type**: `number`
- **Default**: `1.0`
- **Range**: `0.5` to `2.0`
- **Description**: Controls the overall scale of the laptop mockup
- **Examples**:
  - `0.8` - 80% of original size (smaller)
  - `1.0` - Original size
  - `1.2` - 120% of original size (larger)

### `laptopPositionX`
- **Type**: `number` (pixels)
- **Default**: `-80`
- **Description**: Horizontal position offset of the laptop mockup
- **Examples**:
  - `-120` - Move further left
  - `0` - Centered horizontally
  - `40` - Move to the right

### `laptopPositionY`
- **Type**: `number` (pixels)
- **Default**: `0`
- **Description**: Vertical position offset of the laptop mockup
- **Examples**:
  - `-50` - Move up
  - `0` - Centered vertically
  - `50` - Move down

### `sectionPaddingY`
- **Type**: `string` (Tailwind classes)
- **Default**: `"py-24 md:py-32"`
- **Description**: Vertical padding for the entire section
- **Examples**:
  - `"py-16 md:py-24"` - Less padding (more compact)
  - `"py-32 md:py-40"` - More padding (more spacious)
  - `"py-20 md:py-28"` - Medium padding

### `deviceGap`
- **Type**: `number` (rem units)
- **Default**: `3`
- **Description**: Gap between the device mockups and the project list
- **Examples**:
  - `2` - Smaller gap (2rem = 32px)
  - `3` - Default gap (3rem = 48px)
  - `4` - Larger gap (4rem = 64px)

### `mobileScale`
- **Type**: `number`
- **Default**: `0.45`
- **Range**: `0.3` to `0.6`
- **Description**: Scale of the mobile mockup relative to the laptop
- **Examples**:
  - `0.35` - Smaller mobile device
  - `0.45` - Default size
  - `0.55` - Larger mobile device

## Usage Examples

### Example 1: Larger Laptop with More Space
```tsx
<WorkSection 
  targetColors={colors}
  config={{
    laptopScale: 1.2,
    deviceGap: 4,
    sectionPaddingY: "py-32 md:py-40"
  }}
/>
```

### Example 2: Compact Layout
```tsx
<WorkSection 
  targetColors={colors}
  config={{
    laptopScale: 0.9,
    laptopPositionX: -40,
    deviceGap: 2,
    sectionPaddingY: "py-16 md:py-24",
    mobileScale: 0.4
  }}
/>
```

### Example 3: Centered and Prominent
```tsx
<WorkSection 
  targetColors={colors}
  config={{
    laptopScale: 1.3,
    laptopPositionX: 0,
    laptopPositionY: -20,
    deviceGap: 5,
    mobileScale: 0.5
  }}
/>
```

### Example 4: Move Laptop Left and Increase Size
```tsx
<WorkSection 
  targetColors={colors}
  config={{
    laptopScale: 1.15,
    laptopPositionX: -120,
    deviceGap: 3.5
  }}
/>
```

## Tips for Best Results

1. **Laptop Scale**: Keep between 0.8 and 1.3 for best visual balance
2. **Position X**: Negative values move left, positive move right. Stay within -150 to 50 for best results
3. **Position Y**: Use small adjustments (-30 to 30) for vertical alignment
4. **Device Gap**: 2-4 rem works well for most layouts
5. **Mobile Scale**: Keep between 0.35 and 0.55 to maintain proper proportion with laptop

## Changes Made

### Removed Elements
- ✅ "Live builds" label
- ✅ "Hover / tap projects to swap the screen states" instruction text

### Added Features
- ✅ Configurable laptop size
- ✅ Configurable laptop position (X and Y)
- ✅ Configurable section padding
- ✅ Configurable gap between devices and project list
- ✅ Configurable mobile device size

### Improved Responsiveness
- Better scaling on different screen sizes
- More professional appearance without instructional text
- Cleaner, more focused design
