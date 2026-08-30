import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0F172A] p-4 text-center">
      <div className="max-w-md space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EF4444]/20 text-[#EF4444]">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="text-xl font-bold text-[#F8FAFC]">403 Forbidden Access</h1>
        <p className="text-xs text-[#94A3B8]">
          You do not have administrative permissions to view or perform actions on this resource.
        </p>
        <div className="pt-2">
          <Link href="/">
            <Button size="sm">
              <ArrowLeft className="h-4 w-4" /> Return to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
