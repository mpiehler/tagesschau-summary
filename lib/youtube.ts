export async function getLatestTagesschauVideo() {
  const channelId = 'UC5NOEUbkLheQcaaRldYW5GA'; // Tagesschau channel
  const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`;

  const response = await fetch(rssUrl, { next: { revalidate: 60 } });
  if (!response.ok) throw new Error('Failed to fetch YouTube RSS');

  const text = await response.text();

  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match;
  
  while ((match = entryRegex.exec(text)) !== null) {
    const entry = match[1];
    if (entry.includes('tagesschau 20:00 Uhr')) {
      const videoIdMatch = entry.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
      const titleMatch = entry.match(/<title>(.*?)<\/title>/);
      const publishedMatch = entry.match(/<published>(.*?)<\/published>/);
      
      if (videoIdMatch && titleMatch && publishedMatch) {
         return {
           videoId: videoIdMatch[1],
           title: titleMatch[1],
           publishedAt: publishedMatch[1],
           url: `https://www.youtube.com/watch?v=${videoIdMatch[1]}`
         };
      }
    }
  }
  return null;
}
