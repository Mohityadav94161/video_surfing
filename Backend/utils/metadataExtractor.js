const axios = require('axios');
const cheerio = require('cheerio');
const { chromium } = require('playwright');
const { setTimeout } = require('timers/promises');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const { URL } = require('url');

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
    } else if (domain.includes('spankbang.com')) {
      return await scrapeSpankBang(validatedUrl);
    } else if (domain.includes('pornhub.com')) {
      return await scrapePornHub(validatedUrl);
    } else if (domain.includes('xvideos.com')) {
      return await scrapeXVideos(validatedUrl);
    } else if (domain.includes('xhamster.com')) {
      return await scrapeXHamster(validatedUrl);
    } else if (domain.includes('redtube.com')) {
      return await scrapeRedTube(validatedUrl);
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
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    // Extract metadata
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('title').text() || 'Unknown Title';
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '';
    
    // Extract duration from meta tags or structured data
    let duration = null;
    const durationMeta = $('meta[itemprop="duration"]').attr('content');
    if (durationMeta) {
      duration = parseDurationToSeconds(durationMeta);
    }
    
    // Extract tags
    const tags = [];
    $('meta[property="og:video:tag"]').each((i, el) => {
      tags.push($(el).attr('content'));
    });
    
    // Extract video ID
    const videoIdMatch = url.match(/[?&]v=([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    // Determine category based on content or default to 'Other'
    let category = determineCategory(title, description, tags);
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      duration,
      videoId,
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
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('title').text() || 'Unknown Title';
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '';
    
    // Extract duration
    let duration = null;
    const durationMeta = $('meta[itemprop="duration"]').attr('content');
    if (durationMeta) {
      duration = parseDurationToSeconds(durationMeta);
    }
    
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
    
    // Extract video ID
    const videoIdMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    let category = determineCategory(title, description, tags);
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      duration,
      videoId,
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
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('title').text() || 'Unknown Title';
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="description"]').attr('content') || '';
    
    // Extract duration
    let duration = null;
    const durationMeta = $('meta[itemprop="duration"]').attr('content');
    if (durationMeta) {
      duration = parseDurationToSeconds(durationMeta);
    }
    
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
    
    // Extract video ID
    const videoIdMatch = url.match(/dailymotion\.com\/video\/([^_]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    let category = determineCategory(title, description, tags);
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      duration,
      videoId,
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
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    // Enhanced title extraction with fallbacks
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('meta[name="twitter:title"]').attr('content') ||
                 $('h1').first().text().trim() ||
                 $('h2').first().text().trim() ||
                 $('.title').first().text().trim() ||
                 $('[class*="title"]').first().text().trim() ||
                 $('title').text() || 'Unknown Title';
    
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || 
                         $('meta[name="twitter:image"]').attr('content') ||
                         $('.video-thumb img').attr('src') ||
                         $('.thumbnail img').attr('src') ||
                         $('video').attr('poster') || '';
    
    const description = $('meta[property="og:description"]').attr('content') || 
                        $('meta[name="twitter:description"]').attr('content') ||
                        $('meta[name="description"]').attr('content') ||
                        $('.description').first().text().trim() ||
                        $('[class*="description"]').first().text().trim() || '';
    
    // Enhanced duration extraction
    let duration = null;
    const durationSelectors = [
      '.duration', '[class*="duration"]', '.time', '[class*="time"]',
      '.length', '[class*="length"]', '.video-time', '.timestamp',
      '.video-duration', '[data-duration]'
    ];
    
    for (const selector of durationSelectors) {
      const durationElement = $(selector).first();
      if (durationElement.length) {
        const durationText = durationElement.text().trim() || durationElement.attr('data-duration');
        if (durationText) {
          duration = parseDurationToSeconds(durationText);
          if (duration > 0) break;
        }
      }
    }
    
    // Enhanced tag extraction
    const tags = [];
    
    // Extract from meta keywords
    $('meta[name="keywords"]').each((i, el) => {
      const keywordsStr = $(el).attr('content');
      if (keywordsStr) {
        keywordsStr.split(',').forEach(tag => {
          const cleanTag = tag.trim();
          if (cleanTag && !tags.includes(cleanTag)) tags.push(cleanTag);
        });
      }
    });
    
    // Extract from tag elements
    const tagSelectors = [
      '.tag', '.tags a', '.tag-item', '.tag-link', '[class*="tag"]',
      '.category', '.categories a', '[class*="category"]',
      '.keyword', '.keywords a', '[class*="keyword"]'
    ];
    
    tagSelectors.forEach(selector => {
      $(selector).each((i, el) => {
        const tagText = $(el).text().trim();
        if (tagText && tagText.length < 50 && !tags.includes(tagText)) {
          tags.push(tagText);
        }
      });
    });
    
    // Extract category from specific elements
    let category = null;
    const categorySelectors = [
      '.category a', '.categories a', '.main-category', 
      '[class*="category"]', '.breadcrumb a:last-child',
      '.nav-breadcrumb a:last-child'
    ];
    
    for (const selector of categorySelectors) {
      const categoryElement = $(selector).first();
      if (categoryElement.length) {
        const categoryText = categoryElement.text().trim();
        if (categoryText && categoryText.length < 30) {
          category = categoryText;
          break;
        }
      }
    }
    
    // Fallback to category determination
    if (!category) {
      category = determineCategory(title, description, tags);
    }
    
    // Extract video ID from URL patterns
    let videoId = null;
    const videoIdPatterns = [
      /\/video\/([^\/\?]+)/i,
      /\/watch\/([^\/\?]+)/i,
      /\/v\/([^\/\?]+)/i,
      /\/([^\/\?]+)\/play$/i,
      /id=([^&]+)/i,
      /video_id=([^&]+)/i
    ];
    
    for (const pattern of videoIdPatterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        videoId = match[1];
        break;
      }
    }
    
    // Determine source website
    const domain = new URL(url).hostname;
    const sourceWebsite = domain.replace(/^www\./, '');
    
    return {
      title: title.substring(0, 200), // Limit title length
      thumbnailUrl,
      description: description.substring(0, 500), // Limit description length
      tags: tags.slice(0, 20), // Limit number of tags
      category,
      duration,
      videoId,
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
  
  // Try to extract video ID from URL as fallback
  let videoId = null;
  const videoIdPatterns = [
    /\/video\/([^\/\?]+)/i,
    /\/watch\/([^\/\?]+)/i,
    /\/v\/([^\/\?]+)/i,
    /\/([^\/\?]+)\/play$/i,
    /id=([^&]+)/i,
    /video_id=([^&]+)/i,
    /viewkey=([^&]+)/i
  ];
  
  for (const pattern of videoIdPatterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      videoId = match[1];
      break;
    }
  }
  
  return {
    title: `Video from ${sourceWebsite}`,
    thumbnailUrl: '',
    description: `This is a video from ${sourceWebsite}`,
    tags: [sourceWebsite],
    category: 'Other',
    duration: null,
    videoId,
    sourceWebsite
  };
};

/**
 * Enhanced Universal Video Scraper
 * Extracts videos from any website including dynamic content loaded via JavaScript
 * @param {string} url - The URL of the webpage
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Result object with videos and metadata
 */
const scrapePageForVideos = async (url, options = {}) => {
  try {
    // Validate URL
    const validatedUrl = validateUrl(url);

    console.log(`🔍 Scraping videos from: ${validatedUrl}`);

    // Default configuration
    const config = {
      // Age verification
      ageVerification: true, // Default to true for wider compatibility
      
      // Extraction options
      customSelectors: options.customSelectors || [],
      fileExtensions: [
        ...new Set([
          '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v', '.flv', '.wmv',
          ...(options.fileExtensions || [])
        ])
      ],
      
      // Advanced scanning
      scanScriptTags: options.scanScriptTags !== false,
      scanDataAttributes: options.scanDataAttributes !== false,
      scanIframeAttributes: options.scanIframeAttributes !== false,

      // Browser configuration
      browser: options.browser || 'chrome',
      userAgent: getUserAgent(options.browser || 'chrome'),

      // Extraction behavior
      scrollPage: true,
      additionalWaitTime: 3000,
      timeout: options.timeout || 30000,
      blockAds: true,
  

      // External links and performance
      followExternalLinks: options.followExternalLinks || false,
      maxScanDepth: options.maxScanDepth || 1,

      // Debugging
      debug: process.env.NODE_ENV === 'development',

      // Merge any additional options
      ...options
    };

    console.log(`⚙️ Configuration:`, JSON.stringify(config, null, 2));

    // Check if it's an adult website and verify age
    const isAdultSite = await detectAdultContent(validatedUrl);

    if (isAdultSite) {
      console.log('🔞 Adult content detected');
      if (!config.ageVerification) {
        throw new Error('Age verification required for adult content. Please confirm you are 18+ by setting ageVerification: true');
      }
    }

    // Use Playwright for extraction
    return await extractVideosWithPlaywright(validatedUrl, config);

  } catch (error) {
    console.error('❌ Error scraping page for videos:', error);
    throw error;
  }
};

/**
 * Get user agent based on browser selection
 */
function getUserAgent(browser) {
  const userAgents = {
    chrome: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    firefox: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    safari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Safari/605.1.15',
    edge: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    mobile: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1'
  };

  return userAgents[browser] || userAgents.chrome;
}

/**
 * Detect adult content based on domain and page content
 */
async function detectAdultContent(url) {
  const domain = new URL(url).hostname.toLowerCase();
  
  // Comprehensive adult site patterns
  const adultPatterns = [
    // General adult terms
    'porn', 'xxx', 'sex', 'adult', 'nude', 'nsfw', 'erotic', 'naked', 'cam',
    'escort', 'milf', 'teen', 'mature', 'amateur', 'fetish', 'bdsm', 'anal',
    
    // Major adult platforms
    'pornhub', 'xvideos', 'xnxx', 'xhamster', 'redtube', 'youporn', 'tube8',
    'spankbang', 'brazzers', 'realitykings', 'bangbros', 'naughtyamerica',
    'digitalplayground', 'wickedpictures', 'vivid', 'hustler', 'penthouse',
    
    // Cam sites
    'chaturbate', 'myfreecams', 'stripchat', 'bongacams', 'livejasmin',
    'flirt4free', 'camsoda', 'cam4', 'streamate', 'imlive',
    
    // Adult tubes and aggregators
    'porntrex', 'eporner', 'thumbzilla', 'txxx', 'hqporner', 'upornia',
    'xmoviesforyou', 'beeg', 'drtuber', 'gotporn', 'vjav', 'javhd',
    
    // Regional/language specific
    'javmost', 'javhihi', 'javguru', 'jav247', 'r18', 'dmm',
    'thisav', 'avgle', 'missav', 'supjav', 'javlibrary',
    
    // Alternative spellings and variations
    'pr0n', 'p0rn', 'sexx', 'xxxx', 'adulto', 'sexo', 'porno',
    'erotik', 'sexe', 'sesso', 'sexs', 'adulte', 'erotico'
  ];
  
  // Check domain patterns
  const isDomainAdult = adultPatterns.some(pattern => domain.includes(pattern));
  
  // Additional checks for TLD patterns commonly used by adult sites
  const adultTlds = ['.xxx', '.sex', '.porn', '.adult'];
  const hasSuspiciousTld = adultTlds.some(tld => domain.endsWith(tld));
  
  // Check for numeric domains (often used to evade filters)
  const hasNumericSubdomain = /^\d+\./.test(domain);
  
  return isDomainAdult || hasSuspiciousTld || (hasNumericSubdomain && isDomainAdult);
}

/**
 * Fetch page content with retry mechanism and different user agents
 */
async function fetchPageWithRetry(url, config) {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  ];

  for (let attempt = 0; attempt < config.maxRetries; attempt++) {
    try {
      const userAgent = config.rotateUserAgent 
        ? userAgents[attempt % userAgents.length]
        : userAgents[0];

      const response = await axios.get(url, {
        headers: {
          'User-Agent': userAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        timeout: config.timeout,
        maxRedirects: 5,
        validateStatus: (status) => status < 500 // Accept 4xx but retry on 5xx
      });

      return response.data;
    } catch (error) {
      console.warn(`Attempt ${attempt + 1} failed:`, error.message);
      if (attempt === config.maxRetries - 1) throw error;
      
      // Wait before retry with exponential backoff
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
}

/**
 * Get main content area from page
 */
function getMainContent($) {
  const selectors = [
    'main', '#main', '.main', '#main-content', '.main-content',
    'article', '.article', '#content', '.content', '.post-content',
    '.entry-content', '.page-content', '#primary', '.primary'
  ];
  
  for (const selector of selectors) {
    const $el = $(selector);
    if ($el.length && $el.text().trim().length > 100) {
      console.log(`📍 Using main content selector: ${selector}`);
      return $el;
    }
  }
  
  return $; // Return full document if no main content found
}

/**
 * Extract videos from video elements
 */
async function extractFromVideoElements($, $content, results, config) {
  console.log('🎥 Extracting from video elements...');
  
  $content('video').each((i, el) => {
    const $el = $(el);
    
    // Get video source
    let videoSrc = $el.attr('src');
    if (!videoSrc) {
      const $source = $el.find('source').first();
      videoSrc = $source.attr('src');
    }
    
    if (videoSrc) {
      const video = {
        url: resolveUrl(videoSrc, results.url),
        title: extractTitle($el, results.domain, 'Video'),
        thumbnailUrl: $el.attr('poster') || '',
        sourceWebsite: results.domain,
        foundBy: 'video-element',
        type: 'direct',
        attributes: extractVideoAttributes($el)
      };
      
      if (isValidVideo(video, config)) {
        results.videos.push(video);
      }
    }
  });
  
  results.metadata.extractionMethods.push('video-elements');
}

/**
 * Extract videos from iframe elements
 */
async function extractFromIframes($, $content, results, config) {
  console.log('🖼️ Extracting from iframes...');
  
  $content('iframe').each((i, el) => {
    const $el = $(el);
    const src = $el.attr('src');
    
    if (src && isVideoIframe(src)) {
      const video = {
        url: resolveUrl(src, results.url),
        title: extractTitle($el, results.domain, 'Embedded Video'),
        thumbnailUrl: extractThumbnailFromIframe($el, src),
        sourceWebsite: extractServiceFromUrl(src),
        foundBy: 'iframe-element',
        type: 'embedded',
        attributes: extractIframeAttributes($el)
      };
      
      if (isValidVideo(video, config)) {
        results.videos.push(video);
      }
    }
  });
  
  results.metadata.extractionMethods.push('iframe-elements');
}

/**
 * Extract videos from script tags (JSON-LD, video data objects)
 */
async function extractFromScriptTags($, results, config) {
  console.log('📜 Extracting from script tags...');
  
  $('script').each((i, el) => {
    const $el = $(el);
    const scriptContent = $el.html();
    
    if (!scriptContent) return;
    
    // Extract from JSON-LD structured data
    if ($el.attr('type') === 'application/ld+json') {
      extractFromJsonLd(scriptContent, results);
    }
    
    // Extract from JavaScript variables
    extractFromJavaScriptVars(scriptContent, results);
    
    // Extract from video player configurations
    extractFromVideoPlayerConfigs(scriptContent, results);
  });
  
  results.metadata.extractionMethods.push('script-tags');
}

/**
 * Extract from JSON-LD structured data
 */
function extractFromJsonLd(scriptContent, results) {
  try {
    const data = JSON.parse(scriptContent);
    const items = Array.isArray(data) ? data : [data];
    
    items.forEach(item => {
      if (item['@type'] === 'VideoObject' || item.contentUrl || item.embedUrl) {
        const video = {
          url: item.contentUrl || item.embedUrl || item.url,
          title: item.name || item.headline || 'JSON-LD Video',
          thumbnailUrl: item.thumbnailUrl || item.image?.url || item.image || '',
          sourceWebsite: results.domain,
          foundBy: 'json-ld',
          type: 'structured-data',
          metadata: {
            description: item.description,
            duration: item.duration,
            uploadDate: item.uploadDate,
            creator: item.creator?.name || item.author?.name
          }
        };
        
        if (video.url) {
          video.url = resolveUrl(video.url, results.url);
          results.videos.push(video);
        }
      }
    });
  } catch (e) {
    // Skip invalid JSON
  }
}

/**
 * Extract from JavaScript variables
 */
function extractFromJavaScriptVars(scriptContent, results) {
  // Common patterns for video data in JS
  const patterns = [
    /videoUrl['":\s]*['"]([^'"]+)['"]/gi,
    /video_url['":\s]*['"]([^'"]+)['"]/gi,
    /src['":\s]*['"]([^'"]+\.(?:mp4|webm|ogg|mov|avi|mkv|m3u8|mpd))['"]/gi,
    /url['":\s]*['"]([^'"]+\.(?:mp4|webm|ogg|mov|avi|mkv|m3u8|mpd))['"]/gi,
    /mp4['":\s]*['"]([^'"]+)['"]/gi,
    /webm['":\s]*['"]([^'"]+)['"]/gi,
    /"file"['":\s]*['"]([^'"]+)['"]/gi,
    /"sources?"['":\s]*\[[^\]]*['"]([^'"]+)['"]/gi,
    /"hls"['":\s]*['"]([^'"]+)['"]/gi,
    /"dash"['":\s]*['"]([^'"]+)['"]/gi,
    /"stream"['":\s]*['"]([^'"]+)['"]/gi,
    /"m3u8"['":\s]*['"]([^'"]+)['"]/gi,
    /"mpd"['":\s]*['"]([^'"]+)['"]/gi,
    /"contentUrl"['":\s]*['"]([^'"]+)['"]/gi,
    /"playbackUrl"['":\s]*['"]([^'"]+)['"]/gi,
    /"videoSrc"['":\s]*['"]([^'"]+)['"]/gi,
    /"videoUrl"['":\s]*['"]([^'"]+)['"]/gi,
    /"media"['":\s]*['"]([^'"]+)['"]/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(scriptContent)) !== null) {
      const url = match[1];
      if (url && url.startsWith('http')) {
        const video = {
          url: url,
          title: `JavaScript Video from ${results.domain}`,
          thumbnailUrl: '',
          sourceWebsite: results.domain,
          foundBy: 'javascript-variable',
          type: 'direct'
        };
        
        results.videos.push(video);
      }
    }
  });
}

/**
 * Extract from video player configurations
 */
function extractFromVideoPlayerConfigs(scriptContent, results) {
  // Video.js, JW Player, and other common players
  const playerPatterns = [
    /(?:jwplayer|videojs|flowplayer)\([^)]*\)\.setup\(\s*\{([^}]+)\}/gi,
    /player\.load\(\s*\{([^}]+)\}/gi,
    /\.src\(\s*['"]([^'"]+)['"]\s*\)/gi
  ];
  
  playerPatterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(scriptContent)) !== null) {
      const config = match[1];
      
      // Extract URLs from player config
      const urlMatches = config.match(/['"]([^'"]*\.(?:mp4|webm|ogg|mov|avi|mkv)[^'"]*)['"]/gi);
      if (urlMatches) {
        urlMatches.forEach(urlMatch => {
          const url = urlMatch.replace(/['"]/g, '');
          if (url.startsWith('http')) {
            results.videos.push({
              url: url,
              title: `Video Player from ${results.domain}`,
              thumbnailUrl: '',
              sourceWebsite: results.domain,
              foundBy: 'video-player-config',
              type: 'direct'
            });
          }
        });
      }
    }
  });
}

/**
 * Extract from data attributes
 */
async function extractFromDataAttributes($, $content, results, config) {
  console.log('🏷️ Extracting from data attributes...');
  
  $content('[data-video], [data-src], [data-url], [data-mp4], [data-webm]').each((i, el) => {
    const $el = $(el);
    const attrs = el.attribs || {};
    
    Object.keys(attrs).forEach(attr => {
      if (attr.startsWith('data-') && 
          (attr.includes('video') || attr.includes('src') || attr.includes('url') || 
           attr.includes('mp4') || attr.includes('webm'))) {
        
        const value = attrs[attr];
        if (value && (value.startsWith('http') || value.includes('.'))) {
          const video = {
            url: resolveUrl(value, results.url),
            title: extractTitle($el, results.domain, 'Data Attribute Video'),
            thumbnailUrl: $el.attr('data-thumbnail') || $el.attr('data-poster') || '',
            sourceWebsite: results.domain,
            foundBy: `data-attribute:${attr}`,
            type: 'direct'
          };
          
          if (isValidVideo(video, config)) {
            results.videos.push(video);
          }
        }
      }
    });
  });
  
  results.metadata.extractionMethods.push('data-attributes');
}

/**
 * Extract from anchor tags
 */
async function extractFromAnchorTags($, $content, results, config) {
  console.log('🔗 Extracting from anchor tags...');
  
  $content('a[href]').each((i, el) => {
    const $el = $(el);
    const href = $el.attr('href');
    
    if (href && isVideoLink(href, config.fileExtensions)) {
      const video = {
        url: resolveUrl(href, results.url),
        title: $el.text().trim() || extractTitle($el, results.domain, 'Video Link'),
        thumbnailUrl: '',
        sourceWebsite: results.domain,
        foundBy: 'anchor-tag',
        type: 'direct'
      };
      
      if (isValidVideo(video, config)) {
        results.videos.push(video);
      }
    }
  });
  
  results.metadata.extractionMethods.push('anchor-tags');
}

/**
 * Extract from style attributes and CSS backgrounds
 */
async function extractFromStyleAttributes($, $content, results, config) {
  console.log('🎨 Extracting from style attributes...');
  
  $content('[style*="background"]').each((i, el) => {
    const $el = $(el);
    const style = $el.attr('style') || '';
    
    const urlMatches = style.match(/url\(['"]?([^'"]+\.(?:mp4|webm|ogg))['"']?\)/gi);
    if (urlMatches) {
      urlMatches.forEach(match => {
        const url = match.match(/url\(['"]?([^'"]+)['"']?\)/)[1];
        if (url) {
          results.videos.push({
            url: resolveUrl(url, results.url),
            title: `Background Video from ${results.domain}`,
            thumbnailUrl: '',
            sourceWebsite: results.domain,
            foundBy: 'css-background',
            type: 'direct'
          });
        }
      });
    }
  });
  
  results.metadata.extractionMethods.push('style-attributes');
}

/**
 * Extract using adult site specific patterns
 */
async function extractFromAdultSitePatterns($, $content, results, config) {
  console.log('🔞 Extracting from adult site patterns...');
  
  // Comprehensive adult site video container patterns
  const adultSelectors = [
    // Video containers
    '.video-item', '.thumb-item', '.video-block', '.clip-item', '.scene-item',
    '.video-card', '.content-item', '.movie-item', '.gallery-item',
    
    // Data attributes commonly used
    '[data-video-id]', '[data-preview]', '[data-video-url]', '[data-src]',
    '[data-video-src]', '[data-movie-id]', '[data-scene-id]', '[data-clip-id]',
    
    // Player containers
    '.preview-video', '.player-container', '.video-player', '.media-player',
    '.jwplayer-container', '.video-js-container', '.plyr-container',
    
    // Thumbnail containers that might have video data
    '.thumb', '.thumbnail', '.preview', '.poster', '.cover',
    
    // Adult-specific patterns
    '.pornstar-video', '.category-video', '.featured-video', '.recommended-video',
    '.related-video', '.similar-video', '.trending-video', '.popular-video',
    
    // Mobile-specific patterns
    '.mobile-video', '.touch-video', '.responsive-video',
    
    // Grid and list patterns
    '.video-grid-item', '.video-list-item', '.video-row', '.video-column',
    
    // Advanced selectors for modern sites
    '[class*="video"]', '[class*="thumb"]', '[class*="clip"]', '[class*="scene"]',
    '[id*="video"]', '[id*="player"]', '[id*="thumb"]'
  ];
  
  // Additional attributes to check for video URLs
  const videoAttributes = [
    'data-src', 'data-video', 'data-url', 'data-video-url', 'data-video-src',
    'data-preview', 'data-preview-url', 'data-stream', 'data-stream-url',
    'data-mp4', 'data-webm', 'data-hls', 'data-dash', 'data-m3u8',
    'data-file', 'data-source', 'data-movie', 'data-clip', 'data-scene',
    'href', 'src', 'data-href', 'data-link'
  ];
  
  adultSelectors.forEach(selector => {
    $content(selector).each((i, el) => {
      const $el = $(el);
      
      // Look for video URLs in various attributes
      let videoUrl = null;
      
      // Check all possible video attributes
      for (const attr of videoAttributes) {
        const attrValue = $el.attr(attr);
        if (attrValue && (isVideoLink(attrValue, config.fileExtensions) || 
                         attrValue.includes('.m3u8') || 
                         attrValue.includes('.mpd') ||
                         attrValue.includes('stream'))) {
          videoUrl = attrValue;
          break;
        }
      }
      
      // Also check nested video/source elements
      if (!videoUrl) {
        const nestedVideo = $el.find('video').first();
        if (nestedVideo.length) {
          videoUrl = nestedVideo.attr('src') || nestedVideo.find('source').first().attr('src');
        }
      }
      
      // Check for iframe sources
      if (!videoUrl) {
        const iframe = $el.find('iframe').first();
        if (iframe.length) {
          const iframeSrc = iframe.attr('src');
          if (iframeSrc && isVideoIframe(iframeSrc)) {
            videoUrl = iframeSrc;
          }
        }
      }
      
      if (videoUrl) {
        // Extract additional metadata
        const title = $el.attr('title') || 
                     $el.find('.title, .video-title, .name').text().trim() ||
                     $el.find('img').attr('alt') ||
                     extractTitle($el, results.domain, 'Adult Content Video');
        
        const thumbnailUrl = $el.find('img').attr('src') || 
                           $el.find('img').attr('data-src') ||
                           $el.attr('data-thumb') || 
                           $el.attr('data-thumbnail') ||
                           $el.attr('data-poster') || '';
        
        // Extract duration if available
        const duration = $el.find('.duration, .time, .length').text().trim() ||
                        $el.attr('data-duration') || '';
        
        // Extract quality if available
        const quality = $el.find('.quality, .resolution, .hd').text().trim() ||
                       $el.attr('data-quality') || '';
        
        // Extract views if available
        const views = $el.find('.views, .view-count').text().trim() ||
                     $el.attr('data-views') || '';
        
        const video = {
          url: resolveUrl(videoUrl, results.url),
          title: title,
          thumbnailUrl: resolveUrl(thumbnailUrl, results.url),
          sourceWebsite: results.domain,
          foundBy: `adult-pattern:${selector}`,
          type: videoUrl.includes('iframe') ? 'embedded' : 'direct',
          isAdultContent: true,
          metadata: {
            duration: duration,
            quality: quality,
            views: views,
            extractedFrom: selector
          }
        };
        
        if (isValidVideo(video, config)) {
          results.videos.push(video);
        }
      }
    });
  });
  
  results.metadata.extractionMethods.push('adult-site-patterns');
}

/**
 * Extract streaming URLs (HLS, DASH, etc.) commonly used by adult sites
 */
async function extractFromStreamingProtocols($, $content, results, config) {
  console.log('📡 Extracting from streaming protocols...');
  
  // Look for streaming manifest files in script content
  $('script').each((i, el) => {
    const scriptContent = $(el).html();
    if (!scriptContent) return;
    
    // HLS (HTTP Live Streaming) patterns
    const hlsPatterns = [
      /["']([^"']*\.m3u8[^"']*?)["']/gi,
      /hls['":\s]*['"]([^'"]+\.m3u8[^'"]*?)['"]?/gi,
      /playlist['":\s]*['"]([^'"]+\.m3u8[^'"]*?)['"]?/gi,
      /manifest['":\s]*['"]([^'"]+\.m3u8[^'"]*?)['"]?/gi
    ];
    
    // DASH (Dynamic Adaptive Streaming) patterns
    const dashPatterns = [
      /["']([^"']*\.mpd[^"']*?)["']/gi,
      /dash['":\s]*['"]([^'"]+\.mpd[^'"]*?)['"]?/gi,
      /manifest['":\s]*['"]([^'"]+\.mpd[^'"]*?)['"]?/gi
    ];
    
    // Progressive streaming patterns
    const streamPatterns = [
      /stream['":\s]*['"]([^'"]+)['"]?/gi,
      /videoUrl['":\s]*['"]([^'"]+)['"]?/gi,
      /mp4['":\s]*['"]([^'"]+\.mp4[^'"]*?)['"]?/gi,
      /webm['":\s]*['"]([^'"]+\.webm[^'"]*?)['"]?/gi
    ];
    
    // Check all patterns
    const allPatterns = [...hlsPatterns, ...dashPatterns, ...streamPatterns];
    
    allPatterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(scriptContent)) !== null) {
        const streamUrl = match[1];
        
        if (streamUrl && (streamUrl.includes('.m3u8') || 
                         streamUrl.includes('.mpd') ||
                         streamUrl.includes('.mp4') ||
                         streamUrl.includes('.webm') ||
                         streamUrl.includes('stream'))) {
          
          try {
            const fullUrl = resolveUrl(streamUrl, results.url);
            
            // Determine stream type
            let streamType = 'direct';
            if (streamUrl.includes('.m3u8')) streamType = 'hls';
            else if (streamUrl.includes('.mpd')) streamType = 'dash';
            
            const video = {
              url: fullUrl,
              title: `Streaming Video from ${results.domain}`,
              thumbnailUrl: '',
              sourceWebsite: results.domain,
              foundBy: 'streaming-protocol',
              type: streamType,
              isAdultContent: results.isAdultContent,
              metadata: {
                protocol: streamType,
                extractedFromScript: true
              }
            };
            
            if (isValidVideo(video, config)) {
              results.videos.push(video);
            }
          } catch (e) {
            // Skip invalid URLs
          }
        }
      }
    });
  });
  
  results.metadata.extractionMethods.push('streaming-protocols');
}

/**
 * Extract from common video player patterns
 */
async function extractFromVideoPlayerPatterns($, $content, results, config) {
  console.log('🎮 Extracting from video player patterns...');
  
  // Common video player div patterns
  const playerSelectors = [
    '#player', '.player', '#video-player', '.video-player',
    '#jwplayer', '.jwplayer', '#flowplayer', '.flowplayer',
    '.video-js', '.vjs-tech', '.plyr', '.dplayer'
  ];
  
  playerSelectors.forEach(selector => {
    $content(selector).each((i, el) => {
      const $el = $(el);
      
      // Check for video source in data attributes or nested elements
      const videoSrc = $el.attr('data-src') || 
                      $el.attr('data-video') ||
                      $el.find('video').attr('src') ||
                      $el.find('source').attr('src');
      
      if (videoSrc) {
        results.videos.push({
          url: resolveUrl(videoSrc, results.url),
          title: extractTitle($el, results.domain, 'Video Player'),
          thumbnailUrl: $el.attr('data-poster') || $el.find('video').attr('poster') || '',
          sourceWebsite: results.domain,
          foundBy: `video-player:${selector}`,
          type: 'direct'
        });
      }
    });
  });
  
  results.metadata.extractionMethods.push('video-player-patterns');
}

/**
 * Follow external video links
 */
async function followExternalVideoLinks($, $content, results, config) {
  console.log('🔗 Following external video links...');
  
  const videoLinks = [];
  $content('a[href]').each((i, el) => {
    const href = $(el).attr('href');
    const text = $(el).text().toLowerCase();
    
    if (href && (text.includes('video') || text.includes('watch') || text.includes('play'))) {
      try {
        const absoluteUrl = new URL(href, results.url).toString();
        if (absoluteUrl !== results.url) {
          videoLinks.push(absoluteUrl);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    }
  });
  
  const linksToFollow = videoLinks.slice(0, config.maxExternalLinks);
  
  for (const link of linksToFollow) {
    try {
      const externalResults = await scrapePageForVideos(link, {
        ...config,
        maxScanDepth: config.maxScanDepth - 1,
        followExternalLinks: false
      });
      
      externalResults.videos.forEach(video => {
        video.foundVia = link;
        results.videos.push(video);
      });
    } catch (e) {
      console.error(`Error following external link ${link}:`, e.message);
    }
  }
  
  results.metadata.extractionMethods.push('external-links');
}

/**
 * Post-process and enhance results
 */
async function postProcessResults(results, config) {
  console.log('⚡ Post-processing results...');
  
  // Deduplicate videos
  const uniqueVideos = [];
  const urlSet = new Set();
  
  for (const video of results.videos) {
    if (!urlSet.has(video.url)) {
      urlSet.add(video.url);
      
      // Enhance video metadata
      await enhanceVideoMetadata(video);
      
      // Validate video
      if (isValidVideo(video, config)) {
        uniqueVideos.push(video);
      }
    }
  }
  
  results.videos = uniqueVideos;
  results.metadata.totalFound = uniqueVideos.length;
  results.metadata.extractionMethods = [...new Set(results.metadata.extractionMethods)];
}

/**
 * Enhance video metadata based on URL patterns
 */
async function enhanceVideoMetadata(video) {
  try {
    const urlObj = new URL(video.url);
    const hostname = urlObj.hostname.toLowerCase();
    
    if (hostname.includes('youtube')) {
      const videoId = urlObj.searchParams.get('v') || urlObj.pathname.split('/').pop();
      if (videoId) {
        video.videoId = videoId;
        video.thumbnailUrl = video.thumbnailUrl || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        video.sourceWebsite = 'YouTube';
        video.type = 'embedded';
      }
    } else if (hostname.includes('vimeo')) {
      const videoId = urlObj.pathname.split('/').filter(Boolean).pop();
      if (videoId && !isNaN(videoId)) {
        video.videoId = videoId;
        video.sourceWebsite = 'Vimeo';
        video.type = 'embedded';
      }
    } else if (hostname.includes('dailymotion')) {
      const match = urlObj.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
      if (match) {
        video.videoId = match[1];
        video.sourceWebsite = 'Dailymotion';
        video.type = 'embedded';
      }
    }
  } catch (e) {
    // Skip enhancement on error
  }
}

/**
 * Utility functions
 */
function resolveUrl(url, baseUrl) {
  try {
    return new URL(url, baseUrl).toString();
  } catch (e) {
    return url;
  }
}

function extractTitle($el, domain, fallback) {
  return $el.attr('title') || 
         $el.attr('alt') || 
         $el.text().trim() || 
         $el.closest('[title]').attr('title') ||
         `${fallback} from ${domain}`;
}

function extractVideoAttributes($el) {
  const attrs = {};
  const relevantAttrs = ['width', 'height', 'duration', 'controls', 'autoplay', 'loop', 'muted'];
  
  relevantAttrs.forEach(attr => {
    const value = $el.attr(attr);
    if (value !== undefined) {
      attrs[attr] = value;
    }
  });
  
  return attrs;
}

function extractIframeAttributes($el) {
  const attrs = {};
  const relevantAttrs = ['width', 'height', 'frameborder', 'allowfullscreen'];
  
  relevantAttrs.forEach(attr => {
    const value = $el.attr(attr);
    if (value !== undefined) {
      attrs[attr] = value;
    }
  });
  
  return attrs;
}

function extractThumbnailFromIframe($el, src) {
  // Try to get thumbnail from iframe data attributes
  const thumb = $el.attr('data-thumb') || $el.attr('data-thumbnail') || $el.attr('data-poster');
  if (thumb) return thumb;
  
  // Generate thumbnail for known services
  if (src.includes('youtube.com/embed/')) {
    const videoId = src.split('/embed/')[1].split('?')[0];
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  
  return '';
}

function extractServiceFromUrl(url) {
  const hostname = new URL(url).hostname.toLowerCase();
  
  if (hostname.includes('youtube')) return 'YouTube';
  if (hostname.includes('vimeo')) return 'Vimeo';
  if (hostname.includes('dailymotion')) return 'Dailymotion';
  if (hostname.includes('twitch')) return 'Twitch';
  if (hostname.includes('facebook')) return 'Facebook';
  if (hostname.includes('instagram')) return 'Instagram';
  
  return hostname;
}

function isVideoIframe(src) {
  const videoServices = [
    'youtube.com/embed', 'youtu.be', 'vimeo.com', 'dailymotion.com',
    'twitch.tv', 'facebook.com/plugins/video', 'instagram.com/p'
  ];
  
  return videoServices.some(service => src.includes(service));
}

function isVideoLink(href, extensions) {
  const url = href.toLowerCase();
  return extensions.some(ext => url.includes(ext.toLowerCase()));
}

function isValidVideo(video, config) {
  if (!video.url) return false;
  
  // Check minimum duration if specified
  if (config.minVideoDuration > 0 && video.metadata?.duration) {
    const duration = parseFloat(video.metadata.duration);
    if (duration < config.minVideoDuration) return false;
  }
  
  // Check file size if specified (would need additional request)
  // This could be implemented with HEAD requests if needed
  
  return true;
}

/**
 * Auto-scroll the page to trigger lazy loading and infinite scroll
 */
async function autoScroll(page) {
  console.log('📜 Auto-scrolling to load more content...');

  try {
    // First scroll gradually to trigger loading of initial content
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let totalHeight = 0;
        const distance = 300; // Increased scroll distance for faster loading
        const scrollInterval = setInterval(() => {
          const scrollHeight = document.body.scrollHeight;
          window.scrollBy(0, distance);
          totalHeight += distance;

          // Stop scrolling if we've reached bottom or a reasonable limit
          if (totalHeight >= scrollHeight || totalHeight > 30000) {
            clearInterval(scrollInterval);
            resolve();
          }
        }, 100);
      });
    });

    // Wait for any new content to load
    await page.waitForTimeout(1000);

    // Try to detect infinite scroll and load more content
    console.log('🔄 Attempting to load more content via infinite scrolling...');

    // Scroll multiple times with pauses to load content
    for (let i = 0; i < 5; i++) {
      // Scroll to bottom
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

      // Wait for possible new content to load
      await page.waitForTimeout(2000);

      // Check if page height increased (indicates infinite scroll loaded more content)
      const heightChanged = await page.evaluate(() => {
        const lastHeight = window.lastScrollHeight || 0;
        const currentHeight = document.body.scrollHeight;
        window.lastScrollHeight = currentHeight;
        return currentHeight > lastHeight;
      });

      if (!heightChanged && i > 1) {
        console.log('📋 No more content loaded, stopping scroll');
        break;
      }

      console.log(`📋 Scroll iteration ${i + 1} completed`);
    }

    // Look for and click "load more" or "show more" buttons
    await clickLoadMoreButtons(page);

    console.log('📜 Auto-scrolling completed');
  } catch (error) {
    console.error('⚠️ Error during auto-scrolling:', error.message);
  }
}

/**
 * Click "load more" or "show more" buttons to reveal more videos
 */
async function clickLoadMoreButtons(page) {
  try {
    // Common selectors for "load more" buttons
    const loadMoreSelectors = [
      // Common text-based buttons
      'button:has-text("Load more")',
      'button:has-text("Show more")',
      'button:has-text("View more")',
      'button:has-text("See more")',
      'a:has-text("Load more")',
      'a:has-text("Show more")',
      'a:has-text("View more")',
      'a:has-text("See more")',

      // Common class-based selectors
      '[class*="load-more"]',
      '[class*="show-more"]',
      '[class*="view-more"]',
      '[class*="see-more"]',
      '[class*="pagination"]',

      // Common id-based selectors
      '#load-more',
      '#show-more',
      '#view-more',
      '#see-more',

      // YouTube-specific
      'ytd-continuation-item-renderer',
      'button[aria-label="Load more"]',
      'paper-button#more',

      // Common generic selectors
      '.more',
      '.load',
      '.next',
      '.pagination__next'
    ];

    // Try each selector
    for (const selector of loadMoreSelectors) {
      try {
        const button = await page.$(selector);
        if (button) {
          console.log(`🖱️ Clicking "load more" button: ${selector}`);

          // Check if button is visible and enabled
          const isVisible = await button.isVisible();
          if (!isVisible) continue;

          // Click the button
          await button.click();

          // Wait for new content to load
          await page.waitForTimeout(2000);

          // Attempt one more scroll to ensure content is rendered
          await page.evaluate(() => window.scrollBy(0, 500));
          await page.waitForTimeout(1000);

          // If we successfully clicked a button, break the loop
          break;
        }
      } catch (e) {
        // Ignore errors from individual button attempts
      }
    }
  } catch (error) {
    console.error('⚠️ Error clicking load more buttons:', error.message);
  }
}

/**
 * Setup request interception to block ads and tracking
 */
async function setupRequestInterception(page) {
  await page.route('**/*', route => {
    const url = route.request().url();
    const resourceType = route.request().resourceType();

    // Block common ad networks and tracking
    if (
      url.includes('doubleclick.net') ||
      url.includes('googleadservices.com') ||
      url.includes('googlesyndication.com') ||
      url.includes('adservice') ||
      url.includes('analytics') ||
      url.includes('tracker') ||
      url.includes('pixel.gif')
    ) {
      return route.abort();
    }

    // Block unnecessary resource types
    if (['font', 'image', 'stylesheet'].includes(resourceType)) {
      // Allow images for video thumbnails
      if (resourceType === 'image' && (
        url.includes('poster') ||
        url.includes('thumbnail') ||
        url.includes('preview')
      )) {
        return route.continue();
      }
      return route.abort();
    }

    return route.continue();
  });
}

/**
 * Dismiss common overlays like cookie notices, GDPR banners, etc.
 */
async function dismissCommonOverlays(page) {
  // Common selectors for cookie/GDPR banners
  const overlaySelectors = [
    // Cookie consent buttons
    'button[id*="cookie"], button[class*="cookie"]',
    'button[id*="consent"], button[class*="consent"]',
    'button[id*="accept"], button[class*="accept"]',
    'button[id*="agree"], button[class*="agree"]',
    // GDPR related
    'button[id*="gdpr"], button[class*="gdpr"]',
    'button[id*="privacy"], button[class*="privacy"]',
    // Common button text
    'button:has-text("Accept")',
    'button:has-text("Accept All")',
    'button:has-text("Agree")',
    'button:has-text("I agree")',
    'button:has-text("Close")',
    'button:has-text("Got it")',
    // Common banner classes
    'div[class*="cookie-banner"] button',
    'div[class*="gdpr-banner"] button',
    'div[id*="cookie-banner"] button',
    'div[class*="consent-banner"] button',
    // Close buttons
    'button.close',
    'span.close',
    '.modal-close',
    '.dialog-close'
  ];

  // Try to dismiss each type of overlay
  for (const selector of overlaySelectors) {
    try {
      const button = await page.$(selector);
      if (button) {
        console.log(`🍪 Dismissing overlay with selector: ${selector}`);
        await button.click().catch(() => { });
      }
    } catch (error) {
      // Ignore errors from overlay dismissal attempts
    }
  }
}

/**
 * Handle age verification popups and screens
 */
async function handleAgeVerification(page) {
  // Common age verification selectors
  const ageVerificationSelectors = [
    // Common age verification buttons
    'button:has-text("I am 18")',
    'button:has-text("I am over 18")',
    'button:has-text("Yes, I am over")',
    'button:has-text("Enter")',
    'button:has-text("Enter Site")',
    'button:has-text("Continue")',
    // Common age verification form elements
    'form[action*="age"] button[type="submit"]',
    'input[name*="confirm"][type="checkbox"]',
    'input[name*="age"][type="checkbox"]',
    'select[name*="day"]',
    'select[name*="month"]',
    'select[name*="year"]'
  ];

  // Try each age verification selector
  for (const selector of ageVerificationSelectors) {
    try {
      const element = await page.$(selector);
      if (element) {
        console.log(`🔞 Handling age verification with selector: ${selector}`);

        // Handle checkboxes
        if (await element.getAttribute('type') === 'checkbox') {
          await element.check().catch(() => { });
        }
        // Handle date selectors
        else if (await element.tagName() === 'SELECT') {
          const name = await element.getAttribute('name');
          if (name.includes('day')) {
            await element.selectOption('1').catch(() => { });
          } else if (name.includes('month')) {
            await element.selectOption('1').catch(() => { });
          } else if (name.includes('year')) {
            await element.selectOption('1990').catch(() => { });
          }
        }
        // Handle buttons
        else {
          await element.click().catch(() => { });
        }
      }
    } catch (error) {
      // Ignore errors from age verification attempts
    }
  }
}

/**
 * Click play buttons to reveal video sources
 */
async function clickPlayButtons(page) {
  // Common play button selectors
  const playButtonSelectors = [
    '.play-button',
    '.video-play',
    '.play-icon',
    '.ytp-play-button',
    'button:has-text("Play")',
    'button[aria-label="Play"]',
    'button[title="Play"]',
    'svg[aria-label="Play"]',
    '.vjs-big-play-button',
    '.plyr__control--play',
    '.jwplayer .jw-icon-display'
  ];

  // Try to click each type of play button
  for (const selector of playButtonSelectors) {
    try {
      const buttons = await page.$$(selector);
      if (buttons.length > 0) {
        console.log(`▶️ Clicking play button with selector: ${selector}`);
        for (const button of buttons) {
          await button.click().catch(() => { });
        }
        // Wait a bit for video to start loading
        await setTimeout(1000);
      }
    } catch (error) {
      // Ignore errors from button clicking attempts
    }
  }
}

/**
 * Generate a safe filename from URL
 */
function generateFilename(url) {
  const urlObj = new URL(url);
  const hash = crypto.createHash('md5').update(url).digest('hex').substring(0, 8);
  const hostname = urlObj.hostname.replace(/[^a-zA-Z0-9]/g, '_');
  return `${hostname}_${hash}`;
}

/**
 * Dynamic video extraction using Playwright headless browser
 * Handles JavaScript-rendered content and dynamic loading
 * @param {string} url - The URL of the webpage
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} - Result object with videos and metadata
 */
async function extractVideosWithPlaywright(url, options = {}) {
  let browser = null;
  let context = null;
  let page = null;

  try {
    console.log(`🎭 Starting Playwright extraction for: ${url}`);

    // Configure Playwright options
    const playwrightOptions = {
      headless: true,
      ...options.playwrightOptions
    };

    // Configure viewport
    const viewportOptions = {
      width: 1920,
      height: 1080,
      ...options.viewport
    };

    // Pagination and video count options
    const paginationOptions = {
      maxPages: options.maxPages || 1, // Default to 1 page if not specified
      maxVideos: options.maxVideos || 500, // Default to 500 videos if not specified
      currentPage: 1,
      videosFound: 0,
      paginationClicked: false
    };

    console.log(`📄 Pagination settings: max pages = ${paginationOptions.maxPages}, max videos = ${paginationOptions.maxVideos}`);

    // Set up device emulation if mobile browser is selected
    if (options.browser === 'mobile') {
      console.log('📱 Using mobile device emulation');
      browser = await chromium.launch(playwrightOptions);
      context = await browser.newContext({
        ...chromium.devices['iPhone 13'],
        locale: 'en-US'
      });
    } else {
      // Launch browser with appropriate user agent
      browser = await chromium.launch(playwrightOptions);
      context = await browser.newContext({
        viewport: viewportOptions,
        userAgent: options.userAgent,
        locale: 'en-US'
      });
    }

    // Create page and configure it
    page = await context.newPage();

    // Handle JavaScript dialogs automatically
    page.on('dialog', async dialog => {
      console.log(`🔔 Auto-dismissing dialog: ${dialog.message()}`);
      await dialog.dismiss();
    });

    // Configure request interception for performance and to avoid unnecessary requests
    if (options.blockAds) {
      await setupRequestInterception(page);
    }

    // Set up console logging
    page.on('console', msg => {
      if (options.debug && ['error', 'warning'].includes(msg.type())) {
        console.log(`🌐 Browser console ${msg.type()}: ${msg.text()}`);
      }
    });

    // Initial page load with timeout
    console.log(`📄 Loading page: ${url}`);
    await page.goto(url, {
      waitUntil: 'domcontentloaded',
      timeout: options.timeout || 30000
    });

    // Wait for network to be idle (no requests for at least 500ms)
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.log('⚠️ Network never reached idle state, continuing anyway');
    });

    // Allow additional time for JavaScript to execute and dynamic content to load
    console.log('⏳ Waiting for dynamic content to load...');
    await setTimeout(options.additionalWaitTime || 2000);

    // Determine if this is a video platform and handle accordingly
    const domain = new URL(url).hostname.toLowerCase();
    const isPlatform = isVideoPlatform(domain);
    const platformType = getVideoPlatformType(domain);

    // Initialize results object to store videos from all pages
    let allResults = {
      url: url,
      domain: domain,
      isAdultContent: await detectAdultContent(url),
      videos: [],
      metadata: {
        pageTitle: await page.title(),
        scanTimestamp: new Date().toISOString(),
        extractionMethods: [],
        pagination: {
          totalPages: 1,
          pagesScanned: 1
        }
      }
    };

    // Process current page and subsequent pages based on pagination settings
    while (paginationOptions.currentPage <= paginationOptions.maxPages) {
      console.log(`📃 Processing page ${paginationOptions.currentPage} of ${paginationOptions.maxPages}`);

      // Try to dismiss cookie banners, GDPR notices, and other common overlays
      await dismissCommonOverlays(page);

      // Accept age verification if needed
      if (options.ageVerification) {
        await handleAgeVerification(page);
      }

      // Click play buttons if needed to reveal video sources
      await clickPlayButtons(page);

      // Scroll through the page to trigger lazy loading
      if (options.scrollPage) {
        console.log('📜 Scrolling page to trigger lazy loading...');
        await autoScroll(page);
      }

      // Extract all video sources from current page
      console.log('🔍 Extracting video sources...');
      let pageResults = await extractVideoSources(page, url, options);

      // For known video platforms, extract related videos too
      if (isPlatform) {
        console.log(`🎬 Detected video platform: ${platformType}`);

        // Extract platform-specific related videos
        const relatedVideos = await extractPlatformVideos(page, url, platformType, options);

        if (relatedVideos && relatedVideos.length > 0) {
          console.log(`✅ Extracted ${relatedVideos.length} platform-specific videos`);

          // Add platform videos to results
          pageResults.videos = [...pageResults.videos, ...relatedVideos];
          pageResults.metadata.extractionMethods.push(`${platformType}-platform`);
        }
      }
      // If not a known platform but seems to be a page with multiple videos
      else if (pageResults.videos.length > 0) {
        // Try to extract more videos by scrolling and looking for video containers
        const additionalVideos = await extractMultipleVideos(page, url, pageResults, options);

        if (additionalVideos && additionalVideos.length > 0) {
          console.log(`✅ Extracted ${additionalVideos.length} additional videos from containers`);

          // Add additional videos to results
          pageResults.videos = [...pageResults.videos, ...additionalVideos];
          pageResults.metadata.extractionMethods.push('video-containers');
        }
      }

      // Add current page results to all results
      allResults.videos = [...allResults.videos, ...pageResults.videos];
      allResults.metadata.extractionMethods = [
        ...allResults.metadata.extractionMethods,
        ...pageResults.metadata.extractionMethods
      ];

      // Update pagination status
      allResults.metadata.pagination.pagesScanned = paginationOptions.currentPage;

      // Check if we've reached max videos limit
      paginationOptions.videosFound = allResults.videos.length;
      if (paginationOptions.videosFound >= paginationOptions.maxVideos) {
        console.log(`🛑 Reached maximum videos limit (${paginationOptions.maxVideos}), stopping pagination`);
        break;
      }

      // Move to next page if we haven't reached the max
      if (paginationOptions.currentPage < paginationOptions.maxPages) {
        console.log('⏭️ Attempting to navigate to next page...');

        // Try to find and click pagination element
        const navigatedToNextPage = await navigateToNextPage(page, platformType);

        if (navigatedToNextPage) {
          console.log('✅ Successfully navigated to next page');
          paginationOptions.currentPage++;
          paginationOptions.paginationClicked = true;

          // Wait for new page to load
          await page.waitForLoadState('domcontentloaded');
          await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => { });
          await setTimeout(2000);
        } else {
          console.log('⚠️ Could not find next page navigation, stopping pagination');
          break;
        }
      } else {
        // We've reached the max pages to scan
        break;
      }
    }

    // Update final pagination metadata
    allResults.metadata.pagination.totalPages = paginationOptions.currentPage;

    // Limit to maximum number of videos
    if (allResults.videos.length > paginationOptions.maxVideos) {
      console.log(`⚠️ Limiting results to ${paginationOptions.maxVideos} videos (found ${allResults.videos.length})`);
      allResults.videos = allResults.videos.slice(0, paginationOptions.maxVideos);
    }

    // Remove duplicate extractionMethods
    allResults.metadata.extractionMethods = [...new Set(allResults.metadata.extractionMethods)];

    // Post-process results (deduplicate, enhance metadata)
    await postProcessResults(allResults, options);

    // Log extraction results
    console.log(`🎉 Total videos extracted: ${allResults.videos.length} from ${allResults.metadata.pagination.pagesScanned} pages`);

    

    return allResults;
  } catch (error) {
    console.error('❌ Playwright extraction error:', error);
    throw error;
  } finally {
    // Clean up resources
    if (page) await page.close().catch(() => { });
    if (context) await context.close().catch(() => { });
    if (browser) await browser.close().catch(() => { });
    console.log('🎭 Playwright extraction completed');
  }
}

/**
 * Extract all video sources from the page
 */
async function extractVideoSources(page, baseUrl, options) {
  const pageUrl = new URL(baseUrl);
  const domain = pageUrl.hostname;

  // Initialize results object
  const results = {
    url: baseUrl,
    domain,
    isAdultContent: await detectAdultContent(baseUrl),
    videos: [],
    metadata: {
      pageTitle: await page.title(),
      scanTimestamp: new Date().toISOString(),
      extractionMethods: []
    }
  };

  try {
    // 1. Extract from video elements
    await extractFromVideoElements(page, results, options);

    // 2. Extract from iframes
    await extractFromIframes(page, results, options);

    // 3. Extract from network requests
    await extractFromNetworkRequests(page, results, options);

    // 4. Extract from HTML5 media elements
    await extractFromMediaElements(page, results, options);

    // 5. Extract from video players
    await extractFromVideoPlayers(page, results, options);

    // 6. Extract from JavaScript variables
    await extractFromJavaScript(page, results, options);

    // 7. Extract from media source extensions
    await extractFromMSE(page, results, options);

    // 8. Extract using adult-specific patterns (if adult content detected)
    if (results.isAdultContent) {
      await extractFromAdultSitePatternsPlaywright(page, results, options);
    }

    // 9. Post-process results (deduplicate, enhance metadata)
    await postProcessResults(results, options);

    return results;
  } catch (error) {
    console.error('Error extracting video sources:', error);
    return results;
  }
}

/**
 * Extract videos from HTML5 video elements
 */
async function extractFromVideoElements(page, results, options) {
  console.log('🎬 Extracting from video elements...');

  // Get all video elements
  const videos = await page.evaluate(() => {
    const videoElements = Array.from(document.querySelectorAll('video'));
    return videoElements.map(video => {
      // Get all sources
      const sources = Array.from(video.querySelectorAll('source'))
        .map(source => ({
          src: source.src,
          type: source.type || ''
        }))
        .filter(source => source.src);

      // Also check the video element itself for src
      if (video.src) {
        sources.push({
          src: video.src,
          type: video.getAttribute('type') || ''
        });
      }

      // Get metadata
      return {
        sources,
        poster: video.poster || '',
        width: video.videoWidth || video.width || 0,
        height: video.videoHeight || video.height || 0,
        duration: video.duration || 0,
        controls: video.controls,
        autoplay: video.autoplay,
        muted: video.muted,
        loop: video.loop,
        className: video.className,
        id: video.id,
        parent: video.parentElement ? {
          className: video.parentElement.className,
          id: video.parentElement.id
        } : null
      };
    });
  });

  // Process each video element
  for (const video of videos) {
    for (const source of video.sources) {
      try {
        const videoUrl = new URL(source.src, results.url).toString();

        // Check if it's a valid video URL
        if (isVideoLink(videoUrl, options.fileExtensions)) {
          const videoTitle = await extractVideoTitle(page, video) || `Video from ${results.domain}`;

          results.videos.push({
            url: videoUrl,
            title: videoTitle,
            thumbnailUrl: video.poster || '',
            sourceWebsite: results.domain,
            foundBy: 'video-element',
            type: 'direct',
            attributes: {
              width: video.width,
              height: video.height,
              duration: video.duration,
              mimeType: source.type
            },
            quality: determineVideoQuality(video.width, video.height)
          });
        }
      } catch (error) {
        // Skip invalid URLs
      }
    }
  }

  results.metadata.extractionMethods.push('video-elements');
}

/**
 * Extract videos from iframes
 */
async function extractFromIframes(page, results, options) {
  console.log('🖼️ Extracting from iframes...');

  // Get all iframes
  const iframes = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('iframe'))
      .map(iframe => ({
        src: iframe.src,
        width: iframe.width,
        height: iframe.height,
        title: iframe.title,
        id: iframe.id,
        className: iframe.className,
        sandbox: iframe.getAttribute('sandbox') || ''
      }))
      .filter(iframe => iframe.src);
  });

  // Check each iframe for video content
  for (const iframe of iframes) {
    try {
      const iframeSrc = new URL(iframe.src, results.url).toString();

      // Check if it's a known video platform
      if (isVideoIframe(iframeSrc)) {
        const videoData = await extractFromVideoIframe(iframeSrc);

        if (videoData) {
          results.videos.push({
            url: iframeSrc,
            title: iframe.title || videoData.title || `Embedded video from ${extractServiceFromUrl(iframeSrc)}`,
            thumbnailUrl: videoData.thumbnailUrl || '',
            sourceWebsite: extractServiceFromUrl(iframeSrc),
            foundBy: 'iframe-element',
            type: 'embedded',
            attributes: {
              width: iframe.width,
              height: iframe.height,
              platform: extractServiceFromUrl(iframeSrc)
            },
            videoId: videoData.videoId
          });
        }
      }
    } catch (error) {
      // Skip invalid iframe URLs
    }
  }

  results.metadata.extractionMethods.push('iframe-elements');
}

/**
 * Extract videos from network requests
 */
async function extractFromNetworkRequests(page, results, options) {
  console.log('🌐 Extracting from network requests...');

  // Start monitoring network requests
  const videoRequests = [];

  // Set up request monitoring
  await page.route('**/*.+(mp4|webm|m3u8|mpd)', route => {
    const request = route.request();
    const url = request.url();

    videoRequests.push({
      url,
      resourceType: request.resourceType(),
      headers: request.headers()
    });

    route.continue();
  });

  // Extra time to ensure we catch late-loading videos
  await setTimeout(1000);

  // Process the captured requests
  for (const request of videoRequests) {
    try {
      // For HLS and DASH, we need special handling
      if (request.url.includes('.m3u8')) {
        results.videos.push({
          url: request.url,
          title: `HLS Stream from ${results.domain}`,
          thumbnailUrl: '',
          sourceWebsite: results.domain,
          foundBy: 'network-request',
          type: 'hls-stream',
          format: 'hls'
        });
      } else if (request.url.includes('.mpd')) {
        results.videos.push({
          url: request.url,
          title: `DASH Stream from ${results.domain}`,
          thumbnailUrl: '',
          sourceWebsite: results.domain,
          foundBy: 'network-request',
          type: 'dash-stream',
          format: 'dash'
        });
      } else {
        // For direct video files
        results.videos.push({
          url: request.url,
          title: `Video from ${results.domain}`,
          thumbnailUrl: '',
          sourceWebsite: results.domain,
          foundBy: 'network-request',
          type: 'direct',
          format: request.url.split('.').pop().toLowerCase()
        });
      }
    } catch (error) {
      // Skip problematic requests
    }
  }

  results.metadata.extractionMethods.push('network-requests');
}

/**
 * Extract from JavaScript variables
 */
async function extractFromJavaScript(page, results, options) {
  console.log('📜 Extracting from JavaScript variables...');

  // Inject a script to find video URLs in JavaScript
  const videoUrls = await page.evaluate((fileExtensions) => {
    const videoUrls = [];
    const scripts = Array.from(document.querySelectorAll('script:not([src])'));

    // Common patterns for video data in JavaScript
    const patterns = [
      /videoUrl['":\s]*['"]([^'"]+)['"]/gi,
      /video_url['":\s]*['"]([^'"]+)['"]/gi,
      /src['":\s]*['"]([^'"]+\.(?:mp4|webm|ogg|mov|avi|mkv|m3u8|mpd))['"]/gi,
      /url['":\s]*['"]([^'"]+\.(?:mp4|webm|ogg|mov|avi|mkv|m3u8|mpd))['"]/gi,
      /mp4['":\s]*['"]([^'"]+)['"]/gi,
      /webm['":\s]*['"]([^'"]+)['"]/gi,
      /"file"['":\s]*['"]([^'"]+)['"]/gi,
      /"sources?"['":\s]*\[[^\]]*['"]([^'"]+)['"]/gi,
      /"hls"['":\s]*['"]([^'"]+)['"]/gi,
      /"dash"['":\s]*['"]([^'"]+)['"]/gi,
      /"stream"['":\s]*['"]([^'"]+)['"]/gi,
      /"m3u8"['":\s]*['"]([^'"]+)['"]/gi,
      /"mpd"['":\s]*['"]([^'"]+)['"]/gi,
      /"contentUrl"['":\s]*['"]([^'"]+)['"]/gi,
      /"playbackUrl"['":\s]*['"]([^'"]+)['"]/gi,
      /"videoSrc"['":\s]*['"]([^'"]+)['"]/gi,
      /"videoUrl"['":\s]*['"]([^'"]+)['"]/gi,
      /"media"['":\s]*['"]([^'"]+)['"]/gi
    ];

    // Function to check if a URL is a video URL
    const isVideoUrl = (url) => {
      if (!url || typeof url !== 'string') return false;

      // Check for streaming formats
      if (url.includes('.m3u8') || url.includes('.mpd')) return true;

      // Check for video file extensions
      return fileExtensions.some(ext => url.toLowerCase().endsWith(ext.toLowerCase()));
    };

    // Extract from script content
    scripts.forEach(script => {
      const content = script.textContent;
      if (!content) return;

      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          if (match[1] && isVideoUrl(match[1])) {
            videoUrls.push({ url: match[1], source: 'script-regex' });
          }
        }
      });

      // Look for common video config objects
      try {
        // JW Player
        if (content.includes('jwplayer') || content.includes('jwConfig')) {
          const jwMatch = content.match(/jwplayer\([^)]*\)\.setup\(\s*\{([^}]+)\}/);
          if (jwMatch && jwMatch[1]) {
            const fileMatch = jwMatch[1].match(/file['":\s]*['"]([^'"]+)['"]/);
            if (fileMatch && fileMatch[1] && isVideoUrl(fileMatch[1])) {
              videoUrls.push({ url: fileMatch[1], source: 'jwplayer' });
            }
          }
        }

        // Video.js
        if (content.includes('videojs') || content.includes('data-setup')) {
          const vjsMatch = content.match(/videojs\([^)]*\)\.src\(\s*['"]([^'"]+)['"]\s*\)/);
          if (vjsMatch && vjsMatch[1] && isVideoUrl(vjsMatch[1])) {
            videoUrls.push({ url: vjsMatch[1], source: 'videojs' });
          }
        }

        // Look for JSON objects containing video data
        const jsonMatches = content.match(/(\{[^{}]*\{[^{}]*\}[^{}]*\})/g);
        if (jsonMatches) {
          jsonMatches.forEach(jsonStr => {
            try {
              const json = JSON.parse(jsonStr);
              if (json.url && isVideoUrl(json.url)) {
                videoUrls.push({ url: json.url, source: 'json-object' });
              } else if (json.src && isVideoUrl(json.src)) {
                videoUrls.push({ url: json.src, source: 'json-object' });
              } else if (json.file && isVideoUrl(json.file)) {
                videoUrls.push({ url: json.file, source: 'json-object' });
              }
            } catch (e) {
              // Invalid JSON, skip
            }
          });
        }
      } catch (e) {
        // Skip errors in JavaScript extraction
      }
    });

    // Look for global variables that might contain video data
    try {
      for (const key in window) {
        if (key.toLowerCase().includes('video') ||
          key.toLowerCase().includes('player') ||
          key.toLowerCase().includes('media')) {

          const value = window[key];
          if (typeof value === 'object' && value !== null) {
            // Look for video URLs in the object
            const jsonStr = JSON.stringify(value);
            fileExtensions.forEach(ext => {
              const regex = new RegExp(`"[^"]*${ext.replace('.', '\\.')}[^"]*"`, 'gi');
              const matches = jsonStr.match(regex);

              if (matches) {
                matches.forEach(match => {
                  const url = match.replace(/"/g, '');
                  if (isVideoUrl(url)) {
                    videoUrls.push({ url, source: `global-${key}` });
                  }
                });
              }
            });
          }
        }
      }
    } catch (e) {
      // Skip errors in global variable extraction
    }

    return videoUrls;
  }, options.fileExtensions);

  // Process found URLs
  for (const item of videoUrls) {
    try {
      const videoUrl = new URL(item.url, results.url).toString();

      results.videos.push({
        url: videoUrl,
        title: `JavaScript Video from ${results.domain}`,
        thumbnailUrl: '',
        sourceWebsite: results.domain,
        foundBy: `javascript-${item.source}`,
        type: getVideoTypeFromUrl(videoUrl),
        format: getVideoFormatFromUrl(videoUrl)
      });
    } catch (error) {
      // Skip invalid URLs
    }
  }

  results.metadata.extractionMethods.push('javascript-variables');
}

