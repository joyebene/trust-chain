"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

import {
  Bell,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  TrendingUp,
  Wallet,
  X,
} from "lucide-react";

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [unread, setUnread] = useState(0);

  const pathname = usePathname();

  useEffect(() => {
    async function loadSession() {
      try {
        const response = await fetch("/api/me", {
          credentials: "include",
          cache: "no-store",
        });

        if (response.status === 401) {
          window.location.href = "/login";
          return;
        }

        const data = await response.json();

        if (data.user) {
          setUser(data.user);
        }

        const notificationResponse =
          await fetch("/api/notifications", {
            credentials: "include",
            cache: "no-store",
          });

        if (notificationResponse.status === 401) {
          window.location.href = "/login";
          return;
        }

        const notificationData =
          await notificationResponse.json();

        setUnread(
          (notificationData.notifications || []).filter(
            (n: any) => !n.read
          ).length
        );
      } catch (error) {
        console.error("Session loading error:", error);
      }
    }

    loadSession();
  }, []);

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


  async function logout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    location.href = "/login";
  }

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }

    return pathname.startsWith(href);
  };

  return (
    <div className="app-shell">

      {/* SIDEBAR */}
      <aside className={`sidebar ${open ? "open" : ""}`}>

        {/* BRAND */}
        <div className="side-brand">
          <Image
            src="/logo.jpeg"
            alt=""
            width={46}
            height={46}
          />

          <span>
            TRUST <b>CHAIN</b>
          </span>

          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav>

          <Link
            href="/dashboard"
            className={isActive("/dashboard") ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            <LayoutDashboard />
            <span>Overview</span>
          </Link>

          <Link
            href="/dashboard/investments"
            className={
              isActive("/dashboard/investments")
                ? "active"
                : ""
            }
            onClick={() => setOpen(false)}
          >
            <TrendingUp />
            <span>Investments</span>
          </Link>

          <Link
            href="/dashboard/withdrawals"
            className={
              isActive("/dashboard/withdrawals")
                ? "active"
                : ""
            }
            onClick={() => setOpen(false)}
          >
            <Wallet />
            <span>Withdrawals</span>
          </Link>

          <Link
            href="/dashboard/notifications"
            className={
              isActive("/dashboard/notifications")
                ? "active"
                : ""
            }
            onClick={() => setOpen(false)}
          >
            <Bell />

            <span>Notifications</span>

            {unread > 0 && (
              <em>{unread}</em>
            )}
          </Link>

          <Link
            href="/dashboard/settings"
            className={
              isActive("/dashboard/settings")
                ? "active"
                : ""
            }
            onClick={() => setOpen(false)}
          >
            <Settings />
            <span>Settings</span>
          </Link>

        </nav>

        {/* LOGOUT */}
        <button
          type="button"
          className="logout"
          onClick={logout}
        >
          <LogOut />
          <span>Sign out</span>
        </button>

      </aside>

      {/* MAIN */}
      <div className="app-main">

        {/* HEADER */}
        <header className="app-header">

          <button
            type="button"
            className="mobile-menu"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div>
            <span className="muted">
              Client portal
            </span>

            <h2>
              Good day
              {user?.name
                ? `, ${user.name.split(" ")[0]}`
                : ""}
            </h2>
          </div>

          <Link
            href="/dashboard/notifications"
            className="notification-btn"
          >
            <Bell />

            {unread > 0 && <i />}
          </Link>

        </header>

        {children}

      </div>
    </div>
  );
}
