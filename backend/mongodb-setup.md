# MongoDB Connection Setup Guide

This guide explains how to properly set up the MongoDB connection for your CO2 sensor application.

## MongoDB Atlas Setup

1. **Create a MongoDB Atlas Account** (if you don't have one):
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Sign up for a free account

2. **Create a New Cluster**:
   - Choose the free tier option
   - Select a cloud provider and region closest to your location
   - Click "Create Cluster"

3. **Set Up Database Access**:
   - Go to "Database Access" in the security menu
   - Add a new database user with password authentication
   - Give appropriate read/write permissions

4. **Configure Network Access**:
   - Go to "Network Access" in the security menu
   - Add your IP address to the IP whitelist or allow access from anywhere (for development)

5. **Get Connection String**:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

## Environment Configuration

1. **Create a .env File**:
   Create a file named `.env` in your backend directory with the following content:

   ```
   # MongoDB Connection
   MONGO_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>?retryWrites=true&w=majority

   # Server Configuration
   PORT=5001
   NODE_ENV=development

   # JWT Secret for Authentication
   JWT_SECRET=your_jwt_secret_key_here
   JWT_EXPIRES_IN=7d

   # CORS Origins
   CORS_ORIGINS=http://localhost:3000,http://localhost:5173

   # Gateway Configuration
   ALLOW_ANONYMOUS_GATEWAY=true
   ```

2. **Update Values**:
   - Replace `<username>` and `<password>` with your MongoDB Atlas credentials
   - Replace `<cluster-url>` with your cluster URL
   - Replace `<database-name>` with your database name (e.g., co2-monitoring)
   - Update JWT_SECRET with a secure random string

## Test the Connection

1. Start your backend server:
   ```
   cd backend
   npm install
   npm start
   ```

2. Check the console output for a successful connection message:
   ```
   ✅ MongoDB pripojené
   ```

## Troubleshooting

- **Connection Error**: Verify your MongoDB Atlas credentials and network access settings
- **Authentication Error**: Check your username and password in the connection string
- **Network Error**: Ensure your IP address is whitelisted in MongoDB Atlas

## Security Recommendations

- Never commit your `.env` file to version control
- Use different database users for development and production
- Regularly rotate database user passwords
- Use IP restrictions when in production 