/**
 * Extract videos from video players
 */
async function extractFromVideoPlayers(page, results, options) {
  console.log('🎮 Extracting from video players...');

  // Common video player selectors
  const playerSelectors = {
    jwplayer: '.jwplayer',
    videojs: '.video-js',
    plyr: '.plyr',
    mediaelement: '.mejs__container',
    flowplayer: '.flowplayer',
    dplayer: '.dplayer',
    clappr: '.clappr-player',
    bitmovin: '.bitmovin-player',
    shaka: 'shaka-player',
    dash: 'dash-player',
    html5: '.html5-video-container'
  };

  // Check for each player type
  for (const [player, selector] of Object.entries(playerSelectors)) {
    const playerElements = await page.$$(selector);

    if (playerElements.length > 0) {
      console.log(`Found ${playerElements.length} ${player} players`);

      // Detect videos with player-specific methods
      switch (player) {
        case 'jwplayer':
          await extractFromJWPlayer(page, results);
          break;
        case 'videojs':
          await extractFromVideoJS(page, results);
          break;
        case 'plyr':
          await extractFromPlyr(page, results);
          break;
        default:
          // Generic extraction for other players
          await extractFromGenericPlayer(page, selector, player, results);
      }
    }
  }

  results.metadata.extractionMethods.push('video-players');
}

