// MongoDB initialization script
db = db.getSiblingDB('video-surfing');

// Create application user
db.createUser({
  user: 'app_user',
  pwd: 'app_password_change_in_production',
  roles: [
    {
      role: 'readWrite',
      db: 'video-surfing'
    }
  ]
});

// Create indexes for better performance
db.videos.createIndex({ "title": "text", "description": "text" });
db.videos.createIndex({ "tags": 1 });
db.videos.createIndex({ "category": 1 });
db.videos.createIndex({ "createdAt": -1 });
db.videos.createIndex({ "views": -1 });

db.users.createIndex({ "username": 1 }, { unique: true });
db.users.createIndex({ "email": 1 }, { unique: true });

db.collections.createIndex({ "userId": 1 });
db.collections.createIndex({ "name": 1 });

db.comments.createIndex({ "videoId": 1 });
db.comments.createIndex({ "userId": 1 });
db.comments.createIndex({ "createdAt": -1 });

print('Database initialized successfully!');