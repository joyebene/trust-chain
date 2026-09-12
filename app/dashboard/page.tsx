"use client";

import { useEffect, useState } from "react";

import {
    ArrowUpRight,
    Clock3,
    ShieldCheck,
    WalletCards,
} from "lucide-react";

import InvestmentModal from "@/components/InvestmentModal";

import { dateTime } from "@/lib/format";

import WithdrawalModal from "@/components/WithdrawalModal";

type DisplayCurrency =
    | "BTC"
    | "USDT"
    | "USDC"
    | "ETH";

type User = {
    name?: string;
    balanceUSD?: number;
    investedBalanceUSD?: number;
    totalProfitUSD?: number;
};

type Investment = {
    _id: string;
    amountUSD: number;
    originalAmount: number;
    currency:
    | "BTC"
    | "USDT"
    | "USDC"
    | "ETH";
    status:
    | "active"
    | "completed"
    | "declined";
    createdAt: string;
};

type Payment = {
    _id: string;
    amount: number;
    currency:
    | "BTC"
    | "USDT"
    | "USDC"
    | "ETH";
    transactionHash: string;
    status:
    | "pending"
    | "approved"
    | "declined";
    creditedAmountUSD?: number;
    createdAt: string;
};

type CryptoRates = {
    BTC: number;
    USDT: number;
    USDC: number;
    ETH: number;
};