/**
 * Extract videos from JWPlayer
 */
async function extractFromJWPlayer(page, results) {
  const jwPlayerData = await page.evaluate(() => {
    if (!window.jwplayer) return null;

    const data = [];

    try {
      // Get all jwplayer instances
      const players = jwplayer();

      if (players) {
        // If players is an array
        if (Array.isArray(players)) {
          players.forEach(player => {
            try {
              const config = player.getConfig();
              const playlistItem = player.getPlaylistItem();

              data.push({
                file: playlistItem?.file || config?.file,
                title: playlistItem?.title || config?.title,
                image: playlistItem?.image || config?.image,
                sources: playlistItem?.sources || config?.sources,
                tracks: playlistItem?.tracks || config?.tracks
              });
            } catch (e) {
              // Skip errors in individual player extraction
            }
          });
        }
        // If single player
        else {
          try {
            const config = players.getConfig();
            const playlistItem = players.getPlaylistItem();

            data.push({
              file: playlistItem?.file || config?.file,
              title: playlistItem?.title || config?.title,
              image: playlistItem?.image || config?.image,
              sources: playlistItem?.sources || config?.sources,
              tracks: playlistItem?.tracks || config?.tracks
            });
          } catch (e) {
            // Skip errors in player extraction
          }
        }
      }
    } catch (e) {
      // Return empty data on error
    }

    return data;
  });

  if (jwPlayerData && jwPlayerData.length > 0) {
    for (const player of jwPlayerData) {
      // Process direct file
      if (player.file) {
        try {
          const videoUrl = new URL(player.file, results.url).toString();

          results.videos.push({
            url: videoUrl,
            title: player.title || `JWPlayer Video from ${results.domain}`,
            thumbnailUrl: player.image || '',
            sourceWebsite: results.domain,
            foundBy: 'jwplayer',
            type: getVideoTypeFromUrl(videoUrl),
            format: getVideoFormatFromUrl(videoUrl)
          });
        } catch (error) {
          // Skip invalid URLs
        }
      }

      // Process sources array
      if (player.sources && Array.isArray(player.sources)) {
        for (const source of player.sources) {
          if (source.file || source.src) {
            try {
              const videoUrl = new URL(source.file || source.src, results.url).toString();

              results.videos.push({
                url: videoUrl,
                title: player.title || `JWPlayer Video from ${results.domain}`,
                thumbnailUrl: player.image || '',
                sourceWebsite: results.domain,
                foundBy: 'jwplayer-sources',
                type: getVideoTypeFromUrl(videoUrl),
                format: getVideoFormatFromUrl(videoUrl),
                quality: source.label || determineQualityFromVideoUrl(videoUrl),
                attributes: {
                  mimeType: source.type || '',
                  width: source.width || 0,
                  height: source.height || 0
                }
              });
            } catch (error) {
              // Skip invalid URLs
            }
          }
        }
      }
    }
  }
}

