"use client";

import { useState, useEffect } from "react";
import { Users, Heart, MessageSquare, Send, User, ChevronDown, ChevronUp, Sparkles, Smile, HeartPulse } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Reply {
    id: string;
    text: string;
    timestamp: string;
}

interface Post {
    id: string;
    text: string;
    category: string;
    likes: number;
    replies: Reply[];
    timestamp: string;
    isLiked?: boolean; // Client-side state for the current user
}

const CATEGORIES = [
    { id: "all", label: "All Feed", icon: <Users className="h-3 w-3" /> },
    { id: "selfcare", label: "#selfcare", icon: <Sparkles className="h-3 w-3" /> },
    { id: "breastfeeding", label: "#breastfeeding", icon: <Heart className="h-3 w-3" /> },
    { id: "mentalhealth", label: "#mentalhealth", icon: <Smile className="h-3 w-3" /> },
    { id: "recovery", label: "#recovery", icon: <HeartPulse className="h-3 w-3" /> },
    { id: "newborn", label: "#newborn", icon: <User className="h-3 w-3" /> },
];

export function CommunityForum() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("selfcare");
    const [filterCategory, setFilterCategory] = useState("all");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

    useEffect(() => {
        const savedPosts = localStorage.getItem("community_posts");
        const likedIds = JSON.parse(localStorage.getItem("user_liked_posts") || "[]");

        if (savedPosts) {
            const parsed = JSON.parse(savedPosts).map((p: Post) => ({
                ...p,
                isLiked: likedIds.includes(p.id)
            }));
            setPosts(parsed);
        } else {
            // Initial seed posts
            const initialPosts: Post[] = [
                {
                    id: "1",
                    text: "Just had my first full 4 hours of sleep in 3 weeks. Feeling like a new human! 🌸",
                    category: "recovery",
                    likes: 12,
                    replies: [
                        { id: "r1", text: "That is such a huge win! So happy for you.", timestamp: new Date().toISOString() }
                    ],
                    timestamp: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: "2",
                    text: "Does anyone else feel guilty for wanting a break? I love my baby but I'm just so tired.",
                    category: "mentalhealth",
                    likes: 24,
                    replies: [
                        { id: "r2", text: "Every single one of us feels this. You are not alone and you are a great mom.", timestamp: new Date().toISOString() }
                    ],
                    timestamp: new Date(Date.now() - 7200000).toISOString()
                }
            ];
            const initialized = initialPosts.map(p => ({ ...p, isLiked: likedIds.includes(p.id) }));
            setPosts(initialized);
            localStorage.setItem("community_posts", JSON.stringify(initialPosts));
        }
    }, []);

    const savePosts = (updatedPosts: Post[]) => {
        // Strip isLiked before saving to global storage simulation
        const toSave = updatedPosts.map(({ isLiked, ...rest }) => rest);
        setPosts(updatedPosts);
        localStorage.setItem("community_posts", JSON.stringify(toSave));
    };

    const handleCreatePost = () => {
        if (!newPost.trim()) return;
        const post: Post = {
            id: Date.now().toString(),
            text: newPost,
            category: selectedCategory,
            likes: 0,
            replies: [],
            timestamp: new Date().toISOString(),
            isLiked: false
        };
        savePosts([post, ...posts]);
        setNewPost("");
    };

    const filteredPosts = filterCategory === "all"
        ? posts
        : posts.filter(p => p.category === filterCategory);

    const handleLike = (postId: string) => {
        const likedIds = JSON.parse(localStorage.getItem("user_liked_posts") || "[]");
        let newLikedIds = [...likedIds];

        const updated = posts.map(p => {
            if (p.id === postId) {
                const isTogglingOff = p.isLiked;
                if (isTogglingOff) {
                    newLikedIds = newLikedIds.filter(id => id !== postId);
                    return { ...p, likes: Math.max(0, p.likes - 1), isLiked: false };
                } else {
                    newLikedIds.push(postId);
                    return { ...p, likes: p.likes + 1, isLiked: true };
                }
            }
            return p;
        });

        localStorage.setItem("user_liked_posts", JSON.stringify(newLikedIds));
        savePosts(updated);
    };

    const handleReply = (postId: string) => {
        if (!replyText.trim()) return;
        const updated = posts.map(p => {
            if (p.id === postId) {
                const reply: Reply = {
                    id: Date.now().toString(),
                    text: replyText,
                    timestamp: new Date().toISOString()
                };
                return { ...p, replies: [...p.replies, reply] };
            }
            return p;
        });
        savePosts(updated);
        setReplyText("");
        setReplyingTo(null);
        setExpandedPosts(prev => new Set(prev).add(postId));
    };

    const toggleExpand = (postId: string) => {
        setExpandedPosts(prev => {
            const next = new Set(prev);
            if (next.has(postId)) next.delete(postId);
            else next.add(postId);
            return next;
        });
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Create Post Section */}
            <section className="rounded-3xl border bg-card p-6 shadow-sm ring-1 ring-primary/5">
                <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-bold">Share Anonymously</h2>
                    </div>
                </div>

                {/* Post Category Selection & Filter */}
                <div className="mb-4 flex flex-wrap gap-2">
                    {CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setFilterCategory(cat.id);
                                if (cat.id !== "all") setSelectedCategory(cat.id);
                            }}
                            className={cn(
                                "flex items-center gap-2 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all",
                                filterCategory === cat.id
                                    ? "bg-primary text-primary-foreground shadow-md ring-1 ring-primary/30"
                                    : "bg-muted/50 text-muted-foreground hover:bg-muted"
                            )}
                        >
                            {cat.icon}
                            {cat.label}
                        </button>
                    ))}
                </div>

                <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder="What's on your mind? This is a safe, anonymous space."
                    className="h-24 w-full resize-none rounded-2xl border-none bg-muted/30 p-4 text-sm focus:ring-2 focus:ring-primary/20"
                />
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={handleCreatePost}
                        disabled={!newPost.trim()}
                        className="flex items-center gap-2 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground shadow-lg transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                        <Send className="h-4 w-4" />
                        Post to #{selectedCategory}
                    </button>
                </div>
            </section>

            {/* Posts List */}
            <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                    {filteredPosts.map((post) => (
                        <motion.div
                            layout
                            key={post.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        <User className="h-4 w-4" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Anonymous Bloom</p>
                                            <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                                            <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[9px] font-bold uppercase text-secondary">
                                                #{post.category}
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground">{new Date(post.timestamp).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>

                            <p className="mb-6 text-sm leading-relaxed text-foreground md:text-base">
                                {post.text}
                            </p>

                            <div className="flex items-center gap-6 border-t pt-4">
                                <button
                                    onClick={() => handleLike(post.id)}
                                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground transition-all hover:text-red-500"
                                >
                                    <Heart className={cn("h-4 w-4 transition-all", post.isLiked ? "fill-red-500 text-red-500 scale-125" : "text-muted-foreground")} />
                                    {post.likes} {post.likes === 1 ? "Cheer" : "Cheers"}
                                </button>
                                <button
                                    onClick={() => setReplyingTo(replyingTo === post.id ? null : post.id)}
                                    className="flex items-center gap-2 text-xs font-bold text-muted-foreground transition-all hover:text-primary"
                                >
                                    <MessageSquare className="h-4 w-4" />
                                    {post.replies.length} Support
                                </button>
                                {post.replies.length > 0 && (
                                    <button
                                        onClick={() => toggleExpand(post.id)}
                                        className="ml-auto text-muted-foreground transition-all hover:text-foreground"
                                    >
                                        {expandedPosts.has(post.id) ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                )}
                            </div>

                            {/* Reply Input */}
                            <AnimatePresence>
                                {replyingTo === post.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 overflow-hidden"
                                    >
                                        <div className="flex gap-2">
                                            <input
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                placeholder="Write a supportive reply..."
                                                className="flex-1 rounded-xl border-none bg-muted/50 px-4 py-2 text-sm focus:ring-2 focus:ring-primary/20"
                                            />
                                            <button
                                                onClick={() => handleReply(post.id)}
                                                className="rounded-xl bg-primary px-4 py-2 text-white shadow-sm"
                                            >
                                                Reply
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Replies List */}
                            <AnimatePresence>
                                {expandedPosts.has(post.id) && post.replies.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="mt-4 space-y-3 overflow-hidden border-l-2 border-primary/10 pl-4"
                                    >
                                        {post.replies.map((reply) => (
                                            <div key={reply.id} className="rounded-2xl bg-muted/30 p-3">
                                                <div className="mb-1 flex items-center gap-2">
                                                    <User className="h-3 w-3 text-muted-foreground" />
                                                    <span className="text-[10px] font-bold text-muted-foreground uppercase">Anonymous Bloom</span>
                                                </div>
                                                <p className="text-xs leading-relaxed text-foreground/80">{reply.text}</p>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
