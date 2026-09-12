"use client";

import { useEffect, useState } from "react";

import {
    Copy,
    Plus,
    Trash2,
    Wallet,
    X,
} from "lucide-react";

type CryptoCurrency =
    | "BTC"
    | "USDT"
    | "USDC"
    | "ETH";

type Method = {
    _id: string;
    name: string;
    currency: CryptoCurrency;
    network: string;
    walletAddress: string;
    instructions?: string;
    isActive: boolean;
};

type FormState = {
    name: string;
    currency: CryptoCurrency;
    network: string;
    walletAddress: string;
    instructions: string;
};

export default function PaymentMethodsPage() {
    const [methods, setMethods] =
        useState<Method[]>([]);

    const [loading, setLoading] =
        useState(true);

    const [showModal, setShowModal] =
        useState(false);

    const [processing, setProcessing] =
        useState(false);

    const [method, setMethod] =
        useState<FormState>({
            name: "",
            currency: "USDT",
            network: "TRC20",
            walletAddress: "",
            instructions: "",
        });

    /*
    ==========================================
    LOAD PAYMENT METHODS
    ==========================================
    */

    useEffect(() => {
        loadMethods();
    }, []);

    const loadMethods = async () => {
        try {
            setLoading(true);

            const res = await fetch(
                "/api/admin/payment-methods"
            );

            if (!res.ok) {
                throw new Error(
                    "Failed to load payment methods."
                );
            }

            const data = await res.json();

            const list = Array.isArray(data)
                ? data
                : data.methods || [];

            setMethods(list);
        } catch (error) {
            console.error(
                "Load payment methods error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    /*
    ==========================================
    RESET FORM
    ==========================================
    */

    const resetForm = () => {
        setMethod({
            name: "",
            currency: "USDT",
            network: "TRC20",
            walletAddress: "",
            instructions: "",
        });
    };

    /*
    ==========================================
    ADD PAYMENT METHOD
    ==========================================
    */

    const addMethod = async () => {
        if (!method.name.trim()) {
            alert(
                "Enter a payment method name."
            );
            return;
        }

        if (!method.network.trim()) {
            alert(
                "Enter the blockchain network."
            );
            return;
        }

        if (
            !method.walletAddress.trim()
        ) {
            alert(
                "Enter the wallet address."
            );
            return;
        }

        try {
            setProcessing(true);

            const res = await fetch(
                "/api/admin/payment-methods",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json",
                    },

                    body: JSON.stringify({
                        name: method.name.trim(),

                        currency:
                            method.currency,

                        network:
                            method.network.trim(),

                        walletAddress:
                            method.walletAddress.trim(),

                        instructions:
                            method.instructions.trim(),
                    }),
                }
            );

            const data =
                await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to add payment method."
                );
            }

            resetForm();

            setShowModal(false);

            await loadMethods();
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
    DELETE PAYMENT METHOD
    ==========================================
    */

    const deleteMethod = async (
        id: string
    ) => {
        const confirmed =
            window.confirm(
                "Are you sure you want to delete this payment wallet?"
            );

        if (!confirmed) return;

        try {
            const res = await fetch(
                `/api/admin/payment-methods?id=${id}`,
                {
                    method: "DELETE",
                }
            );

            const data =
                await res.json();

            if (!res.ok) {
                throw new Error(
                    data.error ||
                        "Failed to delete payment method."
                );
            }

            await loadMethods();
        } catch (error: any) {
            alert(
                error.message ||
                    "Something went wrong."
            );
        }
    };

    /*
    ==========================================
    COPY WALLET ADDRESS
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
                "Wallet address copied."
            );
        } catch {
            alert(
                "Could not copy wallet address."
            );
        }
    };

    /*
    ==========================================
    CURRENCY CHANGE
    ==========================================
    */

    const handleCurrencyChange = (
        currency: CryptoCurrency
    ) => {
        let network = method.network;

        /*
        Give a useful default network
        when the currency changes.
        */

        if (currency === "BTC") {
            network = "Bitcoin";
        }

        if (currency === "ETH") {
            network = "Ethereum";
        }

        if (
            currency === "USDT" &&
            ![
                "TRC20",
                "ERC20",
                "BEP20",
            ].includes(network)
        ) {
            network = "TRC20";
        }

        if (
            currency === "USDC" &&
            ![
                "ERC20",
                "BEP20",
                "Solana",
                "Polygon",
            ].includes(network)
        ) {
            network = "ERC20";
        }

        setMethod({
            ...method,
            currency,
            network,
        });
    };

    return (
        <>
            {/* =========================================
                HEADER
            ========================================= */}

            <header className="admin-header">
                <div>
                    <h1>
                        Payment Wallets
                    </h1>

                    <p>
                        Manage the crypto wallet
                        addresses users can send
                        investment funds to.
                    </p>
                </div>

                <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                        resetForm();
                        setShowModal(true);
                    }}
                >
                    <Plus size={18} />

                    Add Wallet
                </button>
            </header>

            <div className="container-app">
                {/* =========================================
                    LOADING
                ========================================= */}

                {loading ? (
                    <div className="panel">
                        <div className="empty-state">
                            Loading payment wallets...
                        </div>
                    </div>
                ) : methods.length ===
                  0 ? (
                    /* =====================================
                       EMPTY STATE
                    ===================================== */

                    <div className="panel">
                        <div className="empty-state">
                            <Wallet size={40} />

                            <h3>
                                No payment wallets yet
                            </h3>

                            <p>
                                Add a crypto wallet
                                address for users
                                to make investment
                                payments.
                            </p>

                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={() => {
                                    resetForm();
                                    setShowModal(
                                        true
                                    );
                                }}
                            >
                                <Plus size={18} />

                                Add Wallet
                            </button>
                        </div>
                    </div>
                ) : (
                    /* =====================================
                       WALLET GRID
                    ===================================== */

                    <div className="method-admin-grid">
                        {methods.map(
                            (item) => (
                                <div
                                    className="method-admin"
                                    key={
                                        item._id
                                    }
                                >
                                    {/* HEADER */}

                                    <div className="method-admin-top">
                                        <div className="method-type-icon">
                                            <Wallet
                                                size={
                                                    21
                                                }
                                            />
                                        </div>

                                        <div>
                                            <h3>
                                                {
                                                    item.name
                                                }
                                            </h3>

                                            <div className="method-tags">
                                                <span>
                                                    {
                                                        item.currency
                                                    }
                                                </span>

                                                <span>
                                                    {
                                                        item.network
                                                    }
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* BODY */}

                                    <div className="method-admin-body">
                                        <div className="method-detail-grid">
                                            {/* CURRENCY */}

                                            <div className="method-detail">
                                                <span>
                                                    Currency
                                                </span>

                                                <strong>
                                                    {
                                                        item.currency
                                                    }
                                                </strong>
                                            </div>

                                            {/* NETWORK */}

                                            <div className="method-detail">
                                                <span>
                                                    Network
                                                </span>

                                                <strong>
                                                    {
                                                        item.network
                                                    }
                                                </strong>
                                            </div>

                                            {/* STATUS */}

                                            <div className="method-detail">
                                                <span>
                                                    Status
                                                </span>

                                                <strong>
                                                    {item.isActive
                                                        ? "Active"
                                                        : "Inactive"}
                                                </strong>
                                            </div>
                                        </div>

                                        {/* WALLET ADDRESS */}

                                        <div className="method-detail wallet-detail">
                                            <span>
                                                Wallet
                                                Address
                                            </span>

                                            <div className="copy-row">
                                                <strong className="wallet-address">
                                                    {
                                                        item.walletAddress
                                                    }
                                                </strong>

                                                {item.walletAddress && (
                                                    <button
                                                        type="button"
                                                        className="copy-btn"
                                                        onClick={() =>
                                                            copyValue(
                                                                item.walletAddress
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

                                        {/* INSTRUCTIONS */}

                                        {item.instructions && (
                                            <div className="method-instructions">
                                                <div className="instruction-label">
                                                    <span>
                                                        Payment
                                                        Instructions
                                                    </span>
                                                </div>

                                                <div className="instruction-content">
                                                    {
                                                        item.instructions
                                                    }
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* FOOTER */}

                                    <div className="method-admin-footer">
                                        <span
                                            className={
                                                item.isActive
                                                    ? "active-method"
                                                    : ""
                                            }
                                        >
                                            {item.isActive
                                                ? "Active"
                                                : "Inactive"}
                                        </span>

                                        <button
                                            type="button"
                                            className="icon-btn danger"
                                            title="Delete"
                                            onClick={() =>
                                                deleteMethod(
                                                    item._id
                                                )
                                            }
                                        >
                                            <Trash2
                                                size={
                                                    17
                                                }
                                            />
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                )}
            </div>

            {/* =========================================
                ADD WALLET MODAL
            ========================================= */}

            {showModal && (
                <div
                    className="modal-backdrop"
                    onClick={() =>
                        setShowModal(
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
                        {/* MODAL HEADER */}

                        <div className="modal-head">
                            <div>
                                <h2>
                                    Add Crypto Wallet
                                </h2>

                                <p>
                                    Add the wallet
                                    address users
                                    will send their
                                    investment
                                    payment to.
                                </p>
                            </div>

                            <button
                                type="button"
                                className="modal-close"
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* FORM */}

                        <div className="form">
                            {/* NAME */}

                            <label>
                                Wallet Name
                            </label>

                            <input
                                type="text"
                                placeholder="e.g. USDT TRC20"
                                value={
                                    method.name
                                }
                                onChange={(e) =>
                                    setMethod({
                                        ...method,
                                        name: e
                                            .target
                                            .value,
                                    })
                                }
                            />

                            {/* CURRENCY + NETWORK */}

                            <div className="two">
                                <div>
                                    <label>
                                        Currency
                                    </label>

                                    <select
                                        value={
                                            method.currency
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            handleCurrencyChange(
                                                e
                                                    .target
                                                    .value as CryptoCurrency
                                            )
                                        }
                                    >
                                        <option value="USDT">
                                            Tether
                                            (USDT)
                                        </option>

                                        <option value="USDC">
                                            USD Coin
                                            (USDC)
                                        </option>

                                        <option value="BTC">
                                            Bitcoin
                                            (BTC)
                                        </option>

                                        <option value="ETH">
                                            Ethereum
                                            (ETH)
                                        </option>
                                    </select>
                                </div>

                                <div>
                                    <label>
                                        Network
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="e.g. TRC20"
                                        value={
                                            method.network
                                        }
                                        onChange={(
                                            e
                                        ) =>
                                            setMethod({
                                                ...method,
                                                network:
                                                    e
                                                        .target
                                                        .value,
                                            })
                                        }
                                    />
                                </div>
                            </div>

                            {/* WALLET ADDRESS */}

                            <label>
                                Wallet Address
                            </label>

                            <input
                                type="text"
                                placeholder="Enter wallet address"
                                value={
                                    method.walletAddress
                                }
                                onChange={(e) =>
                                    setMethod({
                                        ...method,
                                        walletAddress:
                                            e
                                                .target
                                                .value,
                                    })
                                }
                            />

                            {/* INSTRUCTIONS */}

                            <label>
                                Payment Instructions
                            </label>

                            <textarea
                                rows={4}
                                placeholder="e.g. Send only USDT through the TRC20 network."
                                value={
                                    method.instructions
                                }
                                onChange={(e) =>
                                    setMethod({
                                        ...method,
                                        instructions:
                                            e
                                                .target
                                                .value,
                                    })
                                }
                            />
                        </div>

                        {/* ACTIONS */}

                        <div className="modal-actions">
                            <button
                                type="button"
                                className="btn btn-outline"
                                onClick={() =>
                                    setShowModal(
                                        false
                                    )
                                }
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={
                                    processing
                                }
                                onClick={
                                    addMethod
                                }
                            >
                                {processing
                                    ? "Adding..."
                                    : "Add Wallet"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}