
"use client";

import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  MailCheck,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

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
          <MailCheck size={32} />
        </div>

        <div className="auth-title">
          <h1>Check Your Email</h1>
          <p>
            Your registration has been received.
            We've sent you an email containing a secure
            link to continue activating your account.
          </p>
        </div>

        {email && (
          <div className="confirmation-notice">
            <MailCheck size={21} />
            <div>
              <strong>Confirmation email sent to</strong>
              <p>{email}</p>
            </div>
          </div>
        )}

        <div className="confirmation-info">
          <ShieldCheck size={21} />
          <div>
            <strong>One more step to activate your account.</strong>
            <p>
              Open the email and click Confirm My Email.
              You will then review our four policies and
              accept them before your account becomes active.
            </p>
          </div>
        </div>

        <div style={{ margin: "22px 0", fontSize: 13, lineHeight: 1.8 }}>
          <strong>Didn't receive the email?</strong>
          <p style={{ opacity: 0.7 }}>
            Check your spam or junk folder. Your confirmation
            link expires after 24 hours.
          </p>
        </div>

        <Link href="/login" className="btn btn-gold btn-block">
          Go to sign in
        </Link>

        <Link href="/" className="back-link">
          <ArrowLeft size={15} /> Back to website
        </Link>
      </div>
    </main>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense
      fallback={
        <main className="auth-shell">
          <div className="auth-card">
            Loading...
          </div>
        </main>
      }
    >
      <CheckEmailContent />
    </Suspense>
  );
}
