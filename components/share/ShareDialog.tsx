// components/share/ShareDialog.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Copy, Trash2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

interface ShareLink {
  id: string;
  token: string;
  created_at: string;
}

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
}

export function ShareDialog({
  open,
  onOpenChange,
  projectId,
}: ShareDialogProps) {
  const [links, setLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const fetchLinks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/share?projectId=${projectId}`);
      if (res.ok) {
        const data = await res.json();
        setLinks(data.links ?? []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (open) fetchLinks();
  }, [open, fetchLinks]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        const data = await res.json();
        setLinks((prev) => [data.link, ...prev]);
        toast.success("Share link created");
      } else {
        toast.error("Failed to create link");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setGenerating(false);
    }
  };

  const handleRevoke = async (token: string) => {
    try {
      const res = await fetch(`/api/share?token=${token}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLinks((prev) => prev.filter((l) => l.token !== token));
        toast.success("Link revoked");
      } else {
        toast.error("Failed to revoke link");
      }
    } catch (err) {
      toast.error("Network error");
    }
  };

  const copyToClipboard = async (token: string) => {
    const shareUrl = `${location.origin}/shared/${token}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    } catch {
      const input = document.createElement("input");
      input.value = shareUrl;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
      toast.success("Link copied to clipboard");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Generate a read‑only link to share your screenplay. Anyone with the
            link can view it — no account required.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full"
            variant="outline"
          >
            <LinkIcon className="mr-2 h-4 w-4" />
            {generating ? "Generating..." : "Generate Share Link"}
          </Button>

          {loading && (
            <p className="text-sm text-muted-foreground text-center">
              Loading...
            </p>
          )}

          {links.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Your Share Links</p>
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center gap-2 p-2 border rounded-md"
                >
                  <Input
                    value={`${location.origin}/shared/${link.token}`}
                    readOnly
                    className="flex-1 text-xs h-8"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(link.token)}
                    title="Copy link"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRevoke(link.token)}
                    title="Revoke link"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
