"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reportUser } from "@/actions/safety";
import { REPORT_CATEGORIES } from "@/schemas/report";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function ReportDialog({
  reportedId,
  username,
  chatId,
  postId,
  open,
  onClose,
  onBlocked,
}: {
  reportedId: string;
  username: string;
  chatId?: string;
  postId?: string;
  open: boolean;
  onClose: () => void;
  onBlocked?: () => void;
}) {
  const [category, setCategory] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!category) return;
    setSubmitting(true);
    const result = await reportUser({
      reportedId,
      chatId,
      postId,
      category,
      details: details || undefined,
      alsoBlock,
    });
    setSubmitting(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Report received. Thank you for keeping Relate safe.");
    onClose();
    if (alsoBlock) onBlocked?.();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Report {username}</DialogTitle>
          <DialogDescription>
            Reports are confidential — {username} won&apos;t know it came from you.
          </DialogDescription>
        </DialogHeader>

        <RadioGroup value={category ?? ""} onValueChange={setCategory} className="gap-2.5">
          {REPORT_CATEGORIES.map((c) => (
            <div key={c.value} className="flex items-center gap-2">
              <RadioGroupItem value={c.value} id={`report-${c.value}`} />
              <Label htmlFor={`report-${c.value}`} className="font-normal">
                {c.label}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <Textarea
          value={details}
          maxLength={300}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Details (optional)"
          rows={2}
        />

        <div className="flex items-center gap-2">
          <Checkbox
            id="also-block"
            checked={alsoBlock}
            onCheckedChange={(v) => setAlsoBlock(v === true)}
          />
          <Label htmlFor="also-block" className="font-normal">
            Also block this user
          </Label>
        </div>

        <DialogFooter>
          <Button onClick={onSubmit} disabled={!category || submitting}>
            {submitting && <Loader2 className="size-4 animate-spin" />}
            Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
