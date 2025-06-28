const mongoose = require('mongoose');
const Video = require('../models/Video');

// MongoDB connection string - update this with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/video-surfing';

async function createTextIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ Connected to MongoDB');

    // Drop existing text index if it exists
    try {
      await Video.collection.dropIndex('title_text_tags_text_description_text_videoId_text_addedBy_text_category_text');
      console.log('🗑️ Dropped existing text index');
    } catch (err) {
      console.log('ℹ️ No existing text index to drop');
    }

    // Create the text index
    await Video.collection.createIndex(
      { 
        title: 'text', 
        tags: 'text', 
        description: 'text',
        videoId: 'text',
        addedBy: 'text', 
        category: 'text' 
      },
      {
        name: 'search_text_index',
        weights: {
          title: 10,
          tags: 8,
          description: 6,
          videoId: 5,
          category: 4,
          addedBy: 2
        },
        default_language: 'english'
      }
    );

    console.log('✅ Text index created successfully');

    // Verify the index was created
    const indexes = await Video.collection.listIndexes().toArray();
    const textIndex = indexes.find(index => index.name === 'search_text_index');
    
    if (textIndex) {
      console.log('✅ Text index verification successful');
      console.log('Index details:', JSON.stringify(textIndex, null, 2));
    } else {
      console.log('❌ Text index not found after creation');
    }

    // Test the index with a simple query
    try {
      const testResult = await Video.find({ $text: { $search: 'test' } }).limit(1);
      console.log('✅ Text search test successful');
    } catch (err) {
      console.log('❌ Text search test failed:', err.message);
    }

  } catch (error) {
    console.error('❌ Error creating text index:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 MongoDB connection closed');
  }
}

// Run the script
createTextIndex(); 