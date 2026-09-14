import { useState, useEffect } from "react";
import { TrashIcon } from "../../icons/TrashIcon";
import { YoutubeIcon } from "../../icons/YoutubeIcon";
import { TwitterIcon } from "../../icons/TwitterIcons";
import { BookmarkIcon } from "../../icons/BookmarkIcon";
import { ExternalLinkIcon } from "../../icons/ExternalLinkIcon";
import { PlayIcon } from "../../icons/PlayIcon";
import { PreviewModal } from "./PreviewModal";

interface CardProps {
    id: string;
    title: string;
    link: string;
    type: "twitter" | "youtube" | "bookmark";
    viewMode?: "grid" | "list";
    isBookmarked?: boolean;
    onToggleBookmark?: (id: string) => void;
    onDelete?: (id: string) => void;
}

function getYoutubeDetails(link: string) {
    try {
        const url = new URL(link);
        let videoId: string | null = null;

        if (url.hostname === "youtu.be") {
            videoId = url.pathname.slice(1);
        } else if (url.hostname.includes("youtube.com")) {
            if (url.pathname.startsWith("/shorts/")) {
                videoId = url.pathname.split("/")[2];
            } else {
                videoId = url.searchParams.get("v");
            }
        }

        if (videoId) {
            return {
                videoId,
                embedUrl: `https://www.youtube.com/embed/${videoId}`,
                thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            };
        }
        return null;
    } catch {
        return null;
    }
}

function getDomainName(link: string) {
    try {
        const url = new URL(link);
        return url.hostname.replace("www.", "");
    } catch {
        return link;
    }
}

function parseTwitterData(link: string, title: string) {
    let username = "X User";
    let handle = "@x";

    try {
        const url = new URL(link);
        const parts = url.pathname.split("/").filter(Boolean);
        if (parts.length >= 1 && parts[0] !== "i") {
            username = parts[0];
            handle = `@${parts[0]}`;
        }
    } catch {
        // fallback
    }

    let cleanText = title;
    const authorMatch = title.match(/^(.*?) — (.*?)$/);
    if (authorMatch) {
        cleanText = authorMatch[1].replace(/^"|"$/g, "").trim();
        if (authorMatch[2]) {
            username = authorMatch[2];
            handle = `@${authorMatch[2].replace(/\s+/g, "").toLowerCase()}`;
        }
    }

    if (!cleanText || cleanText === link || cleanText.startsWith("http") || cleanText.toLowerCase() === "twitter post") {
        cleanText = `Saved post from ${handle}`;
    }

    return { username, handle, cleanText };
}

interface RichTweetData {
    authorName: string;
    handle: string;
    avatarUrl?: string;
    verified: boolean;
    text: string;
    mediaUrl?: string;
    mediaType?: "photo" | "video" | "gif";
    likes?: number;
    retweets?: number;
    views?: number;
    date?: string;
}

const tweetDataCache: Record<string, RichTweetData> = {};

function formatMetric(num?: number): string {
    if (num === undefined || num === null) return "";
    if (num >= 1_000_000) return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
    if (num >= 1_000) return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "k";
    return num.toLocaleString();
}

function formatTweetDate(dateStr?: string): string {
    if (!dateStr) return "";
    try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "";
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
        return "";
    }
}

export function Card(props: CardProps) {
    const { type, viewMode = "grid" } = props;

    if (viewMode === "list") {
        return <CompactListCard {...props} />;
    }

    if (type === "twitter") {
        return <DedicatedTwitterCard {...props} />;
    }

    if (type === "youtube") {
        return <DedicatedYoutubeCard {...props} />;
    }

    return <DedicatedBookmarkCard {...props} />;
}

/* ==========================================================================
   1. PREMIUM TWITTER / X CARD (Live Resolution & SaaS Aesthetics)
   ========================================================================== */
