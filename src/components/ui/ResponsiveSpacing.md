# Responsive Spacing System Documentation

This document outlines the spacing system used throughout the SaleToru CRM application.

## Spacing Scale

Our spacing system uses a consistent scale based on rem units (relative to the root font size). This provides better accessibility and responsive behavior across different screen sizes and user preferences.

| Variable | Value | Pixels (16px base) | Usage |
|----------|-------|-------------------|-------|
| --space-0 | 0 | 0px | No spacing |
| --space-1 | 0.25rem | 4px | Tiny spacing (icons, badges) |
| --space-2 | 0.5rem | 8px | Small spacing (between related items) |
| --space-3 | 0.75rem | 12px | Compact spacing (form elements) |
| --space-4 | 1rem | 16px | Base spacing (standard padding) |
| --space-5 | 1.25rem | 20px | Medium spacing |
| --space-6 | 1.5rem | 24px | Card padding |
| --space-8 | 2rem | 32px | Section spacing |
| --space-10 | 2.5rem | 40px | Large spacing |
| --space-12 | 3rem | 48px | Extra large spacing |
| --space-16 | 4rem | 64px | Page spacing |
| --space-20 | 5rem | 80px | Major section spacing |
| --space-24 | 6rem | 96px | Maximum spacing |

## Component Spacing

| Component | Variable | Default Value | Description |
|-----------|----------|---------------|-------------|
| Card Padding | --card-padding | var(--space-6) | Internal padding for cards |
| Card Gap | --card-gap | var(--space-6) | Gap between cards in a grid |
| Section Spacing | --section-spacing | var(--space-8) | Vertical space between page sections |
| Page Padding X | --page-padding-x | var(--space-6) | Horizontal page padding |
| Page Padding Y | --page-padding-y | var(--space-10) | Vertical page padding |
| Touch Target | --touch-target-min | 2.75rem (44px) | Minimum size for touch targets |
| Button Padding X | --button-padding-x | var(--space-4) | Horizontal button padding |
| Button Padding Y | --button-padding-y | var(--space-3) | Vertical button padding |
| Icon Gap | --icon-gap | var(--space-2) | Space between icon and text |
| Icon Margin | --icon-margin | var(--space-3) | Margin around standalone icons |
| Form Field Gap | --form-field-gap | var(--space-4) | Space between form fields |
| Form Section Gap | --form-section-gap | var(--space-6) | Space between form sections |
| Input Padding X | --input-padding-x | var(--space-4) | Horizontal input padding |
| Input Padding Y | --input-padding-y | var(--space-3) | Vertical input padding |

## Responsive Breakpoints

The spacing system adjusts at different breakpoints to optimize the layout for different screen sizes:

| Breakpoint | --page-padding-x | --card-gap |
|------------|------------------|------------|
| Default | var(--space-6) | var(--space-6) |
| sm (640px) | var(--space-8) | var(--space-8) |
| lg (1024px) | var(--space-12) | var(--space-10) |
| xl (1280px) | var(--space-16) | var(--space-12) |

## Usage Guidelines

### Consistent Spacing

- Use the spacing scale for all margin, padding, and gap values
- Avoid arbitrary pixel values
- Maintain vertical rhythm with consistent spacing between elements

### Touch Targets

- All interactive elements should be at least 44px (2.75rem) in height and width
- Provide adequate spacing between touch targets (at least 8px)

### Responsive Adjustments

- Use smaller spacing on mobile devices
- Increase spacing proportionally on larger screens
- Maintain proper hierarchy with consistent spacing ratios

### Component-Specific Guidelines

#### Cards
- Use `--card-padding` (24px) for internal padding
- Maintain `--card-gap` (24-48px depending on breakpoint) between cards

#### Buttons
- Standard buttons: 16px horizontal, 12px vertical padding
- Small buttons: 12px horizontal, 8px vertical padding
- Large buttons: 24px horizontal, 16px vertical padding

#### Forms
- 16px spacing between form fields
- 24px spacing between form sections
- 16px horizontal, 12px vertical padding for inputs

#### Navigation
- 12px vertical, 16px horizontal padding for nav items
- 8px spacing between related nav items
- 16px spacing between nav sections

## Accessibility Considerations

- Maintain adequate spacing for touch targets (44px minimum)
- Ensure proper contrast with spacing that helps distinguish elements
- Support high contrast mode with clear borders
- Respect user preferences for reduced motion and text spacing