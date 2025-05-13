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

/**
 * Scrape a webpage for multiple videos
 * @param {string} url - The URL of the webpage
 * @param {Array} customSelectors - Optional array of custom selectors for finding videos
 * @param {Array} fileExtensions - Optional array of file extensions to scan for in links
 * @param {Object} options - Optional configuration options
 * @returns {Promise<Array>} - Array of video metadata objects
 */
const scrapePageForVideos = async (url, customSelectors = [], fileExtensions = null, options = {}) => {
  try {
    // Validate URL
    const validatedUrl = validateUrl(url);
    const domain = new URL(validatedUrl).hostname;
    
    // Set default options
    const defaultOptions = {
      scanScriptTags: true,
      scanDataAttributes: true,
      scanIframeAttributes: true,
      followExternalLinks: false,
      scanOnlyMainContent: false,
      minVideoDuration: 0,
      maxScanDepth: 1
    };
    
    // Merge options with defaults
    const extractionOptions = { ...defaultOptions, ...options };
    console.log('Extraction options:', extractionOptions);
    
    // Process file extensions with defaults if not provided
    const videoFileExtensions = fileExtensions || [
      '.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'
    ];
    console.log('Looking for file extensions:', videoFileExtensions);
    
    // Make a request to the webpage
    console.log(`Scraping videos from page: ${validatedUrl}`);
    const response = await axios.get(validatedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const videos = [];
    
    // Optionally detect and focus on main content area
    let $content = $;
    if (extractionOptions.scanOnlyMainContent) {
      // Try to detect main content area using common patterns
      const mainContentSelectors = [
        'main', 
        '#main-content', 
        '.main-content',
        'article',
        '.article-content',
        '.content-main',
        '#content'
      ];
      
      for (const selector of mainContentSelectors) {
        if ($(selector).length) {
          $content = $(selector);
          console.log(`Found main content using selector: ${selector}`);
          break;
        }
      }
    }
    
    // Process default and custom selectors
    const processedSelectors = customSelectors || [
      { type: 'css', selector: 'video' },
      { type: 'css', selector: 'iframe[src*="youtube"], iframe[src*="vimeo"]' }
    ];
    
    console.log('Using selectors:', processedSelectors);
    
    // Extract video sources based on custom selectors and common patterns
    
    // Process all CSS selectors
    processedSelectors.forEach((selectorObj, index) => {
      if (selectorObj.type === 'css') {
        $content(selectorObj.selector).each((i, el) => {
          const $el = $(el);
          
          // Handle different element types
          if (el.tagName.toLowerCase() === 'video') {
            // Handle video elements
            const videoSrc = $el.attr('src') || $el.find('source').attr('src');
            
            if (videoSrc) {
              const videoUrl = new URL(videoSrc, validatedUrl).toString();
              
              // Extract minimal metadata
              const title = $el.attr('title') || 
                           $el.attr('alt') || 
                           $el.attr('id') || 
                           `Video ${videos.length + 1} from ${domain}`;
                           
              const posterUrl = $el.attr('poster');
              
              // Extract duration if available
              let duration = 0;
              if ($el.attr('duration')) {
                duration = parseFloat($el.attr('duration'));
              }
              
              // Only add if it meets the minimum duration requirement
              if (duration === 0 || duration >= extractionOptions.minVideoDuration) {
                videos.push({
                  url: videoUrl,
                  title: title,
                  thumbnailUrl: posterUrl || '',
                  sourceWebsite: domain,
                  foundBy: `selector:${selectorObj.selector}`,
                  duration: duration || null
                });
              }
            }
          } 
          else if (el.tagName.toLowerCase() === 'iframe') {
            // Handle iframe elements
            const src = $el.attr('src');
            
            if (src) {
              // Extract title from nearby elements if possible
              let title = $el.attr('title') || '';
              if (!title) {
                // Try to find a title in nearby elements (common patterns)
                const $parent = $el.parent();
                const $heading = $parent.find('h1, h2, h3, h4, h5, h6').first();
                if ($heading.length) {
                  title = $heading.text().trim();
                } else {
                  // Try parent's siblings
                  const $parentHeading = $parent.siblings('h1, h2, h3, h4, h5, h6').first();
                  if ($parentHeading.length) {
                    title = $parentHeading.text().trim();
                  } else {
                    title = `Embedded Video ${videos.length + 1} from ${domain}`;
                  }
                }
              }
              
              let videoInfo = {
                url: new URL(src, validatedUrl).toString(),
                title: title,
                thumbnailUrl: '', // Will try to enhance later
                sourceWebsite: domain,
                foundBy: `selector:${selectorObj.selector}`
              };
              
              // If enabled, scan iframe attributes for additional metadata
              if (extractionOptions.scanIframeAttributes) {
                const attrs = $el[0].attribs;
                if (attrs['data-video-id']) videoInfo.videoId = attrs['data-video-id'];
                if (attrs['data-thumbnail']) videoInfo.thumbnailUrl = attrs['data-thumbnail'];
                if (attrs['width'] && attrs['height']) {
                  videoInfo.dimensions = `${attrs['width']}x${attrs['height']}`;
                }
              }
              
              videos.push(videoInfo);
            }
          }
          else {
            // For other elements, try to find video-related attributes or child elements
            // Check for data attributes that might contain video information
            if (extractionOptions.scanDataAttributes) {
              const dataAttrs = Object.keys($el[0].attribs || {})
                .filter(attr => attr.startsWith('data-') && 
                  (attr.includes('video') || attr.includes('media')));
                
              if (dataAttrs.length > 0) {
                let videoUrl = '';
                let videoTitle = '';
                let thumbnailUrl = '';
                
                dataAttrs.forEach(attr => {
                  const value = $el.attr(attr);
                  if (value && value.includes('http')) {
                    if (attr.includes('src') || attr.includes('url')) {
                      videoUrl = value;
                    } else if (attr.includes('thumb') || attr.includes('poster') || attr.includes('image')) {
                      thumbnailUrl = value;
                    }
                  }
                });
                
                if (!videoUrl) {
                  // Check for anchor tags with video links
                  const $anchor = $el.find('a[href]');
                  if ($anchor.length) {
                    const href = $anchor.attr('href');
                    if (isVideoLink(href, videoFileExtensions)) {
                      videoUrl = $anchor.attr('href');
                      videoTitle = $anchor.text().trim();
                    }
                  }
                }
                
                if (videoUrl) {
                  try {
                    videos.push({
                      url: new URL(videoUrl, validatedUrl).toString(),
                      title: videoTitle || $el.text().trim() || `Custom Video ${videos.length + 1}`,
                      thumbnailUrl: thumbnailUrl || '',
                      sourceWebsite: domain,
                      foundBy: `data-attribute:${dataAttrs[0]}`
                    });
                  } catch (e) {
                    // Skip invalid URLs
                  }
                }
              }
            }
          }
        });
      }
    });
    
    // Look for video links in anchor tags with specified file extensions
    $content('a').each((i, el) => {
      const $a = $(el);
      const href = $a.attr('href');
      
      if (href && isVideoLink(href, videoFileExtensions)) {
        const title = $a.text().trim() || `Video Link ${videos.length + 1} from ${domain}`;
        
        videos.push({
          url: new URL(href, validatedUrl).toString(),
          title: title,
          thumbnailUrl: '',
          sourceWebsite: domain,
          foundBy: 'anchor-tag:file-extension'
        });
      }
    });
    
    // Process video JS data if enabled
    if (extractionOptions.scanScriptTags) {
      $('script').each((i, el) => {
        const script = $(el).html();
        
        // Look for video data in JSON format
        try {
          // Find JSON-like structures that might contain video data
          const jsonMatches = script.match(/(\{.*?\})/g);
          
          if (jsonMatches) {
            jsonMatches.forEach(jsonStr => {
              try {
                const data = JSON.parse(jsonStr);
                
                // Check if it might be video data
                if (data.url && 
                   (data.type === 'video' || 
                    data.videoUrl || 
                    data.contentUrl || 
                    data.embedUrl)) {
                  
                  const videoUrl = data.url || data.videoUrl || data.contentUrl || data.embedUrl;
                  
                  videos.push({
                    url: new URL(videoUrl, validatedUrl).toString(),
                    title: data.title || data.name || `Video Data ${videos.length + 1} from ${domain}`,
                    thumbnailUrl: data.thumbnailUrl || data.image || '',
                    sourceWebsite: domain,
                    foundBy: 'script-data:json',
                    duration: data.duration || null
                  });
                }
              } catch (e) {
                // Skip invalid JSON
              }
            });
          }
        } catch (e) {
          // Skip script processing errors
        }
      });
    }
    
    // Follow external links if enabled
    const processedExternalLinks = new Set();
    if (extractionOptions.followExternalLinks && extractionOptions.maxScanDepth > 1) {
      console.log('Following external links for videos...');
      
      // Find links that might be video gallery pages
      const videoPageLinks = [];
      $content('a').each((i, el) => {
        const href = $(el).attr('href');
        if (href && 
           (href.includes('video') || 
            href.includes('media') || 
            href.includes('gallery') || 
            href.includes('watch'))) {
          
          try {
            const absoluteUrl = new URL(href, validatedUrl).toString();
            // Don't follow links to the same page or already processed links
            if (absoluteUrl !== validatedUrl && !processedExternalLinks.has(absoluteUrl)) {
              videoPageLinks.push(absoluteUrl);
              processedExternalLinks.add(absoluteUrl);
            }
          } catch (e) {
            // Skip invalid URLs
          }
        }
      });
      
      // Limit the number of external links to follow
      const linksToFollow = videoPageLinks.slice(0, 3); // Only follow up to 3 external links
      
      if (linksToFollow.length > 0) {
        console.log(`Following ${linksToFollow.length} external links`);
        
        // Follow each link and extract videos with reduced depth
        const reducedOptions = {
          ...extractionOptions,
          maxScanDepth: extractionOptions.maxScanDepth - 1,
          followExternalLinks: false // Prevent further recursion
        };
        
        for (const link of linksToFollow) {
          try {
            console.log(`Following link: ${link}`);
            const externalVideos = await scrapePageForVideos(
              link, 
              customSelectors, 
              videoFileExtensions, 
              reducedOptions
            );
            
            // Add source information to external videos
            if (externalVideos.length > 0) {
              console.log(`Found ${externalVideos.length} videos from external link`);
              externalVideos.forEach(video => {
                video.foundVia = link;
                videos.push(video);
              });
            }
          } catch (e) {
            console.error(`Error following external link ${link}:`, e);
            // Continue with other links even if one fails
          }
        }
      }
    }
    
    // Deduplicate videos based on URL
    const dedupedVideos = [];
    const urlSet = new Set();
    
    for (const video of videos) {
      if (!urlSet.has(video.url)) {
        urlSet.add(video.url);
        dedupedVideos.push(video);
      }
    }
    
    // Enhance metadata for known service URLs
    const enhancedVideos = [];
    
    for (const video of dedupedVideos) {
      try {
        const videoUrl = video.url;
        const videoUrlObj = new URL(videoUrl);
        
        if (videoUrlObj.hostname.includes('youtube.com') || 
           videoUrlObj.hostname.includes('youtu.be')) {
          
          // For YouTube, try to extract the video ID and get a thumbnail
          const videoId = videoUrlObj.searchParams.get('v') || 
                         videoUrlObj.pathname.split('/').pop();
                         
          if (videoId) {
            video.thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            video.sourceWebsite = 'YouTube';
            video.videoId = videoId;
          }
        }
        else if (videoUrlObj.hostname.includes('vimeo.com')) {
          video.sourceWebsite = 'Vimeo';
          // Extract Vimeo ID for thumbnail
          const vimeoId = videoUrlObj.pathname.split('/').pop();
          if (vimeoId && !isNaN(vimeoId)) {
            video.videoId = vimeoId;
          }
        }
        else if (videoUrlObj.hostname.includes('dailymotion.com')) {
          video.sourceWebsite = 'Dailymotion';
          // Extract Dailymotion ID
          const matches = videoUrlObj.pathname.match(/\/video\/([a-zA-Z0-9]+)/);
          if (matches && matches[1]) {
            video.videoId = matches[1];
          }
        }
        
        enhancedVideos.push(video);
      } catch (e) {
        // Keep original video data if enhancement fails
        enhancedVideos.push(video);
      }
    }
    
    console.log(`Found ${enhancedVideos.length} videos on page: ${validatedUrl}`);
    return enhancedVideos;
    
  } catch (error) {
    console.error('Error scraping page for videos:', error);
    throw new Error('Failed to extract videos from the provided URL');
  }
};

/**
 * Check if a URL points to a video file based on extension
 * @param {string} url - URL to check
 * @param {Array} extensions - Array of video file extensions
 * @returns {boolean} - True if URL points to a video file
 */
const isVideoLink = (url, extensions = []) => {
  if (!url) return false;
  
  // Check for video hosting platforms
  if (url.includes('youtube.com/watch') || 
      url.includes('youtu.be/') ||
      url.includes('vimeo.com/') ||
      url.includes('dailymotion.com/video')) {
    return true;
  }
  
  // Check for file extensions
  for (const ext of extensions) {
    if (url.toLowerCase().endsWith(ext.toLowerCase())) {
      return true;
    }
  }
  
  return false;
};

module.exports = {
  extractMetadata,
  scrapePageForVideos
}; 