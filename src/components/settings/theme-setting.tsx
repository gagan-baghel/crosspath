"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const emptySubscribe = () => () => {};

export function ThemeSetting() {
  const { theme, setTheme } = useTheme();
  // Theme is only known on the client; render a placeholder during SSR.
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  if (!mounted) return <div className="h-9" />;

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm">Theme</p>
      <Tabs value={theme} onValueChange={setTheme}>
        <TabsList>
          <TabsTrigger value="light" aria-label="Light">
            <Sun className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="dark" aria-label="Dark">
            <Moon className="size-4" />
          </TabsTrigger>
          <TabsTrigger value="system" aria-label="System">
            <Monitor className="size-4" />
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  );
}
