"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
    BarChart3,
    Bell,
    CreditCard,
    LogOut,
    Menu,
    Settings,
    Users,
    Wallet,
    WalletCards,
    X,
} from "lucide-react";

export default function AdminShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const [unread, setUnread] = useState(0);

    const [user, setUser] = useState<any>(null);


    useEffect(() => {
        Promise.all([
            fetch("/api/me"),
            fetch("/api/notifications"),
        ]).then(async ([a, b]) => {
            const x = await a.json();
            const y = await b.json();

            if (x.user) {
                setUser(x.user);
            }

            setUnread(
                (y.notifications || []).filter(
                    (n: any) => !n.read
                ).length
            );
        });
    }, []);

    const isActive = (path: string) => {
        if (path === "/admin") {
            return pathname === "/admin";
        }

        return pathname.startsWith(path);
    };

    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    const handleLogout = async () => {
        try {
            await fetch("/api/auth/logout", {
                method: "POST",
            });
        } catch (error) {
            console.error("Logout error:", error);
        }

        window.location.href = "/login";
    };

    return (
        <div className="admin-shell">
            {/* MOBILE/TABLET TOP BAR */}
            <div className="admin-mobile-header">
                <button
                    type="button"
                    className="admin-menu-button"
                    onClick={() => setSidebarOpen(true)}
                    aria-label="Open menu"
                >
                    <Menu size={24} />
                </button>

                <div className="admin-mobile-title">
                    <span>Trust Chain</span>
                </div>
            </div>

            {/* OVERLAY */}
            {sidebarOpen && (
                <div
                    className="admin-overlay"
                    onClick={closeSidebar}
                />
            )}

            {/* SIDEBAR */}
            <aside
                className={`admin-side ${sidebarOpen ? "admin-side-open" : ""
                    }`}
            >
                {/* SIDEBAR BRAND */}
                <div className="admin-brand">
                    <Image
                        src="/logo.jpeg"
                        alt="Trust Chain"
                        width={42}
                        height={42}
                        className="admin-logo"
                    />

                    <div style={{ display: "flex", flexDirection: "column", color: "black" }}>
                        <h2>Trust Chain</h2>
                        <span>Admin Panel</span>
                    </div>

                    {/* CLOSE BUTTON - TABLET/MOBILE */}
                    <button
                        type="button"
                        className="admin-close-button"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* NAVIGATION */}
                <nav className="admin-nav">
                    <p className="admin-nav-title">MAIN</p>

                    <Link
                        href="/admin"
                        className={`admin-nav-link ${isActive("/admin") ? "active" : ""
                            }`}
                        onClick={closeSidebar}
                    >
                        <BarChart3 size={19} />
                        <span>Overview</span>
                    </Link>

                    <Link
                        href="/admin/payments"
                        className={`admin-nav-link ${isActive("/admin/payments") ? "active" : ""
                            }`}
                        onClick={closeSidebar}
                    >
                        <CreditCard size={19} />
                        <span>Payments</span>
                    </Link>

                    <Link
                        href="/admin/withdrawals"
                        className={`admin-nav-link ${isActive("/admin/withdrawals")
                            ? "active"
                            : ""
                            }`}
                        onClick={closeSidebar}
                    >
                        <Wallet size={19} />
                        <span>Withdrawals</span>
                    </Link>

                    <Link
                        href="/admin/payment-methods"
                        className={`admin-nav-link ${isActive("/admin/payment-methods")
                            ? "active"
                            : ""
                            }`}
                        onClick={closeSidebar}
                    >
                        <WalletCards size={19} />
                        <span>Payment Methods</span>
                    </Link>

                    <Link
                        href="/admin/users"
                        className={`admin-nav-link ${isActive("/admin/users") ? "active" : ""
                            }`}
                        onClick={closeSidebar}
                    >
                        <Users size={19} />
                        <span>Users</span>
                    </Link>

                    <p className="admin-nav-title">SYSTEM</p>

                    <Link
                        href="/admin/notifications"
                        className={`admin-nav-link ${isActive("/admin/notifications") ? "active" : ""
                            }`}
                        onClick={closeSidebar}
                    >
                        <Bell size={19} />

                        <span>Notifications</span>

                        {unread > 0 && (
                            <em>{unread}</em>
                        )}
                    </Link>

                    <Link
                        href="/admin/settings"
                        className={`admin-nav-link ${isActive("/admin/settings") ? "active" : ""
                            }`}
                        onClick={closeSidebar}
                    >
                        <Settings size={19} />
                        <span>Settings</span>
                    </Link>
                </nav>

                {/* LOGOUT */}
                <div className="admin-side-bottom">
                    <button
                        type="button"
                        style={{ display: "flex", alignItems: "center", gap: 8, borderRadius: "20px", padding: "8px 30px" }}
                        onClick={handleLogout}
                    >
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="admin-main">
                {children}
            </main>
        </div>
    );
}