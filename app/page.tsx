"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bitcoin, CheckCircle2, ChevronDown, LockKeyhole, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

const features = [
  { icon: ShieldCheck, title: "Transparency first", text: "Clear investment records, payment statuses and account activity." },
  { icon: LockKeyhole, title: "Account visibility", text: "Keep your balance, investments and notifications in one secure dashboard." },
  { icon: TrendingUp, title: "Bitcoin focused", text: "A structured platform designed around digital-asset investment participation." },
];

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <div className="container nav">
          <Link href="/" className="brand">
            <Image src="/logo.jpeg" alt="Trust Chain" width={54} height={54} className="brand-logo" />
            <span>TRUST <b>CHAIN</b></span>
          </Link>
          <nav className="desktop-nav">
            <a href="#about">About</a>
            <a href="#opportunity">Opportunity</a>
            <a href="#process">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="nav-actions">
            <Link href="/login" className="btn btn-ghost">Sign in</Link>
            <Link href="/register" className="btn btn-gold">Create account <ArrowRight size={16}/></Link>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-grid" />
        <div className="container hero-content">
          <div className="eyebrow"><span className="pulse" /> BITCOIN • DISCIPLINE • LONG-TERM VISION</div>
          <h1>Build wealth with a more <span>structured</span> Bitcoin journey.</h1>
          <p className="hero-copy">
            Trust Chain brings investment participation, transparent account visibility and professional-looking
            digital asset management into one simple experience.
          </p>
          <div className="hero-actions">
            <Link href="/register" className="btn btn-gold btn-lg">Start investing <ArrowRight size={18}/></Link>
            <a href="#about" className="btn btn-outline btn-lg">Explore Trust Chain</a>
          </div>
          <div className="hero-trust">
            <div><CheckCircle2 size={17}/> Clear reporting</div>
            <div><CheckCircle2 size={17}/> Payment verification</div>
            <div><CheckCircle2 size={17}/> Secure client portal</div>
          </div>
        </div>
        <div className="hero-card-wrap">
          <div className="hero-card">
            <div className="hero-card-top"><span>TRUST CHAIN</span><Bitcoin size={20}/></div>
            <div className="hero-card-label">Digital investment account</div>
            <div className="hero-card-value">$50,000<span>.00</span></div>
            <div className="mini-chart"><span/><span/><span/><span/><span/><span/><span/><span/><span/><span/></div>
            <div className="hero-card-bottom"><span>Portfolio visibility</span><b>24/7</b></div>
          </div>
        </div>
      </section>

      <section className="stats-strip">
        <div className="container stats">
          <div><strong>2020</strong><span>Established</span></div>
          <div><strong>BTC</strong><span>Core asset focus</span></div>
          <div><strong>24/7</strong><span>Account access</span></div>
          <div><strong>1</strong><span>Transparent dashboard</span></div>
        </div>
      </section>

      <section id="about" className="section">
        <div className="container split">
          <div>
            <div className="section-kicker">ABOUT TRUST CHAIN</div>
            <h2>Trust is the foundation of every lasting financial relationship.</h2>
          </div>
          <div className="section-copy">
            <p>Trust Chain is a Bitcoin-focused investment company established in 2020, built around a simple belief:
              wealth creation should be approached with trust, transparency, discipline and a long-term vision.</p>
            <p>We provide clients with access to Bitcoin investment opportunities while combining professional management,
              responsible investment practices and clear communication.</p>
            <Link href="/about" className="text-link">Learn more about us <ArrowRight size={17}/></Link>
          </div>
        </div>
        <div className="container feature-grid">
          {features.map((f) => <div className="feature-card" key={f.title}><div className="icon-box"><f.icon size={22}/></div><h3>{f.title}</h3><p>{f.text}</p></div>)}
        </div>
      </section>

      <section id="opportunity" className="section section-dark">
        <div className="container opportunity">
          <div className="opportunity-copy">
            <div className="section-kicker gold">INVESTMENT OPPORTUNITY</div>
            <h2>A premium experience for clients pursuing digital-asset growth.</h2>
            <p>Our program is designed for individuals seeking to participate in the Bitcoin market through a
              structured, transparent investment workflow.</p>
            <ul className="check-list">
              <li><CheckCircle2/> Bitcoin-focused investment opportunities</li>
              <li><CheckCircle2/> Professional investment management</li>
              <li><CheckCircle2/> Transparent communication and reporting</li>
              <li><CheckCircle2/> Clear account and payment history</li>
            </ul>
            <Link href="/register" className="btn btn-gold btn-lg">Open your account <ArrowRight size={18}/></Link>
          </div>
          <div className="investment-card">
            <div className="investment-card-head"><span>INVESTMENT PROGRAM</span><Sparkles size={18}/></div>
            <div className="investment-number">3–5 <small>working days</small></div>
            <p>Illustrative cycle period. Actual terms, eligibility, risks and outcomes are subject to the applicable investment agreement.</p>
            <div className="program-line"><span>Minimum investment</span><strong>$5,000</strong></div>
            <div className="program-line"><span>Return target</span><strong>Up to 300%*</strong></div>
            <div className="risk-note">*Target returns are not guaranteed. Investment values can rise or fall. Review all applicable terms and risk disclosures before investing.</div>
          </div>
        </div>
      </section>

      <section id="process" className="section">
        <div className="container">
          <div className="center-head"><div className="section-kicker">HOW IT WORKS</div><h2>A simple investment workflow.</h2><p>Designed so every important step is visible.</p></div>
          <div className="steps">
            {[
              ["01","Create an account","Register and complete your basic profile."],
              ["02","Choose an investment","Select the currency and payment method available to you."],
              ["03","Make payment","Use the verified account or wallet details shown in your secure modal."],
              ["04","Get verified","Submit your payment confirmation. Our team reviews it."],
              ["05","Track your account","Once approved, the investment and balance are reflected in your dashboard."]
            ].map(([n,t,d]) => <div className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}
          </div>
        </div>
      </section>

      <section className="section quote-section">
        <div className="container quote"><Bitcoin size={42}/><blockquote>“Your confidence is our responsibility.”</blockquote><p>TRUST CHAIN</p></div>
      </section>

      <section id="faq" className="section faq-section">
        <div className="container narrow">
          <div className="center-head"><div className="section-kicker">FAQ</div><h2>Questions, answered clearly.</h2></div>
          {[
            ["What is Trust Chain?","Trust Chain is a Bitcoin-focused investment platform designed around structured investment participation, transparent account visibility and clear communication."],
            ["How do I fund an investment?","After signing in, select an investment amount and currency. The platform will show the payment methods configured by the administrator. After payment, submit your confirmation for review."],
            ["When is my investment approved?","Payments remain pending until an administrator verifies the submitted payment. Approved investments are then reflected in your account."],
            ["Are investment returns guaranteed?","No. Any target return shown on the platform is not a guarantee. Investment outcomes are subject to applicable terms, risks and market conditions."]
          ].map(([q,a]) => <details key={q}><summary>{q}<ChevronDown size={18}/></summary><p>{a}</p></details>)}
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div><Link href="/" className="brand"><Image src="/logo.jpeg" alt="" width={46} height={46} className="brand-logo"/><span>TRUST <b>CHAIN</b></span></Link><p>Building Wealth Through Bitcoin.</p></div>
          <div><h4>Company</h4><Link href="/about">About us</Link><a href="#opportunity">Opportunity</a><a href="#process">How it works</a></div>
          <div><h4>Account</h4><Link href="/login">Sign in</Link><Link href="/register">Create account</Link></div>
          <div><h4>Important</h4><p className="footer-note">Digital assets involve risk. Nothing on this website should be interpreted as a guarantee of returns or as individualized financial advice.</p></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} Trust Chain. All rights reserved.</span><span>Built for transparent account management.</span></div>
      </footer>
    </main>
  );
}
