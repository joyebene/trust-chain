"use client";

import { useEffect, useState } from "react";
import {
    CheckCircle2,
    Copy,
    Loader2,
    X,
} from "lucide-react";

type Method = {
    _id: string;
    name: string;
    network: string;
    institution: string;
    currency: string;
    walletAddress?: string;
    instructions?: string;
};

export default function InvestmentModal({
    open,
    onClose,
    onDone,
}: {
    open: boolean;
    onClose: () => void;
    onDone: () => void;
}) {
    const [methods, setMethods] = useState<Method[]>([]);
    const [selected, setSelected] = useState<Method | null>(null);

    const [amount, setAmount] = useState("");
    const [reference, setReference] = useState("");
    const [note, setNote] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [copied, setCopied] = useState(false);

    /*
    ==========================================
    LOAD PAYMENT METHODS
    ==========================================
    */

    useEffect(() => {
        if (!open) return;

        setError("");
        setSuccess(false);

        fetch("/api/payment-methods")
            .then((r) => r.json())
            .then((d) => {
                setMethods(d.methods || []);
            })
            .catch(() => {
                setError(
                    "Unable to load payment methods."
                );
            });
    }, [open]);

    /*
    ==========================================
    RESET WHEN MODAL CLOSES
    ==========================================
    */

    function handleClose() {
        if (loading) return;

        setSelected(null);
        setAmount("");
        setReference("");
        setNote("");
        setError("");
        setSuccess(false);

        onClose();
    }

    /*
    ==========================================
    SELECT PAYMENT METHOD
    ==========================================
    */

    function handleSelectMethod(method: Method) {
        setSelected(method);
        setAmount("");
        setReference("");
        setError("");
    }


    /*
    ==========================================
    SUBMIT PAYMENT
    ==========================================
    */

    async function submit() {
        setError("");

        if (!selected) {
            setError("Choose a payment method.");
            return;
        }

        if (!amount || Number(amount) <= 0) {
            setError("Enter a valid amount.");
            return;
        }

        /*
        USD MINIMUM
        */

        if (
            selected.currency === "USD" &&
            Number(amount) < 5000
        ) {
            setError(
                "The minimum investment is $5,000."
            );
            return;
        }

        if (!reference.trim()) {
            setError(
                "Enter your payment reference or transaction ID."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/payments",
                {
                    method: "POST",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        paymentMethodId:
                            selected._id,
                        amount: Number(amount),
                        transactionHash:
                            reference.trim(),
                        note: note.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Unable to submit payment."
                );
            }

            setSuccess(true);

            onDone();
        } catch (e) {
            setError(
                e instanceof Error
                    ? e.message
                    : "Unable to submit payment."
            );
        } finally {
            setLoading(false);
        }
    }

    if (!open) return null;

    return (
        <div
            className="modal-backdrop"
            onMouseDown={handleClose}
        >
            <div
                className="modal"
                onMouseDown={(e) =>
                    e.stopPropagation()
                }
            >
                {/* CLOSE BUTTON */}

                <button
                    type="button"
                    className="modal-close"
                    onClick={handleClose}
                    aria-label="Close modal"
                >
                    <X />
                </button>

                {/* =====================================
                    SUCCESS VIEW
                ===================================== */}

                {success ? (
                    <div className="success-view">
                        <div className="success-icon">
                            <CheckCircle2 />
                        </div>

                        <h2>
                            Payment submitted
                        </h2>

                        <p>
                            Your payment is pending
                            verification. You will
                            receive an in-app
                            notification when it is
                            reviewed.
                        </p>

                        <button
                            type="button"
                            className="btn btn-gold btn-block"
                            onClick={handleClose}
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    <>
                        {/* =================================
                            HEADER
                        ================================= */}

                        <div className="modal-head">
                            <div className="section-kicker">
                                NEW INVESTMENT
                            </div>

                            <h2>
                                Fund your investment
                            </h2>

                            <p>
                                Select the account or
                                wallet you want to use.
                            </p>
                        </div>

                        {/* ERROR */}

                        {error && (
                            <div className="alert error">
                                {error}
                            </div>
                        )}

                        {/* =================================
                            PAYMENT METHODS
                        ================================= */}

                        <div className="method-grid">
                            {methods.map((method) => (
                                <button
                                    type="button"
                                    key={method._id}
                                    className={`method ${selected?._id ===
                                            method._id
                                            ? "selected"
                                            : ""
                                        }`}
                                    onClick={() =>
                                        handleSelectMethod(
                                            method
                                        )
                                    }
                                >
                                    <span className="method-currency">
                                        {method.currency}
                                    </span>

                                    <b>
                                        {method.name}
                                    </b>

                                    <small>
                                        {method.institution}
                                    </small>
                                </button>
                            ))}
                        </div>

                        {/* =================================
                            SELECTED PAYMENT DETAILS
                        ================================= */}

                        {selected && (
                            <div className="payment-details">

                                <div className="detail-title">
                                    Wallet details
                                </div>

                                {/* BANK NAME */}

                                {selected.network && (
                                        <div className="detail-row">
                                            <span>
                                                Network
                                            </span>

                                            <b>
                                                {
                                                    selected.network
                                                }
                                            </b>
                                        </div>
                                    )}


                                {/* WALLET ADDRESS */}

                                {selected.walletAddress && (
                                    <div className="detail-row">
                                        <span>
                                            Wallet address
                                        </span>

                                        <div className="copy-value wallet-copy-value">
                                            <b className="wrap">
                                                {selected.walletAddress}
                                            </b>

                                            <button
                                                type="button"
                                                className="copy-btn"
                                                onClick={async () => {
                                                    try {
                                                        await navigator.clipboard.writeText(
                                                            selected.walletAddress || ""
                                                        );
                                                    } catch {
                                                        setError(
                                                            "Unable to copy wallet address."
                                                        );
                                                    }
                                                }}
                                                title="Copy wallet address"
                                                aria-label="Copy wallet address"
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* INSTRUCTIONS */}

                                {selected.instructions && (
                                    <p>
                                        {
                                            selected.instructions
                                        }
                                    </p>
                                )}
                            </div>
                        )}

                        {/* =================================
                            AMOUNT
                        ================================= */}

                        <label>
                            Amount (
                            {selected?.currency ||
                                "currency"}
                            )

                            <input
                                type="number"
                                min="1"
                                value={amount}
                                onChange={(e) =>
                                    setAmount(
                                        e.target.value
                                    )
                                }
                                placeholder={
                                    selected?.currency ===
                                        "USD"
                                        ? "5000"
                                        : "Enter amount"
                                }
                            />
                        </label>

                        {/* =================================
                            REFERENCE
                        ================================= */}

                        <label>
                            Payment reference /
                            transaction ID

                            <input
                                value={reference}
                                onChange={(e) =>
                                    setReference(
                                        e.target.value
                                    )
                                }
                                placeholder="e.g. TRX-123456"
                            />
                        </label>

                        {/* =================================
                            NOTE
                        ================================= */}

                        <label>
                            Optional note

                            <textarea
                                value={note}
                                onChange={(e) =>
                                    setNote(
                                        e.target.value
                                    )
                                }
                                placeholder="Anything our verification team should know?"
                            />
                        </label>

                        {/* =================================
                            SUBMIT
                        ================================= */}

                        <button
                            type="button"
                            className="btn btn-gold btn-block"
                            disabled={
                                loading || !selected
                            }
                            onClick={submit}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="spin" />

                                    Processing...
                                </>
                            ) : (
                                "I have made the payment"
                            )}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
