import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/">
            <a className="text-xl font-bold text-primary">DriveLearn Academy</a>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Welcome, {user.fullName} ({user.role})
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              Logout
            </Button>
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
