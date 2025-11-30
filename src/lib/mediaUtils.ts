export const isVideoFile = (url: string): boolean => {
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.mkv'];
  const lowerUrl = url.toLowerCase();
  return videoExtensions.some(ext => lowerUrl.includes(ext));
};

export const getMediaType = (url: string): 'video' | 'image' => {
  return isVideoFile(url) ? 'video' : 'image';
};
