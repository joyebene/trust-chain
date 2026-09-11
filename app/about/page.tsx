"use client";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

export default function About() {
  return <main>
    <header className="site-header"><div className="container nav"><Link href="/" className="brand"><Image src="/logo.jpeg" alt="Trust Chain" width={54} height={54} className="brand-logo"/><span>TRUST <b>CHAIN</b></span></Link><Link href="/" className="btn btn-ghost"><ArrowLeft size={16}/> Back home</Link></div></header>
    <section className="page-hero"><div className="container"><div className="section-kicker">ABOUT US</div><h1>Building wealth through Bitcoin.</h1><p>Professionalism, transparency and disciplined digital-asset participation.</p></div></section>
    <section className="section"><div className="container prose-grid">
      <article><h2>Our story</h2><p>Trust Chain is a Bitcoin-focused investment company established in 2020, built around a simple belief: wealth creation should be approached with trust, transparency, discipline and a long-term vision.</p><p>We provide clients with access to Bitcoin investment opportunities while combining professional management, responsible investment practices and clear communication. Our goal is to make participation in the digital asset market more structured, understandable and accessible.</p></article>
      <article><h2>What we do</h2><p>Our approach is centered on identifying opportunities within the Bitcoin market, managing investment strategies responsibly and providing clients with clear information about their investments.</p><ul className="plain-list">{["Bitcoin-focused investment opportunities","Professional investment management","Transparent communication","Responsible risk management","Clear reporting and account visibility","Long-term wealth-building strategies"].map(x=><li key={x}><CheckCircle2/> {x}</li>)}</ul></article>
      <article><h2>Our vision</h2><p>To become a trusted leader in Bitcoin investment, empowering individuals and businesses to participate confidently in the future of digital finance.</p></article>
      <article><h2>Our mission</h2><p>To provide a professional and transparent environment for Bitcoin investment while helping clients pursue their financial goals through disciplined and responsible investment strategies.</p></article>
      <article><h2>Transparency</h2><p>We believe transparency is the foundation of every lasting financial relationship. We are committed to communicating clearly about our investment strategies, processes, risks and performance.</p></article>
      <article><h2>Our dedication</h2><p>Our dedication goes beyond managing investments. It is about building relationships based on professionalism, responsibility and trust. Every client matters. Every investment deserves careful attention.</p></article>
    </div></section>
  </main>
}
