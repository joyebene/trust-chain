"use client";

import { useEffect, useState } from "react";

import {
    Check,
    Copy,
    Eye,
    Search,
    X,
} from "lucide-react";

type PaymentMethod = {
    _id: string;
    name: string;
    currency: string;
    network: string;
    walletAddress: string;
    instructions?: string;
    isActive?: boolean;
};

type Payment = {
    _id: string;

    userId: {
        _id?: string;
        name?: string;
        email?: string;
        phone?: string;
    };

    amount: number;

    currency: string;

    transactionHash: string;

    proofUrl?: string;

    note?: string;

    status: string;

    declineReason?: string;

    creditedAmountUSD?: number;

    fxRate?: number;

    paymentMethodId:
        | PaymentMethod
        | null;

    createdAt: string;

    reviewedAt?: string;
};

export default function AdminPaymentsPage() {
    const [payments, setPayments] =
        useState<Payment[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [search, setSearch] =
        useState("");

    const [
        selectedPayment,
        setSelectedPayment,
    ] = useState<Payment | null>(null);

    const [
        showDetails,
        setShowDetails,
    ] = useState(false);

    const [
        showDecline,
        setShowDecline,
    ] = useState(false);

    const [reason, setReason] =
        useState("");

    const [processing, setProcessing] =
        useState(false);

    /*
    ==========================================
    LOAD PAYMENTS
    ==========================================
    */

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                "/api/admin/payments"
            );

            if (!res.ok) {
                throw new Error(
                    "Failed to load payments."
                );
            }

            const data =
                await res.json();

            const list = Array.isArray(data)
                ? data
                : data.payments || [];

            setPayments(list);
        } catch (error) {
            console.error(
                "Load payments error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    ==========================================
    REVIEW PAYMENT
    ==========================================
    */

    const reviewPayment = async (
        paymentId: string,
        action:
            | "approve"
            | "decline",
        declineReason?: string
    ) => {
        try {
            setProcessing(true);

            const res = await fetch(
                "/api/admin/payments",
                {
                    method: "PATCH",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        paymentId,
                        action,
                        reason:
                            declineReason || "",
                    }),
                }
            );

            const data =
                await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to review payment."
                );
            }

            setShowDecline(false);

            setShowDetails(false);

            setSelectedPayment(null);

            setReason("");

            await loadPayments();
        } catch (error: any) {
            alert(
                error.message ||
                    "Something went wrong."
            );
        } finally {
            setProcessing(false);
        }
    };

    /*
    ==========================================
    APPROVE
    ==========================================
    */

    const handleApprove = (
        payment: Payment
    ) => {
        const confirmed =
            window.confirm(
                `Approve payment of ${formatCryptoAmount(
                    payment.amount,
                    payment.currency
                )}?`
            );

        if (!confirmed) return;

        reviewPayment(
            payment._id,
            "approve"
        );
    };

    /*
    ==========================================
    OPEN DECLINE
    ==========================================
    */

    const openDecline = (
        payment: Payment
    ) => {
        setSelectedPayment(payment);

        setReason("");

        setShowDecline(true);
    };

    /*
    ==========================================
    DECLINE
    ==========================================
    */

    const handleDecline = () => {
        if (!selectedPayment) {
            return;
        }

        if (!reason.trim()) {
            alert(
                "Please enter a reason for declining this payment."
            );

            return;
        }

        reviewPayment(
            selectedPayment._id,
            "decline",
            reason.trim()
        );
    };

    /*
    ==========================================
    FORMAT CRYPTO AMOUNT
    ==========================================
    */

    const formatCryptoAmount = (
        amount: number,
        currency: string
    ) => {
        const decimals =
            currency === "BTC" ||
            currency === "ETH"
                ? 8
                : 2;

        return `${Number(
            amount || 0
        ).toFixed(decimals)} ${currency}`;
    };

    /*
    ==========================================
    FORMAT USD
    ==========================================
    */

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
        ).format(amount || 0);
    };

    /*
    ==========================================
    FORMAT DATE
    ==========================================
    */

    const formatDate = (
        date: string
    ) => {
        return new Date(
            date
        ).toLocaleString("en-NG", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    /*
    ==========================================
    COPY TRANSACTION HASH
    ==========================================
    */

    const copyValue = async (
        value: string
    ) => {
        try {
            await navigator.clipboard.writeText(
                value
            );

            alert(
                "Transaction hash copied."
            );
        } catch {
            alert(
                "Could not copy transaction hash."
            );
        }
    };

    /*
    ==========================================
    SEARCH
    ==========================================
    */

    const filteredPayments =
        payments.filter(
            (payment) => {
                const value =
                    search
                        .toLowerCase()
                        .trim();

                if (!value) {
                    return true;
                }

                const clientName =
                    payment.userId?.name?.toLowerCase() ||
                    "";

                const email =
                    payment.userId?.email?.toLowerCase() ||
                    "";

                const transactionHash =
                    payment.transactionHash?.toLowerCase() ||
                    "";

                const currency =
                    payment.currency?.toLowerCase() ||
                    "";

                const network =
                    payment.paymentMethodId?.network?.toLowerCase() ||
                    "";

                return (
                    clientName.includes(
                        value
                    ) ||
                    email.includes(
                        value
                    ) ||
                    transactionHash.includes(
                        value
                    ) ||
                    currency.includes(
                        value
                    ) ||
                    network.includes(
                        value
                    )
                );
            }
        );

    return (
        <>
            {/* =========================================
                HEADER
            ========================================= */}

            <header className="admin-header">
                <div>
                    <h1>
                        Payments
                    </h1>

                    <p>
                        Review and verify
                        cryptocurrency
                        investment payments.
                    </p>
                </div>
            </header>

            <div className="container-app">
                <section className="panel">
                    {/* =====================================
                        PANEL HEADER
                    ===================================== */}

                    <div className="panel-head">
                        <div>
                            <h2>
                                Payment Verification
                            </h2>

                            <p>
                                Approve or decline
                                crypto payments
                                submitted by users.
                            </p>
                        </div>

                        <div className="search-box">
                            <Search size={18} />

                            <input
                                type="text"
                                placeholder="Search payments..."
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                            />
                        </div>
                    </div>

                    {/* =====================================
                        CONTENT
                    ===================================== */}

                    {loading ? (
                        <div className="empty-state">
                            Loading payments...
                        </div>
                    ) : filteredPayments.length ===
                      0 ? (
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
                                            Network
                                        </th>

                                        <th>
                                            Transaction
                                        </th>

                                        <th>
                                            Submitted
                                        </th>

                                        <th>
                                            Status
                                        </th>

                                        <th>
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>
                                    {filteredPayments.map(
                                        (
                                            payment
                                        ) => (
                                            <tr
                                                key={
                                                    payment._id
                                                }
                                            >
                                                {/* CLIENT */}

                                                <td>
                                                    <div className="client-cell">
                                                        <strong>
                                                            {payment
                                                                .userId
                                                                ?.name ||
                                                                "Unknown"}
                                                        </strong>

                                                        <small>
                                                            {payment
                                                                .userId
                                                                ?.email ||
                                                                "No email"}
                                                        </small>
                                                    </div>
                                                </td>

                                                {/* AMOUNT */}

                                                <td>
                                                    <strong>
                                                        {formatCryptoAmount(
                                                            payment.amount,
                                                            payment.currency
                                                        )}
                                                    </strong>
                                                </td>

                                                {/* NETWORK */}

                                                <td>
                                                    <div className="client-cell">
                                                        <strong>
                                                            {payment
                                                                .paymentMethodId
                                                                ?.network ||
                                                                "—"}
                                                        </strong>

                                                        <small>
                                                            {
                                                                payment.currency
                                                            }
                                                        </small>
                                                    </div>
                                                </td>

                                                {/* TRANSACTION HASH */}

                                                <td>
                                                    <span className="reference-text">
                                                        {payment
                                                            .transactionHash
                                                            ? `${payment.transactionHash.slice(
                                                                  0,
                                                                  10
                                                              )}...${payment.transactionHash.slice(
                                                                  -8
                                                              )}`
                                                            : "—"}
                                                    </span>
                                                </td>

                                                {/* DATE */}

                                                <td>
                                                    {formatDate(
                                                        payment.createdAt
                                                    )}
                                                </td>

                                                {/* STATUS */}

                                                <td>
                                                    <span
                                                        className={`status status-${payment.status?.toLowerCase()}`}
                                                    >
                                                        {
                                                            payment.status
                                                        }
                                                    </span>
                                                </td>

                                                {/* ACTIONS */}

                                                <td>
                                                    <div className="action-buttons">
                                                        {/* VIEW */}

                                                        <button
                                                            type="button"
                                                            className="icon-btn"
                                                            title="View details"
                                                            onClick={() => {
                                                                setSelectedPayment(
                                                                    payment
                                                                );

                                                                setShowDetails(
                                                                    true
                                                                );
                                                            }}
                                                        >
                                                            <Eye
                                                                size={
                                                                    17
                                                                }
                                                            />
                                                        </button>

                                                        {/* APPROVE + DECLINE */}

                                                        {payment.status?.toLowerCase() ===
                                                            "pending" && (
                                                            <>
                                                                <button
                                                                    type="button"
                                                                    className="icon-btn success"
                                                                    title="Approve"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            payment
                                                                        )
                                                                    }
                                                                >
                                                                    <Check
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>

                                                                <button
                                                                    type="button"
                                                                    className="icon-btn danger"
                                                                    title="Decline"
                                                                    disabled={
                                                                        processing
                                                                    }
                                                                    onClick={() =>
                                                                        openDecline(
                                                                            payment
                                                                        )
                                                                    }
                                                                >
                                                                    <X
                                                                        size={
                                                                            17
                                                                        }
                                                                    />
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
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

            {/* =========================================
                PAYMENT DETAILS MODAL
            ========================================= */}

            {showDetails &&
                selectedPayment && (
                    <div
                        className="modal-backdrop"
                        onClick={() =>
                            setShowDetails(
                                false
                            )
                        }
                    >
                        <div
                            className="modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <div className="modal-head">
                                <div>
                                    <h2>
                                        Payment Details
                                    </h2>

                                    <p>
                                        Review the
                                        submitted
                                        blockchain
                                        payment.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={() =>
                                        setShowDetails(
                                            false
                                        )
                                    }
                                >
                                    <X
                                        size={20}
                                    />
                                </button>
                            </div>

                            <div className="payment-details">
                                {/* CLIENT */}

                                <div>
                                    <span>
                                        Client
                                    </span>

                                    <strong>
                                        {selectedPayment
                                            .userId
                                            ?.name ||
                                            "—"}
                                    </strong>
                                </div>

                                {/* EMAIL */}

                                <div>
                                    <span>
                                        Email
                                    </span>

                                    <strong>
                                        {selectedPayment
                                            .userId
                                            ?.email ||
                                            "—"}
                                    </strong>
                                </div>

                                {/* AMOUNT */}

                                <div>
                                    <span>
                                        Amount
                                    </span>

                                    <strong>
                                        {formatCryptoAmount(
                                            selectedPayment.amount,
                                            selectedPayment.currency
                                        )}
                                    </strong>
                                </div>

                                {/* CURRENCY */}

                                <div>
                                    <span>
                                        Currency
                                    </span>

                                    <strong>
                                        {
                                            selectedPayment.currency
                                        }
                                    </strong>
                                </div>

                                {/* NETWORK */}

                                <div>
                                    <span>
                                        Network
                                    </span>

                                    <strong>
                                        {selectedPayment
                                            .paymentMethodId
                                            ?.network ||
                                            "—"}
                                    </strong>
                                </div>

                                {/* WALLET */}

                                <div className="full-detail">
                                    <span>
                                        Destination
                                        Wallet
                                    </span>

                                    <div className="copy-row">
                                        <strong>
                                            {selectedPayment
                                                .paymentMethodId
                                                ?.walletAddress ||
                                                "—"}
                                        </strong>

                                        {selectedPayment
                                            .paymentMethodId
                                            ?.walletAddress && (
                                            <button
                                                type="button"
                                                className="copy-btn"
                                                onClick={() =>
                                                    copyValue(
                                                        selectedPayment
                                                            .paymentMethodId
                                                            ?.walletAddress ||
                                                            ""
                                                    )
                                                }
                                                title="Copy wallet address"
                                            >
                                                <Copy
                                                    size={
                                                        15
                                                    }
                                                />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* TRANSACTION HASH */}

                                <div className="full-detail">
                                    <span>
                                        Transaction
                                        Hash
                                    </span>

                                    <div className="copy-row">
                                        <strong>
                                            {
                                                selectedPayment.transactionHash
                                            }
                                        </strong>

                                        {selectedPayment.transactionHash && (
                                            <button
                                                type="button"
                                                className="copy-btn"
                                                onClick={() =>
                                                    copyValue(
                                                        selectedPayment.transactionHash
                                                    )
                                                }
                                                title="Copy transaction hash"
                                            >
                                                <Copy
                                                    size={
                                                        15
                                                    }
                                                />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* USD VALUE */}

                                {selectedPayment.creditedAmountUSD !==
                                    undefined &&
                                    selectedPayment.status ===
                                        "approved" && (
                                        <div>
                                            <span>
                                                Credited
                                                USD
                                            </span>

                                            <strong>
                                                {formatUSD(
                                                    selectedPayment.creditedAmountUSD
                                                )}
                                            </strong>
                                        </div>
                                    )}

                                {/* FX RATE */}

                                {selectedPayment.fxRate &&
                                    selectedPayment.fxRate >
                                        0 && (
                                        <div>
                                            <span>
                                                Conversion
                                                Rate
                                            </span>

                                            <strong>
                                                {selectedPayment.fxRate.toLocaleString()}
                                            </strong>
                                        </div>
                                    )}

                                {/* DATE */}

                                <div>
                                    <span>
                                        Submitted
                                    </span>

                                    <strong>
                                        {formatDate(
                                            selectedPayment.createdAt
                                        )}
                                    </strong>
                                </div>

                                {/* NOTE */}

                                {selectedPayment.note && (
                                    <div className="full-detail">
                                        <span>
                                            Note
                                        </span>

                                        <strong>
                                            {
                                                selectedPayment.note
                                            }
                                        </strong>
                                    </div>
                                )}

                                {/* DECLINE REASON */}

                                {selectedPayment.declineReason && (
                                    <div className="full-detail">
                                        <span>
                                            Decline
                                            Reason
                                        </span>

                                        <strong>
                                            {
                                                selectedPayment.declineReason
                                            }
                                        </strong>
                                    </div>
                                )}
                            </div>

                            {/* ACTIONS */}

                            {selectedPayment.status?.toLowerCase() ===
                                "pending" && (
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="btn btn-primary"
                                        disabled={
                                            processing
                                        }
                                        onClick={() =>
                                            handleApprove(
                                                selectedPayment
                                            )
                                        }
                                    >
                                        <Check
                                            size={
                                                17
                                            }
                                        />

                                        Approve Payment
                                    </button>

                                    <button
                                        type="button"
                                        className="btn btn-danger"
                                        disabled={
                                            processing
                                        }
                                        onClick={() =>
                                            openDecline(
                                                selectedPayment
                                            )
                                        }
                                    >
                                        <X
                                            size={
                                                17
                                            }
                                        />

                                        Decline
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

            {/* =========================================
                DECLINE MODAL
            ========================================= */}

            {showDecline &&
                selectedPayment && (
                    <div
                        className="modal-backdrop"
                        onClick={() =>
                            setShowDecline(
                                false
                            )
                        }
                    >
                        <div
                            className="modal"
                            onClick={(e) =>
                                e.stopPropagation()
                            }
                        >
                            <div className="modal-head">
                                <div>
                                    <h2>
                                        Decline Payment
                                    </h2>

                                    <p>
                                        Give a reason
                                        so the user
                                        knows why
                                        the payment
                                        was declined.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    className="modal-close"
                                    onClick={() =>
                                        setShowDecline(
                                            false
                                        )
                                    }
                                >
                                    <X
                                        size={20}
                                    />
                                </button>
                            </div>

                            <div className="form">
                                <label>
                                    Decline Reason
                                </label>

                                <textarea
                                    rows={5}
                                    placeholder="Enter the reason for declining this payment..."
                                    value={reason}
                                    onChange={(e) =>
                                        setReason(
                                            e.target
                                                .value
                                        )
                                    }
                                />
                            </div>

                            <div className="modal-actions">
                                <button
                                    type="button"
                                    className="btn btn-outline"
                                    onClick={() =>
                                        setShowDecline(
                                            false
                                        )
                                    }
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    disabled={
                                        processing
                                    }
                                    onClick={
                                        handleDecline
                                    }
                                >
                                    <X
                                        size={17}
                                    />

                                    {processing
                                        ? "Declining..."
                                        : "Decline Payment"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </>
    );
}