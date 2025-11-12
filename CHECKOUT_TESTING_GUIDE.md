# 🧪 Checkout Page Testing Guide

## Quick Test Steps

### Test 1: Complete Order Flow (Recommended First Test)

**Steps:**
1. Open `product-detail-page/index.html?id=1` in browser
2. Set quantity to 2
3. Click "ADD TO CART"
4. Navigate to `cartpage/cart.html`
5. Verify items appear in cart
6. Enter coupon code: `SAVE20`
7. Click "Apply coupon"
8. Verify discount is applied (20% off)
9. Click "Proceed to Checkout"
10. Fill in all required fields:
    - First name: John
    - Last name: Doe
    - Country: Select any
    - Street address: 123 Main St
    - Town/City: New York
    - District: Manhattan
    - Postcode: 10001
    - Phone: +1-555-0123
    - Email: john.doe@example.com
11. Select payment method (e.g., PayPal)
12. Click "Place order"

**Expected Results:**
✅ Order summary shows:
  - Pancake Stack × 2
  - Correct subtotal
  - 20% discount (-$X.XX in green)
  - Coupon info: "SAVE20: 20% off"
  - Shipping: $6.00
  - Correct final total
✅ Success notification appears with Order ID
✅ After 2 seconds: Cart is cleared
✅ Redirect notification appears
✅ After 2 more seconds: Redirected to homepage

---

### Test 2: Empty Cart Redirect

**Steps:**
1. Open browser console
2. Clear localStorage: `localStorage.clear()`
3. Navigate directly to `checkout-page/checkout.html`

**Expected Results:**
✅ Blue notification: "Your cart is empty. Redirecting..."
✅ After 2 seconds: Auto-redirect to cart page
✅ Cannot place order with empty cart

---

### Test 3: Multiple Items with Different Quantities

**Steps:**
1. Add Pancake Stack × 2 ($5.99 each)
2. Add Grilled Chicken × 3 ($9.99 each)
3. Add Caesar Salad × 1 ($8.50 each)
4. Go to checkout

**Expected Results:**
✅ Order summary shows all 3 items with correct quantities
✅ Subtotal = (5.99×2) + (9.99×3) + (8.50×1) = $50.45
✅ No discount (no coupon applied)
✅ Shipping: $6.00
✅ Total: $56.45

---

### Test 4: Free Shipping Coupon

**Steps:**
1. Add any items to cart (e.g., Pasta × 2 = $21.98)
2. Apply coupon: `FREESHIP`
3. Go to checkout

