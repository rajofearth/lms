"use client";
import { useSession, signOut } from "@/lib/auth-client";
import { ThemeSwitch } from "./ThemeSwitch";
import { usePathname, useRouter } from "next/navigation";
import { Input } from "./ui/input";
import { useForm } from "react-hook-form";
import { searchSchema } from "@/schema/zod-schemes";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeftSquare, LogIn, LogOut, User } from "lucide-react";
import { Button } from "./ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

const Navbar = () => {
  const path = usePathname();
  const router = useRouter();
  const { data: session, isPending } = useSession();

  const form = useForm<z.infer<typeof searchSchema>>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  useEffect(() => {
    const setSearchCourse = () => {
      const search = form.watch("search");
      if (search) {
        router.push(`/courses?search=${search}`);
      } else {
        router.push(`/courses`);
      }
    };
    if (path === "/courses") setSearchCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.watch("search")]);

  const user = session?.user;
  const visitedUser = !user;

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/");
        },
      },
    });
  };

  return (
    <>
      <div className="flex items-center">
        {path.includes("courses") ? (
          <Input
            type="text"
            className="p-2 rounded-md"
            placeholder="Search"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                router.push(`/courses?search=${form.watch("search")}`);
              }
            }}
            {...form.register("search")}
          />
        ) : path.includes("course") ? (
          !path.includes("chapter") && !path.includes("course-") ? (
            <Link href="/dashboard" className="flex gap-2 items-center">
              <ArrowLeftSquare /> <span>back</span>
            </Link>
          ) : null
        ) : null}
      </div>

      <div className="flex gap-2 items-center">
        {visitedUser || isPending ? (
          <Link href="/auth/sign-in">
            <Button className="flex gap-2 items-center" variant={"outline"}>
              <LogIn />
              {isPending ? "Loading..." : "Sign In"}
            </Button>
          </Link>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full">
                <User className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <ThemeSwitch />
      </div>
    </>
  );
};

export default Navbar;
