function analyzeSEO() {
  const data = {};

  // Title
  const title = document.querySelector('title');
  data.title = { text: title?.innerText?.trim() || '', length: title?.innerText?.trim()?.length || 0 };

  // Meta Description
  const metaDesc = document.querySelector('meta[name="description"]');
  const descContent = metaDesc?.getAttribute('content') || '';
  data.metaDescription = { text: descContent, length: descContent.length, exists: !!metaDesc };

  // Meta Keywords
  const metaKw = document.querySelector('meta[name="keywords"]');
  data.metaKeywords = { text: metaKw?.getAttribute('content') || '', exists: !!metaKw };

  // Headings
  data.headings = {
    h1: Array.from(document.querySelectorAll('h1')).map(h => h.innerText.trim()),
    h2: document.querySelectorAll('h2').length,
    h3: document.querySelectorAll('h3').length,
    h4: document.querySelectorAll('h4').length
  };

  // Images
  const allImgs = Array.from(document.querySelectorAll('img'));
  const noAlt = allImgs.filter(i => !i.getAttribute('alt') || !i.getAttribute('alt').trim());
  data.images = { total: allImgs.length, withoutAlt: noAlt.length, withAlt: allImgs.length - noAlt.length };

  // Links
  const allLinks = Array.from(document.querySelectorAll('a[href]'));
  const filterLink = (internal) => allLinks.filter(a => {
    try {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('javascript')) return false;
      const url = new URL(href, window.location.href);
      return internal ? url.hostname === window.location.hostname : url.hostname !== window.location.hostname;
    } catch { return false; }
  });
  data.links = { total: allLinks.length, internal: filterLink(true).length, external: filterLink(false).length };

  // Canonical
  const canonical = document.querySelector('link[rel="canonical"]');
  data.canonical = { exists: !!canonical, url: canonical?.getAttribute('href') || '' };

  // Open Graph
  const og = (prop) => !!document.querySelector(`meta[property="og:${prop}"]`);
  data.openGraph = { title: og('title'), description: og('description'), image: og('image'), url: og('url') };

  // Twitter Card
  const tw = (name) => document.querySelector(`meta[name="twitter:${name}"]`);
  data.twitterCard = { exists: !!tw('card'), type: tw('card')?.getAttribute('content') || '' };

  // Robots
  const robots = document.querySelector('meta[name="robots"]');
  data.robots = { exists: !!robots, content: robots?.getAttribute('content') || '' };

  // Viewport
  const vp = document.querySelector('meta[name="viewport"]');
  data.viewport = { exists: !!vp, content: vp?.getAttribute('content') || '' };

  // Structured Data
  const jsonLd = document.querySelectorAll('script[type="application/ld+json"]');
  const schemas = [];
  jsonLd.forEach(s => {
    try { const j = JSON.parse(s.textContent); schemas.push(j['@type'] || 'Unknown'); } catch {}
  });
  data.structuredData = { count: jsonLd.length, types: schemas };

  // Content
  const words = (document.body?.innerText || '').trim().split(/\s+/).filter(w => w.length > 0);
  data.content = { wordCount: words.length };

  // HTTPS
  data.https = { secure: window.location.protocol === 'https:' };

  // Lang
  data.lang = { exists: !!document.documentElement.getAttribute('lang'), value: document.documentElement.getAttribute('lang') || '' };

  // URL
  data.url = { full: window.location.href, hostname: window.location.hostname, hasUnderscores: window.location.pathname.includes('_'), length: window.location.href.length };

  // Favicon
  data.favicon = { exists: !!document.querySelector('link[rel*="icon"]') };

  // Page load perf hint
  data.performance = { hasLazyImages: !!document.querySelector('img[loading="lazy"]') };

  return data;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'analyzeSEO') sendResponse(analyzeSEO());
  return true;
});
