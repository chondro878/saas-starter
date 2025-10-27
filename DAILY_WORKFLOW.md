# Daily Fulfillment Workflow - Quick Reference

## 🌅 Morning Routine (5-10 minutes)

### 1. Open Dashboard
```
https://your-app.vercel.app/dashboard/fulfillment
```
or locally: `http://localhost:3000/dashboard/fulfillment`

### 2. Review Orders
Check the summary at top:
- **Total Pending** - How many orders today
- **Subscription** - Regular subscription cards
- **Bulk Packs** - From bulk purchases
- **Individual** - Extra paid cards

### 3. Print Everything
```
┌─────────────────────────────────────┐
│  Click: 🖨️ Print All Labels         │
│  → Prints to Brother laser printer  │
│  → 2 labels per order (30/sheet)    │
│  → Avery 5160 format                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  Click: 🖨️ Print All Cards          │
│  → Prints 3x5 reminder cards        │
│  → 2 per page                       │
│  → Cut on dotted lines              │
└─────────────────────────────────────┘
```

### 4. Stuff Envelopes
For each order:
1. ✉️ Get greeting card
2. 📝 Insert printed reminder card inside
3. 🏷️ Apply recipient label (front of envelope)
4. 🏷️ Apply return label (back of envelope)
5. 💌 Add stamp
6. ✅ Click "Mark as Sent" in dashboard

### 5. Mail
📮 Take to post office

---

## 📋 Order Details

Each order card shows:
```
┌────────────────────────────────────────────┐
│ Emma Johnson    [Birthday] [Subscription]  │
│                                            │
│ 📅 November 11, 2025                       │
│ 📍 123 Main St, Apt 4B                     │
│    Austin, TX 78701                        │
│ 📝 Notes: Loves flowers                    │
│                                            │
│ Return: John Smith                         │
│         456 Oak Ave, Dallas, TX 75201      │
│                                            │
│ [🖨️ Labels] [🖨️ Card] [✅ Mark Sent]     │
└────────────────────────────────────────────┘
```

---

## 🎯 Card Types at a Glance

| Type | Badge Color | What It Means |
|------|------------|---------------|
| 🟢 **Subscription** | Green | Included in their plan |
| 🟣 **Bulk Pack** | Purple | From $39 holiday pack |
| 🟠 **Individual** | Orange | $9 extra card |

---

## ⏰ Timeline

### What Happens When

```
Day 0:  Customer adds recipient + birthday (May 15)
        ↓
Day X:  Cron runs at 2 AM (April 30)
        ↓ Creates order for May 15 (15 days away)
        ↓
Day X:  You wake up → See order in dashboard
        ↓ Print labels + cards
        ↓ Stuff envelope
        ↓ Mail today (April 30)
        ↓
~7 days: Card arrives (around May 7-10)
        ↓
May 15: 🎉 Birthday!
```

**Key**: Cards are printed **15 days before** the occasion to allow for shipping time.

---

## 🖨️ Printer Setup

### Brother Laser Printer Settings
- **Paper**: Letter (8.5" x 11")
- **Labels**: Avery 5160 sheets
- **Cards**: Plain white cardstock (recommended)

### If Print Dialog Doesn't Open
1. Check browser pop-up blocker
2. Allow pop-ups from your site
3. Try single order first

---

## ✅ Status Flow

```
PENDING (⏳)
   ↓ You click "Print All"
PRINTED (🖨️)
   ↓ You click "Mark as Sent"
MAILED (✅)
   ↓
Done! ✨
```

### Printed But Not Mailed?
Yellow warning box shows orders you printed but haven't marked as sent yet.

---

## 🚨 Quick Troubleshooting

### No Orders Today?
✅ That's good! It means:
- No occasions 15 days from now
- All upcoming orders already created
- Enjoy the day off! 🎉

### Too Many Orders?
- Check if users are near subscription limits
- Consider suggesting plan upgrades
- Bulk orders don't count toward limits

### Address Issues?
- Each order shows return address to use
- Labels print automatically
- All addresses are snapshots (won't change if user updates)

---

## 📊 Quick Stats

Check these numbers:
- **Pending** = Need to print today
- **Printed** = Printed but not mailed (finish these first!)
- **Subscription/Bulk/Individual** = Where orders came from

---

## 🔐 Admin Access Only

Only you (role='owner') see the fulfillment dashboard.

Regular users see:
- `/dashboard/orders` - Their order history
- Order status updates
- Card usage stats

---

## 📞 If Something Goes Wrong

1. **Check Vercel Logs** for cron errors
2. **Test Cron Manually**: 
   ```bash
   curl https://your-app/api/cron/create-orders \
     -H "Authorization: Bearer CRON_SECRET"
   ```
3. **Check Database**: Make sure orders table exists
4. **User Issues**: Verify they have default address set

---

## 💡 Pro Tips

1. **Print Early**: Do it first thing so you don't forget
2. **Batch Process**: Stuff all envelopes at once
3. **Check Printed Orders**: Yellow box reminds you of unfinished work
4. **Test Printer**: Keep extra Avery labels in stock
5. **Track Limits**: Watch subscription card counts

---

## 📅 What Gets Created?

Every night at 2 AM, the system checks:
- All occasions 15 days from today
- Users with active subscriptions
- Under their card limit
- Has default return address

Creates orders automatically! ✨

---

**Need more details?** See `FULFILLMENT_SETUP.md`