/**
 * Extract videos from Video.js player
 */
async function extractFromVideoJS(page, results) {
  const videojsData = await page.evaluate(() => {
    if (!window.videojs) return null;

    const data = [];

    try {
      // Get all video.js players
      const players = videojs.getPlayers();

      if (players) {
        for (const [id, player] of Object.entries(players)) {
          if (player && typeof player.currentSrc === 'function') {
            const src = player.currentSrc();
            const poster = player.poster();
            const duration = player.duration();

            // Try to get sources
            let sources = [];
            if (typeof player.options_ === 'object' && player.options_.sources) {
              sources = player.options_.sources;
            }

            data.push({
              id,
              src,
              poster,
              duration,
              sources,
              width: player.width(),
              height: player.height(),
              title: player.options_?.title || document.title
            });
          }
        }
      }
    } catch (e) {
      // Return empty data on error
    }

    return data;
  });

  if (videojsData && videojsData.length > 0) {
    for (const player of videojsData) {
      // Process direct source
      if (player.src) {
        try {
          const videoUrl = new URL(player.src, results.url).toString();

          results.videos.push({
            url: videoUrl,
            title: player.title || `Video.js Video from ${results.domain}`,
            thumbnailUrl: player.poster || '',
            sourceWebsite: results.domain,
            foundBy: 'videojs',
            type: getVideoTypeFromUrl(videoUrl),
            format: getVideoFormatFromUrl(videoUrl),
            attributes: {
              width: player.width,
              height: player.height,
              duration: player.duration
            },
            quality: determineVideoQuality(player.width, player.height)
          });
        } catch (error) {
          // Skip invalid URLs
        }
      }

      // Process sources array
      if (player.sources && Array.isArray(player.sources)) {
        for (const source of player.sources) {
          if (source.src) {
            try {
              const videoUrl = new URL(source.src, results.url).toString();

              results.videos.push({
                url: videoUrl,
                title: player.title || `Video.js Video from ${results.domain}`,
                thumbnailUrl: player.poster || '',
                sourceWebsite: results.domain,
                foundBy: 'videojs-sources',
                type: getVideoTypeFromUrl(videoUrl),
                format: getVideoFormatFromUrl(videoUrl),
                attributes: {
                  mimeType: source.type || '',
                  width: player.width,
                  height: player.height,
                  duration: player.duration
                }
              });
            } catch (error) {
              // Skip invalid URLs
            }
          }
        }
      }
    }
  }
}

