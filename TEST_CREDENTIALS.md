# Test Credentials for Admin Login

## Admin Users

### Primary Admin Account
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin

### Alternative Admin Account
- **Username:** `admin001`
- **Password:** `admin123`
- **Role:** Admin

## Manager Users

### Primary Manager Account
- **Username:** `manager`
- **Password:** `manager123`
- **Role:** Manager

### Alternative Manager Account
- **Username:** `manager001`
- **Password:** `manager123`
- **Role:** Manager

## Usage

1. Navigate to `http://localhost:3000/admin/login`
2. Enter one of the usernames and passwords above
3. Click "Sign In"

## Notes

- Only users with **Admin** or **Manager** roles can log in
- Customer and Staff roles cannot access the admin panel
- All passwords are hashed using bcrypt in the database

## Setting Up More Users

To set up passwords for additional users, run:
```bash
cd sukiya-api
npm run seed:passwords
```

Or use the API endpoint:
```bash
POST http://localhost:5001/api/auth/set-password
Body: {
  "userId": "your-user-id",
  "password": "your-password"
}
```

