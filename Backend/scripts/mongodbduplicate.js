const mongoose = require('mongoose');
require('dotenv').config();

async function fixEmailIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/video-surfing');
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Get current indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Check if email index exists
    const emailIndexExists = indexes.some(idx => idx.key && idx.key.email);

    if (emailIndexExists) {
      console.log('Dropping email index...');
      await collection.dropIndex('email_1');
      console.log('✅ Email index dropped successfully!');
    } else {
      console.log('ℹ️  Email index does not exist');
    }

    // Get indexes after dropping
    const newIndexes = await collection.indexes();
    console.log('Indexes after fix:', newIndexes.map(idx => ({ name: idx.name, key: idx.key })));

    console.log('✅ Email index fix completed!');

  } catch (error) {
    console.error('❌ Error fixing email index:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

fixEmailIndex();