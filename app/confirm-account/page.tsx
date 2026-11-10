
"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import {
  ShieldCheck,
  LockKeyhole,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  FileText,
  AlertCircle,
  MailCheck,
} from "lucide-react";

const policies = [
  {
    title: "Privacy Policy",
    description: "How we collect, use, store and protect your personal information.",
    href: "/privacy-policy",
  },
  {
    title: "Refund Policy",
    description: "Understand our refund procedures, eligibility and conditions.",
    href: "/refund-policy",
  },
  {
    title: "Withdrawal Policy",
    description: "Review the procedures, requirements and conditions for withdrawals.",
    href: "/withdrawal-policy",
  },
  {
    title: "Terms & Conditions",
    description: "The terms governing your use of Trust Chain and its services.",
    href: "/terms-and-conditions",
  },
];

function ConfirmAccountContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleProceed() {
    if (!accepted) {
      setError("Please read and accept all four policies to continue.");
      return;
    }

    if (!token) {
      setError("Invalid or missing confirmation link. Please request a new confirmation email.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/confirm-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          acceptedPolicies: true,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Unable to confirm your account."
        );
      }

      setSuccess(true);
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

  if (success) {
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
            <span>TRUST <b>CHAIN</b></span>
          </Link>
        </div>

        <div className="auth-card wide confirmation-card">
          <div className="confirmation-success-icon">
            <CheckCircle2 size={38} />
          </div>

          <div className="auth-title">
            <h1>Account Confirmed!</h1>
            <p>
              Your email has been verified and your policy
              acceptance has been recorded successfully.
            </p>
          </div>

          <div className="confirmation-info">
            <ShieldCheck size={21} />
            <div>
              <strong>Your account is now activated.</strong>
              <p>You can now sign in and access your Trust Chain dashboard.</p>
            </div>
          </div>

          <button
            onClick={() => router.push("/login")}
            className="btn btn-gold btn-block"
          >
            Continue to sign in
          </button>

          <Link href="/" className="back-link">
            <ArrowLeft size={15} /> Back to website
          </Link>
        </div>
      </main>
    );
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
          <span>TRUST <b>CHAIN</b></span>
        </Link>
      </div>

      <div className="auth-card wide confirmation-card">
        <div className="confirmation-top-icon">
          <MailCheck size={30} />
        </div>

        <div className="auth-title">
          <h1>Complete Your Registration</h1>
          <p>
            Your email confirmation link has been opened.
            Before activating your Trust Chain account, please
            review and accept our policies.
          </p>
        </div>

        <div className="confirmation-notice">
          <ShieldCheck size={20} />
          <div>
            <strong>Your account, your understanding.</strong>
            <p>
              Please review each document carefully.
              These policies explain your rights, responsibilities
              and the procedures that apply to your account.
            </p>
          </div>
        </div>

        <div className="policy-section">
          <div className="policy-section-heading">
            <div>
              <h3>Important Documents</h3>
              <p>Review all four documents before proceeding.</p>
            </div>
            <span className="policy-count">04 DOCUMENTS</span>
          </div>

          <div className="policy-document-list">
            {policies.map((policy, index) => (
              <div className="policy-document" key={policy.href}>
                <div className="policy-file-icon">
                  <FileText size={20} />
                </div>

                <div className="policy-document-info">
                  <strong>{policy.title}</strong>
                  <p>{policy.description}</p>
                </div>

                <Link
                  href={policy.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="policy-read-link"
                >
                  Read <span>↗</span>
                </Link>
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="alert error">
            <AlertCircle size={17} />
            {error}
          </div>
        )}

        <label className="confirmation-checkbox">
          <input
            type="checkbox"
            checked={accepted}
            onChange={(e) => {
              setAccepted(e.target.checked);
              setError("");
            }}
          />

          <span className="custom-check"></span>

          <span className="confirmation-checkbox-text">
            <strong>I have read and understand the procedures.</strong>
            <small>
              I confirm that I have reviewed and understood
              the Privacy Policy, Refund Policy, Withdrawal
              Policy and Terms & Conditions, and agree to be
              bound by the applicable terms.
            </small>
          </span>
        </label>

        <button
          type="button"
          onClick={handleProceed}
          disabled={loading || !accepted || !token}
          className="btn btn-gold btn-block confirmation-proceed"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="spin" />
              Confirming your account...
            </>
          ) : (
            <>
              <ShieldCheck size={18} />
              Proceed to activate account
            </>
          )}
        </button>

        <div className="confirmation-security">
          <LockKeyhole size={14} />
          Your confirmation is securely processed.
        </div>

        <Link href="/" className="back-link">
          <ArrowLeft size={15} /> Back to website
        </Link>
      </div>
    </main>
  );
}

export default function ConfirmAccount() {
  return (
    <Suspense
      fallback={
        <main className="auth-shell">
          <div className="auth-card">
            <Loader2 className="spin" />
            <p>Loading confirmation page...</p>
          </div>
        </main>
      }
    >
      <ConfirmAccountContent />
    </Suspense>
  );
}
