# EcoLens Backend

Backend API for the EcoLens CO2 Carbon Emission Tracker.

## Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Create a `.env` file in the backend folder with these variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/ecolens

# Server Port
PORT=3001

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key

# JWT Expiration
JWT_EXPIRES_IN=7d

# OpenAI API Key (for image analysis)
OPENAI_API_KEY=your-openai-api-key

# ElevenLabs API Key (for text-to-speech)
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

### 3. Run MongoDB

**Option A: Local MongoDB**
```bash
# Install MongoDB Community Server
# Start MongoDB service
mongod
```

**Option B: MongoDB Atlas (Cloud)**
1. Create a free cluster at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Update `MONGODB_URI` in your `.env`

### 4. Initialize Database

Run the MongoDB playground script to create collections with validation:

```bash
# Using MongoDB Shell
mongosh < ../playground-1.mongodb.js

# Or use MongoDB Compass / VS Code MongoDB extension
```

### 5. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

## Database Schema

### Users Collection
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `email` | String | User email (unique) |
| `name` | String | Display name |
| `passwordHash` | String | Bcrypt hashed password |
| `dailyCO2Goal` | Number | Daily CO2 budget in grams |
| `preferences` | Object | Units, notifications, theme |
| `stats` | Object | totalScans, totalCO2, streakDays |
| `createdAt` | Date | Account creation time |

### Emissions Collection
| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique identifier |
| `userId` | ObjectId | Reference to user |
| `objectName` | String | Name of scanned item |
| `category` | String | food, beverage, clothing, etc. |
| `carbonValue` | Number | CO2 in grams |
| `carbonFootprint` | String | Formatted (e.g., "82.8g CO₂e") |
| `lifecycle` | Array | Lifecycle stages |
| `explanation` | String | Environmental impact description |
| `alternatives` | Array | Eco-friendly alternatives |
| `scannedAt` | Date | When item was scanned |
| `date` | String | YYYY-MM-DD for daily aggregation |

## API Endpoints (Coming Soon)

```
POST   /api/auth/register     - Create new user
POST   /api/auth/login        - User login
GET    /api/users/me          - Get current user
PUT    /api/users/me          - Update profile

POST   /api/emissions         - Log new emission
GET    /api/emissions         - Get user's emissions
GET    /api/emissions/today   - Get today's emissions
GET    /api/emissions/stats   - Get CO2 statistics
DELETE /api/emissions/:id     - Delete an emission
```
