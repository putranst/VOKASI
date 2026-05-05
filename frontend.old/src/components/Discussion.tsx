'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, ThumbsUp, Send, User, Clock } from 'lucide-react';

interface DiscussionComment {
    id: number;
    thread_id: number;
    user_id: number;
    author_name: string;
    content: string;
    created_at: string;
    likes: number;
}

interface DiscussionThread {
    id: number;
    course_id: number;
    user_id: number;
    author_name: string;
    title: string;
    content: string;
    created_at: string;
    comments_count: number;
    likes: number;
    comments: DiscussionComment[];
}

interface DiscussionProps {
    courseId: number;
}

export default function Discussion({ courseId }: DiscussionProps) {
    const [threads, setThreads] = useState<DiscussionThread[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedThread, setSelectedThread] = useState<DiscussionThread | null>(null);

    // Form states
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newThreadContent, setNewThreadContent] = useState('');
    const [newComment, setNewComment] = useState('');

    useEffect(() => {
        fetchThreads();
    }, [courseId]);

    const fetchThreads = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/discussions`);
            const data = await res.json();
            setThreads(data);
        } catch (error) {
            console.error('Failed to fetch discussions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateThread = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/courses/${courseId}/discussions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    author_name: 'Student User',
                    title: newThreadTitle,
                    content: newThreadContent
                })
            });

            if (res.ok) {
                const newThread = await res.json();
                setThreads([newThread, ...threads]);
                setNewThreadTitle('');
                setNewThreadContent('');
                setShowCreateForm(false);
            }
        } catch (error) {
            console.error('Failed to create thread:', error);
        }
    };

    const handleAddComment = async (threadId: number) => {
        if (!newComment.trim()) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/v1/discussions/${threadId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    user_id: 1,
                    author_name: 'Student User',
                    content: newComment
                })
            });

            if (res.ok) {
                const comment = await res.json();
                const updatedThreads = threads.map(t => t.id === threadId ? {
                    ...t,
                    comments: [...t.comments, comment],
                    comments_count: t.comments_count + 1
                } : t);
                setThreads(updatedThreads);
                setNewComment('');

                if (selectedThread && selectedThread.id === threadId) {
                    setSelectedThread({
                        ...selectedThread,
                        comments: [...selectedThread.comments, comment],
                        comments_count: selectedThread.comments_count + 1
                    });
                }
            }
        } catch (error) {
            console.error('Failed to add comment:', error);
        }
    };

    const formatTimeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        return `${Math.floor(seconds / 86400)}d ago`;
    };

    if (loading) {
        return <div className="flex items-center justify-center p-8"><div className="text-gray-600">Loading discussions...</div></div>;
    }

    // Thread Detail  View
    if (selectedThread) {
        return (
            <div className="space-y-6">
                <button onClick={() => setSelectedThread(null)} className="text-primary font-bold hover:underline text-sm">← Back to all discussions</button>
                <div className="bg-white rounded-2xl p-6 border border-gray-200">
                    <h2 className="text-2xl font-black text-gray-900 mb-4">{selectedThread.title}</h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mb-4">
                        <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center"><User size={16} className="text-primary" /></div>
                        <span className="font-bold">{selectedThread.author_name}</span><span>•</span><span>{formatTimeAgo(selectedThread.created_at)}</span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">{selectedThread.content}</p>
                    <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
                        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"><ThumbsUp size={16} /><span>{selectedThread.likes}</span></button>
                        <div className="flex items-center gap-2 text-sm text-gray-600"><MessageSquare size={16} /><span>{selectedThread.comments_count} replies</span></div>
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">{selectedThread.comments_count} Replies</h3>
                    {selectedThread.comments.map((comment) => (
                        <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                            <div className="flex items-start gap-3">
                                <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0"><User size={14} className="text-accent" /></div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2"><span className="font-bold text-sm text-gray-900">{comment.author_name}</span><span className="text-xs text-gray-500">{formatTimeAgo(comment.created_at)}</span></div>
                                    <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                                    <button className="flex items-center gap-1 text-xs text-gray-600 hover:text-primary transition-colors mt-2"><ThumbsUp size={12} /><span>{comment.likes}</span></button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="bg-white rounded-xl p-4 border border-gray-200">
                        <div className="flex gap-3">
                            <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0"><User size={16} className="text-primary" /></div>
                            <div className="flex-1">
                                <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a reply..." className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={3} />
                                <div className="flex justify-end mt-2"><button onClick={() => handleAddComment(selectedThread.id)} disabled={!newComment.trim()} className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-[#5a4a3b] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"><Send size={16} />Reply</button></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Thread List View
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Course Discussions</h3>
                <button onClick={() => setShowCreateForm(!showCreateForm)} className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-[#5a4a3b] transition-all">+ New Discussion</button>
            </div>
            {showCreateForm && (
                <form onSubmit={handleCreateThread} className="bg-white rounded-2xl p-6 border border-gray-200 space-y-4">
                    <h4 className="font-bold text-gray-900">Start a Discussion</h4>
                    <input type="text" value={newThreadTitle} onChange={(e) => setNewThreadTitle(e.target.value)} placeholder="Discussion title..." className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20" required minLength={5} maxLength={200} />
                    <textarea value={newThreadContent} onChange={(e) => setNewThreadContent(e.target.value)} placeholder="What would you like to discuss?" className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" rows={4} required minLength={10} maxLength={2000} />
                    <div className="flex gap-3">
                        <button type="submit" className="px-6 py-2 bg-primary text-white rounded-lg font-bold hover:bg-[#5a4a3b] transition-all">Post Discussion</button>
                        <button type="button" onClick={() => { setShowCreateForm(false); setNewThreadTitle(''); setNewThreadContent(''); }} className="px-6 py-2 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition-all">Cancel</button>
                    </div>
                </form>
            )}
            {threads.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl"><MessageSquare className="text-gray-400 mx-auto mb-4" size={48} /><p className="text-gray-600 mb-4">No discussions yet</p><p className="text-sm text-gray-500">Be the first to start a conversation!</p></div>
            ) : (
                <div className="space-y-3">
                    {threads.map((thread) => (
                        <button key={thread.id} onClick={() => setSelectedThread(thread)} className="w-full text-left bg-white rounded-xl p-6 border border-gray-200 hover:border-primary transition-all">
                            <h4 className="font-bold text-gray-900 mb-2">{thread.title}</h4>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">{thread.content}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-2"><User size={14} /><span>{thread.author_name}</span></div><span>•</span>
                                <div className="flex items-center gap-2"><Clock size={14} /><span>{formatTimeAgo(thread.created_at)}</span></div><span>•</span>
                                <div className="flex items-center gap-2"><MessageSquare size={14} /><span>{thread.comments_count} replies</span></div>
                                <div className="flex items-center gap-2 ml-auto"><ThumbsUp size={14} /><span>{thread.likes}</span></div>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
