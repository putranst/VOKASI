import React, { useState, useEffect } from 'react';
import { Bell, Check, Info, AlertCircle } from 'lucide-react';

interface Notification {
    id: number;
    title: string;
    message: string;
    type: 'system' | 'instructor' | 'institution';
    is_read: boolean;
    created_at: string;
}

export function NotificationPopover() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/v1/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data);
                setUnreadCount(data.filter((n: Notification) => !n.is_read).length);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const markAsRead = async (id: number) => {
        try {
            await fetch(`http://localhost:8000/api/v1/notifications/${id}/read`, {
                method: 'POST'
            });
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, is_read: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'system': return <Info size={16} className="text-blue-500" />;
            case 'instructor': return <AlertCircle size={16} className="text-amber-500" />;
            case 'institution': return <Check size={16} className="text-green-500" />;
            default: return <Info size={16} />;
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-full transition-colors"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-1 rounded-full">
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No notifications yet
                                </div>
                            ) : (
                                notifications.map(notif => (
                                    <div
                                        key={notif.id}
                                        className={`p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!notif.is_read ? 'bg-blue-50/50' : ''}`}
                                        onClick={() => !notif.is_read && markAsRead(notif.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="mt-1 flex-shrink-0">
                                                {getIcon(notif.type)}
                                            </div>
                                            <div>
                                                <h4 className={`text-sm ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notif.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <span className="text-[10px] text-gray-400 mt-2 block">
                                                    {new Date(notif.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
