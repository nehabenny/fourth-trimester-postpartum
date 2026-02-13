"use client";

import { useState, useEffect } from "react";
import { Users, Heart, MessageSquare, Send, User, ChevronDown, ChevronUp, Sparkles } from "lucide-react";
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
    likes: number;
    replies: Reply[];
    timestamp: string;
}

export function CommunityForum() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState("");
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState("");
    const [expandedPosts, setExpandedPosts] = useState<Set<string>>(new Set());

    useEffect(() => {
        const savedPosts = localStorage.getItem("community_posts");
        if (savedPosts) {
            setPosts(JSON.parse(savedPosts));
        } else {
            // Initial seed posts
            const initialPosts: Post[] = [
                {
                    id: "1",
                    text: "Just had my first full 4 hours of sleep in 3 weeks. Feeling like a new human! 🌸",
                    likes: 12,
                    replies: [
                        { id: "r1", text: "That is such a huge win! So happy for you.", timestamp: new Date().toISOString() }
                    ],
                    timestamp: new Date(Date.now() - 3600000).toISOString()
                },
                {
                    id: "2",
                    text: "Does anyone else feel guilty for wanting a break? I love my baby but I'm just so tired.",
                    likes: 24,
                    replies: [
                        { id: "r2", text: "Every single one of us feels this. You are not alone and you are a great mom.", timestamp: new Date().toISOString() }
                    ],
                    timestamp: new Date(Date.now() - 7200000).toISOString()
                }
            ];
            setPosts(initialPosts);
            localStorage.setItem("community_posts", JSON.stringify(initialPosts));
        }
    }, []);

    const savePosts = (updatedPosts: Post[]) => {
        setPosts(updatedPosts);
        localStorage.setItem("community_posts", JSON.stringify(updatedPosts));
    };

    const handleCreatePost = () => {
        if (!newPost.trim()) return;
        const post: Post = {
            id: Date.now().toString(),
            text: newPost,
            likes: 0,
            replies: [],
            timestamp: new Date().toISOString()
        };
        savePosts([post, ...posts]);
        setNewPost("");
    };

    const handleLike = (postId: string) => {
        const updated = posts.map(p =>
            p.id === postId ? { ...p, likes: p.likes + 1 } : p
        );
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
                <div className="mb-4 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    <h2 className="text-xl font-bold">Share Anonymously</h2>
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
                        Post Anonymously
                    </button>
                </div>
            </section>

            {/* Posts List */}
            <div className="space-y-4">
                {posts.map((post) => (
                    <motion.div
                        layout
                        key={post.id}
                        className="rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
                    >
                        <div className="mb-4 flex items-start justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                                    <User className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Anonymous Bloom</p>
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
                                <Heart className={cn("h-4 w-4", post.likes > 12 ? "fill-red-500 text-red-500" : "")} />
                                {post.likes} Cheers
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
            </div>
        </div>
    );
}
