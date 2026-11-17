
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
    ArrowLeft,
    Mail,
    Loader2,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function submit(e: FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch(
                "/api/auth/forgot-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        email: email.trim().toLowerCase(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error || "Unable to process your request."
                );
                return;
            }

            setSuccess(true);

        } catch {
            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-shell">
            <div className="auth-brand">
                <Link href="/" className="brand">
                    <span>
                        TRUST <b>CHAIN</b>
                    </span>
                </Link>
            </div>

            <div className="auth-card">
                <div className="auth-title">
                    <div className="gold-circle">
                        <Mail />
                    </div>

                    <h1>Forgot Password?</h1>

                    <p>
                        Don't worry. Enter your registered email
                        address and we'll send you a link to reset
                        your password.
                    </p>
                </div>

                {success && (
                    <div className="alert success">
                        <div className="flex items-start gap-2">
                            <CheckCircle2
                                size={19}
                                className="shrink-0 mt-0.5"
                            />

                            <div>
                                <p className="font-semibold">
                                    Check your email
                                </p>

                                <p className="mt-2 text-sm">
                                    If an account exists with this
                                    email address, a password reset
                                    link has been sent.
                                </p>

                                <p className="mt-2 text-sm">
                                    Please check your inbox and spam
                                    or junk folder.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {error && (
                    <div className="alert error">
                        <div className="flex items-start gap-2">
                            <AlertCircle size={18} />

                            <p>{error}</p>
                        </div>
                    </div>
                )}

                {!success && (
                    <form onSubmit={submit} className="form">
                        <label>
                            Email address

                            <div className="input-wrap">
                                <Mail />

                                <input
                                    required
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="you@example.com"
                                    autoComplete="email"
                                />
                            </div>
                        </label>

                        <button
                            disabled={loading}
                            className="btn btn-gold btn-block"
                            type="submit"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="spin" />
                                    Sending link...
                                </>
                            ) : (
                                "Send Reset Link"
                            )}
                        </button>
                    </form>
                )}

                {success && (
                    <button
                        onClick={() => setSuccess(false)}
                        className="btn btn-gold btn-block"
                    >
                        Try another email
                    </button>
                )}

                <div className="auth-foot">
                    Remember your password?{" "}
                    <Link href="/login">Sign in</Link>
                </div>

                <div className="security-message">
                    <ShieldCheck size={15} />
                    Your account is protected by secure authentication.
                </div>

                <Link href="/login" className="back-link">
                    <ArrowLeft size={15} />
                    Back to login
                </Link>
            </div>
        </main>
    );
}
