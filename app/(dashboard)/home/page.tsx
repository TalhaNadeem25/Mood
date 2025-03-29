import { auth, currentUser } from "@clerk/nextjs/server";
import DashboardContent from "@/components/dashboard/DashboardContent";

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();
  const fullName = user ? `${user.firstName} ${user.lastName}` : "Guest";
  
  return <DashboardContent fullName={fullName} />;
} 