export default function Dashboard() {
    const [user, setUser] =
        useState<User | null>(null);

    const [payments, setPayments] =
        useState<Payment[]>([]);

    const [investments, setInvestments] =
        useState<Investment[]>([]);

    const [open, setOpen] =
        useState(false);

    const [withdrawalOpen, setWithdrawalOpen] =
        useState(false);

    const [currency, setCurrency] =
        useState<DisplayCurrency>("USDT");

    const [cryptoRates, setCryptoRates] =
        useState<CryptoRates>({
            BTC: 0,
            USDT: 1,
            USDC: 1,
            ETH: 0,
        });

    const [loading, setLoading] =
        useState(true);

    /*
    ==========================================
    LOAD DASHBOARD DATA
    ==========================================
    */

    async function load() {
        try {
            setLoading(true);

            const [
                userResponse,
                paymentsResponse,
                investmentsResponse,
            ] = await Promise.all([
                fetch("/api/me"),
                fetch("/api/payments"),
                fetch("/api/investments"),
            ]);

            const userData =
                await userResponse.json();

            const paymentData =
                await paymentsResponse.json();

            const investmentData =
                await investmentsResponse.json();

            setUser(
                userData.user || null
            );

            /*
            API should return:

            cryptoRates: {
                BTC: number,
                USDT: number,
                USDC: number,
                ETH: number
            }

            The values represent how much
            1 unit of the crypto is worth in USD.
            */

            if (userData.cryptoRates) {
                setCryptoRates({
                    BTC:
                        Number(
                            userData.cryptoRates.BTC
                        ) || 0,

                    USDT:
                        Number(
                            userData.cryptoRates.USDT
                        ) || 1,

                    USDC:
                        Number(
                            userData.cryptoRates.USDC
                        ) || 1,

                    ETH:
                        Number(
                            userData.cryptoRates.ETH
                        ) || 0,
                });
            }

            setPayments(
                paymentData.payments || []
            );

            setInvestments(
                investmentData.investments || []
            );
        } catch (error) {
            console.error(
                "Failed to load dashboard:",
                error
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
    }, []);

    /*
    ==========================================
    WALLET BALANCE
    ==========================================
    */

    const balanceUSD =
        Number(user?.balanceUSD) || 0;

    const selectedCryptoRate =
        cryptoRates[currency];

    const displayedBalance =
        selectedCryptoRate > 0
            ? balanceUSD /
            selectedCryptoRate
            : 0;

    /*
    ==========================================
    INVESTED BALANCE
    ==========================================
    */

    const investedUSD =
        Number(
            user?.investedBalanceUSD
        ) || 0;

    const displayedInvested =
        selectedCryptoRate > 0
            ? investedUSD /
            selectedCryptoRate
            : 0;

    /*
    ==========================================
    TOTAL PROFIT
    ==========================================
    */

    const profitUSD =
        Number(
            user?.totalProfitUSD
        ) || 0;

    const displayedProfit =
        selectedCryptoRate > 0
            ? profitUSD /
            selectedCryptoRate
            : 0;

    /*
    ==========================================
    ACTIVE INVESTMENTS
    ==========================================
    */

    const activeInvestments =
        investments.filter(
            (investment) =>
                investment.status ===
                "active"
        );

    /*
    ==========================================
    CRYPTO FORMAT
    ==========================================
    */

    function formatCrypto(
        amount: number
    ) {
        if (!Number.isFinite(amount)) {
            return "0";
        }

        if (currency === "BTC") {
            return amount.toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 8,
                    maximumFractionDigits: 8,
                }
            );
        }

        if (currency === "ETH") {
            return amount.toLocaleString(
                undefined,
                {
                    minimumFractionDigits: 6,
                    maximumFractionDigits: 6,
                }
            );
        }

        return amount.toLocaleString(
            undefined,
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    }

    function formatBalance(
        amount: number
    ) {
        return `${formatCrypto(amount)} ${currency}`;
    }

    return (
        <div className="dashboard-page">
            <div className="container-app">

                {/* =========================================
                    WELCOME
                ========================================= */}

                <div className="welcome-row">
                    <div>
                        <span className="section-kicker">
                            ACCOUNT OVERVIEW
                        </span>

                        <h1>
                            Your investment dashboard
                        </h1>

                        <p className="muted">
                            Monitor your wallet,
                            investments and
                            payment activity
                            in one place.
                        </p>
                    </div>

                    <div className="dashboard-actions">
                        <button
                            type="button"
                            className="btn btn-outline"
                            onClick={() => setWithdrawalOpen(true)}
                        >
                            Withdraw
                        </button>

                        <button
                            type="button"
                            className="btn btn-gold"
                            onClick={() => setOpen(true)}
                        >
                            <ArrowUpRight size={17} />
                            I want to invest
                        </button>
                    </div>
                </div>

                {/* =========================================
                    BALANCES
                ========================================= */}

                <div className="balance-grid">

                    {/* WALLET BALANCE */}

                    <div className="balance-card main">

                        <div className="balance-card-top">
                            <div>
                                <span>
                                    Wallet balance
                                </span>

                                <strong>
                                    {loading
                                        ? "Loading..."
                                        : formatBalance(
                                            displayedBalance
                                        )}
                                </strong>

                                <small>
                                    Available balance
                                </small>
                            </div>

                            <WalletCards
                                size={24}
                            />
                        </div>

                        {/* CRYPTO SELECTOR */}

                        <div className="currency-selector">
                            <label htmlFor="balance-currency">
                                Display currency
                            </label>

                            <select
                                id="balance-currency"
                                value={currency}
                                onChange={(event) =>
                                    setCurrency(
                                        event.target
                                            .value as DisplayCurrency
                                    )
                                }
                            >
                                <option value="BTC">
                                    BTC — Bitcoin
                                </option>

                                <option value="USDT">
                                    USDT — Tether
                                </option>

                                <option value="USDC">
                                    USDC — USD Coin
                                </option>

                                <option value="ETH">
                                    ETH — Ethereum
                                </option>
                            </select>
                        </div>

                        <div className="fx-note">
                            {currency === "USDT" ||
                                currency === "USDC"
                                ? `1 ${currency} ≈ $${selectedCryptoRate.toLocaleString()} USD`
                                : selectedCryptoRate > 0
                                    ? `1 ${currency} ≈ $${selectedCryptoRate.toLocaleString()} USD`
                                    : `Current ${currency} rate unavailable`}
                        </div>
                    </div>

                    {/* INVESTED BALANCE */}

                    <div className="balance-card">
                        <span>
                            Invested balance
                        </span>

                        <strong>
                            {loading
                                ? "Loading..."
                                : formatBalance(
                                    displayedInvested
                                )}
                        </strong>

                        <small>
                            Currently invested
                        </small>
                    </div>

                    {/* TOTAL PROFIT */}

                    <div className="balance-card">
                        <span>
                            Total profit
                        </span>

                        <strong>
                            {loading
                                ? "Loading..."
                                : formatBalance(
                                    displayedProfit
                                )}
                        </strong>

                        <small>
                            Earned from investments
                        </small>
                    </div>

                    {/* ACTIVE INVESTMENTS */}

                    <div className="balance-card">
                        <span>
                            Active investments
                        </span>

                        <strong>
                            {
                                activeInvestments.length
                            }
                        </strong>

                        <small>
                            Current positions
                        </small>
                    </div>
                </div>

                {/* =========================================
                    DASHBOARD GRID
                ========================================= */}

                <div className="dashboard-grid">

                    {/* RECENT INVESTMENTS */}

                    <section className="panel">

                        <div className="panel-head">
                            <div>
                                <h3>
                                    Recent investments
                                </h3>

                                <p>
                                    Latest approved
                                    investment
                                    activity
                                </p>
                            </div>

                            <a href="/dashboard/investments">
                                View all
                            </a>
                        </div>

                        {investments
                            .slice(0, 4)
                            .map(
                                (
                                    investment
                                ) => (
                                    <div
                                        className="activity-row"
                                        key={
                                            investment._id
                                        }
                                    >
                                        <div className="activity-icon">
                                            <TrendingIcon />
                                        </div>

                                        <div>
                                            <b>
                                                {
                                                    investment.originalAmount
                                                }{" "}
                                                {
                                                    investment.currency
                                                }
                                            </b>

                                            <span>
                                                $
                                                {Number(
                                                    investment.amountUSD
                                                ).toLocaleString(
                                                    undefined,
                                                    {
                                                        minimumFractionDigits: 2,
                                                        maximumFractionDigits: 2,
                                                    }
                                                )}{" "}
                                                USD ·{" "}
                                                {dateTime(
                                                    investment.createdAt
                                                )}
                                            </span>
                                        </div>

                                        <strong
                                            className={`status ${investment.status}`}
                                        >
                                            {
                                                investment.status
                                            }
                                        </strong>
                                    </div>
                                )
                            )}

                        {!loading &&
                            !investments.length && (
                                <Empty
                                    text="Your approved investments will appear here."
                                />
                            )}
                    </section>

                    {/* PAYMENT ACTIVITY */}

                    <section className="panel">

                        <div className="panel-head">
                            <div>
                                <h3>
                                    Payment activity
                                </h3>

                                <p>
                                    Crypto payment
                                    verification
                                    history
                                </p>
                            </div>
                        </div>

                        {payments
                            .slice(0, 4)
                            .map(
                                (
                                    payment
                                ) => (
                                    <div
                                        className="activity-row"
                                        key={
                                            payment._id
                                        }
                                    >
                                        <div className="activity-icon">
                                            <Clock3 />
                                        </div>

                                        <div>
                                            <b>
                                                {
                                                    payment.amount
                                                }{" "}
                                                {
                                                    payment.currency
                                                }
                                            </b>

                                            <span>
                                                TX:{" "}
                                                {shortHash(
                                                    payment.transactionHash
                                                )}
                                            </span>
                                        </div>

                                        <strong
                                            className={`status ${payment.status}`}
                                        >
                                            {
                                                payment.status
                                            }
                                        </strong>
                                    </div>
                                )
                            )}

                        {!loading &&
                            !payments.length && (
                                <Empty
                                    text="No payment activity yet."
                                />
                            )}
                    </section>
                </div>

                {/* =========================================
                    SECURITY
                ========================================= */}

                <div className="security-banner">

                    <ShieldCheck />

                    <div>
                        <b>
                            Verification matters
                        </b>

                        <p>
                            Crypto payments are
                            reviewed by an
                            administrator before
                            an investment becomes
                            active. Never send
                            funds to an address
                            that is not shown in
                            your authenticated
                            Trust Chain account.
                        </p>
                    </div>
                </div>
            </div>

            {/* =========================================
                INVESTMENT MODAL
            ========================================= */}

            <InvestmentModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    load();
                }}
                onDone={load}
            />

            <WithdrawalModal
                open={withdrawalOpen}
                onClose={() => {
                    setWithdrawalOpen(false);
                }}
                onDone={load}
                balanceUSD={balanceUSD}
            />
        </div>
    );
}

/*
==========================================
EMPTY STATE
==========================================
*/

function Empty({
    text,
}: {
    text: string;
}) {
    return (
        <div className="empty">
            {text}
        </div>
    );
}

/*
==========================================
SHORTEN TRANSACTION HASH
==========================================
*/

function shortHash(
    hash: string
) {
    if (!hash) {
        return "—";
    }

    if (hash.length <= 16) {
        return hash;
    }

    return `${hash.slice(
        0,
        8
    )}...${hash.slice(-8)}`;
}

/*
==========================================
TRENDING ICON
==========================================
*/

function TrendingIcon() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
        >
            <path d="m3 17 6-6 4 4 7-8" />
            <path d="M14 7h6v6" />
        </svg>
    );
}