"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { PenSquare } from "lucide-react";
import { NAV_ITEMS, SIDEBAR_EXTRA } from "@/components/shell/nav-items";
import { Brand } from "@/components/shell/brand";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCreatePost } from "@/stores/create-post";

export function Sidebar({
  username,
  avatarUrl,
}: {
  username: string;
  avatarUrl: string;
}) {
  const pathname = usePathname();
  const openCreatePost = useCreatePost((s) => s.open);

  return (
    <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-2 border-r px-3 py-5 md:flex lg:w-64">
      <Brand href="/feed" className="mb-4 px-1" />

      {[...NAV_ITEMS, ...SIDEBAR_EXTRA].map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        );
      })}

      <Button className="mt-4 rounded-xl" onClick={openCreatePost}>
        <PenSquare className="size-4" />
        Share
      </Button>

      <div className="mt-auto flex items-center gap-2 rounded-xl px-2 py-2">
        <Image
          src={avatarUrl}
          alt=""
          width={32}
          height={32}
          unoptimized
          className="rounded-full"
        />
        <span className="truncate text-sm font-medium">{username}</span>
      </div>
    </aside>
  );
}
