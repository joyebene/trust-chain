
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ArrowLeft,
    Wallet,
    TrendingUp,
    DollarSign,
    Trash2,
    Loader2,
    RefreshCw,
    UserRound,
    ShieldCheck,
} from "lucide-react";

type User = {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    balanceUSD: number;
    investedBalanceUSD: number;
    totalProfitUSD: number;
    createdAt: string;
};

type ApiResponse = {
    user?: User;
    message?: string;
    error?: string;
};

export default function AdminUserDetailsPage() {
    const params = useParams();
    const router = useRouter();

    const id = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState(
        "Administrator wallet top-up"
    );

    const [processing, setProcessing] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const money = (value?: number) =>
        `$${Number(value || 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;

    const loadUser = useCallback(async (showRefresh = false) => {
        try {
            if (showRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError("");

            const response = await fetch(
                `/api/admin/users/${id}`,
                {
                    method: "GET",
                    cache: "no-store",
                }
            );

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Unable to load user."
                );
            }

            if (!data.user) {
                throw new Error("User information was not returned.");
            }

            setUser(data.user);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Unable to load user."
            );
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            loadUser();
        }
    }, [id, loadUser]);

    async function handleTopup(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (!user) {
            setError("User information is unavailable.");
            return;
        }

        const value = Number(amount);

        if (!Number.isFinite(value) || value <= 0) {
            setError("Enter a valid top-up amount.");
            return;
        }

        if (value > 1000000) {
            setError("Top-up amount exceeds the permitted limit.");
            return;
        }

        if (!user.isActive) {
            setError("This account is inactive. Activate it before topping up.");
            return;
        }

        const confirmed = window.confirm(
            `Confirm wallet top-up?\n\n` +
            `User: ${user.name}\n` +
            `Email: ${user.email}\n` +
            `Amount: ${money(value)}\n` +
            `Current Balance: ${money(user.balanceUSD)}\n` +
            `New Balance: ${money(user.balanceUSD + value)}`
        );

        if (!confirmed) return;

        try {
            setProcessing(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `/api/admin/users/${id}/topup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        amountUSD: value,
                        description:
                            description.trim() ||
                            "Administrator wallet top-up",
                    }),
                }
            );

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Wallet top-up failed."
                );
            }

            setMessage(
                data.message || "Wallet topped up successfully."
            );

            setAmount("");
            await loadUser(true);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Wallet top-up failed."
            );
        } finally {
            setProcessing(false);
        }
    }

    async function handleDelete() {
        if (!user || processing || deleting) return;

        const confirmed = window.confirm(
            `Are you sure you want to delete ${user.name}'s account?\n\n` +
            `Email: ${user.email}\n\n` +
            "The account will be disabled. Financial records will be preserved."
        );

        if (!confirmed) return;

        const finalConfirmation = window.confirm(
            "FINAL CONFIRMATION\n\n" +
            "This user will lose access to their account.\n" +
            "Payment, investment and withdrawal records should remain preserved.\n\n" +
            "Continue?"
        );

        if (!finalConfirmation) return;

        try {
            setDeleting(true);
            setError("");
            setMessage("");

            const response = await fetch(
                `/api/admin/users/${id}`,
                {
                    method: "DELETE",
                }
            );

            const data: ApiResponse = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error || "Account deletion failed."
                );
            }

            window.alert(
                data.message || "Account deleted successfully."
            );

            router.push("/admin/users");
            router.refresh();
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Account deletion failed."
            );
        } finally {
            setDeleting(false);
        }
    }

    if (loading) {
        return (
            <div className="empty-state">
                <Loader2 className="spin" />
                <p>Loading user details...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="empty-state">
                <UserRound size={35} />
                <h2>User not found</h2>
                <p>
                    The requested user could not be loaded.
                </p>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => router.push("/admin/users")}
                >
                    <ArrowLeft size={16} />
                    Back to Users
                </button>
            </div>
        );
    }

    return (
        <div className="container-app">

            {/* PAGE HEADER */}
            <header className="admin-header">
                <div>
                    <button
                        type="button"
                        className="btn"
                        onClick={() => router.push("/admin/users")}
                    >
                        <ArrowLeft size={16} />
                        Back to Users
                    </button>

                    <h1>User Details</h1>

                    <p>
                        Manage this user's account, wallet and account access.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn"
                    onClick={() => loadUser(true)}
                    disabled={refreshing}
                >
                    {refreshing ? (
                        <Loader2 className="spin" size={16} />
                    ) : (
                        <RefreshCw size={16} />
                    )}
                    Refresh
                </button>
            </header>

            {/* NOTIFICATIONS */}
            {message && (
                <div className="alert success">
                    {message}
                </div>
            )}

            {error && (
                <div className="alert error">
                    {error}
                </div>
            )}

            {/* USER PROFILE */}
            <section className="panel">
                <div className="panel-head">
                    <div className="flex items-center gap-3">
                        <div className="rounded-full bg-gray-100 p-3">
                            <UserRound size={26} />
                        </div>

                        <div>
                            <h2>{user.name}</h2>
                            <p>{user.email}</p>
                        </div>
                    </div>

                    <span
                        className={`status ${
                            user.isActive
                                ? "status-approved"
                                : "status-declined"
                        }`}
                    >
                        {user.isActive ? "Active" : "Inactive"}
                    </span>
                </div>

                <div className="table-scroll">
                    <table className="admin-table">
                        <tbody>
                            <tr>
                                <th>Full Name</th>
                                <td>{user.name}</td>
                            </tr>

                            <tr>
                                <th>Email Address</th>
                                <td>{user.email}</td>
                            </tr>

                            <tr>
                                <th>Phone Number</th>
                                <td>{user.phone || "—"}</td>
                            </tr>

                            <tr>
                                <th>Role</th>
                                <td>{user.role}</td>
                            </tr>

                            <tr>
                                <th>Date Joined</th>
                                <td>
                                    {new Date(user.createdAt).toLocaleDateString(
                                        "en-NG",
                                        {
                                            day: "numeric",
                                            month: "long",
                                            year: "numeric",
                                        }
                                    )}
                                </td>
                            </tr>

                            <tr>
                                <th>User ID</th>
                                <td className="break-all">
                                    {user._id}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </section>

            {/* FINANCIAL SUMMARY */}
            <div className="dashboard-grid">

                <section className="panel">
                    <Wallet size={24} />
                    <p>Available Wallet Balance</p>
                    <h2>{money(user.balanceUSD)}</h2>
                </section>

                <section className="panel">
                    <TrendingUp size={24} />
                    <p>Invested Balance</p>
                    <h2>{money(user.investedBalanceUSD)}</h2>
                </section>

                <section className="panel">
                    <DollarSign size={24} />
                    <p>Total Profit</p>
                    <h2>{money(user.totalProfitUSD)}</h2>
                </section>

            </div>

            {/* WALLET TOP-UP */}
            <section className="panel">
                <div className="panel-head">
                    <div>
                        <h2>Top Up Wallet</h2>
                        <p>
                            Manually credit this user's available USD balance.
                        </p>
                    </div>

                    <Wallet size={24} />
                </div>

                <div className="p-4">
                    <div className="rounded-lg bg-gray-50 p-4 mb-5">
                        <p className="text-sm text-gray-500">
                            Current Available Balance
                        </p>

                        <h2 className="text-2xl font-bold">
                            {money(user.balanceUSD)}
                        </h2>
                    </div>

                    <form
                        className="form"
                        onSubmit={handleTopup}
                    >
                        <label>
                            Amount (USD)

                            <input
                                type="number"
                                min="0.01"
                                max="1000000"
                                step="0.01"
                                required
                                placeholder="Enter amount"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={processing || deleting}
                            />
                        </label>

                        <label>
                            Description

                            <input
                                type="text"
                                maxLength={250}
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                placeholder="Reason for wallet top-up"
                                disabled={processing || deleting}
                            />
                        </label>

                        {amount && Number(amount) > 0 && (
                            <div className="rounded-lg bg-gray-50 p-4">
                                <p className="text-sm text-gray-500">
                                    Projected New Balance
                                </p>

                                <h3 className="text-xl font-bold">
                                    {money(
                                        user.balanceUSD + Number(amount)
                                    )}
                                </h3>
                            </div>
                        )}

                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={
                                processing ||
                                deleting ||
                                !user.isActive ||
                                !amount
                            }
                        >
                            {processing ? (
                                <Loader2 className="spin" size={17} />
                            ) : (
                                <Wallet size={17} />
                            )}

                            {processing
                                ? "Processing Top-up..."
                                : "Credit Wallet"}
                        </button>

                        {!user.isActive && (
                            <p className="text-danger">
                                This account is inactive. Activate it before
                                topping it up.
                            </p>
                        )}
                    </form>

                    <p className="text-sm text-gray-500 mt-4">
                        This operation increases the available wallet balance.
                        It does not automatically create an investment or
                        change the invested balance.
                    </p>
                </div>
            </section>

            {/* ACCOUNT DELETION */}
            <section className="panel">
                <div className="panel-head">
                    <div>
                        <h2>Danger Zone</h2>
                        <p>
                            Remove this user's access while preserving
                            financial records.
                        </p>
                    </div>

                    <Trash2 color="red" />
                </div>

                <div className="p-4">
                    <div className="flex items-start gap-3 mb-4">
                        <ShieldCheck
                            size={22}
                            className="text-green-600 shrink-0"
                        />

                        <p className="text-sm text-gray-600">
                            Account deletion should disable login access
                            without permanently deleting payment,
                            investment or withdrawal records.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="btn btn-danger"
                        onClick={handleDelete}
                        disabled={processing || deleting}
                    >
                        {deleting ? (
                            <Loader2 className="spin" size={17} />
                        ) : (
                            <Trash2 size={17} />
                        )}

                        {deleting
                            ? "Deleting Account..."
                            : "Delete Account"}
                    </button>
                </div>
            </section>

        </div>
    );
}
