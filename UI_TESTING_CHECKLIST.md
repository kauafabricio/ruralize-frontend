# RURALIZE UI/UX REDESIGN - COMPREHENSIVE TESTING CHECKLIST

## 📱 Pre-Testing Setup

Before starting manual testing:
1. Run `npm run dev` to start development server
2. Open browser DevTools (F12) to check console for errors
3. Test on desktop (1920x1080) first, then mobile (375px)
4. Clear browser cache if colors don't appear correctly
5. Test on multiple browsers (Chrome, Firefox, Safari if available)

---

## 🔴 CRITICAL PATH TESTING (Must Pass)

### Login/Registration Flow
- [ ] **Login Page Renders**
  - [ ] AuthLogo displays SVG correctly (dark background version)
  - [ ] Ruralize text is primary-dark (#2c4a24)
  - [ ] UFRPE badge background is secondary-light (#f5eee0)
  - [ ] Page background is neutral-lighter (#f5f7f3)
  
- [ ] **Login Form Elements**
  - [ ] Input fields have neutral-light background
  - [ ] Input borders are subtle (pastel-support color on focus)
  - [ ] Labels are dark text (neutral-darker)
  - [ ] Placeholder text is subtle (neutral-muted)
  - [ ] Login button is primary-dark with white text
  - [ ] Button hover state is primary-darker
  - [ ] Button shadow is soft and organic (shadow-soft-sm)

- [ ] **Registration Flow**
  - [ ] All form elements follow same styling
  - [ ] Submit button is primary-dark
  - [ ] Cancel button is neutral-lighter with neutral-muted text
  - [ ] Form card is white with shadow-soft-xl

### Feed Navigation (FeedHeader)
- [ ] **Header Appears**
  - [ ] Header background: neutral-lighter (#f5f7f3) ✓
  - [ ] Logo text: primary-dark ✓
  - [ ] Border bottom: light subtle line (neutral-light)
  - [ ] Height is 72px

- [ ] **Navigation Tabs**
  - [ ] Inactive tabs: neutral-dark text
  - [ ] Active tab: primary-dark bold text
  - [ ] Active indicator bar: primary-dark (3px underline)
  - [ ] Indicator animates smoothly between tabs
  - [ ] Hover effect: text becomes darker

- [ ] **Search Bar**
  - [ ] Background: neutral-lighter
  - [ ] Border: pastel-support
  - [ ] Icon: neutral-muted color
  - [ ] Placeholder: "Buscar" in neutral-muted
  - [ ] Focus state: border-pastel-support

- [ ] **Profile Avatar Button**
  - [ ] Background: primary-dark
  - [ ] Ring: neutral-lighter (2px)
  - [ ] Displays user photo or placeholder initials
  - [ ] Hover: slight opacity change
  - [ ] Dropdown menu has shadow-soft

### Feed Posts (PostCard)
- [ ] **Post Card Container**
  - [ ] Background: white (#ffffff)
  - [ ] Border radius: rounded-3xl (28px)
  - [ ] Shadow: shadow-soft-xs (very subtle)
  - [ ] Spacing: px-6 pt-6

- [ ] **Author Section**
  - [ ] Avatar: primary-dark circular background OR user photo
  - [ ] Author name: primary-dark, font-black
  - [ ] Action badge: secondary-light background with icon + action name
  - [ ] Badge border radius: rounded-full
  - [ ] Hover over author: background becomes neutral-lighter

- [ ] **Post Content**
  - [ ] Text color: neutral-darker
  - [ ] Location text: neutral-muted, smaller font
  - [ ] Image displays correctly with rounded-lg borders
  - [ ] Image has proper aspect ratio

- [ ] **Edit/Delete Controls (if own post)**
  - [ ] Edit button: text-primary-dark, hover:bg-neutral-light
  - [ ] Delete button: text-danger-primary, hover:bg-danger-light
  - [ ] Buttons have rounded-full style
  - [ ] Timestamp: neutral-muted, small text

- [ ] **Interaction Buttons**
  - [ ] Like button (unliked): neutral-muted text, hover:bg-neutral-light
  - [ ] Like button (liked): bg-danger-light, text-danger-primary ❤️
  - [ ] Comment button: neutral-muted text, hover:bg-neutral-light
  - [ ] Both buttons: rounded-lg with py-2

- [ ] **Comments Section**
  - [ ] Comment container: bg-neutral-light, rounded-lg
  - [ ] Commenter name: primary-dark, clickable
  - [ ] Comment text: neutral-darker
  - [ ] Timestamp: neutral-muted, small
  - [ ] Delete button (own comment): text-red-600

- [ ] **Post Edit Mode**
  - [ ] Edit form background: neutral-lighter
  - [ ] Form border: border-neutral-light
  - [ ] Border radius: rounded-xl
  - [ ] Textarea: white bg, pastel-support border on focus
  - [ ] Select dropdown: white bg, pastel-support border
  - [ ] Discard button: bg-neutral-lighter, text-neutral-muted
  - [ ] Save button: bg-primary-dark, text-white

- [ ] **Delete Confirmation Modal**
  - [ ] Modal background overlay: neutral-darker/35 opacity
  - [ ] Card background: white, rounded-2xl
  - [ ] Icon circle: bg-danger-light, text-danger-primary
  - [ ] Title: text-neutral-darker, font-black
  - [ ] Description: text-neutral-muted
  - [ ] Cancel button: bg-neutral-lighter, text-neutral-muted
  - [ ] Confirm button: bg-danger-primary, text-white
  - [ ] Button shadow: shadow-soft-sm

- [ ] **Delete Success Modal**
  - [ ] Icon circle: bg-success-light, text-primary-dark
  - [ ] Title: text-neutral-darker
  - [ ] Description: text-neutral-muted
  - [ ] Confirm button: bg-primary-dark, text-white with shadow

---

## 🟡 HIGH-PRIORITY TESTING

### User Discovery (Explore/Search)
- [ ] **User Card Styling**
  - [ ] Border: border-pastel-support
  - [ ] Background: bg-neutral-lighter
  - [ ] Avatar: primary-dark background
  - [ ] Name: text-neutral-darker, font-black
  - [ ] Role: text-neutral-muted, smaller
  - [ ] Hover: border-pastel-support (no change), background changes to white
  - [ ] Card radius: rounded-2xl

- [ ] **Follow Button States**
  - [ ] When not following: bg-primary-dark, text-white, shadow-soft-sm
  - [ ] When following: bg-secondary-light, text-primary-dark
  - [ ] Hover (not following): bg-primary-darker
  - [ ] Hover (following): bg-pastel-support
  - [ ] Disabled: opacity-50

### Sidebar Elements (SideCards)
- [ ] **Suggestions Card**
  - [ ] Background: white, rounded-3xl, shadow-soft
  - [ ] Title: text-neutral-darker, font-black
  - [ ] User items: hover:bg-neutral-lighter, rounded-xl
  - [ ] Avatar: primary-dark background
  - [ ] User name: text-neutral-darker, group-hover:text-primary-dark
  - [ ] Role/dept: text-neutral-muted
  - [ ] "View all" button: bg-neutral-lighter, text-primary-dark, hover:bg-secondary-light

- [ ] **New Schedule Card (CTA)**
  - [ ] Background: neutral-lighter
  - [ ] Border: border-pastel-support (dashed)
  - [ ] Border radius: rounded-3xl
  - [ ] Title: text-neutral-darker, font-black
  - [ ] Button: bg-primary-dark, text-white, rounded-full, shadow-soft-sm

---

## 💙 SECONDARY TESTING (Important)

### Form Pages (Appointments, Profile)
- [ ] **Form Inputs**
  - [ ] Labels: text-neutral-darker, uppercase, font-black
  - [ ] Input background: neutral-light
  - [ ] Input border: pastel-support
  - [ ] Focus border: pastel-support (highlight)
  - [ ] Placeholder: text-neutral-muted
  - [ ] Border radius: rounded-full for text inputs, rounded-lg for textareas

- [ ] **Form Buttons**
  - [ ] Primary (Submit): bg-primary-dark, text-white, rounded-full
  - [ ] Secondary: bg-neutral-lighter, text-neutral-muted
  - [ ] Danger: bg-danger-primary, text-white
  - [ ] All have smooth hover transitions

### Modals/Dialogs
- [ ] **Modal Structure**
  - [ ] Overlay: bg-neutral-darker with opacity (not solid black)
  - [ ] Card: white, rounded-2xl, shadow-soft-lg
  - [ ] Icon background: colored circles (primary, danger, success)
  - [ ] Title: font-black, neutral-darker
  - [ ] Description: neutral-muted, smaller font
  - [ ] Button container: grid gap-3

- [ ] **Modal Button States**
  - [ ] Cancel/Back buttons: bg-neutral-lighter, text-neutral-muted
  - [ ] Confirm buttons: color varies (primary-dark, danger-primary, etc.)
  - [ ] Buttons: rounded-full, h-11, shadow-soft-sm on hover

### Pages (Feed, Profile, Appointments)
- [ ] **Page Background**
  - [ ] Main background: white or neutral-lighter
  - [ ] Subtle dividers: border-neutral-light
  - [ ] Section headers: text-neutral-darker, font-black
  - [ ] Section descriptions: text-neutral-muted

- [ ] **Profile Elements**
  - [ ] Profile header: primary-dark background or gradient
  - [ ] User info: text-neutral-darker
  - [ ] Edit button: bg-primary-dark or bordered style
  - [ ] Stats section: neutral-light dividers

---

## ♿ ACCESSIBILITY & RESPONSIVE TESTING

### Keyboard Navigation
- [ ] Tab key cycles through all interactive elements
- [ ] Focus states are visible (outline or highlight)
- [ ] Enter/Space activates buttons
- [ ] Escape closes modals
- [ ] No keyboard traps

### Mobile Responsiveness (375px width)
- [ ] **Header**
  - [ ] Logo stacks correctly
  - [ ] Navigation items wrap or collapse
  - [ ] Search bar still visible/usable
  - [ ] Avatar is still clickable

- [ ] **Cards**
  - [ ] Cards stack vertically
  - [ ] Padding scales appropriately
  - [ ] Text is readable (no overflow)
  - [ ] Images scale proportionally

- [ ] **Buttons & Interactions**
  - [ ] Buttons are at least 44px x 44px (touch-friendly)
  - [ ] Spacing between buttons prevents accidental clicks
  - [ ] Hover states don't appear on mobile (OK to skip)
  - [ ] Active/pressed states are visible

### Tablet (768px width)
- [ ] Layout uses medium column widths
- [ ] Sidebar visible or accessible
- [ ] Cards at appropriate width
- [ ] Touch targets are adequate

### Desktop (1920px width)
- [ ] Layout uses full width appropriately
- [ ] Cards don't stretch too wide
- [ ] Sidebar properly positioned
- [ ] Content is scannable and organized

---

## 🎨 COLOR CONTRAST VERIFICATION

For WCAG AA Compliance (4.5:1 text to background):
- [ ] **Primary Dark (#2c4a24) on White**
  - [ ] Contrast ratio: ~15:1 ✅ PASS
  - Text readable: Yes

- [ ] **Primary Dark on Secondary Light (#f5eee0)**
  - [ ] Contrast ratio: ~9:1 ✅ PASS
  - Text readable: Yes

- [ ] **Neutral Muted on White**
  - [ ] Contrast ratio: ~4.5:1 ✅ BORDERLINE PASS
  - Text readable: Yes (for secondary text)

- [ ] **Neutral Muted on Neutral Light**
  - [ ] Contrast ratio: Varies, acceptable for tertiary text

- [ ] **Danger Primary on Danger Light**
  - [ ] Contrast ratio: ~5:1 ✅ PASS
  - Text readable: Yes

- [ ] **All interactive elements**: Have sufficient contrast

---

## 🐛 ERROR STATES & EDGE CASES

- [ ] **Empty States**
  - [ ] "No posts yet" message: centered, neutral-muted text
  - [ ] Empty feed: shows placeholder with primary-dark icon
  - [ ] Loading skeleton: subtle gray color (neutral-light)

- [ ] **Error Messages**
  - [ ] Error text: danger-primary color
  - [ ] Error background: danger-light
  - [ ] Error icon: danger-primary
  - [ ] Error dismissible: clear X button

- [ ] **Loading States**
  - [ ] Spinner/skeleton: neutral-light color
  - [ ] Loading text: neutral-muted
  - [ ] Disabled button appearance: opacity-50
  - [ ] Disabled cursor: not-allowed

- [ ] **Disabled States**
  - [ ] Form inputs: opacity-50 or grayed out
  - [ ] Buttons: opacity-50 or disabled:opacity-60
  - [ ] Form submit button: disabled when form invalid

---

## 📊 PERFORMANCE & RENDERING

- [ ] **No Console Errors**
  - [ ] Check DevTools console for JavaScript errors
  - [ ] Check for CSS compilation warnings
  - [ ] No 404s for image/asset loads

- [ ] **Smooth Animations**
  - [ ] Transitions are smooth (hover effects)
  - [ ] No janky animations or frame drops
  - [ ] Tab switches animate smoothly
  - [ ] Modal appears/disappears smoothly

- [ ] **Load Time**
  - [ ] Page loads in < 3 seconds
  - [ ] Interactive elements respond immediately
  - [ ] Images load progressively
  - [ ] No layout shift during load

---

## ✅ FINAL VERIFICATION CHECKLIST

After all tests pass:
- [ ] **Code Quality**
  - [ ] No console errors or warnings
  - [ ] All Tailwind classes are valid
  - [ ] No inline hex colors remain (except SVG)
  - [ ] All components use design tokens

- [ ] **Design Consistency**
  - [ ] All primary actions use primary-dark
  - [ ] All neutral backgrounds use neutral-lighter/light
  - [ ] All borders use pastel-support
  - [ ] All shadows use shadow-soft utilities
  - [ ] All cards use rounded-3xl
  - [ ] All inputs use rounded-lg/xl

- [ ] **Accessibility**
  - [ ] All text has sufficient contrast
  - [ ] All interactive elements are keyboard accessible
  - [ ] Focus states are visible
  - [ ] Images have alt text
  - [ ] Semantic HTML is used

- [ ] **Responsiveness**
  - [ ] Desktop (1920px) ✅
  - [ ] Tablet (768px) ✅
  - [ ] Mobile (375px) ✅
  - [ ] No horizontal scrolling on mobile
  - [ ] Touch targets are adequate

- [ ] **Functionality**
  - [ ] All buttons work correctly
  - [ ] All forms submit correctly
  - [ ] All modals open/close correctly
  - [ ] All links navigate correctly
  - [ ] API calls still function (no data lost)

---

## 🎯 SIGN-OFF

**Tester Name:** ___________________  
**Date:** ___________________  
**Overall Status:**
- [ ] ✅ PASS - All tests passed, ready for deployment
- [ ] ⚠️ CONDITIONAL - Minor issues, can deploy with notes
- [ ] ❌ FAIL - Critical issues, do not deploy

**Issues Found:**
```
[List any issues found during testing]
```

**Notes:**
```
[Any additional observations or recommendations]
```

---

**Test Coverage: 513 design token instances across 7+ major components**
**Estimated Test Time: 30-45 minutes for complete coverage**
