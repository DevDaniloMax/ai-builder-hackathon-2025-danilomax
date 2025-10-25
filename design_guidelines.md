# ChatCommerce AI - Design Guidelines

## Design Philosophy
Premium conversational commerce experience blending AI assistant intelligence with professional shopping platform trust. Interface disappears, letting conversation and products lead.

**Influences:** Linear (minimalism), ChatGPT/Claude (conversational UI), Stripe (trust), Shopify (merchandising)

---

## Typography

### Fonts
- **Interface:** Inter (Google Fonts) - messages, UI
- **Monospace:** JetBrains Mono - prices, SKUs

### Scale
```
Display: text-4xl (36px) font-bold
Message: text-base (16px) font-normal, leading-relaxed
Product Name: text-lg (18px) font-semibold, leading-tight
Price: text-xl (20px) font-bold (mono)
Metadata: text-xs (12px) font-normal
Button: text-sm (14px) font-medium
```

---

## Layout

### Spacing
**Units:** 2, 4, 6, 8, 12, 16, 24 (Tailwind)
- Component padding: p-4, p-6, p-8
- Message spacing: space-y-4, space-y-6
- Card gaps: gap-4, gap-6

### Structure
- **Chat Container:** max-w-4xl mx-auto
- **Product Grid:** grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- **Viewport:** min-h-screen, flex column, input fixed bottom

---

## Components

### Chat Layout
```
Header (h-16) → Brand, menu
Messages (flex-grow, overflow-y-auto) → Scrollable
Input Bar (h-20, fixed bottom) → Textarea + send
```

### Message Bubbles
- **User:** max-w-2xl ml-auto rounded-2xl p-4
- **AI:** max-w-3xl mr-auto rounded-2xl p-6
- **Timestamp:** text-xs opacity-60 mt-2
- **Streaming:** Animated ellipsis with pulse

### Product Cards
```
┌─────────────────┐
│ Image (1:1)     │ aspect-square, rounded-lg, object-cover
├─────────────────┤
│ Name (2 lines)  │ text-lg font-semibold
│ $XX.XX          │ text-xl font-bold mono
│ Source badge    │ text-xs rounded-full
│ [View →]        │ Full-width button mt-4
└─────────────────┘
```

**Specs:**
- Border: border rounded-xl, p-5
- Hover: translate-y-[-2px] transition-transform
- Grid: Responsive cols, max 9 products
- Image: 400x400px min, lazy load, fallback icon

### Input Interface
- Container: Fixed bottom, w-full px-4 py-4
- Wrapper: max-w-4xl mx-auto flex gap-3
- Textarea: rounded-xl p-4 min-h-[56px] max-h-[200px] resize-none
- Send: w-12 h-12 rounded-xl icon-only
- Placeholder: "Describe what you're looking for..."
- Auto-resize to content

### Empty State
Center-aligned:
```
[Icon w-16]
ChatCommerce AI (text-4xl font-bold)
Your AI Shopping Assistant (text-lg opacity-70)

Suggested Queries (clickable pills):
- rounded-full px-6 py-3 text-sm
- grid-cols-1 md:grid-cols-3 gap-3
- hover:scale-105
- 6-9 examples
```

### Header
- h-16, max-w-7xl mx-auto px-4
- flex items-center justify-between
- Left: Logo (text-xl font-bold)
- Right: Menu icon (w-8 h-8)
- border-b

### Loading States
- Skeleton: Pulsing shimmer
- Typing: 3-dot stagger animation
- Streaming: Character reveal + cursor blink
- Auto-scroll to latest

### Buttons
**Primary:**
- px-6 py-3 (or p-4 icon-only)
- rounded-xl, text-sm font-medium
- transition-all duration-200
- Explicit hover/active/disabled states

**Icons:** Heroicons (send, menu, close, external link)

---

## Color System
*(Reference color tokens from your theme - preserve specific hex/RGB values, background/foreground relationships, and states like hover/active/disabled)*

---

## Animations

**Principle:** Minimal, purposeful, never distracting

**Approved (200-300ms):**
1. Message entrance: slide-up + fade
2. Card hover: translate-y-[-2px]
3. Button hover: scale/brightness
4. Streaming cursor: blink
5. Loading: pulse

**Avoid:** Parallax, scroll-triggered, carousels, confetti

---

## Responsive

### Breakpoints
- Mobile: 0-768px (base)
- Tablet: 768-1024px (md:)
- Desktop: 1024px+ (lg:)

### Mobile
- Single-column grid
- Reduced padding (px-4)
- Smaller type (text-3xl hero)
- safe-area-inset
- 44x44px tap targets

### Desktop
- max-w-4xl chat, max-w-7xl full
- 3-column grid
- Hover states active
- Generous spacing

---

## Accessibility

**Keyboard:**
- Tab order: Header → Messages → Input → Send
- Enter sends, Escape clears

**Screen Readers:**
- ARIA labels on interactive elements
- Live region for new messages
- Alt text: "Product name - $XX.XX"

**Visual:**
- Focus ring: 2px solid with offset
- WCAG AA contrast (4.5:1 min)
- Clear interactive states

---

## Images

**Product:** 1:1 aspect, object-cover, rounded-lg, 400x400px min
**Empty State:** Icon/logo w-16 h-16, optional subtle gradient
**Handling:** Lazy load, placeholder fallback, inline in messages

---

## Special Patterns

**Streaming:** Skeleton → character reveal → progressive card load → auto-scroll

**Errors:** Inline messages, retry button, "No products" with refinement suggestion

**Performance:** Virtual scroll (>50 messages), lazy images, debounced input

---

**Core Principle:** Utility-first app with premium design. Every element serves conversation/discovery. Clean, focused interface—AI does heavy lifting, UI gets out of the way.