/**
 * Extract videos from Plyr player
 */
async function extractFromPlyr(page, results) {
  const plyrData = await page.evaluate(() => {
    if (!window.Plyr) return null;

    const data = [];

    try {
      // Find all Plyr containers
      const containers = document.querySelectorAll('.plyr');

      for (const container of containers) {
        // Check for video element
        const videoEl = container.querySelector('video');

        if (videoEl) {
          const sources = Array.from(videoEl.querySelectorAll('source'))
            .map(source => ({
              src: source.src,
              type: source.type || ''
            }))
            .filter(source => source.src);

          // Also check the video element itself for src
          if (videoEl.src) {
            sources.push({
              src: videoEl.src,
              type: videoEl.getAttribute('type') || ''
            });
          }

          data.push({
            sources,
            poster: videoEl.poster || container.querySelector('[data-poster]')?.dataset.poster,
            width: videoEl.videoWidth || videoEl.width || 0,
            height: videoEl.videoHeight || videoEl.height || 0,
            duration: videoEl.duration || 0,
            title: videoEl.title || container.querySelector('.plyr__title')?.textContent?.trim()
          });
        }

        // Check for audio element
        const audioEl = container.querySelector('audio');

        if (audioEl) {
          const sources = Array.from(audioEl.querySelectorAll('source'))
            .map(source => ({
              src: source.src,
              type: source.type || ''
            }))
            .filter(source => source.src);

          // Also check the audio element itself for src
          if (audioEl.src) {
            sources.push({
              src: audioEl.src,
              type: audioEl.getAttribute('type') || ''
            });
          }

          data.push({
            sources,
            isAudio: true,
            duration: audioEl.duration || 0,
            title: audioEl.title || container.querySelector('.plyr__title')?.textContent?.trim()
          });
        }
      }
    } catch (e) {
      // Return empty data on error
    }

    return data;
  });

  if (plyrData && plyrData.length > 0) {
    for (const player of plyrData) {
      // Process sources array
      if (player.sources && Array.isArray(player.sources)) {
        for (const source of player.sources) {
          if (source.src) {
            try {
              const mediaUrl = new URL(source.src, results.url).toString();

              results.videos.push({
                url: mediaUrl,
                title: player.title || `Plyr ${player.isAudio ? 'Audio' : 'Video'} from ${results.domain}`,
                thumbnailUrl: player.poster || '',
                sourceWebsite: results.domain,
                foundBy: 'plyr',
                type: player.isAudio ? 'audio' : getVideoTypeFromUrl(mediaUrl),
                format: player.isAudio ? getAudioFormatFromUrl(mediaUrl) : getVideoFormatFromUrl(mediaUrl),
                attributes: {
                  mimeType: source.type || '',
                  width: player.width,
                  height: player.height,
                  duration: player.duration
                },
                quality: player.isAudio ? null : determineVideoQuality(player.width, player.height)
              });
            } catch (error) {
              // Skip invalid URLs
            }
          }
        }
      }
    }
  }
}

/**
 * Extract from generic player
 */
async function extractFromGenericPlayer(page, selector, playerName, results) {
  // First check for video elements within the player
  const videos = await page.evaluate((selector) => {
    const players = document.querySelectorAll(selector);
    const data = [];

    for (const player of players) {
      // Look for video elements
      const videoElements = player.querySelectorAll('video');

      for (const video of videoElements) {
        // Get all sources
        const sources = Array.from(video.querySelectorAll('source'))
          .map(source => ({
            src: source.src,
            type: source.type || ''
          }))
          .filter(source => source.src);

        // Also check the video element itself for src
        if (video.src) {
          sources.push({
            src: video.src,
            type: video.getAttribute('type') || ''
          });
        }

        if (sources.length > 0) {
          data.push({
            sources,
            poster: video.poster || '',
            width: video.videoWidth || video.width || 0,
            height: video.videoHeight || video.height || 0,
            duration: video.duration || 0
          });
        }
      }

      // Look for data attributes that might contain video URLs
      const dataAttributes = ['data-src', 'data-video', 'data-video-src', 'data-url', 'data-source'];

      for (const attr of dataAttributes) {
        if (player.hasAttribute(attr)) {
          const src = player.getAttribute(attr);
          if (src) {
            data.push({
              sources: [{ src, type: '' }],
              fromAttribute: attr
            });
          }
        }
      }
    }

    return data;
  }, selector);

  // Process results
  for (const video of videos) {
    for (const source of video.sources) {
      try {
        const videoUrl = new URL(source.src, results.url).toString();

        results.videos.push({
          url: videoUrl,
          title: `${playerName} Video from ${results.domain}`,
          thumbnailUrl: video.poster || '',
          sourceWebsite: results.domain,
          foundBy: `generic-player-${playerName}${video.fromAttribute ? `-${video.fromAttribute}` : ''}`,
          type: getVideoTypeFromUrl(videoUrl),
          format: getVideoFormatFromUrl(videoUrl),
          attributes: {
            mimeType: source.type || '',
            width: video.width,
            height: video.height,
            duration: video.duration
          },
          quality: determineVideoQuality(video.width, video.height)
        });
      } catch (error) {
        // Skip invalid URLs
      }
    }
  }
}

/**
 * Extract from a specific video iframe (YouTube, Vimeo, etc.)
 */
async function extractFromVideoIframe(iframeSrc) {
  try {
    const url = new URL(iframeSrc);

    // YouTube
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
      let videoId = '';

      if (url.hostname.includes('youtube.com')) {
        if (url.pathname.startsWith('/embed/')) {
          videoId = url.pathname.split('/embed/')[1].split('/')[0];
        } else if (url.searchParams.has('v')) {
          videoId = url.searchParams.get('v');
        }
      } else if (url.hostname.includes('youtu.be')) {
        videoId = url.pathname.substring(1);
      }

      if (videoId) {
        return {
          videoId,
          title: `YouTube Video: ${videoId}`,
          thumbnailUrl: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`
        };
      }
    }

    // Vimeo
    else if (url.hostname.includes('vimeo.com')) {
      const match = url.pathname.match(/\/(?:video\/)?(\d+)(?:\/|\?|$)/);
      if (match && match[1]) {
        const videoId = match[1];
        return {
          videoId,
          title: `Vimeo Video: ${videoId}`,
          thumbnailUrl: '' // Vimeo requires an API call to get thumbnails
        };
      }
    }

    // Dailymotion
    else if (url.hostname.includes('dailymotion.com')) {
      const match = url.pathname.match(/\/embed\/(?:video\/)?([a-zA-Z0-9]+)(?:\/|\?|$)/);
      if (match && match[1]) {
        const videoId = match[1];
        return {
          videoId,
          title: `Dailymotion Video: ${videoId}`,
          thumbnailUrl: `https://www.dailymotion.com/thumbnail/video/${videoId}`
        };
      }
    }

    // Facebook
    else if (url.hostname.includes('facebook.com')) {
      if (url.pathname.includes('/plugins/video.php')) {
        const videoId = url.searchParams.get('href')?.match(/videos\/(\d+)/)?.[1] || '';
        return {
          videoId,
          title: `Facebook Video: ${videoId}`,
          thumbnailUrl: ''
        };
      }
    }

    // Generic iframe - return minimal data
    return {
      videoId: '',
      title: `Embedded Video from ${url.hostname}`,
      thumbnailUrl: ''
    };
  } catch (e) {
    return null;
  }
}

/**
 * Extract title from video element context
 */
async function extractVideoTitle(page, video) {
  if (!video || !video.id) return null;

  // Try to find title in surrounding elements
  const title = await page.evaluate((videoId) => {
    const videoEl = document.getElementById(videoId);
    if (!videoEl) return null;

    // Check if video has a title attribute
    if (videoEl.title) return videoEl.title;

    // Check for parent elements with possible title indicators
    let current = videoEl.parentElement;
    const depth = 3; // How many levels up to check

    for (let i = 0; i < depth && current; i++) {
      // Check for common title patterns
      const titleEl = current.querySelector('h1, h2, h3, .title, .video-title, [class*="title"], [id*="title"], .video-name, .media-heading');
      if (titleEl && titleEl.textContent.trim()) {
        return titleEl.textContent.trim();
      }

      // Check for figcaption if video is in a figure
      if (current.tagName === 'FIGURE') {
        const caption = current.querySelector('figcaption');
        if (caption && caption.textContent.trim()) {
          return caption.textContent.trim();
        }
      }

      // Move up to parent
      current = current.parentElement;
    }

    return null;
  }, video.id);

  return title;
}

/**
 * Determine video quality based on dimensions
 */
function determineVideoQuality(width, height) {
  if (!width || !height) return 'unknown';

  if (width >= 3840 || height >= 2160) return '4K';
  if (width >= 2560 || height >= 1440) return '1440p';
  if (width >= 1920 || height >= 1080) return '1080p';
  if (width >= 1280 || height >= 720) return '720p';
  if (width >= 854 || height >= 480) return '480p';
  if (width >= 640 || height >= 360) return '360p';

  return 'unknown';
}

/**
 * Determine quality from video URL
 */
function determineQualityFromVideoUrl(url) {
  const qualityMatches = {
    '4k': '4K',
    '2160p': '4K',
    '2160': '4K',
    '1440p': '1440p',
    '1440': '1440p',
    '1080p': '1080p',
    '1080': '1080p',
    'fullhd': '1080p',
    'full-hd': '1080p',
    '720p': '720p',
    '720': '720p',
    'hd': '720p',
    '480p': '480p',
    '480': '480p',
    '360p': '360p',
    '360': '360p',
    '240p': '240p',
    '240': '240p',
    'high': '720p',
    'medium': '480p',
    'low': '360p'
  };

  const urlLower = url.toLowerCase();

  for (const [pattern, quality] of Object.entries(qualityMatches)) {
    if (urlLower.includes(pattern)) {
      return quality;
    }
  }

  return 'unknown';
}

/**
 * Get video type from URL
 */
function getVideoTypeFromUrl(url) {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('.m3u8')) return 'hls-stream';
  if (urlLower.includes('.mpd')) return 'dash-stream';
  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
  if (urlLower.includes('vimeo.com')) return 'vimeo';
  if (urlLower.includes('dailymotion.com')) return 'dailymotion';
  if (urlLower.includes('facebook.com')) return 'facebook';

  // For direct video files
  return 'direct';
}

/**
 * Get video format from URL
 */
function getVideoFormatFromUrl(url) {
  if (url.includes('.m3u8')) return 'hls';
  if (url.includes('.mpd')) return 'dash';

  // Extract file extension
  const extension = url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();

  if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv', 'wmv', 'm4v'].includes(extension)) {
    return extension;
  }

  return 'unknown';
}

/**
 * Get audio format from URL
 */
function getAudioFormatFromUrl(url) {
  const extension = url.split('?')[0].split('#')[0].split('.').pop().toLowerCase();

  if (['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac'].includes(extension)) {
    return extension;
  }

  return 'unknown';
}

/**
 * Check if a URL is a video iframe
 */
function isVideoIframe(url) {
  const videoServices = [
    'youtube.com/embed', 'youtu.be', 'vimeo.com', 'dailymotion.com',
    'twitch.tv', 'facebook.com/plugins/video', 'instagram.com/p'
  ];

  return videoServices.some(service => url.includes(service));
}

/**
 * Extract service name from URL
 */
function extractServiceFromUrl(url) {
  try {
    const hostname = new URL(url).hostname.toLowerCase();

    if (hostname.includes('youtube')) return 'YouTube';
    if (hostname.includes('vimeo')) return 'Vimeo';
    if (hostname.includes('dailymotion')) return 'Dailymotion';
    if (hostname.includes('facebook')) return 'Facebook';
    if (hostname.includes('twitch')) return 'Twitch';
    if (hostname.includes('instagram')) return 'Instagram';
    if (hostname.includes('streamable')) return 'Streamable';

    // Extract domain without TLD
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      return domainParts[domainParts.length - 2].charAt(0).toUpperCase() +
        domainParts[domainParts.length - 2].slice(1);
    }

    return hostname;
  } catch (e) {
    return 'Unknown';
  }
}

/**
 * Check if URL points to a video file
 */
function isVideoLink(url, extensions = []) {
  if (!url) return false;

  const urlLower = url.toLowerCase();

  // Check for streaming formats
  if (urlLower.includes('.m3u8') || urlLower.includes('.mpd')) {
    return true;
  }

  // Check for video hosting platforms
  if (urlLower.includes('youtube.com/watch') ||
    urlLower.includes('youtu.be/') ||
    urlLower.includes('vimeo.com/') ||
    urlLower.includes('dailymotion.com/video')) {
    return true;
  }

  // Default extensions if none provided
  const fileExtensions = extensions.length > 0 ?
    extensions :
    ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v', '.flv', '.wmv'];

  // Check for file extensions
  for (const ext of fileExtensions) {
    if (urlLower.endsWith(ext) || urlLower.includes(`${ext}?`) || urlLower.includes(`${ext}&`)) {
      return true;
    }
  }

  return false;
}

/**
 * Post-process and deduplicate results
 */
async function postProcessResults(results, options) {
  console.log('⚙️ Post-processing results...');

  // Deduplicate videos
  const uniqueVideos = [];
  const urlSet = new Set();

  for (const video of results.videos) {
    // Skip invalid URLs
    if (!video.url) continue;

    // Normalize URL for deduplication
    let normalizedUrl = video.url;

    // Strip query parameters for direct video files to avoid duplicates
    if (video.type === 'direct') {
      const urlObj = new URL(video.url);
      if (['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'].some(ext =>
        urlObj.pathname.endsWith(ext))) {
        normalizedUrl = `${urlObj.origin}${urlObj.pathname}`;
      }
    }

    if (!urlSet.has(normalizedUrl)) {
      urlSet.add(normalizedUrl);

      // Enhance video metadata if possible
      await enhanceVideoMetadata(video);

      // Validate video
      if (isValidVideo(video, options)) {
        uniqueVideos.push(video);
      }
    }
  }

  results.videos = uniqueVideos;
  results.metadata.totalFound = uniqueVideos.length;
  results.metadata.extractionMethods = [...new Set(results.metadata.extractionMethods)];
}

/**
 * Calculate confidence score for a video
 */
function calculateConfidenceScore(video) {
  let score = 0.5; // Base score

  // Adjust based on video type
  if (video.type === 'direct') score += 0.2;
  if (video.type === 'hls-stream' || video.type === 'dash-stream') score += 0.15;
  if (video.type === 'youtube' || video.type === 'vimeo') score += 0.1;

  // Adjust based on extraction method
  if (video.foundBy.includes('video-element')) score += 0.15;
  if (video.foundBy.includes('network-request')) score += 0.15;
  if (video.foundBy.includes('jwplayer') || video.foundBy.includes('videojs')) score += 0.1;
  if (video.foundBy.includes('media-source-extensions')) score += 0.1;
  if (video.foundBy.includes('javascript')) score += 0.05;

  // Adjust based on metadata completeness
  if (video.title && video.title !== `Video from ${video.sourceWebsite}`) score += 0.05;
  if (video.thumbnailUrl) score += 0.05;
  if (video.quality && video.quality !== 'unknown') score += 0.05;

  // Cap score at 1.0
  return Math.min(Math.max(score, 0.1), 1.0);
}

/**
 * Enhance video metadata
 */
