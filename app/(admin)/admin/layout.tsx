import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  // Check if user is logged in and is an admin (with email fallback)
  if (!session?.user || (session.user.role !== "admin" && session.user.email !== "admin@gmail.com")) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-bg-base">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {children}
      </div>
    </div>
  );
}
