# Security Specification - Bazar YES Paraná

## 1. Data Invariants
- **Products**: Only admins can create/update/delete. Public can read.
- **Categories**: Only admins can manage. Public can read.
- **Orders**: Customers can create. Only the customer (by email/ID) or admins can read. No one can update once confirmed (except admins). No one can delete orders (history preservation).
- **Testimonials**: Customers can create. Public can read. Only admins can delete/update.
- **Settings**: Only admins can manage. Public can read.
- **Admins**: Root collection to store admin UIDs. Only existing admins can add other admins.

## 2. Dirty Dozen Payloads (Rejection Targets)
1. **Price Poisoning**: Create product with `price: -500`.
2. **Admin Spoofing**: Regular user trying to write to `/admins/my-uid`.
3. **Ghost Field Update**: Updating an order to include `isTest: true` via an undocumented field.
4. **Identity Injection**: Creating an order with `customerEmail: 'admin@bazaryes.com'` while logged in as someone else.
5. **State Shortcut**: Updating an order status from `pending` directly to `delivered` bypassing steps.
6. **Immutable Hijack**: Attempting to change `createdAt` on a product after creation.
7. **Resource Exhaustion**: Inserting a 2MB string into a product description.
8. **Orphan Writing**: Creating an order without any items.
9. **Negative Stock**: Updating stock to a negative value.
10. **Testimonial Spam**: User creating 100 testimonials in a loop (Size/Rate limits).
11. **PII Leak**: Non-admin querying all orders in the system without a `customerEmail` filter.
12. **System Bypass**: Manually updating `discountPrice` to a negative value.

## 3. Test Scenarios (Logical)
- All "Dirty Dozen" must return `PERMISSION_DENIED`.
- Public can fetch products and categories without auth.
- Authenticated user can create an order.
- Authenticated user can see ONLY their own orders.
