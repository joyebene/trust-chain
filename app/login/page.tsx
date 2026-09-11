"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, LockKeyhole, Mail } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Login() {
  const router = useRouter();
  const [email,setEmail]=useState(""); const [password,setPassword]=useState(""); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError("");try{const r=await fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({email,password})});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to sign in");router.push(d.user.role==="admin"?"/admin":"/dashboard");}catch(err){setError(err instanceof Error?err.message:"Something went wrong");}finally{setLoading(false)}}
  return <main className="auth-shell"><div className="auth-brand"><Link href="/" className="brand"><Image src="/logo.jpeg" alt="Trust Chain" width={60} height={60} className="brand-logo"/><span>TRUST <b>CHAIN</b></span></Link></div><div className="auth-card"><div className="auth-title"><div className="gold-circle"><LockKeyhole/></div><h1>Welcome back</h1><p>Sign in to access your investment account.</p></div>{error&&<div className="alert error">{error}</div>}<form onSubmit={submit} className="form"><label>Email address<div className="input-wrap"><Mail/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div></label><label>Password<div className="input-wrap"><LockKeyhole/><input required type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••"/></div></label><button disabled={loading} className="btn btn-gold btn-block">{loading?<Loader2 className="spin"/>:"Sign in"}</button></form><p className="auth-foot">New to Trust Chain? <Link href="/register">Create an account</Link></p><Link href="/" className="back-link"><ArrowLeft size={15}/> Back to website</Link></div></main>
}
