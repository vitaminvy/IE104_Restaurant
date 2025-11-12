# 🎨 Visual Reference Guide

This document provides visual descriptions of what each feature looks like and where it appears on the website.

---

## 🌱 Feature 1: Dietary Filter System

### Location: Below menu category filters on Menu Page

### Visual Layout:
```
┌─────────────────────────────────────────────────────────────┐
│  Filter by dietary preferences:                             │
│                                                              │
│  [🌱 Vegan]  [🥗 Vegetarian]  [🌾 Gluten Free]              │
│  [🌶️ Spicy]  [🔥 Popular]  [⭐ Chef's Special]             │
└─────────────────────────────────────────────────────────────┘
```

### Colors:
- **Vegan**: Green `#10b981`
- **Vegetarian**: Light Green `#84cc16`
- **Gluten Free**: Orange `#f59e0b`
- **Spicy**: Red `#ef4444`
- **Popular**: Brand Orange `#fb8f2c`
- **Chef's Special**: Yellow `#eab308`

### Interaction:
- Click badge → Badge lights up + gets border
- Multiple badges can be selected
- Menu filters automatically
- Hover → Badge lifts slightly with shadow

### On Menu Cards:
```
┌──────────────────────┐
│   [Food Image]       │
│                      │
│  Grilled Chicken     │
│  Healthy rice bowl   │
│                      │
│  [🌾 Gluten Free]    │ ← Badge appears here
│  [🔥 Popular]        │
│                      │
│  Order Now    $9.99  │
└──────────────────────┘
```

---

## 💡 Feature 2: Smart Meal Pairing Suggestions

### Location: Below product detail section on Product Detail Page

### Visual Layout:
```
┌─────────────────────────────────────────────────────────────┐
│                    Pairs Well With                          │
│     Enhance your meal with these perfect combinations       │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │  [Image] │  │  [Image] │  │  [Image] │                 │
│  │          │  │          │  │          │                 │
│  │ Pancakes │  │ Avocado  │  │  Salmon  │                 │
│  │ Stack    │  │ Toast    │  │ Teriyaki │                 │
│  │          │  │          │  │          │                 │
│  │ 💡 Comp- │  │ 💡 Balan-│  │ 💡 Chef  │                 │
│  │ lements  │  │ ces the  │  │ recom-   │                 │
│  │ perfectly│  │ spice    │  │ mendation│                 │
│  │          │  │          │  │          │                 │
│  │ $5.99    │  │ $7.50    │  │ $14.50   │                 │
│  │ [Add]    │  │ [Add]    │  │ [Add]    │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

### Hover Effect:
- Card lifts up with shadow
- Image zooms in slightly
- Title turns orange
- Shimmer effect sweeps across

### Toast Notification (when adding to cart):
```
┌────────────────────────────────┐
│ ✓ Pancake Stack added to cart! │  ← Bottom right corner
└────────────────────────────────┘
   Slides in and out smoothly
```

---

## ⚠️ Feature 3: Allergy Alert System

### Floating Button:
**Desktop Position**: Top-right corner (below header)
**Mobile Position**: Bottom-right corner (above footer)

```
┌──────────────────────┐
│ ⚠️ Allergy Settings  │  ← Floating button
└──────────────────────┘
   Glassmorphism red glow
```

### Modal (when clicked):
```
┌──────────────────────────────────────────────────┐
│  Manage Allergies                          [×]   │
│                                                   │
│  [🌰]        [🥛]        [🥚]        [⚠️]        │
│  Tree Nuts   Dairy      Eggs       Gluten       │
│  ✓ Selected  □          □          ✓           │
│                                                   │
│  [🥜]        [⚠️]        [🐟]        [⚠️]        │
│  Peanuts     Soy        Fish       Sesame       │
│  □           □          ✓          □           │
│                                                   │
│  [Clear All]              [Save Settings]        │
└──────────────────────────────────────────────────┘
```

### Warning Banner (on product page when conflict detected):
```
┌──────────────────────────────────────────────────┐
│ ⚠️ Allergy Warning: This item contains Gluten,  │
│    Tree Nuts which you marked as allergens.      │  ← Red pulsing banner
└──────────────────────────────────────────────────┘
```

### Allergen List on Product:
```
Contains:
[⚠️ Gluten] [🥛 Dairy] [🥚 Eggs]
   ↑ Red if user is allergic, gray if not
```

---

## 🔥 Feature 4: Social Proof Notifications

### Order Counter:
**Desktop Position**: Top-left corner (below header)
**Mobile Position**: Bottom-center (above notifications)

```
┌──────────────────────────────┐
│ 🔥 127 meals delivered today │  ← Pulsing fire icon
└──────────────────────────────┘
   Counter increments with each notification
```

### Notification (slides in from bottom-left):
```
┌────────────────────────────────────────────┐
│  [Image]  Sarah from Sydney                │
│   50x50   just ordered Grilled Chicken 🌶️ │
│           a few minutes ago           [×]  │
└────────────────────────────────────────────┘
   ↑ Food image with orange border
   Glassmorphism dark background
   Slides in every 8 seconds
   Auto-hides after 5 seconds