**Expected Results:**
✅ Subtotal: $21.98
✅ No discount row (FREESHIP doesn't reduce subtotal)
✅ Coupon info row appears: "FREESHIP: Free shipping"
✅ Shipping shows strikethrough on $6.00
✅ "FREE" in green appears next to shipping
✅ Total: $21.98 (shipping not added)

---

### Test 5: Form Validation - Missing Fields

**Steps:**
1. Have items in cart
2. Go to checkout
3. Leave First Name empty
4. Leave Email empty
5. Don't select payment method
6. Click "Place order"

**Expected Results:**
✅ Form does not submit
✅ Empty required fields get red border
✅ Notification appears: "Please select a payment method"
✅ Page stays on checkout

---

### Test 6: Form Validation - Invalid Email

**Steps:**
1. Fill all fields
2. Enter email: `notanemail`
3. Select payment method
4. Click "Place order"

**Expected Results:**
✅ Red notification: "Please enter a valid email address"
✅ Email field gets red border
✅ Form does not submit

---

### Test 7: Form Validation - Invalid Phone

**Steps:**
1. Fill all fields
2. Enter phone: `123` (too short)
3. Select payment method
4. Click "Place order"

**Expected Results:**
✅ Red notification: "Please enter a valid phone number"
✅ Phone field gets red border
✅ Form does not submit

---

### Test 8: Fixed Discount Coupon

**Steps:**
1. Add items totaling $25.00
2. Apply coupon: `FLAT5` ($5 off)
3. Go to checkout

**Expected Results:**
✅ Subtotal: $25.00
✅ Discount row: -$5.00 (green)
✅ Coupon info: "FLAT5: $5 off"
✅ Shipping: $6.00
✅ Total: $26.00

---

### Test 9: Cart Update Reflects in Checkout

**Steps:**
1. Add 3 items to cart
2. Go to checkout (note the total)
3. Go back to cart
4. Remove 1 item
5. Update quantity of another item
6. Return to checkout

**Expected Results:**
✅ Order summary updates automatically
✅ Shows current cart items only
✅ Totals recalculated correctly
✅ No stale data

---

### Test 10: Coupon Applied Then Removed

**Steps:**
1. Add items to cart
2. Apply coupon `SAVE20`
3. Go to checkout (verify discount shows)
4. Go back to cart
5. Click "Remove" on coupon
6. Return to checkout

**Expected Results:**
✅ No discount row in checkout
✅ No coupon info row
✅ Total increases (no discount applied)
✅ Shipping still $6.00
✅ Clean order summary

---

## Browser Console Tests

### Check Cart Data
```javascript
// View current cart items
JSON.parse(localStorage.getItem('restaurant_cart_items'))

// View applied coupon
JSON.parse(localStorage.getItem('restaurant_applied_coupon'))
```

### Manually Add Test Data
```javascript
// Add test cart items
localStorage.setItem('restaurant_cart_items', JSON.stringify([
  {
    id: 1,
    title: "Test Burger",
    price: 12.99,
    image: "../assets/images/menu/burger.png",
    quantity: 2
  },
  {
    id: 2,
    title: "Test Fries",
    price: 4.99,
    image: "../assets/images/menu/fries.png",
    quantity: 3
  }
]))

// Add test coupon
localStorage.setItem('restaurant_applied_coupon', JSON.stringify({
  code: "SAVE20",
  discount: 20,
  type: "percentage",
  description: "20% off"
}))

// Refresh page
location.reload()
```

### Clear All Data
```javascript
// Clear everything
localStorage.clear()
location.reload()
```

---

## Expected Console Logs

When checkout loads successfully:
```
Checkout initialized with X item(s)
```

When order is placed:
```
Order placed: {
  firstName: "John",
  lastName: "Doe",
  ...
  items: [...],
  subtotal: XX.XX,
  discount: XX.XX,
  total: XX.XX,
  orderDate: "2025-11-12T..."
}
```

---

## Common Issues & Solutions

### Issue: "Cart items not showing"
**Solution:** 
- Check browser console for errors
- Verify localStorage has data: `localStorage.getItem('restaurant_cart_items')`
- Make sure script is loaded: Check Network tab

### Issue: "Discount not calculating"
**Solution:**
- Verify coupon is in localStorage: `localStorage.getItem('restaurant_applied_coupon')`
- Check coupon format matches expected structure
- Refresh page

### Issue: "Form submits but nothing happens"
**Solution:**
- This is expected in demo mode
- Check console for "Order placed:" log
- In production, this would send to API

### Issue: "Page redirects too fast"
**Solution:**
- Timing is intentional for UX
- Adjust setTimeout values in checkout-enhanced.js if needed
- Lines with setTimeout() control delay

---

## Visual Verification Checklist

✅ **Order Summary Table:**
- [ ] Header row: "Food" and "Subtotal"
- [ ] Item rows show: "Title × Quantity" | "$Price"
- [ ] Footer shows: Subtotal, Discount (if any), Coupon info (if any), Shipping, Total
- [ ] Discount appears in green color
- [ ] Free shipping shows strikethrough + "FREE"

✅ **Form Fields:**
- [ ] All required fields marked with *
- [ ] Country dropdown has options
- [ ] Payment method radios work
- [ ] Hint text appears when radio selected

✅ **Notifications:**
- [ ] Slide in from right
- [ ] Auto-dismiss after 3 seconds
- [ ] Can click to dismiss early
- [ ] Colors match type (green=success, red=error, blue=info)

✅ **Validation:**
- [ ] Empty required fields get red border
- [ ] Invalid email/phone trigger error
- [ ] Valid fields clear red border on blur

---

## Performance Checks

**Page Load Time:**
- Should be < 100ms after DOM ready
- Order summary renders instantly
- No flickering or layout shifts

**Form Validation:**
- Instant feedback on blur
- Submit validation < 50ms
- No lag on button click

**Order Placement:**
- Success notification appears immediately
- Smooth transition to redirect
- No freezing or hanging

---

## Accessibility Tests

**Keyboard Navigation:**
1. Tab through all form fields
2. Tab to payment radio buttons
3. Tab to "Place order" button
4. Press Enter on button

✅ All should work without mouse

**Screen Reader:**
- Form labels properly associated
- Table headers use `<th>` tags
- Required fields announced
- Error messages announced

---

## Mobile Testing

**Responsive Layout:**
1. Resize browser to mobile width (< 768px)
2. Check:
   - [ ] Form fields stack vertically
   - [ ] Order summary below form
   - [ ] Buttons are full-width
   - [ ] Text is readable
   - [ ] No horizontal scroll

**Touch Targets:**
- [ ] Buttons are large enough
- [ ] Radio buttons easy to tap
- [ ] Input fields don't overlap

---

## Cross-Browser Testing

Test on:
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

**All should:**
- Load order summary correctly
- Validate form properly
- Show notifications
- Handle order placement

---

## Final Verification

Before marking complete:
1. [ ] Empty cart redirects to cart page
2. [ ] Single item displays correctly
3. [ ] Multiple items all appear
4. [ ] Percentage coupon calculates correctly
5. [ ] Fixed coupon applies properly
6. [ ] Free shipping coupon works
7. [ ] Form validation catches all errors
8. [ ] Valid form submits successfully
9. [ ] Cart clears after order
10. [ ] Redirects to homepage after order
11. [ ] Console shows order data
12. [ ] No JavaScript errors in console
13. [ ] No CSS layout issues
14. [ ] Mobile layout works
15. [ ] All browsers supported

---

## Success Criteria

✅ **Functionality:**
- Dynamic cart loading
- Coupon integration
- Form validation
- Order placement
- Cart clearing
- Redirects

✅ **User Experience:**
- Clear notifications
- Smooth animations
- Helpful error messages
- Logical flow

✅ **Code Quality:**
- No console errors
- Clean localStorage usage
- Proper error handling
- Well-documented

✅ **Integration:**
- Works with cart page
- Works with product pages
- Maintains data consistency
- Handles all edge cases

---

**Ready to Test?**

Start with Test 1 (Complete Order Flow) for the best demonstration of all features working together!
