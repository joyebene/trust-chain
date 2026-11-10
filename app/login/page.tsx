
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
    ArrowLeft,
    Loader2,
    LockKeyhole,
    Mail,
    ShieldCheck,
    AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function Login() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [errorCode, setErrorCode] = useState("");

    async function submit(e: FormEvent) {
        e.preventDefault();

        setLoading(true);
        setError("");
        setErrorCode("");

        try {
            const r = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    password,
                }),
            });

            const d = await r.json();

            if (!r.ok) {
                setError(d.error || "Unable to sign in.");
                setErrorCode(d.code || "");
                return;
            }

            router.push(
                d.user.role === "admin" ? "/admin" : "/dashboard"
            );

            router.refresh();

        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="auth-shell">
            <div className="auth-brand">
                <Link href="/" className="brand">
                    <Image
                        src="/logo.jpeg"
                        alt="Trust Chain"
                        width={60}
                        height={60}
                        className="brand-logo"
                    />
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

                    <h1>Welcome back</h1>
                    <p>Sign in to access your investment account.</p>
                </div>

                {error && (
                    <div className="alert error">
                        <div className="flex items-start gap-2">
                            <AlertCircle
                                size={18}
                                className="shrink-0 mt-0.5"
                            />
                            <div>
                                <p>{error}</p>

                                {errorCode === "EMAIL_NOT_VERIFIED" && (
                                    <p className="mt-2 text-sm">
                                        Check your inbox for the verification
                                        email. You need to verify your email
                                        before signing in.
                                    </p>
                                )}

                                {errorCode === "POLICIES_NOT_ACCEPTED" && (
                                    <p className="mt-2 text-sm">
                                        Please complete the policy acceptance
                                        process using your confirmation link.
                                    </p>
                                )}

                                {errorCode === "ACCOUNT_NOT_ACTIVE" && (
                                    <p className="mt-2 text-sm">
                                        Your account is not active yet.
                                        Please contact our support team.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={submit} className="form">
                    <label>
                        Email address

                        <div className="input-wrap">
                            <Mail />

                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                autoComplete="email"
                            />
                        </div>
                    </label>

                    <label>
                        Password

                        <div className="input-wrap">
                            <LockKeyhole />

                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                autoComplete="current-password"
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
                                Signing in...
                            </>
                        ) : (
                            "Sign in"
                        )}
                    </button>
                </form>

                <div className="auth-foot">
                    New to Trust Chain?{" "}
                    <Link href="/register">Create an account</Link>
                </div>

                <div className="flex items-center justify-center gap-2 text-xs text-gray-500 mt-5">
                    <ShieldCheck size={15} />
                    Your account is protected by secure authentication.
                </div>

                <Link href="/" className="back-link">
                    <ArrowLeft size={15} />
                    Back to website
                </Link>
            </div>
        </main>
    );
}
