"use client";

import {
    useEffect,
    useState,
} from "react";

import {
    X,
    Wallet,
    ShieldCheck,
    AlertCircle,
    CheckCircle2,
} from "lucide-react";

type WithdrawalCurrency =
    | "BTC"
    | "USDT"
    | "USDC"
    | "ETH";

type WithdrawalModalProps = {
    open: boolean;
    onClose: () => void;
    onDone?: () => void;
    balanceUSD?: number;
};

type FormState = {
    amountUSD: string;
    payoutAmount: string;
    currency: WithdrawalCurrency;
    network: string;
    walletAddress: string;
    note: string;
};

const initialForm: FormState = {
    amountUSD: "",
    payoutAmount: "",
    currency: "USDT",
    network: "TRC20",
    walletAddress: "",
    note: "",
};

const networkOptions: Record<
    WithdrawalCurrency,
    string[]
> = {
    BTC: [
        "Bitcoin",
    ],

    USDT: [
        "TRC20",
        "ERC20",
        "BEP20",
    ],

    USDC: [
        "ERC20",
        "BEP20",
        "Polygon",
    ],

    ETH: [
        "Ethereum",
    ],
};

export default function WithdrawalModal({
    open,
    onClose,
    onDone,
    balanceUSD = 0,
}: WithdrawalModalProps) {
    const [form, setForm] =
        useState<FormState>(
            initialForm
        );

    const [loading, setLoading] =
        useState(false);

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState(false);

    const [submittedBalanceUSD, setSubmittedBalanceUSD] =
        useState<number | null>(null);

    /**
     * Reset modal whenever it opens.
     */
    useEffect(() => {
        if (open) {
            setForm(initialForm);
            setError("");
            setSuccess(false);
            setLoading(false);
            setSubmittedBalanceUSD(null);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const amountUSD =
        Number(form.amountUSD) || 0;

    const payoutAmount =
        Number(form.payoutAmount) || 0;

    const remainingBalance =
        submittedBalanceUSD !== null
            ? submittedBalanceUSD
            : Math.max(
                0,
                balanceUSD - amountUSD
            );

    function updateField(
        field: keyof FormState,
        value: string
    ) {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (error) {
            setError("");
        }
    }

    function handleCurrencyChange(
        currency: WithdrawalCurrency
    ) {
        setForm((current) => ({
            ...current,
            currency,
            network:
                networkOptions[
                currency
                ][0],
        }));

        setError("");
    }

    function setMaxAmount() {
        setForm((current) => ({
            ...current,
            amountUSD:
                balanceUSD > 0
                    ? balanceUSD.toFixed(2)
                    : "",
        }));

        setError("");
    }

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        if (amountUSD <= 0) {
            setError(
                "Enter a valid withdrawal amount."
            );
            return;
        }

        if (amountUSD > balanceUSD) {
            setError(
                "Withdrawal amount exceeds your available balance."
            );
            return;
        }

        if (payoutAmount <= 0) {
            setError(
                "Enter the amount you expect to receive."
            );
            return;
        }

        if (!form.network.trim()) {
            setError(
                "Please select a network."
            );
            return;
        }

        if (
            !form.walletAddress.trim()
        ) {
            setError(
                "Please enter your destination wallet address."
            );
            return;
        }

        try {
            setLoading(true);

            const response =
                await fetch(
                    "/api/withdrawals",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },
                        body: JSON.stringify({
                            amountUSD,
                            payoutAmount,
                            currency:
                                form.currency,
                            network:
                                form.network.trim(),
                            walletAddress:
                                form.walletAddress.trim(),
                            note:
                                form.note.trim(),
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ||
                    "Failed to submit withdrawal request."
                );
            }

            // ==========================================
            // SERVER BALANCE AFTER DEDUCTION
            // ==========================================

            if (
                typeof data.balanceUSD === "number"
            ) {
                setSubmittedBalanceUSD(
                    data.balanceUSD
                );
            }


            setSuccess(true);

            if (onDone) {
                onDone();
            }
        } catch (error) {
            console.error(
                "WITHDRAWAL SUBMIT ERROR:",
                error
            );

            setError(
                error instanceof Error
                    ? error.message
                    : "Failed to submit withdrawal request."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div
            className="modal-backdrop"
            onMouseDown={(event) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div
                className="modal withdrawal-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="withdrawal-title"
            >
                {/* HEADER */}
                <div className="modal-head">
                    <div>
                        <span className="section-kicker">
                            WALLET
                        </span>

                        <h2 id="withdrawal-title">
                            Withdraw funds
                        </h2>

                        <p>
                            Request a crypto
                            withdrawal from
                            your Trust Chain
                            wallet.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="modal-close"
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close withdrawal modal"
                    >
                        <X size={19} />
                    </button>
                </div>

                {success ? (
                    <div className="success-view">
                        <div className="success-icon">
                            <CheckCircle2
                                size={34}
                            />
                        </div>

                        <h3>
                            Withdrawal request
                            submitted
                        </h3>

                        <p>
                            Your withdrawal
                            request has been
                            submitted and is
                            waiting for admin
                            review.
                        </p>

                        <div className="withdrawal-success-summary">
                            <div>
                                <span>
                                    Amount deducted
                                </span>

                                <strong>
                                    $
                                    {amountUSD.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}{" "}
                                    USD
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Remaining balance
                                </span>

                                <strong>
                                    $
                                    {remainingBalance.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}{" "}
                                    USD
                                </strong>
                            </div>

                            <div>
                                <span>
                                    Payout
                                </span>

                                <strong>
                                    {
                                        form.payoutAmount
                                    }{" "}
                                    {
                                        form.currency
                                    }
                                </strong>
                            </div>
                        </div>

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-gold"
                                onClick={
                                    onClose
                                }
                            >
                                Done
                            </button>
                        </div>
                    </div>
                ) : (
                    <form
                        className="form"
                        onSubmit={
                            handleSubmit
                        }
                    >
                        {/* CURRENT BALANCE */}
                        <div className="withdrawal-balance">
                            <div className="withdrawal-balance-icon">
                                <Wallet
                                    size={20}
                                />
                            </div>

                            <div>
                                <span>
                                    Available
                                    wallet balance
                                </span>

                                <strong>
                                    $
                                    {balanceUSD.toLocaleString(
                                        undefined,
                                        {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2,
                                        }
                                    )}{" "}
                                    USD
                                </strong>
                            </div>
                        </div>

                        {/* WARNING */}
                        <div className="withdrawal-warning">
                            <AlertCircle
                                size={18}
                            />

                            <div>
                                <strong>
                                    Balance deduction
                                </strong>

                                <p>
                                    The withdrawal
                                    amount will be
                                    deducted from
                                    your wallet
                                    immediately.
                                    If the request
                                    is declined,
                                    the amount will
                                    be refunded to
                                    your wallet.
                                </p>
                            </div>
                        </div>

                        {/* AMOUNT */}
                        <div className="field">
                            <div className="field-label-row">
                                <label htmlFor="withdrawal-amount">
                                    Withdrawal amount
                                    (USD)
                                </label>

                                <button
                                    type="button"
                                    className="max-button"
                                    onClick={
                                        setMaxAmount
                                    }
                                    disabled={
                                        balanceUSD <=
                                        0
                                    }
                                >
                                    Max
                                </button>
                            </div>

                            <div className="input-prefix">
                                <span>
                                    $
                                </span>

                                <input
                                    id="withdrawal-amount"
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={
                                        form.amountUSD
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateField(
                                            "amountUSD",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
                                />
                            </div>
                        </div>

                        {/* CRYPTO + PAYOUT */}
                        <div className="two">
                            <div className="field">
                                <label htmlFor="withdrawal-currency">
                                    Payout currency
                                </label>

                                <select
                                    id="withdrawal-currency"
                                    value={
                                        form.currency
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        handleCurrencyChange(
                                            event
                                                .target
                                                .value as WithdrawalCurrency
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
                                >
                                    <option value="USDT">
                                        USDT
                                    </option>

                                    <option value="USDC">
                                        USDC
                                    </option>

                                    <option value="BTC">
                                        BTC
                                    </option>

                                    <option value="ETH">
                                        ETH
                                    </option>
                                </select>
                            </div>

                            <div className="field">
                                <label htmlFor="withdrawal-payout">
                                    Payout amount
                                </label>

                                <input
                                    id="withdrawal-payout"
                                    type="number"
                                    min="0"
                                    step="any"
                                    placeholder={`Amount in ${form.currency}`}
                                    value={
                                        form.payoutAmount
                                    }
                                    onChange={(
                                        event
                                    ) =>
                                        updateField(
                                            "payoutAmount",
                                            event
                                                .target
                                                .value
                                        )
                                    }
                                    disabled={
                                        loading
                                    }
                                />
                            </div>
                        </div>

                        {/* NETWORK */}
                        <div className="field">
                            <label htmlFor="withdrawal-network">
                                Network
                            </label>

                            <select
                                id="withdrawal-network"
                                value={
                                    form.network
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "network",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    loading
                                }
                            >
                                {networkOptions[
                                    form.currency
                                ].map(
                                    (
                                        network
                                    ) => (
                                        <option
                                            key={
                                                network
                                            }
                                            value={
                                                network
                                            }
                                        >
                                            {
                                                network
                                            }
                                        </option>
                                    )
                                )}
                            </select>
                        </div>

                        {/* WALLET ADDRESS */}
                        <div className="field">
                            <label htmlFor="withdrawal-wallet">
                                Destination wallet
                                address
                            </label>

                            <input
                                id="withdrawal-wallet"
                                type="text"
                                placeholder="Enter destination wallet address"
                                value={
                                    form.walletAddress
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "walletAddress",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    loading
                                }
                                autoComplete="off"
                            />

                            <small className="field-help">
                                Make sure the wallet
                                address matches the
                                selected currency
                                and network.
                            </small>
                        </div>

                        {/* NOTE */}
                        <div className="field">
                            <label htmlFor="withdrawal-note">
                                Note{" "}
                                <span>
                                    (optional)
                                </span>
                            </label>

                            <textarea
                                id="withdrawal-note"
                                rows={3}
                                maxLength={500}
                                placeholder="Add any additional information..."
                                value={
                                    form.note
                                }
                                onChange={(
                                    event
                                ) =>
                                    updateField(
                                        "note",
                                        event
                                            .target
                                            .value
                                    )
                                }
                                disabled={
                                    loading
                                }
                            />
                        </div>

                        {/* ERROR */}
                        {error && (
                            <div className="form-error">
                                <AlertCircle
                                    size={17}
                                />

                                <span>
                                    {error}
                                </span>
                            </div>
                        )}

                        {/* SECURITY */}
                        <div className="withdrawal-security">
                            <ShieldCheck
                                size={18}
                            />

                            <span>
                                Your withdrawal
                                request will be
                                reviewed by an
                                administrator before
                                funds are sent.
                            </span>
                        </div>

                        {/* ACTIONS */}
                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={
                                    onClose
                                }
                                disabled={
                                    loading
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                className="btn btn-gold"
                                disabled={
                                    loading ||
                                    balanceUSD <=
                                    0
                                }
                            >
                                {loading
                                    ? "Submitting..."
                                    : "Submit withdrawal"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}