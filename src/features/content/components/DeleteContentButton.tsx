"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { DuoIcon } from "@/components/ui/duo-icon";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteContentSource } from "../actions";

interface DeleteContentButtonProps {
    contentId: string;
    contentTitle?: string;
    variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
    size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
    showText?: boolean;
    redirectTo?: string;
    className?: string;
}

export function DeleteContentButton({
    contentId,
    contentTitle,
    variant = "ghost",
    size = "icon",
    showText = false,
    redirectTo,
    className,
}: DeleteContentButtonProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    const handleConfirmDelete = () => {
        startTransition(async () => {
            const result = await deleteContentSource(contentId);
            if (result.success) {
                toast.success("Content deleted successfully.");
                setOpen(false);
                if (redirectTo) {
                    router.push(redirectTo);
                } else {
                    router.refresh();
                }
            } else {
                toast.error(result.error || "Failed to delete content.");
            }
        });
    };

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>
            <AlertDialogTrigger
                render={
                    <Button
                        type="button"
                        variant={variant}
                        size={size}
                        disabled={isPending}
                        title={contentTitle ? `Delete "${contentTitle}"` : "Delete content"}
                        className={className}
                        aria-label="Delete content"
                        onClick={(e) => {
                            e.stopPropagation();
                        }}
                    >
                        {isPending ? (
                            <Spinner className="size-4 shrink-0" />
                        ) : (
                            <DuoIcon
                                name="trash"
                                className="size-4 shrink-0 text-muted-foreground group-hover:text-destructive hover:text-destructive transition-colors"
                            />
                        )}
                        {showText && (
                            <span className="ml-1.5">{isPending ? "Deleting..." : "Delete"}</span>
                        )}
                    </Button>
                }
            />
            <AlertDialogContent onClick={(e) => e.stopPropagation()}>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Content</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete {contentTitle ? <strong>&ldquo;{contentTitle}&rdquo;</strong> : "this content"}?
                        <br />
                        <br />
                        This will permanently remove it along with any generated intelligence, distribution plans, and queue items.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        variant="destructive"
                        onClick={handleConfirmDelete}
                        disabled={isPending}
                    >
                        {isPending ? <Spinner className="size-4 mr-2" /> : null}
                        {isPending ? "Deleting..." : "Delete"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

