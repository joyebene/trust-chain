import {getSession} from "@/lib/auth"; import {redirect} from "next/navigation";
export default async function AdminLayout({children}:{children:React.ReactNode}){const s=await getSession();if(!s||s.role!=="admin")redirect("/login");return children}