function DedicatedTwitterCard({
    id,
    title,
    link,
    isBookmarked = false,
    onToggleBookmark,
    onDelete
}: CardProps) {
    const fallback = parseTwitterData(link, title);
    const [tweet, setTweet] = useState<RichTweetData | null>(() => {
        return tweetDataCache[link] || null;
    });
    const [loading, setLoading] = useState(!tweetDataCache[link]);
    const [avatarFailed, setAvatarFailed] = useState(false);

    useEffect(() => {
        if (tweetDataCache[link]) {
            setTweet(tweetDataCache[link]);
            setLoading(false);
            return;
        }

        const match = link.match(/(?:twitter\.com|x\.com)\/([^\/]+)\/status\/(\d+)/);
        if (!match) {
            setLoading(false);
            return;
        }

        const username = match[1];
        const statusId = match[2];
        let isMounted = true;

        fetch(`https://api.fxtwitter.com/${username}/status/${statusId}`)
            .then((res) => {
                if (!res.ok) throw new Error("Fetch failed");
                return res.json();
            })
            .then((data) => {
                if (!isMounted) return;
                if (data && data.tweet) {
                    const t = data.tweet;
                    const mediaItem = t.media?.all?.[0] || t.media?.photos?.[0] || t.media?.videos?.[0];
                    const richData: RichTweetData = {
                        authorName: t.author?.name || username,
                        handle: `@${t.author?.screen_name || username}`,
                        avatarUrl: t.author?.avatar_url,
                        verified: Boolean(t.author?.verification?.verified),
                        text: t.text || fallback.cleanText,
                        mediaUrl: mediaItem?.thumbnail_url || mediaItem?.url,
                        mediaType: mediaItem?.type || (t.media?.videos?.length ? "video" : "photo"),
                        likes: t.likes,
                        retweets: t.retweets,
                        views: t.views,
                        date: formatTweetDate(t.created_at)
                    };
                    tweetDataCache[link] = richData;
                    setTweet(richData);
                }
            })
            .catch(() => {
                // Silently maintain fallback data
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [link, fallback.cleanText]);

    const authorName = tweet?.authorName || fallback.username;
    const handle = tweet?.handle || fallback.handle;
    const cleanText = tweet?.text || fallback.cleanText;
    const sanitizedText = cleanText ? cleanText.replace(/\n\s*\n+/g, "\n").trim() : "";
    const initial = authorName ? authorName.charAt(0).toUpperCase() : "X";
    const avatarUrl = tweet?.avatarUrl;
    const verified = tweet?.verified;
    const mediaUrl = tweet?.mediaUrl;
    const mediaType = tweet?.mediaType;

    if (loading && !tweet) {
        return (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-4 sm:p-5 flex flex-col space-y-3.5 animate-pulse h-auto">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-slate-200" />
                        <div className="space-y-1.5">
                            <div className="w-24 h-3.5 bg-slate-200 rounded-md" />
                            <div className="w-16 h-2.5 bg-slate-100 rounded-md" />
                        </div>
                    </div>
                    <div className="w-16 h-6 bg-slate-100 rounded-lg" />
                </div>
                <div className="space-y-2 py-2">
                    <div className="w-full h-3.5 bg-slate-200 rounded-md" />
                    <div className="w-5/6 h-3.5 bg-slate-200 rounded-md" />
                </div>
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="w-20 h-3 bg-slate-100 rounded-md" />
                    <div className="w-20 h-6 bg-slate-200 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-slate-300 transition-all duration-300 flex flex-col p-4 sm:p-5 space-y-3.5 transform hover:-translate-y-1 relative overflow-hidden h-auto">
            {/* Top Author Header & Action Controls */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {avatarUrl && !avatarFailed ? (
                        <img
                            src={avatarUrl}
                            alt={authorName}
                            onError={() => setAvatarFailed(true)}
                            className="size-9 sm:size-10 rounded-full object-cover border border-slate-200 shadow-xs shrink-0 ring-1 ring-slate-100"
                            loading="lazy"
                        />
                    ) : (
                        <div className="size-9 sm:size-10 rounded-full bg-black text-white font-bold text-sm flex items-center justify-center shadow-xs shrink-0 border border-slate-800">
                            {initial}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 text-sm truncate max-w-[120px] sm:max-w-[160px]" title={authorName}>
                                {authorName}
                            </span>
                            {verified && (
                                <svg className="size-3.5 sm:size-4 text-sky-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                                </svg>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate max-w-[120px] sm:max-w-[160px]">
                            {handle}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {onToggleBookmark && (
                        <button
                            type="button"
                            onClick={() => onToggleBookmark(id)}
                            className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                                isBookmarked
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "text-slate-400 hover:text-indigo-600 hover:bg-slate-100"
                            }`}
                            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                        >
                            <BookmarkIcon size="sm" />
                        </button>
                    )}

                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Open on X"
                    >
                        <ExternalLinkIcon size="sm" />
                    </a>

                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete item"
                        >
                            <TrashIcon size="sm" />
                        </button>
                    )}
                </div>
            </div>

            {/* Tweet Content: Natural size based strictly on content */}
            <div className="flex flex-col space-y-3">
                {mediaUrl ? (
                    <>
                        <p className="text-slate-800 text-sm leading-relaxed break-words font-normal select-text line-clamp-3">
                            {sanitizedText}
                        </p>

                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-slate-950 border border-slate-200/80 group/media block shrink-0 cursor-pointer shadow-2xs"
                            title="Open media on X"
                        >
                            <img
                                src={mediaUrl}
                                alt="Tweet media preview"
                                className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500 opacity-95 group-hover/media:opacity-100"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
                            {mediaType === "video" ? (
                                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md text-white text-xs font-semibold flex items-center gap-1.5 shadow-md">
                                    <PlayIcon size="sm" />
                                    <span>Video</span>
                                </div>
                            ) : (
                                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-0.5 rounded-lg bg-black/60 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1">
                                    <span>Photo</span>
                                </div>
                            )}
                        </a>
                    </>
                ) : (
                    <div className="py-1">
                        <div className="border-l-2 border-slate-900/30 pl-3.5 py-0.5">
                            <p className="text-slate-800 text-sm sm:text-base leading-relaxed break-words font-medium select-text">
                                "{sanitizedText}"
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer: Live Metrics, Timestamp & Open on X Pill */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs gap-2 shrink-0">
                <div className="flex items-center gap-2.5 text-slate-500 font-medium min-w-0 truncate">
                    {tweet?.likes !== undefined && tweet.likes > 0 && (
                        <span className="inline-flex items-center gap-1 text-slate-600 shrink-0" title="Likes">
                            <span className="text-rose-500 text-xs">❤️</span>
                            <span className="text-xs">{formatMetric(tweet.likes)}</span>
                        </span>
                    )}

                    {tweet?.retweets !== undefined && tweet.retweets > 0 && (
                        <span className="inline-flex items-center gap-1 text-slate-600 shrink-0" title="Reposts">
                            <span className="text-emerald-500 text-xs">🔁</span>
                            <span className="text-xs">{formatMetric(tweet.retweets)}</span>
                        </span>
                    )}

                    {tweet?.date && (
                        <span className="text-slate-400 text-[11px] font-mono shrink-0 truncate">
                            {tweet.date}
                        </span>
                    )}
                </div>

                <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all shrink-0 cursor-pointer"
                >
                    <TwitterIcon size="sm" />
                    <span>View on X</span>
                </a>
            </div>
        </div>
    );
}

/* ==========================================================================
   2. DEDICATED YOUTUBE CARD
   ========================================================================== */
function DedicatedYoutubeCard({
    id,
    title,
    link,
    isBookmarked = false,
    onToggleBookmark,
    onDelete
}: CardProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const youtubeDetails = getYoutubeDetails(link);
    const domain = getDomainName(link);

    return (
        <>
            <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-indigo-200/90 transition-all duration-300 flex flex-col h-auto overflow-hidden transform hover:-translate-y-1">
                {/* 16:9 Thumbnail Header */}
                <div className="relative w-full aspect-video bg-slate-950 overflow-hidden shrink-0 group/media">
                    {youtubeDetails ? (
                        <>
                            <img
                                src={youtubeDetails.thumbnailUrl}
                                alt={title}
                                className="w-full h-full object-cover group-hover/media:scale-105 transition-transform duration-500 opacity-90 group-hover/media:opacity-100"
                                loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                            
                            {/* YouTube Badge */}
                            <div className="absolute top-3 left-3">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-600 text-white shadow-lg backdrop-blur-md">
                                    <YoutubeIcon size="sm" />
                                    YouTube
                                </span>
                            </div>

                            {/* Play Button Trigger */}
                            <button
                                type="button"
                                onClick={() => setPreviewOpen(true)}
                                className="absolute inset-0 flex items-center justify-center cursor-pointer group/btn"
                                aria-label="Play Video"
                            >
                                <div className="size-12 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 transform group-hover/btn:scale-110 transition-transform duration-200 border border-white/20 backdrop-blur-md">
                                    <PlayIcon size="md" className="ml-0.5" />
                                </div>
                            </button>
                        </>
                    ) : (
                        <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-400 text-xs">
                            YouTube Video
                        </div>
                    )}

                    {/* Bookmark Toggle Overlay */}
                    {onToggleBookmark && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleBookmark(id);
                            }}
                            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md shadow-lg transition-all cursor-pointer z-10 ${
                                isBookmarked
                                    ? "bg-indigo-600 text-white border border-indigo-400"
                                    : "bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-900 border border-white/10"
                            }`}
                            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                        >
                            <BookmarkIcon size="sm" />
                        </button>
                    )}
                </div>

                {/* Card Content Info */}
                <div className="p-4 sm:p-5 flex flex-col space-y-3.5">
                    <h3
                        className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors"
                        title={title}
                    >
                        {title}
                    </h3>

                    {/* Bottom Actions Bar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-mono text-slate-400 truncate max-w-[140px]" title={domain}>
                            {domain}
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => setPreviewOpen(true)}
                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer font-semibold text-xs flex items-center gap-1"
                                title="Watch video"
                            >
                                <PlayIcon size="sm" /> Watch
                            </button>

                            <a
                                href={link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                                title="Open original link"
                            >
                                <ExternalLinkIcon size="sm" />
                            </a>

                            {onDelete && (
                                <button
                                    type="button"
                                    onClick={() => onDelete(id)}
                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                    title="Delete item"
                                >
                                    <TrashIcon size="sm" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Video Lightbox Modal */}
            <PreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                title={title}
                link={link}
                embedUrl={youtubeDetails?.embedUrl || null}
                type="youtube"
            />
        </>
    );
}

/* ==========================================================================
   3. DEDICATED WEB BOOKMARK CARD
   ========================================================================== */
function DedicatedBookmarkCard({
    id,
    title,
    link,
    isBookmarked = false,
    onToggleBookmark,
    onDelete
}: CardProps) {
    const domain = getDomainName(link);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

    return (
        <div className="group bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-2xl hover:border-indigo-200/90 transition-all duration-300 flex flex-col h-auto overflow-hidden transform hover:-translate-y-1">
            {/* Header Banner */}
            <div className="relative w-full aspect-video bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-5 text-white flex flex-col justify-between shrink-0">
                <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold bg-indigo-600/90 border border-indigo-500/80 text-white shadow-sm backdrop-blur-md">
                        <BookmarkIcon size="sm" />
                        Web Link
                    </span>
                    <div className="size-8 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 p-1 flex items-center justify-center">
                        <img
                            src={faviconUrl}
                            alt={domain}
                            className="size-5 rounded-md object-contain"
                            onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                            }}
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <p className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                        Website Bookmark
                    </p>
                    <p className="text-sm font-semibold text-slate-200 truncate font-mono">
                        {domain}
                    </p>
                </div>

                {/* Bookmark Toggle Button */}
                {onToggleBookmark && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleBookmark(id);
                        }}
                        className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md shadow-lg transition-all cursor-pointer z-10 ${
                            isBookmarked
                                ? "bg-indigo-600 text-white border border-indigo-400"
                                : "bg-slate-900/60 text-slate-300 hover:text-white hover:bg-slate-900 border border-white/10"
                        }`}
                        title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                    >
                        <BookmarkIcon size="sm" />
                    </button>
                )}
            </div>

            {/* Body */}
            <div className="p-4 sm:p-5 flex flex-col space-y-3.5">
                <h3
                    className="font-bold text-slate-900 text-base leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors"
                    title={title}
                >
                    {title}
                </h3>

                {/* Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400 truncate max-w-[140px]" title={domain}>
                        {domain}
                    </span>

                    <div className="flex items-center gap-1">
                        <a
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                            title="Open original link"
                        >
                            <ExternalLinkIcon size="sm" />
                        </a>

                        {onDelete && (
                            <button
                                type="button"
                                onClick={() => onDelete(id)}
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                                title="Delete item"
                            >
                                <TrashIcon size="sm" />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ==========================================================================
   4. COMPACT LIST VIEW CARD
   ========================================================================== */
function CompactListCard({
    id,
    title,
    link,
    type,
    isBookmarked = false,
    onToggleBookmark,
    onDelete
}: CardProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const youtubeDetails = type === "youtube" ? getYoutubeDetails(link) : null;
    const domain = getDomainName(link);

    return (
        <>
            <div className="group bg-white rounded-2xl border border-slate-200/80 p-3.5 sm:p-4 shadow-xs hover:shadow-lg hover:border-indigo-200 transition-all duration-200 flex items-center justify-between gap-3 sm:gap-4">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="shrink-0">
                        {type === "youtube" ? (
                            <div className="size-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100/80 shadow-xs">
                                <YoutubeIcon size="md" />
                            </div>
                        ) : type === "twitter" ? (
                            <div className="size-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                                <TwitterIcon size="md" />
                            </div>
                        ) : (
                            <div className="size-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100/80 shadow-xs">
                                <BookmarkIcon size="md" />
                            </div>
                        )}
                    </div>

                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <h4 
                                className="font-bold text-slate-900 text-sm truncate group-hover:text-indigo-600 transition-colors cursor-pointer"
                                onClick={() => type === "youtube" ? setPreviewOpen(true) : window.open(link, "_blank")}
                                title={title}
                            >
                                {title}
                            </h4>
                            {isBookmarked && (
                                <span className="shrink-0 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200">
                                    Saved
                                </span>
                            )}
                        </div>
                        <p className="text-xs text-slate-400 font-mono truncate mt-0.5">
                            {domain}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {onToggleBookmark && (
                        <button
                            type="button"
                            onClick={() => onToggleBookmark(id)}
                            className={`p-2 rounded-xl transition-all cursor-pointer ${
                                isBookmarked
                                    ? "bg-indigo-600 text-white shadow-xs"
                                    : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                            }`}
                            title={isBookmarked ? "Remove Bookmark" : "Save Bookmark"}
                        >
                            <BookmarkIcon size="sm" />
                        </button>
                    )}

                    {type === "youtube" && (
                        <button
                            type="button"
                            onClick={() => setPreviewOpen(true)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer"
                        >
                            <PlayIcon size="sm" /> Watch
                        </button>
                    )}

                    <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
                        title="Open original link"
                    >
                        <ExternalLinkIcon size="sm" />
                    </a>

                    {onDelete && (
                        <button
                            type="button"
                            onClick={() => onDelete(id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Delete item"
                        >
                            <TrashIcon size="sm" />
                        </button>
                    )}
                </div>
            </div>

            <PreviewModal
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                title={title}
                link={link}
                embedUrl={youtubeDetails?.embedUrl || null}
                type="youtube"
            />
        </>
    );
}
