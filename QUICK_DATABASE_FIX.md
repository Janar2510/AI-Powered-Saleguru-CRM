# ⚡ Quick Database Fix for Status Column Error

## 🚨 Error: `column "status" does not exist`

### ✅ Simple Solution

1. **Open Supabase Studio**:
   - Go to your Supabase project
   - Click "SQL Editor" in the sidebar

2. **Run this script**:
   - Copy and paste the contents of `fix-deals-status-column.sql`
   - Click "Run"

3. **Expected output**:
   ```
   ✅ Added status column
   ✅ Added stage column  
   ✅ Added other missing columns
   ✅ Inserted 5 sample deals
   🎉 Deals table is now ready with status column!
   ```

4. **Refresh your browser** and test drag & drop

### 🎯 What This Fixes

- ✅ **Adds missing `status` column** to deals table
- ✅ **Adds all other required columns** (stage, description, priority, etc.)
- ✅ **Creates sample data** for testing drag & drop
- ✅ **Sets up proper indexes** for performance
- ✅ **Enables RLS policies** for security

### 🧪 After the Fix

The drag & drop should work perfectly:

1. **Data Loading**: No more 400 errors
2. **Drag & Drop**: Cards move between stages  
3. **Console Logs**: See successful move messages

### 🔄 Backup Plan

If you can't access Supabase Studio, the app will automatically:
- Use sample data when database fails
- Show drag & drop functionality with sample deals
- Continue working while you fix the database

---

**This should resolve the status column error immediately!** 🚀
