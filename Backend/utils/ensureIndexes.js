const Video = require('../models/Video');

/**
 * Ensure all necessary indexes are created for the application
 * This should be called when the application starts
 */
async function ensureIndexes() {
  try {
    console.log('🔍 Ensuring database indexes...');

    // Ensure text index exists for search functionality
    try {
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
      console.log('✅ Text search index ensured');
    } catch (err) {
      if (err.code === 85) {
        // Index already exists with different options, drop and recreate
        console.log('🔄 Recreating text index with updated options...');
        await Video.collection.dropIndex('search_text_index');
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
        console.log('✅ Text search index recreated');
      } else {
        console.log('ℹ️ Text search index already exists or error:', err.message);
      }
    }

    // Ensure other important indexes
    try {
      await Video.collection.createIndex({ videoId: 1 }, { unique: true });
      console.log('✅ Video ID unique index ensured');
    } catch (err) {
      console.log('ℹ️ Video ID index already exists');
    }

    try {
      await Video.collection.createIndex({ active: 1 });
      console.log('✅ Active status index ensured');
    } catch (err) {
      console.log('ℹ️ Active status index already exists');
    }

    try {
      await Video.collection.createIndex({ category: 1 });
      console.log('✅ Category index ensured');
    } catch (err) {
      console.log('ℹ️ Category index already exists');
    }

    try {
      await Video.collection.createIndex({ createdAt: -1 });
      console.log('✅ Created date index ensured');
    } catch (err) {
      console.log('ℹ️ Created date index already exists');
    }

    try {
      await Video.collection.createIndex({ views: -1 });
      console.log('✅ Views index ensured');
    } catch (err) {
      console.log('ℹ️ Views index already exists');
    }

    try {
      await Video.collection.createIndex({ isTrending: 1 });
      console.log('✅ Trending index ensured');
    } catch (err) {
      console.log('ℹ️ Trending index already exists');
    }

    console.log('✅ All indexes ensured successfully');
  } catch (error) {
    console.error('❌ Error ensuring indexes:', error);
    throw error;
  }
}

module.exports = { ensureIndexes }; 