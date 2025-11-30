# FoodieFinder Design Guidelines

## Design Approach
**Reference-Based**: Drawing inspiration from OpenTable and Zomato's clean, professional restaurant discovery interfaces with focus on visual appeal and intuitive navigation.

## Core Design Principles
1. **Visual-First Discovery**: Restaurant imagery drives engagement and decision-making
2. **Dual Experience**: Distinct but cohesive design language for customer and admin interfaces
3. **Information Hierarchy**: Critical details (cuisine, location, ratings) immediately visible
4. **Trust Signals**: Professional presentation builds credibility for dining decisions

---

## Typography System

**Font Families**:
- Primary: Poppins (600 for headings, 500 for subheadings)
- Body: Open Sans (400 regular, 600 semi-bold)
- UI Elements: Roboto (400, 500)

**Type Scale**:
- Hero Headline: text-5xl md:text-6xl font-semibold (Poppins)
- Page Titles: text-3xl md:text-4xl font-semibold (Poppins)
- Section Headers: text-2xl md:text-3xl font-semibold (Poppins)
- Card Titles: text-xl font-semibold (Poppins)
- Body Text: text-base (Open Sans)
- Captions/Labels: text-sm (Roboto)
- Buttons: text-sm md:text-base font-medium uppercase tracking-wide (Roboto)

---

## Layout & Spacing System

**Spacing Primitives**: Use Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24
- Component padding: p-4 md:p-6 lg:p-8
- Section padding: py-12 md:py-16 lg:py-20
- Card spacing: p-6
- Form fields: p-3
- Gaps in grids: gap-4 md:gap-6 lg:gap-8

**Container Strategy**:
- Full-width sections with inner max-w-7xl mx-auto px-4
- Content sections: max-w-6xl
- Forms: max-w-2xl

**Border Radius**: rounded-lg (8px) consistently across cards, buttons, and inputs

---

## Customer Interface Components

### Hero Section
- Full-width with large hero image (high-quality food/restaurant photography)
- Overlaid search bar with location and cuisine filters
- Buttons with backdrop-blur-md bg-white/20 treatment
- Height: min-h-[500px] md:min-h-[600px]

### Restaurant Card Grid
- Grid: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Card structure:
  - Restaurant image (aspect-ratio-4/3, object-cover)
  - Badge overlay for cuisine type (top-right, gold accent)
  - Card body with restaurant name, location, price range ($-$$$)
  - Rating display with stars and review count
  - Quick action button "View Details"
- Hover: subtle shadow elevation (shadow-lg)

### Search & Filter Bar
- Sticky position on scroll (top-20)
- Three filter sections: Location, Cuisine Type, Price Range
- Dropdown menus with forest green active states
- Clear/Reset filters button
- Results count display

### Restaurant Detail Page
- Hero image gallery (large primary + 4-6 thumbnails)
- Information grid (2-column on desktop):
  - Left: Name, cuisine, rating, price range, hours, contact
  - Right: Interactive map showing location
- Menu section with categorized items
- Related restaurants carousel at bottom

### Navigation
- Fixed header with logo left, navigation center, account/login right
- Categories: Browse, Cuisines, Near Me, About
- Transparent on hero, white background on scroll
- Mobile: Hamburger menu with slide-in drawer

---

## Admin Interface Components

### Admin Dashboard Layout
- Sidebar navigation (w-64, fixed, forest green background)
- Main content area (ml-64, p-8)
- Top bar with admin name and logout

### Admin Tables
- Striped rows for readability
- Action buttons (Edit/Delete) in final column
- Pagination controls at bottom
- Search bar above table

### Admin Forms
- Two-column layout for restaurant creation
- Image upload with preview
- Rich text editor for descriptions
- Multi-select for cuisine tags
- Location autocomplete input
- Form validation with inline error messages (#E74C3C)

---

## Color Application

**Customer Interface**:
- Primary CTA buttons: bg-[#FF6B35] hover:bg-[#E55A28]
- Secondary buttons: bg-[#2E8B57] hover:bg-[#257047]
- Rating stars/badges: text-[#FFD700]
- Links: text-[#FF6B35]
- Background sections: bg-[#FAFAFA]

**Admin Interface**:
- Sidebar: bg-[#2E8B57]
- Active nav items: bg-[#257047]
- Table headers: bg-[#FAFAFA]
- Success states: text-[#2E8B57]
- Danger actions: bg-[#E74C3C]

---

## Forms & Inputs

**Input Fields**:
- Border: border border-gray-300 rounded-lg
- Padding: px-4 py-3
- Focus: ring-2 ring-[#FF6B35] border-[#FF6B35]
- Error: border-[#E74C3C] with error message below
- Labels: text-sm font-medium text-[#2C3E50] mb-2

**Buttons**:
- Primary: px-6 py-3 rounded-lg with uppercase text
- Secondary: border-2 with transparent background
- Icon buttons: p-2 rounded-full

---

## Images

**Hero Section**: Large, appetizing food photography showcasing diverse cuisines (sushi, pasta, burgers) with shallow depth of field, warm lighting. Position: Full-width background.

**Restaurant Cards**: High-quality restaurant interior/signature dish photos. Aspect ratio 4:3, consistent sizing.

**Detail Pages**: Gallery of 5-7 professional restaurant photos showing ambiance, dishes, and exterior.

**Admin**: Placeholder images for empty states, upload icons for image inputs.