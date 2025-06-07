/**
 * Test script for video extraction using Playwright
 * Run with: node testVideoExtraction.js URL [maxPages] [maxVideos]
 */

const { scrapePageForVideos } = require('../utils/metadataExtractor');

// Parse command line arguments
const url = process.argv[2];
const maxPages = parseInt(process.argv[3]) || 1;  // Default to 1 page
const maxVideos = parseInt(process.argv[4]) || 500;  // Default to 500 videos

if (!url) {
  console.error('❌ Please provide a URL to extract videos from');
  console.error('Usage: node testVideoExtraction.js URL [maxPages] [maxVideos]');
  process.exit(1);
}

// Configuration options
const options = {
  // Browser settings
  browser: 'chrome',
  timeout: 60000, // 60 seconds
  
  // Extraction behavior
  scrollPage: true,
  additionalWaitTime: 5000,
  
  // Content scanning
  scanScriptTags: true,
  scanDataAttributes: true,
  scanIframeAttributes: true,
  
  // Advanced options
  followExternalLinks: false,
  blockAds: true,
  debug: true,
  
  // Pagination options
  maxPages,
  maxVideos,
  
  // Age verification (for adult content)
  ageVerification: true,
  
  // Screenshot for debugging
  takeScreenshot: true
};

async function runTest() {
  console.log(`🚀 Testing video extraction for: ${url}`);
  console.log(`📄 Pagination settings: max pages = ${maxPages}, max videos = ${maxVideos}`);
  
  try {
    // Extract videos
    const result = await scrapePageForVideos(url, options);
    
    // Print results
    console.log('\n✅ Extraction complete!');
    console.log(`Found ${result.videos.length} videos from ${result.domain}`);
    console.log(`Page title: ${result.metadata.pageTitle}`);
    
    // Pagination information
    if (result.metadata.pagination) {
      console.log(`Pages scanned: ${result.metadata.pagination.pagesScanned} of ${result.metadata.pagination.totalPages}`);
    }
    
    // Extraction methods used
    console.log('\n📋 Extraction methods:');
    result.metadata.extractionMethods.forEach(method => {
      console.log(`  - ${method}`);
    });
    
    // Print videos found
    console.log('\n🎬 Videos found:');
    result.videos.forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title}`);
      console.log(`   URL: ${video.url}`);
      console.log(`   Type: ${video.type}`);
      console.log(`   Format: ${video.format || 'unknown'}`);
      console.log(`   Quality: ${video.quality || 'unknown'}`);
      console.log(`   Found by: ${video.foundBy}`);
      console.log(`   Confidence: ${Math.round((video.confidence || 0) * 100)}%`);
      
      if (video.thumbnailUrl) {
        console.log(`   Thumbnail: ${video.thumbnailUrl}`);
      }
    });
    
    // Save the full result to a JSON file
    const fs = require('fs');
    const path = require('path');
    const outputDir = path.join(__dirname, 'extraction-results');
    
    // Create output directory if it doesn't exist
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Generate filename from URL
    const domain = new URL(url).hostname.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = new Date().toISOString().replace(/[:T.]/g, '-').slice(0, 19);
    const outputFile = path.join(outputDir, `${domain}_${timestamp}.json`);
    
    // Write results to file
    fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
    console.log(`\n💾 Full results saved to: ${outputFile}`);
    
  } catch (error) {
    console.error('❌ Error during extraction:', error);
  }
}

runTest(); 