"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Bell, CircleDollarSign, LayoutDashboard, LogOut, Menu, Plus, Settings, TrendingUp, X, WalletCards } from "lucide-react";
export default function DashboardShell({children}:{children:React.ReactNode}){
 const [open,setOpen]=useState(false);const [user,setUser]=useState<any>(null);const [unread,setUnread]=useState(0);
 useEffect(()=>{Promise.all([fetch("/api/me"),fetch("/api/notifications")]).then(async([a,b])=>{const x=await a.json(),y=await b.json();if(x.user)setUser(x.user);setUnread((y.notifications||[]).filter((n:any)=>!n.read).length)});},[]);
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});location.href="/login"}
 return <div className="app-shell"><aside className={`sidebar ${open?"open":""}`}><div className="side-brand"><Image src="/logo.jpeg" alt="" width={46} height={46}/><span>TRUST <b>CHAIN</b></span><button onClick={()=>setOpen(false)}><X/></button></div><nav><Link href="/dashboard" onClick={()=>setOpen(false)}><LayoutDashboard/> Overview</Link><Link href="/dashboard/investments" onClick={()=>setOpen(false)}><TrendingUp/> Investments</Link><Link href="/dashboard/notifications" onClick={()=>setOpen(false)}><Bell/> Notifications {unread>0&&<em>{unread}</em>}</Link><Link href="/dashboard/settings" onClick={()=>setOpen(false)}><Settings/> Settings</Link></nav><button className="logout" onClick={logout}><LogOut/> Sign out</button></aside><div className="app-main"><header className="app-header"><button className="mobile-menu" onClick={()=>setOpen(true)}><Menu/></button><div><span className="muted">Client portal</span><h2>Good day{user?.name?`, ${user.name.split(" ")[0]}`:""}</h2></div><Link href="/dashboard/notifications" className="notification-btn"><Bell/>{unread>0&&<i/>}</Link></header>{children}</div></div>
}
