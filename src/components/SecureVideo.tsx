import { useState, useEffect } from "react";
import { fetchRawFileFromGitHub, getGitHubConfig } from "@/lib/github";
import { Loader2 } from "lucide-react";

interface SecureVideoProps extends React.VideoHTMLAttributes<HTMLVideoElement> {
    src: string;
}

const getMimeType = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
        case 'mp4': return 'video/mp4';
        case 'webm': return 'video/webm';
        case 'ogg': return 'video/ogg';
        case 'mov': return 'video/quicktime';
        default: return 'video/mp4';
    }
};

export const SecureVideo = ({ src, className, ...props }: SecureVideoProps) => {
    const [videoSrc, setVideoSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadVideo = async () => {
            // If it's a demo video (imported asset) or a blob URL, use it directly
            if (!src || src.startsWith('/assets/') || src.startsWith('blob:') || src.startsWith('data:')) {
                setVideoSrc(src);
                setLoading(false);
                return;
            }

            // If it's a raw.githubusercontent.com URL from our private repo
            if (src.includes('raw.githubusercontent.com')) {
                try {
                    // Extract path from URL
                    // Format: https://raw.githubusercontent.com/OWNER/REPO/BRANCH/PATH
                    const { owner, repo, branch } = getGitHubConfig();

                    // Check if the URL belongs to our repo
                    if (src.includes(`/${owner}/${repo}/`)) {
                        console.log('[SecureVideo] Loading from private repo:', src);
                        // We need to fetch it via API to authenticate
                        // Convert raw URL to API path
                        // Remove prefix up to branch
                        const pathParts = src.split(`/${branch}/`);
                        if (pathParts.length > 1) {
                            const path = pathParts[1];
                            console.log('[SecureVideo] Fetching path:', path);
                            const fileData = await fetchRawFileFromGitHub(path);

                            if (fileData && fileData.content) {
                                console.log('[SecureVideo] File fetched, converting to blob. Content length:', fileData.content.length);
                                // Convert base64 to blob
                                try {
                                    const byteCharacters = atob(fileData.content);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);
                                    const mimeType = getMimeType(path);
                                    const blob = new Blob([byteArray], { type: mimeType });
                                    const objectUrl = URL.createObjectURL(blob);
                                    console.log('[SecureVideo] Blob created successfully:', objectUrl);
                                    setVideoSrc(objectUrl);
                                    setLoading(false);
                                    return;
                                } catch (decodeErr) {
                                    console.error('[SecureVideo] Error decoding base64:', decodeErr);
                                    setError(true);
                                    setLoading(false);
                                    return;
                                }
                            } else {
                                console.warn('[SecureVideo] No file data returned');
                            }
                        }
                    }
                } catch (err) {
                    console.error("[SecureVideo] Error loading secure video:", err);
                    setError(true);
                    setLoading(false);
                    return;
                }
            }

            // Fallback for public URLs or if secure fetch failed
            console.log('[SecureVideo] Using fallback src:', src);
            setVideoSrc(src);
            setLoading(false);
        };

        loadVideo();

        return () => {
            if (videoSrc && videoSrc.startsWith('blob:')) {
                URL.revokeObjectURL(videoSrc);
            }
        };
    }, [src]);

    if (loading) {
        return (
            <div className={`flex items-center justify-center bg-muted ${className}`} style={{ minHeight: '200px' }}>
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (error) {
        return (
            <div className={`flex items-center justify-center bg-muted ${className}`} style={{ minHeight: '200px' }}>
                <span className="text-muted-foreground text-sm">Video nicht verfügbar</span>
            </div>
        );
    }

    return (
        <video
            src={videoSrc || src}
            className={className}
            controls
            playsInline
            {...props}
        />
    );
};
