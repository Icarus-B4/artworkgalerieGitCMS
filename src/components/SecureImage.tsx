import { useState, useEffect } from "react";
import { fetchRawFileFromGitHub, getGitHubConfig } from "@/lib/github";
import { Loader2 } from "lucide-react";

interface SecureImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string;
    alt: string;
}

export const SecureImage = ({ src, alt, className, ...props }: SecureImageProps) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const loadImage = async () => {
            // If it's a demo image (imported asset) or a blob URL, use it directly
            if (!src || src.startsWith('/assets/') || src.startsWith('blob:') || src.startsWith('data:')) {
                setImageSrc(src);
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
                        console.log('[SecureImage] Loading from private repo:', src);
                        // We need to fetch it via API to authenticate
                        // Convert raw URL to API path
                        // Remove prefix up to branch
                        const pathParts = src.split(`/${branch}/`);
                        if (pathParts.length > 1) {
                            const path = pathParts[1];
                            console.log('[SecureImage] Fetching path:', path);
                            const fileData = await fetchRawFileFromGitHub(path);

                            if (fileData && fileData.content) {
                                console.log('[SecureImage] File fetched, converting to blob. Content length:', fileData.content.length);
                                // Convert base64 to blob
                                try {
                                    const byteCharacters = atob(fileData.content);
                                    const byteNumbers = new Array(byteCharacters.length);
                                    for (let i = 0; i < byteCharacters.length; i++) {
                                        byteNumbers[i] = byteCharacters.charCodeAt(i);
                                    }
                                    const byteArray = new Uint8Array(byteNumbers);

                                    // Detect MIME type from file extension
                                    const ext = path.split('.').pop()?.toLowerCase();
                                    let mimeType = 'image/png';
                                    if (ext === 'jpg' || ext === 'jpeg') mimeType = 'image/jpeg';
                                    else if (ext === 'gif') mimeType = 'image/gif';
                                    else if (ext === 'webp') mimeType = 'image/webp';
                                    else if (ext === 'svg') mimeType = 'image/svg+xml';

                                    const blob = new Blob([byteArray], { type: mimeType });
                                    const objectUrl = URL.createObjectURL(blob);
                                    console.log('[SecureImage] Blob created successfully:', objectUrl);
                                    setImageSrc(objectUrl);
                                    setLoading(false);
                                    return;
                                } catch (decodeErr) {
                                    console.error('[SecureImage] Error decoding base64:', decodeErr);
                                    setError(true);
                                    setLoading(false);
                                    return;
                                }
                            } else {
                                console.warn('[SecureImage] No file data returned');
                            }
                        }
                    }
                } catch (err) {
                    console.error("[SecureImage] Error loading secure image:", err);
                    setError(true);
                    setLoading(false);
                    return;
                }
            }

            // Fallback for public URLs or if secure fetch failed
            console.log('[SecureImage] Using fallback src:', src);
            setImageSrc(src);
            setLoading(false);
        };

        loadImage();

        return () => {
            if (imageSrc && imageSrc.startsWith('blob:')) {
                URL.revokeObjectURL(imageSrc);
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
                <span className="text-muted-foreground text-sm">Bild nicht verfügbar</span>
            </div>
        );
    }

    return <img src={imageSrc || src} alt={alt} className={className} {...props} />;
};
