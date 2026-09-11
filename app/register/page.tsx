"use client";
import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Loader2, LockKeyhole, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Register() {
  const router=useRouter(); const [form,setForm]=useState({name:"",email:"",password:"",phone:""}); const [loading,setLoading]=useState(false); const [error,setError]=useState("");
  async function submit(e:FormEvent){e.preventDefault();setLoading(true);setError("");try{const r=await fetch("/api/auth/register",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)});const d=await r.json();if(!r.ok)throw new Error(d.error||"Unable to register");router.push("/dashboard");}catch(err){setError(err instanceof Error?err.message:"Something went wrong")}finally{setLoading(false)}}
  return <main className="auth-shell"><div className="auth-brand"><Link href="/" className="brand"><Image src="/logo.jpeg" alt="Trust Chain" width={60} height={60} className="brand-logo"/><span>TRUST <b>CHAIN</b></span></Link></div><div className="auth-card wide"><div className="auth-title"><div className="gold-circle"><User/></div><h1>Create your account</h1><p>Join Trust Chain and manage your investment journey.</p></div>{error&&<div className="alert error">{error}</div>}
  
  <p className="auth-foot">Already have an account? <Link href="/login">Sign in</Link></p><Link href="/" className="back-link"><ArrowLeft size={15}/> Back to website</Link></div></main>
}
