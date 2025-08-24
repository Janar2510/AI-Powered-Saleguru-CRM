# 🎨 SaleToru CRM Brand Design Guide

## 🚀 **Always Use These Components**

```tsx
import { 
  BrandBackground,      // 3D Spline background
  BrandPageLayout,      // Page header + layout
  BrandStatsGrid,       // Stats cards grid
  BrandStatCard,        // Individual stat card
  BrandCard,            // Glass-morphism cards
  BrandButton,          // Brand-styled buttons
  BrandInput,           // Brand-styled inputs
  BrandBadge            // Status badges
} from '../contexts/BrandDesignContext';
```

## 📱 **Page Template - Copy This**

```tsx
export default function YourPage() {
  return (
    <BrandBackground>
      <BrandPageLayout
        title="Your Page Title"
        subtitle="Your page description"
        actions={<BrandButton>Action Button</BrandButton>}
      >
        <BrandCard className="p-6">
          Your content here
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
}
```

## 🎯 **Key Rules**

1. **Always wrap pages with BrandBackground**
2. **Use BrandPageLayout for headers**
3. **Use BrandCard for content containers**
4. **Use BrandButton for all buttons**
5. **Use BrandInput for form inputs**
6. **Use BrandBadge for status indicators**

## 🚫 **Never Do This**

- ❌ Don't create custom UI components
- ❌ Don't use hardcoded colors
- ❌ Don't skip BrandBackground wrapper

## ✅ **Result**

Every page automatically gets:
- 🎨 Your brand colors (#a259ff purple, #377dff blue)
- 🌟 3D Spline background
- ✨ Glass-morphism effects
- 📱 Responsive design
- 🔄 Consistent look and feel

**Copy this guide to any new chat to maintain design consistency!** 🎉
