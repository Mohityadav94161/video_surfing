# Video Surfing - Video Aggregation Platform

## ✅ **Fixed Issues:**

### 1. **✅ Avatar opens left sidebar instead of dropdown**

- Changed from Dropdown to Button that opens a Drawer
- Avatar now opens a left sidebar with the same styling as the menu drawer


### 2. **✅ Protected actions for non-authenticated users**

- Added `handleProtectedAction` function that checks authentication
- If not logged in and clicking "My Collections" or "Upload Videos", it automatically opens the login modal
- After login, users can access these features normally


### 3. **✅ Search overlay with proper list format and background blur**

- **List format**: Search recommendations now display as a vertical list (like Pornhub mobile search)
- **Proper blur**: Enhanced backdrop blur with `backdrop-filter: blur(10px)` and darker overlay
- **Better UX**: Each recommendation item has hover effects and proper spacing


## 🎯 **New Features:**

**Avatar Sidebar Content:**

- **Not logged in:** Login/Register buttons + My Collections/Upload (triggers login) + Contact Support
- **Logged in:** Welcome message + My Collections + Upload Videos + Contact Support + Profile + Admin Dashboard (if admin) + Logout


**Search Overlay:**

- Full-screen overlay with proper background blur
- Vertical list of recommendations with search icons
- Smooth hover animations
- Each item clickable to perform search


**Authentication Flow:**

- Seamless login prompts for protected features
- Automatic navigation after successful authentication


The mobile navigation now works exactly like modern video platforms with proper authentication handling and intuitive UI patterns!

A MERN stack application that aggregates videos from various websites, displaying thumbnails, titles, tags, and categories. Users can browse, search, and filter videos. When a user clicks on a video, they are redirected to the original website.

## Features

- Responsive UI built with React and Ant Design
- Video metadata extraction from external URLs
- Categorization and tagging system for better searching
- Admin-only video addition
- User authentication with JWT
- Optimized and scalable architecture following SOLID principles

## Tech Stack

### Frontend
- React.js
- Ant Design (UI framework)
- React Router
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Cheerio for web scraping

## Project Structure

```
/
├── Frontend/           # React frontend
│   ├── public/         # Static files
│   └── src/            # Source files
│       ├── components/ # React components
│       ├── contexts/   # Context providers
│       ├── pages/      # Page components
│       └── ...
└── Backend/            # Node.js backend
    ├── controllers/    # Route controllers
    ├── models/         # Mongoose models
    ├── routes/         # Express routes
    ├── middleware/     # Custom middleware
    ├── utils/          # Utility functions
    └── server.js       # Entry point
```

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- npm or yarn

### Backend Setup
1. Navigate to the backend directory:
   ```
   cd Backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   NODE_ENV=development
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/video-surfing
   JWT_SECRET=your-secure-jwt-secret-key-change-in-production
   JWT_EXPIRES_IN=90d
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```
   cd Frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the frontend directory with the following variables:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_DEFAULT_THUMBNAIL=https://via.placeholder.com/640x360
   ```

4. Start the frontend development server:
   ```
   npm start
   ```

5. Open your browser and navigate to `http://localhost:3000`

## Initial Admin Setup
To create an initial admin user (for development purposes only):

```bash
curl -X POST http://localhost:5000/api/auth/create-admin \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"password123"}'
```

## Production Deployment
For production deployment, make sure to:
1. Set `NODE_ENV=production` in the backend `.env` file
2. Use a strong, unique JWT secret
3. Set up proper MongoDB authentication
4. Consider using a process manager like PM2
5. Implement a CDN for frontend assets
6. Set up HTTPS with a valid certificate

## License
MIT 