function enhanceVideoMetadata(video) {
  // Handle YouTube videos
  if (video.url.includes('youtube.com') || video.url.includes('youtu.be')) {
    // Extract video ID if not already present
    if (!video.videoId) {
      const url = new URL(video.url);

      if (url.hostname.includes('youtube.com')) {
        if (url.pathname.startsWith('/embed/')) {
          video.videoId = url.pathname.split('/embed/')[1].split('/')[0];
        } else if (url.searchParams.has('v')) {
          video.videoId = url.searchParams.get('v');
        }
      } else if (url.hostname.includes('youtu.be')) {
        video.videoId = url.pathname.substring(1);
      }
    }

    // Set platform-specific data
    video.sourceWebsite = 'YouTube';
    video.type = 'youtube';

    // Add thumbnail if not present
    if (video.videoId && !video.thumbnailUrl) {
      video.thumbnailUrl = `https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`;
    }
  }

  // Handle Vimeo videos
  else if (video.url.includes('vimeo.com')) {
    video.sourceWebsite = 'Vimeo';
    video.type = 'vimeo';

    // Extract video ID if not already present
    if (!video.videoId) {
      const match = video.url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      if (match && match[1]) {
        video.videoId = match[1];
      }
    }
  }

  // Handle Dailymotion videos
  else if (video.url.includes('dailymotion.com')) {
    video.sourceWebsite = 'Dailymotion';
    video.type = 'dailymotion';

    // Extract video ID if not already present
    if (!video.videoId) {
      const match = video.url.match(/dailymotion\.com\/(?:embed\/)?(?:video\/)?([a-zA-Z0-9]+)/);
      if (match && match[1]) {
        video.videoId = match[1];

        // Add thumbnail if not present
        if (!video.thumbnailUrl) {
          video.thumbnailUrl = `https://www.dailymotion.com/thumbnail/video/${video.videoId}`;
        }
      }
    }
  }

  // Handle Facebook videos
  else if (video.url.includes('facebook.com')) {
    video.sourceWebsite = 'Facebook';
    video.type = 'facebook';
  }

  // Enhance direct video files
  else if (video.type === 'direct') {
    // Try to determine quality from URL if not already set
    if (!video.quality || video.quality === 'unknown') {
      video.quality = determineQualityFromVideoUrl(video.url);
    }

    // Add format if not present
    if (!video.format) {
      video.format = getVideoFormatFromUrl(video.url);
    }
  }

  // Enhance streaming formats
  else if (video.type === 'hls-stream') {
    video.format = 'hls';
  } else if (video.type === 'dash-stream') {
    video.format = 'dash';
  }

  return video;
}

/**
 * Extract videos from HTML5 media source extensions (MSE)
 */
async function extractFromMSE(page, results, options) {
  console.log('🔄 Extracting from Media Source Extensions...');

  // Inject script to detect MSE usage
  const mseData = await page.evaluate(() => {
    if (!window.MediaSource) return null;

    const data = {
      detected: false,
      sourceBuffers: [],
      mimeTypes: []
    };

    // Check if MediaSource is being used
    if (MediaSource.isTypeSupported) {
      data.detected = true;

      // Check common MIME types
      const commonTypes = [
        'video/mp4; codecs="avc1.42E01E, mp4a.40.2"',
        'video/webm; codecs="vp9, opus"',
        'application/x-mpegURL',
        'application/dash+xml'
      ];

      commonTypes.forEach(type => {
        if (MediaSource.isTypeSupported(type)) {
          data.mimeTypes.push(type);
        }
      });

      // Try to get existing MediaSource objects
      if (document.querySelector('video')) {
        const videoSrc = document.querySelector('video').src;
        if (videoSrc && videoSrc.startsWith('blob:')) {
          data.sourceBuffers.push(videoSrc);
        }
      }
    }

    return data;
  });

  if (mseData && mseData.detected) {
    console.log('MSE detected, streams may be present');

    // If MSE is detected, try to find the manifest URLs from network requests
    // Trigger network monitoring for common streaming formats
    const client = await page.context().newCDPSession(page);
    await client.send('Network.enable');

    // Listen for network requests specifically for streaming manifests
    client.on('Network.requestWillBeSent', request => {
      const url = request.request.url;
      if (url.endsWith('.m3u8') || url.endsWith('.mpd') ||
        url.includes('master.m3u8') || url.includes('manifest.mpd')) {

        try {
          const manifestUrl = new URL(url, results.url).toString();

          // Determine stream type
          const isHLS = url.includes('.m3u8');
          const isDASH = url.includes('.mpd');

          results.videos.push({
            url: manifestUrl,
            title: `${isHLS ? 'HLS' : isDASH ? 'DASH' : 'Streaming'} Video from ${results.domain}`,
            thumbnailUrl: '',
            sourceWebsite: results.domain,
            foundBy: 'media-source-extensions',
            type: isHLS ? 'hls-stream' : isDASH ? 'dash-stream' : 'stream',
            format: isHLS ? 'hls' : isDASH ? 'dash' : 'unknown'
          });
        } catch (error) {
          // Skip invalid URLs
        }
      }
    });

    // Give some time for network requests to be captured
    await setTimeout(2000);

    // If we found MSE but no manifest URLs, add a generic entry
    if (mseData.detected && !results.videos.some(v => v.foundBy === 'media-source-extensions')) {
      results.videos.push({
        url: results.url,
        title: `Streaming Video from ${results.domain}`,
        thumbnailUrl: '',
        sourceWebsite: results.domain,
        foundBy: 'media-source-extensions',
        type: 'adaptive-stream',
        format: 'unknown',
        note: 'Streaming video detected but direct URL not found'
      });
    }
  }

  results.metadata.extractionMethods.push('media-source-extensions');
}

/**
 * Extract from HTML5 media elements (audio/video)
 */
async function extractFromMediaElements(page, results, options) {
  console.log('🎵 Extracting from HTML5 media elements...');

  // Extract from audio elements
  const audioElements = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('audio'))
      .map(audio => {
        // Get all sources
        const sources = Array.from(audio.querySelectorAll('source'))
          .map(source => ({
            src: source.src,
            type: source.type || ''
          }))
          .filter(source => source.src);

        // Also check the audio element itself for src
        if (audio.src) {
          sources.push({
            src: audio.src,
            type: audio.getAttribute('type') || ''
          });
        }

        return {
          sources,
          title: audio.title || '',
          id: audio.id,
          className: audio.className
        };
      });
  });

  // Process audio elements
  for (const audio of audioElements) {
    for (const source of audio.sources) {
      try {
        const audioUrl = new URL(source.src, results.url).toString();

        results.videos.push({
          url: audioUrl,
          title: audio.title || `Audio from ${results.domain}`,
          thumbnailUrl: '',
          sourceWebsite: results.domain,
          foundBy: 'audio-element',
          type: 'audio',
          format: getAudioFormatFromUrl(audioUrl),
          attributes: {
            mimeType: source.type
          }
        });
      } catch (error) {
        // Skip invalid URLs
      }
    }
  }

  results.metadata.extractionMethods.push('media-elements');
}

/**
 * Extract from adult sites using Playwright-specific methods
 */
async function extractFromAdultSitePatternsPlaywright(page, results, options) {
  console.log('🔞 Extracting from adult sites using advanced patterns...');

  try {
    // 1. Extract from common adult site video containers
    const adultVideos = await page.evaluate((domain) => {
      const videos = [];
      
      // Adult-specific selectors
      const adultSelectors = [
        '.video-item', '.thumb-item', '.video-block', '.clip-item', '.scene-item',
        '.video-card', '.content-item', '.movie-item', '.gallery-item',
        '[data-video-id]', '[data-preview]', '[data-video-url]', '[data-src]',
        '.preview-video', '.player-container', '.video-player', '.media-player',
        '.thumb', '.thumbnail', '.preview', '.poster', '.cover',
        '.pornstar-video', '.category-video', '.featured-video', '.recommended-video'
      ];
      
      adultSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        
        elements.forEach(el => {
          // Look for video URLs in various attributes
          const videoAttributes = [
            'data-src', 'data-video', 'data-url', 'data-video-url', 'data-video-src',
            'data-preview', 'data-preview-url', 'data-stream', 'data-stream-url',
            'data-mp4', 'data-webm', 'data-hls', 'data-dash', 'data-m3u8',
            'href', 'src'
          ];
          
          let videoUrl = null;
          for (const attr of videoAttributes) {
            const value = el.getAttribute(attr);
            if (value && (value.includes('.mp4') || value.includes('.webm') || 
                         value.includes('.m3u8') || value.includes('.mpd') ||
                         value.includes('stream'))) {
              videoUrl = value;
              break;
            }
          }
          
          // Also check nested elements
          if (!videoUrl) {
            const video = el.querySelector('video');
            if (video) {
              videoUrl = video.src || video.querySelector('source')?.src;
            }
          }
          
          if (videoUrl) {
            // Extract metadata
            const title = el.getAttribute('title') || 
                         el.querySelector('.title, .video-title, .name')?.textContent?.trim() ||
                         el.querySelector('img')?.alt ||
                         `Adult Video from ${domain}`;
            
            const thumbnailUrl = el.querySelector('img')?.src || 
                               el.querySelector('img')?.getAttribute('data-src') ||
                               el.getAttribute('data-thumb') || '';
            
            const duration = el.querySelector('.duration, .time, .length')?.textContent?.trim() ||
                           el.getAttribute('data-duration') || '';
            
            const quality = el.querySelector('.quality, .resolution, .hd')?.textContent?.trim() ||
                          el.getAttribute('data-quality') || '';
            
            const views = el.querySelector('.views, .view-count')?.textContent?.trim() ||
                        el.getAttribute('data-views') || '';
            
            videos.push({
              url: videoUrl,
              title: title,
              thumbnailUrl: thumbnailUrl,
              duration: duration,
              quality: quality,
              views: views,
              foundBy: `adult-playwright:${selector}`,
              extractedFrom: selector
            });
          }
        });
      });
      
      return videos;
    }, results.domain);

    // Process found videos
    for (const video of adultVideos) {
      try {
        const fullUrl = new URL(video.url, results.url).toString();
        const fullThumbnailUrl = video.thumbnailUrl ? 
          new URL(video.thumbnailUrl, results.url).toString() : '';

        results.videos.push({
          url: fullUrl,
          title: video.title,
          thumbnailUrl: fullThumbnailUrl,
          sourceWebsite: results.domain,
          foundBy: video.foundBy,
          type: 'direct',
          isAdultContent: true,
          metadata: {
            duration: video.duration,
            quality: video.quality,
            views: video.views,
            extractedFrom: video.extractedFrom
          }
        });
      } catch (error) {
        // Skip invalid URLs
      }
    }

    // 2. Extract from JavaScript variables specific to adult sites
    const jsVideos = await page.evaluate(() => {
      const videos = [];
      
      // Common adult site JavaScript variable patterns
      const patterns = [
        /video_url['":\s]*['"]([^'"]+)['"]/gi,
        /stream_url['":\s]*['"]([^'"]+)['"]/gi,
        /mp4_url['":\s]*['"]([^'"]+)['"]/gi,
        /hls_url['":\s]*['"]([^'"]+)['"]/gi,
        /preview_url['":\s]*['"]([^'"]+)['"]/gi,
        /file['":\s]*['"]([^'"]+\.(?:mp4|webm|m3u8|mpd))['"]/gi,
        /sources?['":\s]*\[[^\]]*['"]([^'"]+\.(?:mp4|webm|m3u8|mpd))['"]/gi
      ];
      
      // Check all script tags
      const scripts = document.querySelectorAll('script:not([src])');
      scripts.forEach(script => {
        const content = script.textContent;
        if (!content) return;
        
        patterns.forEach(pattern => {
          let match;
          while ((match = pattern.exec(content)) !== null) {
            if (match[1] && (match[1].includes('.mp4') || match[1].includes('.webm') || 
                           match[1].includes('.m3u8') || match[1].includes('.mpd'))) {
              videos.push({
                url: match[1],
                foundBy: 'adult-javascript',
                type: 'streaming'
              });
            }
          }
        });
      });
      
      return videos;
    });

    // Process JavaScript-found videos
    for (const video of jsVideos) {
      try {
        const fullUrl = new URL(video.url, results.url).toString();
        
        results.videos.push({
          url: fullUrl,
          title: `Streaming Video from ${results.domain}`,
          thumbnailUrl: '',
          sourceWebsite: results.domain,
          foundBy: video.foundBy,
          type: video.type,
          isAdultContent: true
        });
      } catch (error) {
        // Skip invalid URLs
      }
    }

    // 3. Try to trigger lazy loading and extract more videos
    await page.evaluate(() => {
      // Scroll to trigger lazy loading
      window.scrollTo(0, document.body.scrollHeight);
      
      // Click on "Load More" buttons if they exist
      const loadMoreButtons = document.querySelectorAll(
        '.load-more, .show-more, .more-videos, .next-page, [data-load-more]'
      );
      loadMoreButtons.forEach(button => {
        if (button.offsetParent !== null) { // Check if visible
          button.click();
        }
      });
    });

    // Wait a bit for content to load
    await page.waitForTimeout(2000);

    results.metadata.extractionMethods.push('adult-site-patterns-playwright');
  } catch (error) {
    console.error('Error in adult site Playwright extraction:', error);
  }
}

/**
 * Validate video against options
 */
function isValidVideo(video, options) {
  if (!video.url) return false;

  // Check minimum duration if specified
  if (options.minVideoDuration > 0 && video.attributes?.duration) {
    const duration = parseFloat(video.attributes.duration);
    if (duration < options.minVideoDuration) return false;
  }

  // Check maximum video size if specified (would need additional request)
  // This could be implemented with HEAD requests if needed

  return true;
}

/**
 * Check if URL is from a known video platform
 */
function isVideoPlatform(domain) {
  return [
    // Mainstream video platforms
    'youtube.com', 'youtu.be',
    'vimeo.com',
    'dailymotion.com',
    'twitch.tv',
    'facebook.com',
    'instagram.com',
    'tiktok.com',
    'twitter.com', 'x.com',
    'reddit.com',
    'netflix.com',
    'hulu.com',
    'vk.com',
    'bilibili.com',
    'nicovideo.jp',
    'ted.com',

    // Adult websites (top 20)
    'pornhub.com',
    'xvideos.com',
    'xnxx.com',
    'xhamster.com',
    'redtube.com',
    'youporn.com',
    'txxx.com',
    'spankbang.com',
    'tube8.com',
    'xvideoslive.com',
    'livejasmin.com',
    'bongacams.com',
    'chaturbate.com',
    'stripchat.com',
    'cam4.com',
    'onlyfans.com',
    'brazzers.com',
    'mydirtyhobby.com',
    'hclips.com',
    'drtuber.com'
  ].some(platform => domain.includes(platform));
}

/**
 * Get video platform type from domain
 */
function getVideoPlatformType(domain) {
  if (domain.includes('youtube.com') || domain.includes('youtu.be')) return 'youtube';
  if (domain.includes('vimeo.com')) return 'vimeo';
  if (domain.includes('dailymotion.com')) return 'dailymotion';
  if (domain.includes('twitch.tv')) return 'twitch';
  if (domain.includes('facebook.com')) return 'facebook';
  if (domain.includes('instagram.com')) return 'instagram';
  if (domain.includes('tiktok.com')) return 'tiktok';
  if (domain.includes('twitter.com') || domain.includes('x.com')) return 'twitter';
  if (domain.includes('reddit.com')) return 'reddit';
  if (domain.includes('pornhub.com')) return 'pornhub';
  if (domain.includes('xvideos.com')) return 'xvideos';
  if (domain.includes('xnxx.com')) return 'xnxx';
  if (domain.includes('netflix.com')) return 'netflix';
  if (domain.includes('hulu.com')) return 'hulu';
  if (domain.includes('vk.com')) return 'vk';
  if (domain.includes('bilibili.com')) return 'bilibili';
  if (domain.includes('nicovideo.jp')) return 'niconico';
  if (domain.includes('ted.com')) return 'ted';

  return 'unknown';
}

/**
 * Extract multiple videos from containers
 */
async function extractMultipleVideos(page, baseUrl, results, options) {
  console.log('🔍 Extracting multiple videos from containers...');

  // Common selectors for video containers and lists
  const containerSelectors = [
    // Common video container classes
    '.video-container', '.video-item', '.video-thumbnail', '.video-preview',
    '.video-list', '.video-grid', '.video-gallery', '.video-results',

    // Common video card/preview patterns
    '.card', '.video-card', '.thumbnail-container', '.preview-card',

    // Common list/grid container patterns
    '.grid', '.list', '.row', '.results', '.gallery',

    // Common classes for sections with videos
    '.related-videos', '.recommended-videos', '.suggestions', '.video-recommendations',
    '.featured-videos', '.popular-videos', '.trending-videos',

    // Video thumbnail patterns
    '[class*="thumbnail"]', '[class*="preview"]', '[class*="poster"]',

    // Common generic containers
    'article', '.item', '.entry'
  ];

  // Videos found across all containers
  const allVideos = [];

  // Track URLs to avoid duplicates within this function
  const foundUrls = new Set();

  // Extract videos from each container type
  for (const selector of containerSelectors) {
    try {
      const containers = await page.$$(selector);

      if (containers.length > 0) {
        console.log(`📦 Found ${containers.length} potential containers using selector: ${selector}`);

        // Process each container
        for (const container of containers) {
          try {
            // Get links within container
            const links = await container.$$('a');

            // Process each link
            for (const link of links) {
              try {
                // Get link attributes
                const href = await link.getAttribute('href');

                if (!href) continue;

                // Skip if already found
                if (foundUrls.has(href)) continue;

                // Resolve URL and skip non-video links
                let videoUrl;
                try {
                  videoUrl = new URL(href, baseUrl).toString();
                } catch (e) {
                  continue; // Skip invalid URLs
                }

                // Only include URLs that likely point to videos
                if (!isProbablyVideoLink(videoUrl)) continue;

                // Mark as found
                foundUrls.add(href);

                // Extract metadata
                const title = await extractLinkTitle(link);
                const thumbnailUrl = await extractThumbnailFromContainer(container, link);
                const duration = await extractDurationFromContainer(container, link);

                // Create video object
                const video = {
                  url: videoUrl,
                  title: title || `Video from ${results.domain}`,
                  thumbnailUrl: thumbnailUrl || '',
                  sourceWebsite: results.domain,
                  foundBy: `container-${selector}`,
                  type: getLinkVideoType(videoUrl),
                  attributes: {
                    duration: duration || 0
                  }
                };

                // Enhance with platform-specific info
                enhanceVideoMetadata(video);

                // Add to results
                allVideos.push(video);

                // Limit to max videos per container to avoid overwhelming results
                if (allVideos.length >= (options.maxVideosPerContainer || 50)) {
                  break;
                }
              } catch (e) {
                // Skip errors in individual link processing
              }
            }

          } catch (e) {
            // Skip errors in container processing
            console.error(`Error processing container: ${e.message}`);
          }
        }
      }
    } catch (e) {
      // Skip errors in selector processing
      console.error(`Error with selector ${selector}: ${e.message}`);
    }
  }

  // If we found no videos through containers, try a more aggressive approach
  if (allVideos.length === 0) {
    console.log('🔍 No videos found in containers, trying direct link extraction...');
    const links = await page.$$('a');

    // Process each link
    for (const link of links) {
      try {
        const href = await link.getAttribute('href');

        if (!href) continue;

        // Skip if already found
        if (foundUrls.has(href)) continue;

        // Resolve URL and skip non-video links
        let videoUrl;
        try {
          videoUrl = new URL(href, baseUrl).toString();
        } catch (e) {
          continue; // Skip invalid URLs
        }

        // Only include URLs that likely point to videos
        if (!isProbablyVideoLink(videoUrl)) continue;

        // Mark as found
        foundUrls.add(href);

        // Extract metadata
        const title = await extractLinkTitle(link);

        // Create video object
        const video = {
          url: videoUrl,
          title: title || `Video from ${results.domain}`,
          thumbnailUrl: '',
          sourceWebsite: results.domain,
          foundBy: 'direct-link',
          type: getLinkVideoType(videoUrl)
        };

        // Enhance with platform-specific info
        enhanceVideoMetadata(video);

        // Add to results
        allVideos.push(video);

        // Limit to max videos
        if (allVideos.length >= (options.maxVideos || 500)) {
          break;
        }
      } catch (e) {
        // Skip errors in individual link processing
      }
    }
  }

  console.log(`✅ Found ${allVideos.length} videos from containers`);
  return allVideos;
}

