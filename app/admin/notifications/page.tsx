"use client";

import { useEffect, useState } from "react";
import { Bell, Check } from "lucide-react";

import { dateTime } from "@/lib/format";

type Notification = {
    _id: string;
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
};

export default function Notifications() {
    const [rows, setRows] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [marking, setMarking] = useState(false);

    useEffect(() => {
        async function loadNotifications() {
            try {
                const response =
                    await fetch(
                        "/api/notifications"
                    );

                const data =
                    await response.json();

                setRows(
                    data.notifications || []
                );
            } catch (error) {
                console.error(
                    "Failed to load notifications:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadNotifications();
    }, []);

    async function markAllRead() {
        if (marking) return;

        try {
            setMarking(true);

            const response =
                await fetch(
                    "/api/notifications",
                    {
                        method: "PATCH",
                    }
                );

            if (!response.ok) {
                throw new Error(
                    "Failed to mark notifications as read."
                );
            }

            setRows((current) =>
                current.map(
                    (notification) => ({
                        ...notification,
                        read: true,
                    })
                )
            );
        } catch (error) {
            console.error(
                "Mark notifications error:",
                error
            );
        } finally {
            setMarking(false);
        }
    }

    return (
        <div className="dashboard-page">
            <div className="container-app">
                <div className="welcome-row">
                    <div>
                        <span className="section-kicker">
                            INBOX
                        </span>

                        <h1>
                            Notifications
                        </h1>

                        <p className="muted">
                            Important updates
                            about your account
                            and payments.
                        </p>
                    </div>

                    <button
                        className="btn btn-outline"
                        onClick={
                            markAllRead
                        }
                        disabled={
                            marking ||
                            !rows.some(
                                (n) =>
                                    !n.read
                            )
                        }
                    >
                        <Check size={16} />

                        {marking
                            ? "Marking..."
                            : "Mark all read"}
                    </button>
                </div>

                <div className="panel notification-list">
                    {loading && (
                        <div className="empty">
                            Loading notifications...
                        </div>
                    )}

                    {!loading &&
                        rows.map(
                            (
                                notification
                            ) => (
                                <div
                                    className={`notification-row ${
                                        !notification.read
                                            ? "unread"
                                            : ""
                                    }`}
                                    key={
                                        notification._id
                                    }
                                >
                                    <div className="notification-icon">
                                        <Bell
                                            size={
                                                18
                                            }
                                        />
                                    </div>

                                    <div>
                                        <b>
                                            {
                                                notification.title
                                            }
                                        </b>

                                        <p>
                                            {
                                                notification.message
                                            }
                                        </p>

                                        <small>
                                            {dateTime(
                                                notification.createdAt
                                            )}
                                        </small>
                                    </div>
                                </div>
                            )
                        )}

                    {!loading &&
                        !rows.length && (
                            <div className="empty">
                                You have no
                                notifications.
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
}