```

### Animation Sequence:
1. Notification slides up from bottom
2. Stays for 5 seconds
3. Slides back down
4. Next notification appears after 8 seconds
5. Counter increments

---

## 🎨 Color Palette

### Primary Colors:
```
Brand Orange:   #fb8f2c  ██████
White:          #ffffff  ██████
Dark BG:        #111114  ██████
Box BG:         #18181b  ██████
```

### Dietary Badge Colors:
```
Vegan:          #10b981  ██████  (Green)
Vegetarian:     #84cc16  ██████  (Light Green)
Gluten Free:    #f59e0b  ██████  (Orange)
Spicy:          #ef4444  ██████  (Red)
Popular:        #fb8f2c  ██████  (Brand Orange)
Chef's Special: #eab308  ██████  (Yellow)
```

### Status Colors:
```
Warning/Alert:  #ef4444  ██████  (Red)
Success:        #10b981  ██████  (Green)
Info:           #3b82f6  ██████  (Blue)
```

---

## 📱 Responsive Breakpoints

### Desktop (≥1024px):
- Dietary filters: Horizontal row
- Meal pairing: 3 columns
- Notifications: Bottom-left
- Counter: Top-left
- Allergy button: Top-right

### Tablet (641px - 1023px):
- Dietary filters: Wrapped horizontal
- Meal pairing: 2 columns
- Notifications: Bottom-left
- Counter: Top-left
- Allergy button: Top-right

### Mobile (≤640px):
- Dietary filters: 2 columns grid
- Meal pairing: 1 column
- Notifications: Bottom (full width)
- Counter: Bottom-center
- Allergy button: Bottom-right

---

## 🎭 Animation Effects

### Hover Animations:
```
Scale Up:        transform: scale(1.05)
Lift Up:         transform: translateY(-8px)
Glow:            box-shadow: 0 12px 32px rgba(...)
Border Pulse:    Animation on allergy warning
Shimmer:         Gradient sweep on pairing cards
Image Zoom:      transform: scale(1.1) on image
```

### Entry Animations:
```
Slide Up:        translateY(120%) → translateY(0)
Fade In:         opacity: 0 → opacity: 1
Scale In:        scale(0.8) → scale(1)
```

### Timing:
```
Quick:           0.2s  (buttons)
Standard:        0.3s  (most animations)
Smooth:          0.4s  (image transitions)
Slow:            0.6s  (shimmer effect)
```

---

## 🖼️ Icon Reference

### Emoji Icons Used:
```
🌱 - Vegan
🥗 - Vegetarian
🌾 - Gluten Free
🌶️ - Spicy
🔥 - Popular / Hot
⭐ - Chef's Special
⚠️ - Warning / Allergen
💡 - Pairing Reason
🎉 - Order Celebration
🥛 - Dairy
🥚 - Eggs
🌰 - Tree Nuts
🥜 - Peanuts
🐟 - Fish
```

### For Production:
Replace emoji with SVG icons for:
- Better cross-browser compatibility
- Consistent appearance
- Scalability
- Custom styling

---

## 📐 Spacing System

```
Extra Small:  0.25rem  (4px)   - Badge padding
Small:        0.5rem   (8px)   - Gap between badges
Medium:       1rem     (16px)  - Card padding
Large:        1.5rem   (24px)  - Section spacing
Extra Large:  2rem     (32px)  - Major sections
```

---

## 🎯 Key Interaction Points

### 1. Dietary Filters
- **Click**: Toggle filter on/off
- **Multi-select**: Can select multiple
- **Hover**: Lift + shadow effect

### 2. Meal Pairing Cards
- **Click Card**: Navigate to product
- **Click Add Button**: Add to cart + show toast
- **Hover**: Lift + image zoom + shimmer

### 3. Allergy Button
- **Click**: Open modal
- **Hover**: Glow effect

### 4. Allergy Modal
- **Click Allergen**: Toggle selection
- **Click Save**: Close + save to localStorage
- **Click Clear**: Unselect all
- **Click Overlay**: Close modal

### 5. Social Proof
- **Click Notification**: Dismiss
- **Click X**: Dismiss
- **Auto**: Disappears after 5s

---

## 📊 Visual Hierarchy

### Font Sizes:
```
Hero Title:        3rem    (48px)
Section Title:     2rem    (32px)
Card Title:        1.125rem (18px)
Body Text:         1rem    (16px)
Small Text:        0.875rem (14px)
Badge Text:        0.75rem  (12px)
```

### Font Weights:
```
Light:    400 - Body text
Medium:   500 - Headings
Semibold: 600 - Important text
Bold:     700 - Prices, numbers
```

---

## 🔍 Z-Index Layers

```
10000: Toast notifications
9999:  Allergy modal overlay
9998:  Social proof notifications
999:   Allergy settings button
999:   Order counter
10:    Menu arrows
1:     Base interactive elements
```

---

## ✨ Special Effects

### Glassmorphism:
```css
background: rgba(255, 255, 255, 0.05);
backdrop-filter: blur(10px);
border: 1px solid rgba(255, 255, 255, 0.1);
```

### Gradient Shimmer:
```css
background: linear-gradient(
  90deg,
  transparent,
  rgba(251, 143, 44, 0.1),
  transparent
);
```

### Pulse Animation:
```css
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}
```

### Warning Pulse:
```css
@keyframes pulseWarning {
  0%, 100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
  50% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
}
```

---

**This visual reference helps you understand exactly how each feature looks and behaves!**

For implementation details, see `FEATURES_INTEGRATION_GUIDE.md`  
For code examples, see `demo-features.html`
