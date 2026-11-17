
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import {
    LockKeyhole,
    Loader2,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    ArrowLeft,
} from "lucide-react";

export default function ResetPasswordForm({
    token,
}: {
    token: string;
}) {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    async function submit(e: FormEvent) {
        e.preventDefault();

        setError("");

        if (!token) {
            setError("Invalid password reset link.");
            return;
        }

        if (password.length < 8) {
            setError(
                "Your password must contain at least 8 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setError("Your passwords do not match.");
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(
                "/api/auth/reset-password",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        token,
                        password,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error || "Unable to reset your password."
                );
                return;
            }

            setSuccess(true);
            setPassword("");
            setConfirmPassword("");

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
                        <LockKeyhole />
                    </div>

                    <h1>Reset Password</h1>

                    <p>
                        Create a new password for your Trust Chain
                        account.
                    </p>
                </div>

                {success ? (
                    <>
                        <div className="alert success">
                            <div className="flex items-start gap-2">
                                <CheckCircle2 size={19} />

                                <div>
                                    <p className="font-semibold">
                                        Password reset successful!
                                    </p>

                                    <p className="mt-2 text-sm">
                                        Your password has been updated.
                                        You can now sign in using your
                                        new password.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/login"
                            className="btn btn-gold btn-block"
                        >
                            Continue to Login
                        </Link>
                    </>
                ) : (
                    <>
                        {error && (
                            <div className="alert error">
                                <div className="flex items-start gap-2">
                                    <AlertCircle size={18} />

                                    <p>{error}</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={submit} className="form">
                            <label>
                                New password

                                <div className="input-wrap">
                                    <LockKeyhole />

                                    <input
                                        required
                                        type="password"
                                        minLength={8}
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="Enter new password"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </label>

                            <label>
                                Confirm new password

                                <div className="input-wrap">
                                    <LockKeyhole />

                                    <input
                                        required
                                        type="password"
                                        minLength={8}
                                        value={confirmPassword}
                                        onChange={(e) =>
                                            setConfirmPassword(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Confirm new password"
                                        autoComplete="new-password"
                                    />
                                </div>
                            </label>

                            <p className="text-sm text-gray-500">
                                Your password must contain at least
                                8 characters.
                            </p>

                            <button
                                disabled={loading}
                                className="btn btn-gold btn-block"
                                type="submit"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="spin" />
                                        Updating password...
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </form>
                    </>
                )}

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
