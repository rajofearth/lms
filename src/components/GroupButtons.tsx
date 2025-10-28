"use client";
import React from "react";
import { ThemeSwitch } from "./ThemeSwitch";
import { useSession, signIn, signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

const GroupButtons = ({ open }: { open: boolean }) => {
  const { theme } = useTheme();
  const { data: session } = useSession();
  return (
    <div
      className={cn(
        " flex flex-col items-center justify-between gap-4",
        open && "flex-row"
      )}
    >
      {session?.user ? (
        <button onClick={() => signOut()} className="px-3 py-2 rounded bg-neutral-800">
          Sign out
        </button>
      ) : (
        <button onClick={() => signIn.email({ email: "", password: "" })} className="px-3 py-2 rounded bg-neutral-800">
          Sign in
        </button>
      )}
      <ThemeSwitch />
    </div>
  );
};

export default GroupButtons;
