"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutStart() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Payments coming soon</h1>
      <p className="text-muted-foreground max-w-md">
        DodoPayments integration is planned. For now, enrollment proceeds without payment.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/courses">Browse courses</Link>
        </Button>
        <Button asChild variant="secondary">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    </div>
  );
}


