"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import {
    ArrowDownRight,
    ArrowUpRight,
    CreditCard,
    DollarSign,
    Users,
    Wallet,
} from "lucide-react";

type Stats = {
    totalUsers: number;
    totalPayments: number;
    pendingPayments: number;
    approvedPayments: number;
    totalInvestments: number;
    totalPaid: number;
};

type Payment = {
    _id: string;

    userId: {
        name: string;
        email: string;
        phone: string;
    };

    amount: number;
    currency: string;
    status: string;
    transactionHash: string;

    createdAt: string;
};

type Withdrawal = {
    _id: string;

    userId: {
        name: string;
        email: string;
        phone: string;
        balanceUSD?: number;
    };

    amountUSD: number;
    payoutAmount: number;
    currency: string;
    network: string;
    walletAddress: string;
    status: string;

    declineReason?: string;
    transactionHash?: string;

    createdAt: string;
};

export default function AdminOverviewPage() {
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        totalPayments: 0,
        pendingPayments: 0,
        approvedPayments: 0,
        totalInvestments: 0,
        totalPaid: 0,
    });

    const [payments, setPayments] =
        useState<Payment[]>([]);

    const [withdrawals, setWithdrawals] =
        useState<Withdrawal[]>([]);

    const [loading, setLoading] =
        useState(true);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const [
                statsRes,
                paymentsRes,
                withdrawalsRes,
            ] = await Promise.all([
                fetch("/api/admin/stats"),
                fetch("/api/admin/payments"),
                fetch("/api/admin/withdrawals"),
            ]);

            /**
             * ADMIN STATS
             */
            if (statsRes.ok) {
                const data =
                    await statsRes.json();

                setStats({
                    totalUsers:
                        data.totalUsers ??
                        data.users ??
                        0,

                    totalPayments:
                        data.totalPayments ??
                        data.payments ??
                        0,

                    pendingPayments:
                        data.pendingPayments ??
                        data.pending ??
                        0,

                    approvedPayments:
                        data.approvedPayments ??
                        data.approved ??
                        0,

                    totalInvestments:
                        data.totalInvestments ??
                        data.investments ??
                        0,

                    totalPaid:
                        data.totalPaid ??
                        data.totalAmount ??
                        0,
                });
            }

            /**
             * RECENT PAYMENTS
             */
            if (paymentsRes.ok) {
                const data =
                    await paymentsRes.json();

                const paymentList =
                    Array.isArray(data)
                        ? data
                        : data.payments || [];

                setPayments(
                    paymentList.slice(0, 5)
                );
            }

            /**
             * RECENT WITHDRAWALS
             */
            if (withdrawalsRes.ok) {
                const data =
                    await withdrawalsRes.json();

                const withdrawalList =
                    Array.isArray(data)
                        ? data
                        : data.withdrawals || [];

                setWithdrawals(
                    withdrawalList.slice(0, 5)
                );
            }
        } catch (error) {
            console.error(
                "Dashboard error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    /**
     * Format crypto and fiat amounts.
     */
    const formatMoney = (
        amount: number,
        currency = "USD"
    ) => {
        const value =
            Number(amount) || 0;

        /**
         * Crypto currencies
         */
        if (
            currency === "BTC" ||
            currency === "ETH" ||
            currency === "USDT" ||
            currency === "USDC"
        ) {
            return `${value.toLocaleString(
                undefined,
                {
                    minimumFractionDigits:
                        currency === "BTC"
                            ? 8
                            : currency === "ETH"
                              ? 6
                              : 2,

                    maximumFractionDigits:
                        currency === "BTC"
                            ? 8
                            : currency === "ETH"
                              ? 6
                              : 2,
                }
            )} ${currency}`;
        }

        /**
         * Normal fiat currencies
         */
        return new Intl.NumberFormat(
            "en-NG",
            {
                style: "currency",
                currency,
                maximumFractionDigits: 2,
            }
        ).format(value);
    };

    const formatUSD = (
        amount: number
    ) => {
        return new Intl.NumberFormat(
            "en-US",
            {
                style: "currency",
                currency: "USD",
                maximumFractionDigits: 2,
            }
        ).format(
            Number(amount) || 0
        );
    };

    const formatDate = (
        date: string
    ) => {
        return new Date(
            date
        ).toLocaleDateString(
            "en-NG",
            {
                day: "numeric",
                month: "short",
                year: "numeric",
            }
        );
    };

    return (
        <>
            <header className="admin-header">
                <div>
                    <h1>
                        Dashboard Overview
                    </h1>

                    <p>
                        Monitor your Trust Chain
                        platform.
                    </p>
                </div>
            </header>

            <div className="container-app">

                {/* =========================
                    STATISTICS
                ========================== */}

                <div className="admin-stat-grid">

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <Users size={21} />
                        </div>

                        <div>
                            <span>
                                Total Users
                            </span>

                            <strong>
                                {stats.totalUsers}
                            </strong>
                        </div>

                        <ArrowUpRight
                            size={18}
                        />
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <CreditCard
                                size={21}
                            />
                        </div>

                        <div>
                            <span>
                                Total Payments
                            </span>

                            <strong>
                                {stats.totalPayments}
                            </strong>
                        </div>

                        <ArrowUpRight
                            size={18}
                        />
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <Wallet size={21} />
                        </div>

                        <div>
                            <span>
                                Pending Payments
                            </span>

                            <strong>
                                {
                                    stats.pendingPayments
                                }
                            </strong>
                        </div>

                        <ArrowDownRight
                            size={18}
                        />
                    </div>

                    <div className="admin-stat-card">
                        <div className="admin-stat-icon">
                            <DollarSign
                                size={21}
                            />
                        </div>

                        <div>
                            <span>
                                Total Paid
                            </span>

                            <strong>
                                {formatMoney(
                                    stats.totalPaid
                                )}
                            </strong>
                        </div>

                        <ArrowUpRight
                            size={18}
                        />
                    </div>

                </div>

                {/* =========================
                    RECENT PAYMENTS
                ========================== */}

                <section className="panel">
                    <div className="panel-head">
                        <div>
                            <h2>
                                Recent Payments
                            </h2>

                            <p>
                                Latest investment
                                payment submissions.
                            </p>
                        </div>

                        <Link
                            href="/admin/payments"
                            className="btn btn-outline"
                        >
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            Loading payments...
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="empty-state">
                            No payments found.
                        </div>
                    ) : (
                        <div className="table-scroll">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Client
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Transaction
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {payments.map(
                                        (
                                            payment
                                        ) => (
                                            <tr
                                                key={
                                                    payment._id
                                                }
                                            >
                                                <td>
                                                    <div className="client-cell">
                                                        <strong>
                                                            {
                                                                payment
                                                                    .userId
                                                                    ?.name
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                payment
                                                                    .userId
                                                                    ?.email
                                                            }
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {formatMoney(
                                                            payment.amount,
                                                            payment.currency ||
                                                                "USD"
                                                        )}
                                                    </strong>
                                                </td>

                                                <td>
                                                    <span
                                                        title={
                                                            payment.transactionHash
                                                        }
                                                    >
                                                        {payment.transactionHash
                                                            ? `${payment.transactionHash.slice(
                                                                  0,
                                                                  8
                                                              )}...${payment.transactionHash.slice(
                                                                  -8
                                                              )}`
                                                            : "—"}
                                                    </span>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        payment.createdAt
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status status-${payment.status?.toLowerCase()}`}
                                                    >
                                                        {
                                                            payment.status
                                                        }
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

                {/* =========================
                    RECENT WITHDRAWALS
                ========================== */}

                <section
                    className="panel"
                    style={{
                        marginTop: "24px",
                    }}
                >
                    <div className="panel-head">
                        <div>
                            <h2>
                                Recent Withdrawals
                            </h2>

                            <p>
                                Latest withdrawal
                                requests from users.
                            </p>
                        </div>

                        <Link
                            href="/admin/withdrawals"
                            className="btn btn-outline"
                        >
                            View All
                        </Link>
                    </div>

                    {loading ? (
                        <div className="empty-state">
                            Loading withdrawals...
                        </div>
                    ) : withdrawals.length ===
                      0 ? (
                        <div className="empty-state">
                            No withdrawals found.
                        </div>
                    ) : (
                        <div className="table-scroll">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>
                                            Client
                                        </th>

                                        <th>
                                            Amount
                                        </th>

                                        <th>
                                            Network
                                        </th>

                                        <th>
                                            Date
                                        </th>

                                        <th>
                                            Status
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {withdrawals.map(
                                        (
                                            withdrawal
                                        ) => (
                                            <tr
                                                key={
                                                    withdrawal._id
                                                }
                                            >
                                                <td>
                                                    <div className="client-cell">
                                                        <strong>
                                                            {
                                                                withdrawal
                                                                    .userId
                                                                    ?.name ||
                                                                "Unknown"
                                                            }
                                                        </strong>

                                                        <small>
                                                            {
                                                                withdrawal
                                                                    .userId
                                                                    ?.email ||
                                                                "No email"
                                                            }
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    <strong>
                                                        {formatMoney(
                                                            withdrawal.payoutAmount,
                                                            withdrawal.currency
                                                        )}
                                                    </strong>

                                                    <small
                                                        style={{
                                                            display:
                                                                "block",
                                                            marginTop:
                                                                "3px",
                                                            color:
                                                                "var(--muted)",
                                                        }}
                                                    >
                                                        {formatUSD(
                                                            withdrawal.amountUSD
                                                        )}{" "}
                                                        USD
                                                    </small>
                                                </td>

                                                <td>
                                                    <div>
                                                        <strong>
                                                            {
                                                                withdrawal.network
                                                            }
                                                        </strong>

                                                        <small
                                                            style={{
                                                                display:
                                                                    "block",
                                                                marginTop:
                                                                    "3px",
                                                                color:
                                                                    "var(--muted)",
                                                            }}
                                                        >
                                                            {
                                                                withdrawal.currency
                                                            }
                                                        </small>
                                                    </div>
                                                </td>

                                                <td>
                                                    {formatDate(
                                                        withdrawal.createdAt
                                                    )}
                                                </td>

                                                <td>
                                                    <span
                                                        className={`status status-${withdrawal.status?.toLowerCase()}`}
                                                    >
                                                        {
                                                            withdrawal.status
                                                        }
                                                    </span>
                                                </td>
                                            </tr>
                                        )
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>

            </div>
        </>
    );
}