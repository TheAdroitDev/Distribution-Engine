"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DuoIcon } from "@/components/ui/duo-icon";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { deleteAccount } from "../actions";
import { signOut } from "@/lib/auth/auth-client";

export function DeleteAccountSection() {
  const [open, setOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteAccount();
      if (res.success) {
        toast.success("Account deleted successfully.");
        await signOut();
        window.location.href = "/login";
      } else {
        toast.error(res.error || "Failed to delete account.");
        setIsDeleting(false);
      }
    } catch {
      toast.error("An unexpected error occurred while deleting your account.");
      setIsDeleting(false);
    }
  };

  return (
    <div className="pt-8 border-t space-y-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight text-destructive">
          Danger Zone
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Irreversible actions related to your account and personal data.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-destructive/30 bg-destructive/5 dark:bg-destructive/10">
        <div className="space-y-1 max-w-md">
          <div className="font-semibold text-base text-foreground">
            Delete Account
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Permanently remove your account and all associated content, strategies, queue items, and settings. This cannot be undone.
          </p>
        </div>

        <Button
          type="button"
          variant="destructive"
          onClick={() => setOpen(true)}
          className="gap-2 shrink-0 self-start sm:self-center font-semibold cursor-pointer shadow-xs"
        >
          <DuoIcon name="trash" className="size-4 shrink-0" />
          <span>Delete Account</span>
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent
          showCloseButton={!isDeleting}
          className="sm:max-w-md p-6 gap-5 border border-border/80 bg-background shadow-2xl"
        >
          <DialogHeader className="space-y-2.5 text-left">
            <div className="flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive border border-destructive/20 shadow-2xs">
              <DuoIcon name="trash" className="size-6" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                Delete Account
              </DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground mt-1 leading-relaxed">
                Are you sure you want to delete your account? All your content sources, intelligence, distribution plans, strategies, queue items, and preferences will be permanently wiped from the database.
              </DialogDescription>
            </div>
          </DialogHeader>

          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive font-medium leading-relaxed">
            Warning: This action is immediate and completely irreversible. You will be logged out and cannot recover this data.
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2 border-t border-border/60">
            <Button
              variant="outline"
              type="button"
              onClick={() => setOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="gap-2 font-semibold cursor-pointer"
            >
              {isDeleting ? <Spinner className="size-4" /> : <DuoIcon name="trash" className="size-4" />}
              <span>{isDeleting ? "Deleting Account..." : "Confirm & Delete"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
