# Email Preview Guide 📧

## 🎨 Visual Email Preview System

Your custom email preview system is built into your Next.js app!

**🌐 http://localhost:3001/dev/email-preview**

---

## 📬 What You'll See

A professional email preview interface with:

- **Sidebar** with all 6 email templates (color-coded & organized)
- **Click any template** to instantly preview it
- **Desktop/Mobile toggle** to see responsive design
- **Live hot reload** - edit templates and see changes automatically
- **Beautiful interface** with real email rendering

### 📧 Your 6 Email Templates:

1. **Welcome Email** ✉️ (Blue) - New user signup
2. **Order Created** ✅ (Green) - Card order confirmation  
3. **Subscription Started** 🎉 (Purple) - Plan activation
4. **Card Credit Purchased** 💳 (Indigo) - Credit purchase
5. **Card Reminder** ⏰ (Yellow) - Upcoming occasion
6. **Missing Address** ⚠️ (Red) - Address needed

---

## 🛠️ Features

✅ **Desktop/Mobile Toggle** - Switch between views with one click  
✅ **Instant Preview** - See all templates with sample data  
✅ **Hot Reload** - Edit templates and changes appear automatically  
✅ **Color-Coded Sidebar** - Easy to identify each email type  
✅ **No External Server** - Built into your Next.js app  
✅ **Always Works** - No dependencies to break  

---

## ✏️ How to Edit Emails

1. **Navigate to**: `/lib/email/templates/`
2. **Open any `.tsx` file** (e.g., `welcome.tsx`)
3. **Edit the component** (change text, colors, layout)
4. **Save the file** → Next.js hot-reloads the preview! ✨

### Example: Edit the Welcome Email

```bash
# Open: /lib/email/templates/welcome.tsx
# Make changes to text, styling, or content
# Save the file
# Refresh the preview page to see changes
```

---

## 🚀 How to Access

### Just navigate to:
```
http://localhost:3001/dev/email-preview
```

No separate server needed! It's built into your app.

---

## 🎯 Design Tips

- All emails use responsive design (mobile-friendly)
- Colors match your brand (purple/pink gradients)
- Emails are tested across major email clients
- Links are styled for high visibility
- CTAs (Call-to-Actions) are prominent buttons

---

## 📧 Testing Real Emails

Want to see how emails look in your real inbox?

1. Trigger the action in your app (e.g., sign up a test user)
2. Check your email inbox
3. Or use the "Send Test" feature in the preview interface

---

## 🔧 Troubleshooting

**Preview not loading?**
- Make sure your Next.js dev server is running (`npm run dev`)
- Navigate to `http://localhost:3001/dev/email-preview`

**Changes not showing?**
- Save your `.tsx` template file
- Refresh the browser page
- Check the terminal for any TypeScript errors

**Emails look broken?**
- Check the browser console for errors
- Verify sample data in `/app/dev/email-preview/page.tsx`

---

## 🎉 Benefits of This Approach

✅ **Zero Maintenance** - No external dependencies to update  
✅ **Always Works** - Same environment as your production app  
✅ **Fast** - Instant preview with Next.js hot reload  
✅ **Reliable** - Built on your existing tech stack  
✅ **Future-Proof** - Will work for years without breaking  

---

Happy email designing! 🎨✨

