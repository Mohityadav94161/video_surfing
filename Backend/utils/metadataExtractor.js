const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Extract metadata from a video URL
 * @param {string} url - The URL of the video
 * @returns {Promise<Object>} - Metadata object containing title, thumbnail, description, tags and category
 */
const extractMetadata = async (url) => {
  try {
    // Validate URL
    const validatedUrl = validateUrl(url);
    
    // Determine the website source and use appropriate scraper
    const domain = new URL(validatedUrl).hostname;
    
    // Choose scraper based on domain
    if (domain.includes('youtube.com') || domain.includes('youtu.be')) {
      return await scrapeYouTube(validatedUrl);
    } else if (domain.includes('vimeo.com')) {
      return await scrapeVimeo(validatedUrl);
    } else if (domain.includes('dailymotion.com')) {
      return await scrapeDailymotion(validatedUrl);
    } else {
      // Generic scraper for other websites
      return await scrapeGeneric(validatedUrl);
    }
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw new Error('Failed to extract metadata from the provided URL');
  }
};

/**
 * Validate and normalize URL
 */
const validateUrl = (url) => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.toString();
  } catch (error) {
    throw new Error('Invalid URL provided');
  }
};

/**
 * YouTube scraper
 */
const scrapeYouTube = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    // Extract metadata
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('title').text() || 'Unknown Title';
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '';
    
    // Extract tags
    const tags = [];
    $('meta[property="og:video:tag"]').each((i, el) => {
      tags.push($(el).attr('content'));
    });
    
    // Determine category based on content or default to 'Other'
    let category = determineCategory(title, description, tags);
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      sourceWebsite: 'YouTube'
    };
  } catch (error) {
    console.error('Error scraping YouTube:', error);
    return fallbackMetadata(url, 'YouTube');
  }
};

/**
 * Vimeo scraper
 */
const scrapeVimeo = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('title').text() || 'Unknown Title';
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '';
    
    // Extract tags - Vimeo specific
    const tags = [];
    // Extract any keywords or tags available
    $('meta[name="keywords"]').each((i, el) => {
      const keywordsStr = $(el).attr('content');
      if (keywordsStr) {
        keywordsStr.split(',').forEach(tag => {
          if (tag.trim()) tags.push(tag.trim());
        });
      }
    });
    
    let category = determineCategory(title, description, tags);
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      sourceWebsite: 'Vimeo'
    };
  } catch (error) {
    console.error('Error scraping Vimeo:', error);
    return fallbackMetadata(url, 'Vimeo');
  }
};

/**
 * Dailymotion scraper
 */
const scrapeDailymotion = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('title').text() || 'Unknown Title';
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '';
    
    // Extract tags
    const tags = [];
    $('meta[name="keywords"]').each((i, el) => {
      const keywordsStr = $(el).attr('content');
      if (keywordsStr) {
        keywordsStr.split(',').forEach(tag => {
          if (tag.trim()) tags.push(tag.trim());
        });
      }
    });
    
    let category = determineCategory(title, description, tags);
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      sourceWebsite: 'Dailymotion'
    };
  } catch (error) {
    console.error('Error scraping Dailymotion:', error);
    return fallbackMetadata(url, 'Dailymotion');
  }
};

/**
 * Generic scraper for other websites
 */
const scrapeGeneric = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('meta[name="twitter:title"]').attr('content') ||
                 $('title').text() || 'Unknown Title';
    
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || 
                         $('meta[name="twitter:image"]').attr('content') || '';
    
    const description = $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="twitter:description"]').attr('content') ||
                        $('meta[name="description"]').attr('content') || '';
    
    // Extract tags from meta keywords
    const tags = [];
    $('meta[name="keywords"]').each((i, el) => {
      const keywordsStr = $(el).attr('content');
      if (keywordsStr) {
        keywordsStr.split(',').forEach(tag => {
          if (tag.trim()) tags.push(tag.trim());
        });
      }
    });
    
    // Determine source website
    const domain = new URL(url).hostname;
    const sourceWebsite = domain.replace(/^www\./, '');
    
    let category = determineCategory(title, description, tags);
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      sourceWebsite
    };
  } catch (error) {
    console.error('Error scraping generic site:', error);
    
    // Fallback to basic URL parsing
    const domain = new URL(url).hostname;
    const sourceWebsite = domain.replace(/^www\./, '');
    
    return fallbackMetadata(url, sourceWebsite);
  }
};

/**
 * Determine category based on content keywords
 */
const determineCategory = (title, description, tags) => {
  const content = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
  
  const categoryKeywords = {
    'Education': ['education', 'learn', 'course', 'tutorial', 'teach', 'school', 'university', 'college', 'academic'],
    'Entertainment': ['entertainment', 'funny', 'comedy', 'laugh', 'fun', 'prank', 'joke', 'humor'],
    'Gaming': ['game', 'gaming', 'gameplay', 'playthrough', 'walkthrough', 'minecraft', 'fortnite', 'xbox', 'playstation'],
    'Music': ['music', 'song', 'concert', 'album', 'band', 'singer', 'rap', 'pop', 'rock', 'hip hop'],
    'News': ['news', 'politics', 'report', 'journalist', 'breaking', 'update', 'current events'],
    'Sports': ['sport', 'football', 'soccer', 'basketball', 'nba', 'nfl', 'baseball', 'tennis', 'cricket'],
    'Technology': ['tech', 'technology', 'coding', 'programming', 'software', 'hardware', 'computer', 'smartphone', 'gadget'],
    'Travel': ['travel', 'vacation', 'trip', 'tour', 'tourism', 'journey', 'adventure', 'explore', 'destination']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (content.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'Other';
};

/**
 * Fallback metadata when scraping fails
 */
const fallbackMetadata = (url, sourceWebsite) => {
  const domain = new URL(url).hostname;
  return {
    title: `Video from ${sourceWebsite}`,
    thumbnailUrl: '',
    description: `This is a video from ${sourceWebsite}`,
    tags: [sourceWebsite],
    category: 'Other',
    sourceWebsite
  };
};

module.exports = { extractMetadata }; 