/**
 * Check if a URL is likely to be a video link
 */
function isProbablyVideoLink(url) {
  // Check known video platforms
  const videoPlatforms = [
    'youtube.com/watch', 'youtu.be/',
    'vimeo.com/',
    'dailymotion.com/video',
    'twitch.tv/',
    'facebook.com/watch',
    'instagram.com/reel', 'instagram.com/tv',
    'tiktok.com/',
    '/video/', '/watch/', '/media/', '/clip/', '/player/',
    '/embed/'
  ];

  if (videoPlatforms.some(platform => url.includes(platform))) {
    return true;
  }

  // Check for video file extensions
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv', '.m4v'];
  if (videoExtensions.some(ext => url.toLowerCase().endsWith(ext))) {
    return true;
  }

  // Check for streaming formats
  if (url.includes('.m3u8') || url.includes('.mpd')) {
    return true;
  }

  // Check for URL patterns that often indicate videos
  const videoPatterns = [
    'video', 'media', 'watch', 'player', 'embed', 'stream',
    'clip', 'movie', 'episode', 'tv', 'show', 'film'
  ];

  const urlPath = new URL(url).pathname.toLowerCase();
  if (videoPatterns.some(pattern => urlPath.includes(pattern))) {
    return true;
  }

  return false;
}

/**
 * Get video type from a link
 */
function getLinkVideoType(url) {
  const urlLower = url.toLowerCase();

  if (urlLower.includes('youtube.com') || urlLower.includes('youtu.be')) return 'youtube';
  if (urlLower.includes('vimeo.com')) return 'vimeo';
  if (urlLower.includes('dailymotion.com')) return 'dailymotion';
  if (urlLower.includes('twitch.tv')) return 'twitch';
  if (urlLower.includes('facebook.com')) return 'facebook';
  if (urlLower.includes('instagram.com')) return 'instagram';
  if (urlLower.includes('tiktok.com')) return 'tiktok';

  // Check for video file extensions
  const videoExtensions = {
    '.mp4': 'mp4',
    '.webm': 'webm',
    '.ogg': 'ogg',
    '.mov': 'mov',
    '.avi': 'avi',
    '.mkv': 'mkv',
    '.m4v': 'm4v'
  };

  for (const [ext, type] of Object.entries(videoExtensions)) {
    if (urlLower.endsWith(ext)) return type;
  }

  // Check for streaming formats
  if (urlLower.includes('.m3u8')) return 'hls-stream';
  if (urlLower.includes('.mpd')) return 'dash-stream';

  return 'unknown';
}

/**
 * Extract title from a link element
 */
