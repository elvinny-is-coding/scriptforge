// components/sidebar/DoctorTab.tsx
"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { useGroq } from "@/hooks/useGroq";
import { Stethoscope } from "lucide-react";
import { useEffect } from "react";
import type { Json } from "@/types/supabase";

interface DoctorTabProps {
  projectId: string;
  doctorReport: any;
  setDoctorReport: (report: any) => void;
}

export function DoctorTab({
  projectId,
  doctorReport,
  setDoctorReport,
}: DoctorTabProps) {
  const { output, isLoading, submit, abort } = useGroq({ agent: "doctor" });

  useEffect(() => {
    if (!isLoading && output) {
      try {
        const cleaned = output.replace(/```json\n?|\n?```/g, "").trim();
        const parsed = JSON.parse(cleaned);
        setDoctorReport(parsed as Json);
      } catch {
        setDoctorReport({ raw: output } as Json);
      }
    }
  }, [isLoading, output, setDoctorReport]);

  const runDoctor = async () => {
    const res = await fetch(`/api/supabase/scenes?projectId=${projectId}`);
    const scenes = await res.json();
    const fullScript = scenes
      .map(
        (s: any) =>
          s.heading +
          "\n" +
          (s.content?.root?.children
            ?.map((c: any) => c.children?.map((t: any) => t.text).join(" "))
            .join("\n") ?? ""),
      )
      .join("\n\n");

    submit({
      messages: [{ role: "user", content: fullScript || "No script content" }],
      context: {},
    });
  };

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="p-4 border-b">
        <Button onClick={runDoctor} disabled={isLoading} className="w-full">
          <Stethoscope className="mr-2 h-4 w-4" />
          Run Narrative Doctor
        </Button>
        {isLoading && (
          <div className="flex justify-center mt-4">
            <LoadingSpinner />
          </div>
        )}
      </div>
      <ScrollArea className="flex-1 p-4">
        {doctorReport && !doctorReport.raw && (
          <div className="space-y-4">
            <div className="bg-muted p-3 rounded-md text-sm">
              <strong>Summary:</strong> {doctorReport.summary}
            </div>
            {doctorReport.issues?.map((issue: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-md p-3 space-y-1 text-sm"
              >
                <div className="flex gap-2 items-center">
                  <span className="font-medium capitalize">{issue.type}</span>
                  <span className="text-xs text-muted-foreground">
                    {issue.location}
                  </span>
                </div>
                <p>{issue.description}</p>
                <p className="text-green-600">Fix: {issue.suggestion}</p>
              </div>
            ))}
          </div>
        )}
        {doctorReport?.raw && (
          <div className="bg-muted p-3 rounded-md text-sm whitespace-pre-wrap">
            {doctorReport.raw}
          </div>
        )}
        {!doctorReport && !isLoading && (
          <p className="text-sm text-muted-foreground text-center mt-8">
            Run the Narrative Doctor to analyze your full script.
          </p>
        )}
      </ScrollArea>
    </div>
  );
}
