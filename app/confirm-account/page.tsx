
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
    ChevronRight,
} from "lucide-react";

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
            setError("Please review and accept all four policies to continue.");
            return;
        }

        if (!token) {
            setError(
                "Invalid or missing confirmation link. Please request a new confirmation email."
            );
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
                            <p>
                                You can now sign in and access your Trust Chain
                                account.
                            </p>
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
        <main className="auth-shell confirmation-shell">
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
                        Please review the four documents below before
                        activating your Trust Chain account.
                    </p>
                </div>

                <div className="confirmation-notice">
                    <ShieldCheck size={20} />
                    <div>
                        <strong>Your account, your understanding.</strong>
                        <p>
                            These documents explain how your information,
                            funds, transactions and account are handled.
                            Please review them carefully.
                        </p>
                    </div>
                </div>

                {/* POLICY NAVIGATION */}
                <div className="policy-section">
                    <div className="policy-section-heading">
                        <div>
                            <h3>Trust Chain Policies</h3>
                            <p>
                                Please take a moment to review each document.
                            </p>
                        </div>

                        <span className="policy-count">04 DOCUMENTS</span>
                    </div>

                    <nav className="policy-navigation" aria-label="Policy documents">
                        <a href="#privacy-policy">
                            <span>01</span>
                            Privacy Policy
                            <ChevronRight size={16} />
                        </a>

                        <a href="#refund-policy">
                            <span>02</span>
                            Refund Policy
                            <ChevronRight size={16} />
                        </a>

                        <a href="#withdrawal-policy">
                            <span>03</span>
                            Withdrawal Policy
                            <ChevronRight size={16} />
                        </a>

                        <a href="#terms-conditions">
                            <span>04</span>
                            Terms & Conditions
                            <ChevronRight size={16} />
                        </a>
                    </nav>

                    <div className="policy-reading-hint">
                        <FileText size={16} />
                        All four documents are displayed below. You can use
                        the links above to move directly to any section.
                    </div>

                    <div className="policy-document-list">

                        {/* PRIVACY POLICY */}
                        <section
                            className="policy-document"
                            id="privacy-policy"
                        >
                            <div className="policy-summary">
                                <div className="policy-file-icon">
                                    <FileText size={21} />
                                </div>

                                <div className="policy-document-info">
                                    <span className="policy-number">DOCUMENT 01</span>
                                    <h3>Privacy Policy</h3>
                                    <p>
                                        How we collect, use and protect your
                                        personal information.
                                    </p>
                                </div>
                            </div>

                            <div className="policy-content">
                                <h4>1. Introduction</h4>
                                <p>
                                    Trust Chain respects your privacy and is
                                    committed to protecting personal information
                                    collected through our website and services.
                                    This policy explains how information is
                                    collected, used, stored and disclosed.
                                </p>

                                <h4>2. Information We Collect</h4>
                                <p>Depending on your use of our services, we may collect:</p>
                                <ul>
                                    <li>Full name and contact information.</li>
                                    <li>Email address and telephone number.</li>
                                    <li>Account credentials and authentication information.</li>
                                    <li>Transaction, deposit and withdrawal records.</li>
                                    <li>Identity verification information where required.</li>
                                    <li>Technical information such as IP address, browser and device information.</li>
                                    <li>Communications and support requests.</li>
                                </ul>

                                <h4>3. How We Use Your Information</h4>
                                <p>We may use your information to:</p>
                                <ul>
                                    <li>Create and manage your account.</li>
                                    <li>Verify your identity and protect against fraud.</li>
                                    <li>Process and record transactions.</li>
                                    <li>Provide customer support.</li>
                                    <li>Communicate important account updates.</li>
                                    <li>Meet applicable legal and regulatory obligations.</li>
                                    <li>Improve the security and functionality of our platform.</li>
                                </ul>

                                <h4>4. Information Sharing</h4>
                                <p>
                                    We do not sell personal information to third
                                    parties. We may share necessary information
                                    with trusted service providers, payment
                                    processors, identity verification providers
                                    and competent authorities where required
                                    for service delivery, security or legal
                                    compliance.
                                </p>

                                <h4>5. Data Security</h4>
                                <p>
                                    We use reasonable technical and
                                    organizational safeguards to protect
                                    information against unauthorized access,
                                    loss, misuse or disclosure. However, no
                                    internet-based system can guarantee
                                    absolute security.
                                </p>

                                <h4>6. Data Retention</h4>
                                <p>
                                    We retain information for as long as
                                    reasonably necessary to provide services,
                                    maintain records, resolve disputes and
                                    comply with applicable legal obligations.
                                </p>

                                <h4>7. Your Privacy Rights</h4>
                                <p>
                                    Subject to applicable law, you may request
                                    access to, correction of or deletion of
                                    certain personal information. You may also
                                    contact our support team with privacy
                                    concerns or requests.
                                </p>

                                <h4>8. Changes to This Policy</h4>
                                <p>
                                    We may update this policy when our
                                    practices, services or legal obligations
                                    change. Updated versions will be published
                                    on our platform.
                                </p>
                            </div>
                        </section>

                        {/* REFUND POLICY */}
                        <section
                            className="policy-document"
                            id="refund-policy"
                        >
                            <div className="policy-summary">
                                <div className="policy-file-icon">
                                    <FileText size={21} />
                                </div>

                                <div className="policy-document-info">
                                    <span className="policy-number">DOCUMENT 02</span>
                                    <h3>Refund Policy</h3>
                                    <p>
                                        Conditions and procedures relating
                                        to refund requests.
                                    </p>
                                </div>
                            </div>

                            <div className="policy-content">
                                <h4>1. Purpose</h4>
                                <p>
                                    This Refund Policy explains how Trust Chain
                                    handles requests relating to payments,
                                    deposits and eligible refunds made through
                                    the platform.
                                </p>

                                <h4>2. Investment Transactions</h4>
                                <p>
                                    Investment contributions are subject to
                                    the applicable investment agreement and
                                    product terms. A request to withdraw an
                                    investment is not automatically a refund.
                                    Investment values may fluctuate, and
                                    returns are not guaranteed.
                                </p>

                                <h4>3. Eligible Refund Requests</h4>
                                <p>
                                    A refund request may be considered where
                                    there has been a duplicate payment, an
                                    incorrectly processed payment, an
                                    unauthorized transaction or another
                                    circumstance in which a refund is required
                                    by applicable law or the relevant service
                                    agreement.
                                </p>

                                <h4>4. Non-Eligible Requests</h4>
                                <p>
                                    Refunds are not automatically available
                                    simply because a user changes their mind,
                                    experiences an investment loss or decides
                                    to discontinue participation in an
                                    investment arrangement. Applicable
                                    contractual and legal rights will always
                                    be considered.
                                </p>

                                <h4>5. How to Request a Refund</h4>
                                <p>
                                    Users should contact Trust Chain support
                                    with the registered email address,
                                    transaction reference, payment date,
                                    amount and a clear explanation of the
                                    request. Supporting evidence may be
                                    required.
                                </p>

                                <h4>6. Review and Verification</h4>
                                <p>
                                    Refund requests may be reviewed against
                                    transaction records and relevant payment
                                    provider information. Additional
                                    verification may be requested before a
                                    decision is made.
                                </p>

                                <h4>7. Approved Refunds</h4>
                                <p>
                                    Where a refund is approved, the refund
                                    method, amount and processing period will
                                    depend on the original payment method,
                                    payment provider and applicable agreement
                                    or law. Any applicable fees or deductions
                                    must be disclosed before processing.
                                </p>

                                <h4>8. Disputes</h4>
                                <p>
                                    Users who disagree with a refund decision
                                    may contact support for further review.
                                    This policy does not remove any rights
                                    available under applicable law.
                                </p>
                            </div>
                        </section>

                        {/* WITHDRAWAL POLICY */}
                        <section
                            className="policy-document"
                            id="withdrawal-policy"
                        >
                            <div className="policy-summary">
                                <div className="policy-file-icon">
                                    <FileText size={21} />
                                </div>

                                <div className="policy-document-info">
                                    <span className="policy-number">DOCUMENT 03</span>
                                    <h3>Withdrawal Policy</h3>
                                    <p>
                                        Procedures and requirements for
                                        withdrawing available funds.
                                    </p>
                                </div>
                            </div>

                            <div className="policy-content">
                                <h4>1. Overview</h4>
                                <p>
                                    This policy explains the general
                                    requirements for requesting withdrawals
                                    from a Trust Chain account. Withdrawals
                                    are subject to account verification,
                                    available balances and the terms of the
                                    applicable investment product.
                                </p>

                                <h4>2. Account Verification</h4>
                                <p>
                                    Users may be required to complete identity
                                    verification and additional security
                                    checks before withdrawals are approved.
                                    Withdrawal requests may be restricted
                                    where an account is under investigation,
                                    suspended or subject to a legal restriction.
                                </p>

                                <h4>3. Available Balance</h4>
                                <p>
                                    Users may only request withdrawals from
                                    funds that are available for withdrawal.
                                    Funds committed to an active investment,
                                    pending transactions or amounts subject
                                    to contractual restrictions may not be
                                    immediately available.
                                </p>

                                <h4>4. Withdrawal Requests</h4>
                                <p>
                                    Withdrawal requests must be submitted
                                    through the approved platform process.
                                    Users must provide accurate payment
                                    destination details and any additional
                                    information reasonably required to
                                    verify the request.
                                </p>

                                <h4>5. Processing and Review</h4>
                                <p>
                                    Withdrawal requests may undergo security,
                                    compliance and transaction checks.
                                    Processing times depend on the applicable
                                    payment provider, asset network,
                                    verification requirements and investment
                                    agreement.
                                </p>

                                <h4>6. Fees and Charges</h4>
                                <p>
                                    Applicable withdrawal, network or
                                    processing fees must be disclosed to users
                                    before they confirm a withdrawal. Users
                                    should review the displayed charges before
                                    submitting a request.
                                </p>

                                <h4>7. Cryptocurrency Withdrawals</h4>
                                <p>
                                    Where cryptocurrency withdrawals are
                                    supported, users are responsible for
                                    providing the correct wallet address and
                                    supported network. Cryptocurrency
                                    transactions may be irreversible once
                                    confirmed on the blockchain.
                                </p>

                                <h4>8. Delayed or Rejected Withdrawals</h4>
                                <p>
                                    A withdrawal may be delayed or rejected
                                    where details are incorrect, verification
                                    is incomplete, suspicious activity is
                                    detected, funds are unavailable or a
                                    legal restriction applies. Users will
                                    receive an explanation where reasonably
                                    possible and legally permitted.
                                </p>

                                <h4>9. Contact and Support</h4>
                                <p>
                                    Users experiencing withdrawal issues
                                    should contact Trust Chain support and
                                    provide their transaction reference and
                                    relevant details.
                                </p>
                            </div>
                        </section>

                        {/* TERMS AND CONDITIONS */}
                        <section
                            className="policy-document"
                            id="terms-conditions"
                        >
                            <div className="policy-summary">
                                <div className="policy-file-icon">
                                    <FileText size={21} />
                                </div>

                                <div className="policy-document-info">
                                    <span className="policy-number">DOCUMENT 04</span>
                                    <h3>Terms & Conditions</h3>
                                    <p>
                                        The rules governing your use of
                                        Trust Chain.
                                    </p>
                                </div>
                            </div>

                            <div className="policy-content">
                                <h4>1. Agreement to Terms</h4>
                                <p>
                                    These Terms and Conditions govern access
                                    to and use of the Trust Chain platform.
                                    By creating an account and using our
                                    services, you agree to comply with these
                                    terms and the other applicable policies.
                                </p>

                                <h4>2. Eligibility</h4>
                                <p>
                                    You must meet the legal age and eligibility
                                    requirements applicable to your location
                                    and the relevant service before opening
                                    an account or participating in any
                                    investment product.
                                </p>

                                <h4>3. Account Registration</h4>
                                <p>
                                    You must provide accurate, complete and
                                    current information during registration.
                                    You are responsible for maintaining the
                                    confidentiality of your login credentials
                                    and for activities carried out through
                                    your account.
                                </p>

                                <h4>4. Identity Verification</h4>
                                <p>
                                    Trust Chain may request identity,
                                    address, source-of-funds or other
                                    verification information where necessary
                                    for security, fraud prevention or
                                    compliance with applicable requirements.
                                </p>

                                <h4>5. Investment Risk</h4>
                                <p>
                                    All investments involve risk. The value
                                    of investments may increase or decrease,
                                    and users may lose some or all of the
                                    capital invested. Past performance does
                                    not guarantee future results.
                                </p>
                                <p>
                                    Unless expressly stated in a legally
                                    binding agreement, any projections,
                                    estimates or illustrative returns are
                                    not guarantees of future performance.
                                </p>

                                <h4>6. Deposits and Transactions</h4>
                                <p>
                                    Users must ensure that payment and
                                    transaction details are accurate.
                                    Transactions may be subject to
                                    verification, payment provider rules,
                                    network conditions and applicable fees.
                                </p>

                                <h4>7. Prohibited Activities</h4>
                                <p>You must not:</p>
                                <ul>
                                    <li>Use the platform for unlawful activities or financial fraud.</li>
                                    <li>Provide false or misleading account information.</li>
                                    <li>Attempt unauthorized access to another user's account.</li>
                                    <li>Manipulate transactions or interfere with platform security.</li>
                                    <li>Use the platform to conceal the source of illegal funds.</li>
                                    <li>Abuse, disrupt or compromise platform services.</li>
                                </ul>

                                <h4>8. Account Suspension</h4>
                                <p>
                                    Trust Chain may restrict, suspend or
                                    terminate access where there is suspected
                                    fraud, a security threat, a breach of
                                    these terms or a legal or regulatory
                                    requirement. Where appropriate, users
                                    will be notified of the reason.
                                </p>

                                <h4>9. Platform Availability</h4>
                                <p>
                                    We aim to maintain reliable platform
                                    access but do not guarantee uninterrupted
                                    availability. Maintenance, technical
                                    failures, network disruptions or
                                    circumstances outside our control may
                                    temporarily affect services.
                                </p>

                                <h4>10. Limitation of Liability</h4>
                                <p>
                                    To the extent permitted by applicable law,
                                    Trust Chain will not be responsible for
                                    indirect or consequential losses arising
                                    from circumstances outside its reasonable
                                    control. Nothing in these terms excludes
                                    liability that cannot legally be excluded.
                                </p>

                                <h4>11. Changes to Services and Terms</h4>
                                <p>
                                    We may modify our platform, services or
                                    these terms where reasonably necessary.
                                    Material changes will be communicated
                                    through appropriate platform notices
                                    or other available communication channels.
                                </p>

                                <h4>12. Governing Law and Disputes</h4>
                                <p>
                                    These terms are subject to the laws of
                                    the jurisdiction applicable to the
                                    Trust Chain operating entity and the
                                    relevant user agreement. Disputes should
                                    first be raised through the available
                                    customer support process, without
                                    limiting any legal rights.
                                </p>

                                <h4>13. Contact</h4>
                                <p>
                                    For questions about these terms or
                                    your account, contact Trust Chain
                                    through the official support channels
                                    published on our website.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>

                {/* ACCEPTANCE */}
                <div className="confirmation-acceptance">
                    <div className="confirmation-acceptance-heading">
                        <ShieldCheck size={20} />
                        <div>
                            <h3>Policy Acknowledgement</h3>
                            <p>
                                Please confirm your agreement after reviewing
                                all four documents.
                            </p>
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
                            <strong>
                                I have read and understand the procedures.
                            </strong>
                            <small>
                                I confirm that I have reviewed and understood
                                the Privacy Policy, Refund Policy, Withdrawal
                                Policy and Terms & Conditions, and agree to
                                be bound by the applicable terms.
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
