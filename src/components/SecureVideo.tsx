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
                        // We need to fetch it via API to authenticate
                        // Convert raw URL to API path
                        // Remove prefix up to branch
                        const pathParts = src.split(`/${branch}/`);
                        if (pathParts.length > 1) {
                            const path = pathParts[1];
                            const fileData = await fetchRawFileFromGitHub(path);

                            if (fileData) {
                                // Convert base64 to blob
                                const byteCharacters = atob(fileData.content);
                                const byteNumbers = new Array(byteCharacters.length);
                                for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                }
                                const byteArray = new Uint8Array(byteNumbers);
                                const mimeType = getMimeType(path);
                                const blob = new Blob([byteArray], { type: mimeType });
                                const objectUrl = URL.createObjectURL(blob);
                                setVideoSrc(objectUrl);
                                setLoading(false);
                                return;
                            }
                        }
                    }
                } catch (err) {
                    console.error("Error loading secure video:", err);
                    setError(true);
                }
            }

            // Fallback for public URLs or if secure fetch failed
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
