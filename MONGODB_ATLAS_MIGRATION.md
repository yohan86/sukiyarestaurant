# MongoDB Atlas Migration Guide

This guide will help you migrate your database from local MongoDB to MongoDB Atlas free cluster.

## Step 1: Create MongoDB Atlas Account and Cluster

1. **Sign up for MongoDB Atlas**
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create a free account (or sign in if you already have one)

2. **Create a Free Cluster**
   - Click "Build a Database"
   - Choose "M0 FREE" (Free Shared Cluster)
   - Select a cloud provider and region (choose closest to you)
   - Name your cluster (e.g., "SukiyaRestaurant")
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" in the left sidebar
   - Click "Add New Database User"
   - Choose "Password" authentication
   - Create a username and strong password (save these!)
   - Set user privileges to "Atlas admin" or "Read and write to any database"
   - Click "Add User"

4. **Configure Network Access**
   - Go to "Network Access" in the left sidebar
   - Click "Add IP Address"
   - For development: Click "Add Current IP Address"
   - For production: Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

## Step 2: Get Your Connection String

1. **Get Connection String**
   - Go to "Database" in the left sidebar
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Select "Node.js" and version "5.5 or later"
   - Copy the connection string (looks like: `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`)

2. **Update Connection String**
   - Replace `<username>` with your database username
   - Replace `<password>` with your database password
   - Add your database name: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sukiyarestaurant?retryWrites=true&w=majority`

## Step 3: Export Data from Local MongoDB (if you have data)

If you have existing data in your local MongoDB, export it first:

```powershell
# Export all collections
mongodump --uri="mongodb://localhost:27017/sukiyarestaurant" --out=./mongodb-backup

# Or export specific collections
mongodump --uri="mongodb://localhost:27017/sukiyarestaurant" --collection=users --out=./mongodb-backup
mongodump --uri="mongodb://localhost:27017/sukiyarestaurant" --collection=menu_items --out=./mongodb-backup
mongodump --uri="mongodb://localhost:27017/sukiyarestaurant" --collection=orders --out=./mongodb-backup
mongodump --uri="mongodb://localhost:27017/sukiyarestaurant" --collection=order_items --out=./mongodb-backup
```

## Step 4: Import Data to Atlas

```powershell
# Import all collections to Atlas
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sukiyarestaurant" ./mongodb-backup/sukiyarestaurant

# Or import specific collections
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sukiyarestaurant" --collection=users ./mongodb-backup/sukiyarestaurant/users.bson
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sukiyarestaurant" --collection=menu_items ./mongodb-backup/sukiyarestaurant/menu_items.bson
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sukiyarestaurant" --collection=orders ./mongodb-backup/sukiyarestaurant/orders.bson
mongorestore --uri="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sukiyarestaurant" --collection=order_items ./mongodb-backup/sukiyarestaurant/order_items.bson
```

## Step 5: Update Environment Variables

### For Frontend (Next.js)
Update `.env.local`:
```env
DATABASE_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sukiyarestaurant?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### For Backend (sukiya-api)
Update `../sukiya-api/.env`:
```env
DATABASE_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/sukiyarestaurant?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
```

### For Vercel Deployment
1. Go to your Vercel project settings
2. Navigate to "Environment Variables"
3. Add/Update `DATABASE_URL` with your Atlas connection string
4. Redeploy your application

## Step 6: Update Database Connection Code (if needed)

The current code should work with Atlas, but you may need to update the connection string handling:

**Note**: Atlas uses `mongodb+srv://` protocol which doesn't need replica set configuration. The current code already handles this by removing replica set parameters.

## Step 7: Test Connection

1. **Test from Backend**
   ```powershell
   cd ../sukiya-api
   npm run dev
   ```
   You should see: `✅ Connected to MongoDB via Prisma`

2. **Test from Frontend**
   ```powershell
   npm run dev
   ```
   Try logging in or accessing the admin panel

## Troubleshooting

### Connection Timeout
- Check Network Access in Atlas (make sure your IP is whitelisted)
- Verify username/password are correct
- Check if the connection string has the database name

### Authentication Failed
- Verify database user credentials
- Make sure password doesn't contain special characters (or URL-encode them)
- Check user privileges in Atlas

### SSL/TLS Issues
- Atlas requires SSL by default
- Make sure your MongoDB driver version supports SSL
- The connection string should use `mongodb+srv://` which handles SSL automatically

## Security Best Practices

1. **Never commit connection strings to Git**
   - Keep them in `.env` files (already in `.gitignore`)
   - Use environment variables in production

2. **Use Strong Passwords**
   - Generate random passwords for database users
   - Store them securely (password manager)

3. **Limit Network Access**
   - Only whitelist IPs that need access
   - For production, use specific IPs, not 0.0.0.0/0

4. **Regular Backups**
   - Atlas free tier includes automated backups
   - Enable them in the Atlas dashboard

## Next Steps

After migration:
1. Test all functionality (login, menu management, orders, etc.)
2. Update any hardcoded connection strings
3. Update deployment environments (Vercel, etc.)
4. Remove local MongoDB if no longer needed

