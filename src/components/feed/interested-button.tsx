"use client";

import { useState } from "react";
import { HeartHandshake, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { toggleInterest } from "@/actions/interests";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function InterestedButton({
  postId,
  initialInterested,
}: {
  postId: string;
  initialInterested: boolean;
}) {
  const [interested, setInterested] = useState(initialInterested);
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  async function toggle() {
    // Optimistic flip; revert on failure.
    const next = !interested;
    setInterested(next);
    setPending(true);
    const result = await toggleInterest(postId);
    setPending(false);
    if (!result.success) {
      setInterested(!next);
      toast.error(result.error);
      return;
    }
    if (next) {
      toast.success("The author will see you're interested");
    }
  }

  function onClick() {
    if (interested) {
      setConfirmOpen(true); // withdrawing needs a confirm
    } else {
      toggle();
    }
  }

  return (
    <>
      <Button
        variant={interested ? "default" : "outline"}
        size="sm"
        disabled={pending}
        onClick={onClick}
        className={cn("rounded-full transition-all", interested && "shadow-sm")}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <HeartHandshake className="size-4" />
        )}
        {interested ? "Interested ✓" : "Interested"}
      </Button>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Withdraw your interest?</AlertDialogTitle>
            <AlertDialogDescription>
              The author will no longer see you in their interested list.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setConfirmOpen(false);
                toggle();
              }}
            >
              Withdraw
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
