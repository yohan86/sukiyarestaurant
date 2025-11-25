# API Routes

This directory contains Next.js API routes for the Sukiya Restaurant admin dashboard.

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
DATABASE_URL=mongodb://localhost:27017/sukiyarestaurant
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

Optional:
- `NEXT_PUBLIC_API_URL` - If set, the frontend will use this URL instead of `/api` (e.g., `http://localhost:5001/api` to use external backend)

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/verify` - Verify JWT token
- `POST /api/auth/set-password` - Set password for admin user

### Menu
- `GET /api/menu` - Get all menu items (returns only active items for public, all items for admin)
- `POST /api/menu` - Create a new menu item
- `PATCH /api/menu/:id` - Update a menu item
- `DELETE /api/menu/:id` - Delete a menu item

### Orders
- `GET /api/orders` - Get all orders
- `PATCH /api/orders/:id/status` - Update order status

### Users
- `GET /api/users` - Get all users
- `POST /api/users` - Create a new user
- `PATCH /api/users/:id` - Update a user
- `DELETE /api/users/:id` - Delete a user
- `GET /api/users/userId/:userId` - Get user by userId

## Database

The API uses MongoDB with the following collections:
- `menu_items` - Menu items
- `orders` - Orders
- `order_items` - Order items (related to orders)
- `users` - Users

## Authentication

Most endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

The token is obtained by logging in via `/api/auth/login`.

