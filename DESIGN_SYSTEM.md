# 🎨 SaleToru CRM Design System

## 🚀 **Quick Start - Always Use These Components**

**Never create custom UI components again!** Use these pre-built brand components for consistent design:

```tsx
import { 
  BrandBackground,      // 3D Spline background + brand colors
  BrandPageLayout,      // Page header + layout wrapper
  BrandStatsGrid,       // Stats cards grid
  BrandStatCard,        // Individual stat card
  BrandCard,            // Glass-morphism cards
  BrandButton,          // Brand-styled buttons
  BrandInput,           // Brand-styled inputs
  BrandBadge            // Status badges
} from '../contexts/BrandDesignContext';
```

## 🎯 **Page Template - Copy This Structure**

```tsx
export default function YourPage() {
  return (
    <BrandBackground>
      <BrandPageLayout
        title="Your Page Title"
        subtitle="Your page description"
        actions={
          <BrandButton onClick={handleAction}>
            <Icon className="w-4 h-4 mr-2" />
            Action Button
          </BrandButton>
        }
      >
        {/* Your page content here */}
        <BrandCard className="p-6">
          Content goes here
        </BrandCard>
      </BrandPageLayout>
    </BrandBackground>
  );
}
```

## 🌈 **Brand Colors (Automatic)**

All components automatically use your brand colors:
- **Primary**: `#a259ff` (Purple)
- **Secondary**: `#377dff` (Blue)
- **Background**: Dark gradient with 3D Spline
- **Text**: White with proper contrast
- **Accents**: Glass-morphism effects

## 📱 **Component Library**

### **1. BrandBackground**
- **What it does**: Provides 3D Spline background + brand gradient
- **Always use**: Wrap every page with this
- **Example**: `<BrandBackground><YourPage /></BrandBackground>`

### **2. BrandPageLayout**
- **What it does**: Creates consistent page headers with title, subtitle, and action buttons
- **Props**: `title`, `subtitle`, `actions`
- **Example**: 
```tsx
<BrandPageLayout
  title="Leads Management"
  subtitle="Track potential customers"
  actions={<BrandButton>Add New</BrandButton>}
>
```

### **3. BrandStatsGrid + BrandStatCard**
- **What it does**: Creates beautiful stats cards in a responsive grid
- **Example**:
```tsx
<BrandStatsGrid>
  <BrandStatCard
    icon={<UserIcon className="w-6 h-6 text-white" />}
    title="Total Users"
    value={1234}
    trend="+12% this month"
  />
</BrandStatsGrid>
```

### **4. BrandCard**
- **What it does**: Glass-morphism cards with backdrop blur
- **Variants**: `default`, `glass`, `gradient`
- **Example**: `<BrandCard className="p-6">Content</BrandCard>`

### **5. BrandButton**
- **What it does**: Brand-styled buttons with gradients and hover effects
- **Variants**: `primary`, `secondary`, `outline`, `ghost`
- **Sizes**: `sm`, `md`, `lg`
- **Example**: `<BrandButton variant="primary" size="lg">Click Me</BrandButton>`

### **6. BrandInput**
- **What it does**: Brand-styled form inputs with glass effect
- **Props**: `placeholder`, `value`, `onChange`, `type`, `required`
- **Example**: `<BrandInput placeholder="Enter text..." required />`

### **7. BrandBadge**
- **What it does**: Status badges with color variants
- **Variants**: `default`, `success`, `warning`, `error`, `info`
- **Example**: `<BrandBadge variant="success">Active</BrandBadge>`

## 🔧 **How to Update Brand Design**

### **Change Colors**
Edit `src/contexts/BrandDesignContext.tsx`:
```tsx
export const BRAND_COLORS = {
  primary: '#YOUR_NEW_COLOR',
  // ... other colors
};
```

### **Change 3D Background**
Update the Spline scene URL in `BrandBackground`:
```tsx
<Spline scene="YOUR_NEW_SPLINE_URL" />
```

### **Add New Components**
Add new components to the context file and export them.

## 📋 **Migration Checklist**

When updating existing pages to use brand design:

1. ✅ **Import brand components**
2. ✅ **Wrap with BrandBackground**
3. ✅ **Use BrandPageLayout for header**
4. ✅ **Replace Card with BrandCard**
5. ✅ **Replace Button with BrandButton**
6. ✅ **Replace Input with BrandInput**
7. ✅ **Replace Badge with BrandBadge**
8. ✅ **Use BrandStatsGrid for stats**
9. ✅ **Test responsive design**
10. ✅ **Verify brand colors are applied**

## 🚫 **What NOT to Do**

- ❌ Don't create custom UI components
- ❌ Don't use hardcoded colors
- ❌ Don't skip BrandBackground wrapper
- ❌ Don't mix old UI components with brand components
- ❌ Don't override brand styles with custom CSS

## ✅ **What TO Do**

- ✅ Always use BrandBackground for pages
- ✅ Use BrandPageLayout for consistent headers
- ✅ Use BrandCard for content containers
- ✅ Use BrandButton for all buttons
- ✅ Use BrandInput for all form inputs
- ✅ Use BrandBadge for status indicators
- ✅ Let the design system handle colors and spacing

## 🎨 **Design Principles**

1. **Consistency**: Every page looks and feels the same
2. **Brand Identity**: Purple/blue gradient with 3D backgrounds
3. **Glass Morphism**: Modern, translucent UI elements
4. **Accessibility**: Proper contrast and readable text
5. **Responsiveness**: Works on all screen sizes
6. **Performance**: Optimized 3D backgrounds

## 🔄 **For New Chats/Developers**

**Copy this message to any new chat:**

> "Please use the SaleToru CRM Design System. Import and use these components from `src/contexts/BrandDesignContext.tsx`:
> - BrandBackground (wrap every page)
> - BrandPageLayout (page headers)
> - BrandCard (content containers)
> - BrandButton (all buttons)
> - BrandInput (form inputs)
> - BrandBadge (status indicators)
> 
> Never create custom UI components. Always use the brand design system for consistency."

---

**Result**: Every page will automatically have:
- 🎨 Your brand colors
- 🌟 3D Spline background
- ✨ Glass-morphism effects
- 📱 Responsive design
- 🔄 Consistent look and feel

**No more design inconsistencies!** 🎉
