"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CheckoutCancel() {
  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-3xl font-bold">Payment canceled (placeholder)</h1>
      <p className="text-muted-foreground max-w-md">
        This page will be updated after DodoPayments integration.
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