async function extractLinkTitle(linkElement) {
  try {
    // First try to get title attribute
    const titleAttr = await linkElement.getAttribute('title');
    if (titleAttr && titleAttr.trim()) {
      return titleAttr.trim();
    }

    // Try aria-label
    const ariaLabel = await linkElement.getAttribute('aria-label');
    if (ariaLabel && ariaLabel.trim()) {
      return ariaLabel.trim();
    }

    // Try data-title
    const dataTitle = await linkElement.getAttribute('data-title');
    if (dataTitle && dataTitle.trim()) {
      return dataTitle.trim();
    }

    // Try getting text content
    const textContent = await linkElement.textContent();
    if (textContent && textContent.trim()) {
      return textContent.trim();
    }

    // Try to find a title element inside
    const innerTitleEl = await linkElement.$('.title, h1, h2, h3, h4, [class*="title"]');
    if (innerTitleEl) {
      const innerTitle = await innerTitleEl.textContent();
      if (innerTitle && innerTitle.trim()) {
        return innerTitle.trim();
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract thumbnail URL from a container or link
 */
async function extractThumbnailFromContainer(container, linkElement) {
  try {
    // Try to find an image inside the link
    const imgInLink = await linkElement.$('img');
    if (imgInLink) {
      // Try src, data-src, data-lazy-src attributes
      for (const attr of ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-thumbnail']) {
        const src = await imgInLink.getAttribute(attr);
        if (src && src.trim() && !src.includes('data:image')) {
          return src.trim();
        }
      }
    }

    // Try to find an image in the container
    const imgInContainer = await container.$('img');
    if (imgInContainer) {
      // Try src, data-src, data-lazy-src attributes
      for (const attr of ['src', 'data-src', 'data-lazy-src', 'data-original', 'data-thumbnail']) {
        const src = await imgInContainer.getAttribute(attr);
        if (src && src.trim() && !src.includes('data:image')) {
          return src.trim();
        }
      }
    }

    // Try background image on link or container
    for (const element of [linkElement, container]) {
      const style = await element.getAttribute('style');
      if (style && style.includes('background')) {
        const match = style.match(/background(-image)?:\s*url\(['"]?([^'"]+)['"]?\)/i);
        if (match && match[2]) {
          return match[2];
        }
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract duration from a container
 */
async function extractDurationFromContainer(container) {
  try {
    // Try common duration selectors
    const durationSelectors = [
      '.duration', '[class*="duration"]', '.time', '[class*="time"]',
      '.length', '[class*="length"]', '.video-time', '.timestamp'
    ];

    for (const selector of durationSelectors) {
      const durationEl = await container.$(selector);
      if (durationEl) {
        const durationText = await durationEl.textContent();
        if (durationText && durationText.trim()) {
          // Parse duration (convert formats like "5:23" to seconds)
          return parseDurationToSeconds(durationText.trim());
        }
      }
    }

    // Try data attributes
    for (const attr of ['data-duration', 'data-time', 'data-length']) {
      const duration = await container.getAttribute(attr);
      if (duration) {
        // Try to parse as seconds or as time format
        const seconds = parseInt(duration, 10);
        if (!isNaN(seconds)) {
          return seconds;
        }
        return parseDurationToSeconds(duration);
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Parse a duration string (like "5:23") to seconds
 */
function parseDurationToSeconds(durationStr) {
  try {
    // Handle ISO 8601 format (e.g., PT5M23S)
    if (durationStr.startsWith('PT')) {
      const hours = durationStr.match(/(\d+)H/);
      const minutes = durationStr.match(/(\d+)M/);
      const seconds = durationStr.match(/(\d+)S/);

      let totalSeconds = 0;
      if (hours) totalSeconds += parseInt(hours[1], 10) * 3600;
      if (minutes) totalSeconds += parseInt(minutes[1], 10) * 60;
      if (seconds) totalSeconds += parseInt(seconds[1], 10);

      return totalSeconds;
    }

    // Handle MM:SS format
    if (durationStr.includes(':')) {
      const parts = durationStr.split(':').map(part => parseInt(part.trim(), 10));

      // Handle HH:MM:SS
      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }

      // Handle MM:SS
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
    }

    // Handle simple seconds
    const seconds = parseInt(durationStr, 10);
    if (!isNaN(seconds)) {
      return seconds;
    }

    return 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Extract platform-specific videos
 */
async function extractPlatformVideos(page, baseUrl, platformType, options) {
  console.log(`🔍 Extracting videos from ${platformType} platform...`);

  switch (platformType) {
    case 'youtube':
      return await extractYoutubeVideos(page, baseUrl, options);
    case 'vimeo':
      return await extractVimeoVideos(page, baseUrl, options);
    case 'dailymotion':
      return await extractDailymotionVideos(page, baseUrl, options);
    case 'twitch':
      return await extractTwitchVideos(page, baseUrl, options);
    case 'facebook':
      return await extractFacebookVideos(page, baseUrl, options);
    case 'instagram':
      return await extractInstagramVideos(page, baseUrl, options);
    default:
      // For other platforms, use the generic extraction
      return await extractGenericPlatformVideos(page, baseUrl, platformType, options);
  }
}

/**
 * Extract videos from YouTube
 */
async function extractYoutubeVideos(page, baseUrl, options) {
  const videos = [];

  // Known YouTube video container selectors
  const youtubeSelectors = [
    // Related videos
    '#related ytd-compact-video-renderer',
    'ytd-compact-video-renderer',
    '.ytd-compact-video-renderer',
    // Search results
    'ytd-video-renderer',
    // Playlist items
    'ytd-playlist-panel-video-renderer',
    // Grid items (homepage, channels)
    'ytd-grid-video-renderer',
    // Shorts
    'ytd-reel-item-renderer',
    // Watch next feed
    '#items ytd-compact-video-renderer',
    // Generic
    '.video-list-item',
    '[id*="video-"]',
    // Fallback - look for thumbnails which often indicate videos
    'a[href*="/watch"]'
  ];

  // Process each selector
  for (const selector of youtubeSelectors) {
    try {
      // Wait a bit for content to load if selector contains items
      const hasItems = await page.$(selector);
      if (hasItems) {
        console.log(`📦 Found YouTube videos with selector: ${selector}`);

        // Extract all video items
        const items = await page.$$(selector);

        // If we have too many items, limit to a reasonable number
        const maxItems = Math.min(items.length, options.maxVideosPerPlatform || 200);

        for (let i = 0; i < maxItems; i++) {
          try {
            const item = items[i];

            // Get video link
            const linkEl = await item.$('a[href*="/watch"]');
            if (!linkEl) continue;

            const href = await linkEl.getAttribute('href');
            if (!href) continue;

            // Handle relative URLs
            let videoUrl = href;
            if (href.startsWith('/')) {
              videoUrl = `https://www.youtube.com${href}`;
            } else if (!href.startsWith('http')) {
              videoUrl = new URL(href, baseUrl).toString();
            }

            // Extract video ID from URL
            const videoId = extractYoutubeVideoId(videoUrl);
            if (!videoId) continue;

            // Get title
            let title = await extractYoutubeTitleFromItem(item);

            // Get thumbnail
            let thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

            // Get duration
            let duration = await extractYoutubeDurationFromItem(item);

            // Create video object
            const video = {
              url: videoUrl,
              title: title || `YouTube Video: ${videoId}`,
              thumbnailUrl,
              sourceWebsite: 'YouTube',
              videoId,
              foundBy: 'youtube-platform',
              type: 'youtube',
              attributes: {
                duration
              }
            };

            // Add to results
            videos.push(video);
          } catch (e) {
            // Skip errors in individual item processing
          }
        }
      }
    } catch (e) {
      console.error(`Error with YouTube selector ${selector}: ${e.message}`);
    }
  }

  console.log(`✅ Extracted ${videos.length} videos from YouTube`);
  return videos;
}

/**
 * Extract title from YouTube item
 */
async function extractYoutubeTitleFromItem(item) {
  try {
    // Common title selectors in YouTube
    const titleSelectors = [
      '#video-title',
      '[id="video-title"]',
      '[title]',
      '[aria-label]',
      '#title',
      '.title',
      'h3',
      '.yt-simple-endpoint'
    ];

    for (const selector of titleSelectors) {
      const titleEl = await item.$(selector);
      if (titleEl) {
        // Try title attribute first
        const titleAttr = await titleEl.getAttribute('title');
        if (titleAttr && titleAttr.trim()) {
          return titleAttr.trim();
        }

        // Try aria-label
        const ariaLabel = await titleEl.getAttribute('aria-label');
        if (ariaLabel && ariaLabel.trim()) {
          return ariaLabel.trim();
        }

        // Try text content
        const textContent = await titleEl.textContent();
        if (textContent && textContent.trim()) {
          return textContent.trim();
        }
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract duration from YouTube item
 */
async function extractYoutubeDurationFromItem(item) {
  try {
    // Common duration selectors in YouTube
    const durationSelectors = [
      '.ytd-thumbnail-overlay-time-status-renderer',
      '.ytp-time-duration',
      '[class*="duration"]',
      '[class*="time-status"]',
      '.time-status',
      '.timestamp'
    ];

    for (const selector of durationSelectors) {
      const durationEl = await item.$(selector);
      if (durationEl) {
        const durationText = await durationEl.textContent();
        if (durationText && durationText.trim()) {
          // Convert YouTube time format (MM:SS) to seconds
          return parseDurationToSeconds(durationText.trim());
        }
      }
    }

    return 0;
  } catch (e) {
    return 0;
  }
}

/**
 * Extract YouTube video ID from URL
 */
function extractYoutubeVideoId(url) {
  try {
    const urlObj = new URL(url);

    // Standard YouTube URL format
    if (urlObj.hostname.includes('youtube.com')) {
      if (urlObj.pathname === '/watch') {
        return urlObj.searchParams.get('v');
      }

      // Handle shorts format
      if (urlObj.pathname.startsWith('/shorts/')) {
        return urlObj.pathname.split('/shorts/')[1].split('/')[0];
      }
    }

    // Short youtu.be format
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.substring(1);
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract videos from Vimeo
 */
async function extractVimeoVideos(page, baseUrl, options) {
  const videos = [];

  // Known Vimeo video container selectors
  const vimeoSelectors = [
    '.js-related_videos .clip',
    '.related_videos .clip',
    '.clip_thumbnail',
    '.iris_thumbnail',
    '.thumbnail_wrapper',
    '.player_container',
    '.video_wrapper',
    // Staff picks
    '.staff_pick',
    // Generic
    '.video-card',
    '.video-item',
    '[data-clip-id]',
    // Fallback
    'a[href*="/videos/"]',
    'a[href*="/channels/"]'
  ];

  // Process each selector
  for (const selector of vimeoSelectors) {
    try {
      // Wait a bit for content to load if selector contains items
      const hasItems = await page.$(selector);
      if (hasItems) {
        console.log(`📦 Found Vimeo videos with selector: ${selector}`);

        // Extract all video items
        const items = await page.$$(selector);

        // If we have too many items, limit to a reasonable number
        const maxItems = Math.min(items.length, options.maxVideosPerPlatform || 200);

        for (let i = 0; i < maxItems; i++) {
          try {
            const item = items[i];

            // Get video link
            const linkEl = await item.$('a[href*="/videos/"], a[href*="/channels/"]');
            if (!linkEl) continue;

            const href = await linkEl.getAttribute('href');
            if (!href) continue;

            // Handle relative URLs
            let videoUrl = href;
            if (href.startsWith('/')) {
              videoUrl = `https://vimeo.com${href}`;
            } else if (!href.startsWith('http')) {
              videoUrl = new URL(href, baseUrl).toString();
            }

            // Extract video ID from URL
            const videoId = extractVimeoVideoId(videoUrl);
            if (!videoId) continue;

            // Get title
            let title = await extractVimeoTitleFromItem(item);

            // Get thumbnail
            let thumbnailUrl = await extractVimeoThumbnailFromItem(item);

            // Create video object
            const video = {
              url: videoUrl,
              title: title || `Vimeo Video: ${videoId}`,
              thumbnailUrl,
              sourceWebsite: 'Vimeo',
              videoId,
              foundBy: 'vimeo-platform',
              type: 'vimeo'
            };

            // Add to results
            videos.push(video);
          } catch (e) {
            // Skip errors in individual item processing
          }
        }
      }
    } catch (e) {
      console.error(`Error with Vimeo selector ${selector}: ${e.message}`);
    }
  }

  console.log(`✅ Extracted ${videos.length} videos from Vimeo`);
  return videos;
}

/**
 * Extract title from Vimeo item
 */
async function extractVimeoTitleFromItem(item) {
  try {
    // Common title selectors in Vimeo
    const titleSelectors = [
      '.title',
      '[data-title]',
      '[title]',
      'h5',
      'h3',
      'a[href*="/videos/"]'
    ];

    for (const selector of titleSelectors) {
      const titleEl = await item.$(selector);
      if (titleEl) {
        // Try data-title attribute first
        const dataTitle = await titleEl.getAttribute('data-title');
        if (dataTitle && dataTitle.trim()) {
          return dataTitle.trim();
        }

        // Try title attribute
        const titleAttr = await titleEl.getAttribute('title');
        if (titleAttr && titleAttr.trim()) {
          return titleAttr.trim();
        }

        // Try text content
        const textContent = await titleEl.textContent();
        if (textContent && textContent.trim()) {
          return textContent.trim();
        }
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract thumbnail from Vimeo item
 */
async function extractVimeoThumbnailFromItem(item) {
  try {
    // Try to find an image
    const imgEl = await item.$('img');
    if (imgEl) {
      // Try different attributes
      for (const attr of ['src', 'data-src', 'data-thumb', 'data-thumbnail']) {
        const src = await imgEl.getAttribute(attr);
        if (src && src.trim()) {
          return src.trim();
        }
      }
    }

    // Try background image
    const styles = await item.getAttribute('style');
    if (styles && styles.includes('background')) {
      const match = styles.match(/background(-image)?:\s*url\(['"]?([^'"]+)['"]?\)/i);
      if (match && match[2]) {
        return match[2];
      }
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract Vimeo video ID from URL
 */
function extractVimeoVideoId(url) {
  try {
    const urlObj = new URL(url);

    // Handle /videos/ID format
    const videoMatch = urlObj.pathname.match(/\/videos?\/(\d+)/);
    if (videoMatch && videoMatch[1]) {
      return videoMatch[1];
    }

    // Handle direct numeric ID format
    const directMatch = urlObj.pathname.match(/^\/(\d+)$/);
    if (directMatch && directMatch[1]) {
      return directMatch[1];
    }

    return null;
  } catch (e) {
    return null;
  }
}

/**
 * Extract videos from generic platform
 */
async function extractGenericPlatformVideos(page, baseUrl, platformType, options) {
  // This is a fallback method for platforms without specific extractors
  console.log(`🔍 Using generic extraction for ${platformType} platform`);

  // Determine video link pattern based on platform
  const linkPatterns = getLinkPatternsForPlatform(platformType);

  // Extract videos from links matching the patterns
  const videos = [];

  for (const pattern of linkPatterns) {
    try {
      // Find all links matching the pattern
      const links = await page.$$(`a[href*="${pattern}"]`);

      if (links.length > 0) {
        console.log(`🔗 Found ${links.length} links matching pattern: ${pattern}`);

        // Process each link
        const maxLinks = Math.min(links.length, options.maxVideosPerPlatform || 200);

        for (let i = 0; i < maxLinks; i++) {
          try {
            const link = links[i];

            // Get href attribute
            const href = await link.getAttribute('href');
            if (!href) continue;

            // Handle relative URLs
            let videoUrl = href;
            if (href.startsWith('/')) {
              videoUrl = new URL(href, baseUrl).toString();
            } else if (!href.startsWith('http')) {
              videoUrl = new URL(href, baseUrl).toString();
            }

            // Skip if not a valid video URL
            if (!isProbablyVideoLink(videoUrl)) continue;

            // Extract title
            const title = await extractLinkTitle(link);

            // Extract thumbnail from parent container
            let thumbnailUrl = null;
            try {
              const container = await link.evaluateHandle(el => el.closest('.video-item, .card, [class*="video"], [class*="card"], article, .item'));
              if (container) {
                thumbnailUrl = await extractThumbnailFromContainer(container, link);
              }
            } catch (e) {
              // Skip thumbnail extraction error
            }

            // Create video object
            const video = {
              url: videoUrl,
              title: title || `${platformType.charAt(0).toUpperCase() + platformType.slice(1)} Video`,
              thumbnailUrl: thumbnailUrl || '',
              sourceWebsite: platformType.charAt(0).toUpperCase() + platformType.slice(1),
              foundBy: `${platformType}-generic`,
              type: platformType
            };

            // Add to results
            videos.push(video);
          } catch (e) {
            // Skip errors in individual link processing
          }
        }
      }
    } catch (e) {
      console.error(`Error with pattern ${pattern}: ${e.message}`);
    }
  }

  console.log(`✅ Extracted ${videos.length} videos from generic platform ${platformType}`);
  return videos;
}

/**
 * Get link patterns for a specific platform
 */
function getLinkPatternsForPlatform(platformType) {
  switch (platformType) {
    case 'dailymotion':
      return ['/video/', '/embed/video/'];
    case 'twitch':
      return ['/videos/', '/clip/', '/collections/'];
    case 'facebook':
      return ['/watch/', '/video/', '/videos/'];
    case 'instagram':
      return ['/reel/', '/p/', '/tv/'];
    case 'tiktok':
      return ['/video/', '@'];
    case 'twitter':
    case 'x':
      return ['/status/', '/i/videos/'];
    case 'reddit':
      return ['/r/', '/video/'];
    default:
      return ['/video/', '/watch/', '/play/', '/embed/', '/media/', '/tv/'];
  }
}

// More specific platform extractors (Dailymotion, Facebook, etc.) would be implemented similarly
async function extractDailymotionVideos(page, baseUrl, options) {
  // For brevity, using the generic extractor for now
  return extractGenericPlatformVideos(page, baseUrl, 'dailymotion', options);
}

async function extractTwitchVideos(page, baseUrl, options) {
  // For brevity, using the generic extractor for now
  return extractGenericPlatformVideos(page, baseUrl, 'twitch', options);
}

async function extractFacebookVideos(page, baseUrl, options) {
  // For brevity, using the generic extractor for now
  return extractGenericPlatformVideos(page, baseUrl, 'facebook', options);
}

async function extractInstagramVideos(page, baseUrl, options) {
  // For brevity, using the generic extractor for now
  return extractGenericPlatformVideos(page, baseUrl, 'instagram', options);
}

/**
 * Navigate to the next page for pagination
 * @param {Page} page - Playwright page instance
 * @param {string} platformType - The type of video platform (youtube, vimeo, etc.)
 * @returns {Promise<boolean>} - Whether navigation was successful
 */
async function navigateToNextPage(page, platformType) {
  try {
    // Platform-specific pagination selectors
    const platformSelectors = getPaginationSelectorsForPlatform(platformType);

    // Try platform-specific selectors first
    for (const selector of platformSelectors) {
      const nextButton = await page.$(selector);
      if (nextButton) {
        const isVisible = await nextButton.isVisible();
        const isEnabled = await nextButton.isEnabled();

        if (isVisible && isEnabled) {
          console.log(`🔍 Found next page button using platform-specific selector: ${selector}`);
          await nextButton.click();
          return true;
        }
      }
    }

    // Generic selectors for pagination as fallback
    const genericSelectors = [
      // Next page buttons
      'a.next', 'a.nextpage', 'a.pagination-next', 'a[rel="next"]',
      'button.next', 'button.nextpage', 'button.pagination-next',
      'li.next a', 'li.nextpage a', 'li.pagination-next a',

      // Arrows and icons
      'a[aria-label="Next page"]', 'button[aria-label="Next page"]',
      'a[title="Next page"]', 'button[title="Next page"]',
      '.pagination-next', '.next-page', '.next-btn',
      'a:has(svg[class*="next"])', 'button:has(svg[class*="next"])',
      'a:has(i[class*="next"])', 'button:has(i[class*="next"])',

      // Text-based next buttons
      'a:has-text("Next")', 'button:has-text("Next")',
      'a:has-text("Next Page")', 'button:has-text("Next Page")',
      'a:has-text("Show more")', 'button:has-text("Show more")',
      'a:has-text("Load more")', 'button:has-text("Load more")',

      // Icons
      'a.page-link[aria-label="Next"]',
      'a > i.fa-chevron-right',
      'a > i.fa-arrow-right',

      // Page numbers
      '.pagination a:not(.active) + a',
      '.pagination .active + a',
      '.pagination__link--active + .pagination__link'
    ];

    // Try generic selectors
    for (const selector of genericSelectors) {
      try {
        const nextButton = await page.$(selector);
        if (nextButton) {
          const isVisible = await nextButton.isVisible();
          const isEnabled = await nextButton.isEnabled();

          if (isVisible && isEnabled) {
            console.log(`🔍 Found next page button using generic selector: ${selector}`);
            await nextButton.click();
            return true;
          }
        }
      } catch (e) {
        // Skip errors with individual selectors
      }
    }

    // Try URL-based pagination if no button found
    const currentUrl = page.url();
    const nextPageUrl = generateNextPageUrl(currentUrl);

    if (nextPageUrl && nextPageUrl !== currentUrl) {
      console.log(`🔍 No pagination button found, trying URL-based pagination: ${nextPageUrl}`);
      await page.goto(nextPageUrl, { waitUntil: 'domcontentloaded' });
      return true;
    }

    // Could not find next page
    return false;
  } catch (error) {
    console.error('⚠️ Error during pagination:', error.message);
    return false;
  }
}

/**
 * Get pagination selectors specific to a platform
 */
function getPaginationSelectorsForPlatform(platformType) {
  switch (platformType) {
    case 'youtube':
      return [
        // YouTube pagination
        'ytd-continuation-item-renderer',
        '#continuations ytd-continuation-item-renderer',
        'ytd-button-renderer#button[aria-label="Next page"]',
        'button[aria-label="Next page"]',
        'a[aria-label="Next page"]',
        'paper-button.ytd-toggle-button-renderer',
        'button.yt-spec-button-shape-next'
      ];
    case 'vimeo':
      return [
        // Vimeo pagination
        '.pagination__next',
        'a[rel="next"]',
        '.js-pagination_next_button',
        'a[data-page="next"]',
        '.js-load_more',
        '.js-load-more'
      ];
    case 'dailymotion':
      return [
        // Dailymotion pagination
        '.pagination__next-button',
        'button.next',
        '.next-page',
        '.loadmore-btn',
        'a[data-action="pagination.loadMore"]'
      ];
    case 'pornhub':
      return [
        // Pornhub pagination
        '.page_next',
        '.page_next_set',
        'a.orangeButton:has-text("Next")',
        'a.paginationNext',
        '.pagination-next',
        '.pagination li:last-child a'
      ];
    case 'xvideos':
      return [
        // XVideos pagination
        '.pagination .next-page',
        '.pagination li.active + li a',
        '.next-page',
        'a.active + a',
        'a[href*="page="]'
      ];
    case 'xhamster':
      return [
        // XHamster pagination
        '.pager__button-next',
        '.xh-paginator-button-next',
        'a.next',
        'a.xh-button-next',
        '.next-page-container a'
      ];
    default:
      // Return empty array for unknown platforms
      return [];
  }
}

/**
 * Generate URL for next page based on current URL pattern
 */
function generateNextPageUrl(currentUrl) {
  try {
    const url = new URL(currentUrl);

    // Check for page parameter in query string
    if (url.searchParams.has('page')) {
      const currentPage = parseInt(url.searchParams.get('page'), 10) || 1;
      url.searchParams.set('page', (currentPage + 1).toString());
      return url.toString();
    }

    // Check for p parameter in query string
    if (url.searchParams.has('p')) {
      const currentPage = parseInt(url.searchParams.get('p'), 10) || 1;
      url.searchParams.set('p', (currentPage + 1).toString());
      return url.toString();
    }

    // Check for numbered page in path
    const pageMatch = url.pathname.match(/\/page\/(\d+)/i);
    if (pageMatch) {
      const currentPage = parseInt(pageMatch[1], 10);
      const newPath = url.pathname.replace(/\/page\/\d+/i, `/page/${currentPage + 1}`);
      url.pathname = newPath;
      return url.toString();
    }

    // Check for pagination format in path
    const paginationMatch = url.pathname.match(/\/(\d+)$/);
    if (paginationMatch && !url.pathname.endsWith('.html') && !url.pathname.endsWith('.php')) {
      const currentPage = parseInt(paginationMatch[1], 10);
      const newPath = url.pathname.replace(/\/\d+$/, `/${currentPage + 1}`);
      url.pathname = newPath;
      return url.toString();
    }

    // If no pagination pattern found, try adding page parameter
    if (!url.searchParams.has('page')) {
      url.searchParams.set('page', '2');
      return url.toString();
    }

    return null;
  } catch (e) {
    console.error('Error generating next page URL:', e.message);
    return null;
  }
}

/**
 * SpankBang specific scraper
 */
const scrapeSpankBang = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    // SpankBang specific title extraction
    const title = $('h1.main_content_title').text().trim() ||
                 $('h1.main_content_title').attr('title') ||
                 $('meta[property="og:title"]').attr('content') || 
                 $('title').text().replace(' - SpankBang', '') || 'Unknown Title';
    
    // Extract thumbnail
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || 
                         $('.player-thumb img').attr('src') ||
                         $('.video-thumb img').attr('src') || '';
    
    // Extract description
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('.video-description').text().trim() ||
                       $('.description').text().trim() || '';
    
    // Extract duration from video page specific elements
    let duration = null;
    const durationText = $('.video-badge.l').text().trim() || 
                        $('.duration').text().trim() ||
                        $('[class*="duration"]').text().trim();
    
    if (durationText) {
      duration = parseDurationToSeconds(durationText);
    }
    
    // Extract tags from SpankBang specific elements
    const tags = [];
    $('.tag-item a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });
    
    $('.tags a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag && !tags.includes(tag)) tags.push(tag);
    });
    
    // Extract categories
    const categoryElement = $('.category a').first().text().trim() ||
                           $('.categories a').first().text().trim() ||
                           $('[class*="category"] a').first().text().trim();
    
    let category = categoryElement || determineCategory(title, description, tags);
    
    // Extract video ID from URL
    const videoIdMatch = url.match(/\/([^\/]+)\/play$/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      duration,
      videoId,
      sourceWebsite: 'SpankBang'
    };
  } catch (error) {
    console.error('Error scraping SpankBang:', error);
    return fallbackMetadata(url, 'SpankBang');
  }
};

/**
 * PornHub specific scraper
 */
const scrapePornHub = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const title = $('h1.title span').text().trim() ||
                 $('meta[property="og:title"]').attr('content') || 
                 $('title').text().replace(' - Pornhub.com', '') || 'Unknown Title';
    
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    
    const description = $('meta[property="og:description"]').attr('content') || 
                       $('.video-detailed-info').text().trim() || '';
    
    // Extract duration
    let duration = null;
    const durationText = $('.duration').text().trim();
    if (durationText) {
      duration = parseDurationToSeconds(durationText);
    }
    
    // Extract tags
    const tags = [];
    $('.categoriesWrapper a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });
    
    $('.tagsWrapper a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag && !tags.includes(tag)) tags.push(tag);
    });
    
    const category = $('.category a').first().text().trim() || 
                    determineCategory(title, description, tags);
    
    // Extract video ID
    const videoIdMatch = url.match(/viewkey=([^&]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      duration,
      videoId,
      sourceWebsite: 'PornHub'
    };
  } catch (error) {
    console.error('Error scraping PornHub:', error);
    return fallbackMetadata(url, 'PornHub');
  }
};

/**
 * XVideos specific scraper
 */
const scrapeXVideos = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('h2.page-title').text().trim() ||
                 $('title').text().replace(' - XVIDEOS.COM', '') || 'Unknown Title';
    
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    
    const description = $('meta[property="og:description"]').attr('content') || '';
    
    // Extract duration
    let duration = null;
    const durationText = $('.duration').text().trim();
    if (durationText) {
      duration = parseDurationToSeconds(durationText);
    }
    
    // Extract tags
    const tags = [];
    $('.video-metadata .metadata a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });
    
    const category = determineCategory(title, description, tags);
    
    // Extract video ID
    const videoIdMatch = url.match(/\/video(\d+)\//);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      duration,
      videoId,
      sourceWebsite: 'XVideos'
    };
  } catch (error) {
    console.error('Error scraping XVideos:', error);
    return fallbackMetadata(url, 'XVideos');
  }
};

/**
 * XHamster specific scraper
 */
const scrapeXHamster = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('h1.with-player-container').text().trim() ||
                 $('title').text().replace(' - xHamster', '') || 'Unknown Title';
    
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    
    const description = $('meta[property="og:description"]').attr('content') || '';
    
    // Extract duration
    let duration = null;
    const durationText = $('.duration').text().trim() || $('.time').text().trim();
    if (durationText) {
      duration = parseDurationToSeconds(durationText);
    }
    
    // Extract tags
    const tags = [];
    $('.categories-container a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });
    
    const category = determineCategory(title, description, tags);
    
    // Extract video ID
    const videoIdMatch = url.match(/videos\/([^\/]+)/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      duration,
      videoId,
      sourceWebsite: 'XHamster'
    };
  } catch (error) {
    console.error('Error scraping XHamster:', error);
    return fallbackMetadata(url, 'XHamster');
  }
};

/**
 * RedTube specific scraper
 */
const scrapeRedTube = async (url) => {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    const title = $('meta[property="og:title"]').attr('content') || 
                 $('h1.videoTitle').text().trim() ||
                 $('title').text().replace(' - RedTube', '') || 'Unknown Title';
    
    const thumbnailUrl = $('meta[property="og:image"]').attr('content') || '';
    
    const description = $('meta[property="og:description"]').attr('content') || '';
    
    // Extract duration
    let duration = null;
    const durationText = $('.duration').text().trim();
    if (durationText) {
      duration = parseDurationToSeconds(durationText);
    }
    
    // Extract tags
    const tags = [];
    $('.video_tags a').each((i, el) => {
      const tag = $(el).text().trim();
      if (tag) tags.push(tag);
    });
    
    const category = $('.breadcrumb a').last().text().trim() || 
                    determineCategory(title, description, tags);
    
    // Extract video ID
    const videoIdMatch = url.match(/\/(\d+)$/);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;
    
    return {
      title,
      thumbnailUrl,
      description,
      tags,
      category,
      duration,
      videoId,
      sourceWebsite: 'RedTube'
    };
  } catch (error) {
    console.error('Error scraping RedTube:', error);
    return fallbackMetadata(url, 'RedTube');
  }
};

module.exports = {
  scrapePageForVideos,
  detectAdultContent,
  validateUrl,
  extractVideosWithPlaywright,
  extractMetadata
}; 