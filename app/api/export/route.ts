// app/api/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { jsPDF } from "jspdf";

// Constants for page layout (in mm)
const PAGE_WIDTH = 215.9; // US Letter
const PAGE_HEIGHT = 279.4;
const MARGIN_LEFT = 25.4; // 1 inch
const MARGIN_RIGHT = 25.4;
const MARGIN_TOP = 25.4;
const MARGIN_BOTTOM = 25.4;

const USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

// Helper to add text with line wrapping and automatic page breaks
function addFormattedText(
  doc: jsPDF,
  text: string,
  y: number,
  options: {
    fontSize?: number;
    align?: "left" | "center" | "right";
    bold?: boolean;
    indent?: number; // extra left indent (mm)
    lineSpacing?: number;
  } = {},
): number {
  const {
    fontSize = 12,
    align = "left",
    bold = false,
    indent = 0,
    lineSpacing = 1.5,
  } = options;

  doc.setFont("Courier", bold ? "bold" : "normal");
  doc.setFontSize(fontSize);

  const x = MARGIN_LEFT + indent;
  const maxWidth = USABLE_WIDTH - indent;

  // Split text into lines that fit
  const lines = doc.splitTextToSize(text, maxWidth);

  for (const line of lines as string[]) {
    // Check if we need a new page
    if (y + lineSpacing * (fontSize * 0.3528) > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
    }

    doc.text(line, x, y, { align, maxWidth });
    y += lineSpacing * (fontSize * 0.3528); // convert pt to mm approx (1pt = 0.3528mm)
  }

  return y;
}

export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { projectId, format } = await req.json();

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  // Verify user owns project and fetch title
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id, title")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Fetch scenes ordered by order_index
  const { data: scenesData, error } = await supabase
    .from("scenes")
    .select("*")
    .eq("project_id", projectId)
    .order("order_index");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const scenes = (scenesData ??
    []) as Database["public"]["Tables"]["scenes"]["Row"][];

  // Handle different formats
  if (format === "pdf") {
    return generatePdf(scenes, project.title);
  } else if (format === "plaintext") {
    return generatePlainText(scenes, project.title);
  } else {
    // Default to Fountain
    return generateFountain(scenes, project.title);
  }
}

async function generatePdf(
  scenes: Database["public"]["Tables"]["scenes"]["Row"][],
  title: string,
) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  doc.setFont("Courier");

  // ----- Title page -----
  doc.setFontSize(24);
  doc.text(title || "Untitled Script", PAGE_WIDTH / 2, PAGE_HEIGHT / 2 - 20, {
    align: "center",
  });
  doc.setFontSize(12);
  const date = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.text(date, PAGE_WIDTH / 2, PAGE_HEIGHT / 2 + 20, { align: "center" });

  // Start content on new page
  doc.addPage();
  let y = MARGIN_TOP;

  // ----- Content pages -----
  for (const scene of scenes) {
    const heading = scene.heading?.trim() || "";
    const content = scene.content as any;
    const children = content?.root?.children;

    // Scene heading
    y = addFormattedText(doc, heading, y, { bold: true, fontSize: 12 });

    if (children) {
      for (const child of children) {
        const nodeType = child.type;
        if (nodeType === "outline") continue;

        const text = child.children?.map((c: any) => c.text).join("") || "";

        if (nodeType === "action") {
          y = addFormattedText(doc, text, y);
        } else if (nodeType === "character") {
          y = addFormattedText(doc, text.toUpperCase(), y, {
            align: "center",
            bold: true,
            indent: 50, // center roughly
          });
        } else if (nodeType === "dialogue") {
          y = addFormattedText(doc, text, y, { indent: 25, lineSpacing: 1.2 });
        } else if (nodeType === "parenthetical") {
          y = addFormattedText(doc, `(${text})`, y, {
            indent: 30,
            fontSize: 10,
            lineSpacing: 1,
          });
        } else if (nodeType === "transition") {
          y = addFormattedText(doc, text.toUpperCase(), y, {
            align: "right",
            bold: true,
          });
        }
      }
    }

    // Space between scenes
    y += 6; // 2 lines
  }

  // ----- Page numbers (after all content) -----
  const totalPages = doc.internal.pages.length - 1; // pages are 1-indexed
  for (let i = 2; i <= totalPages; i++) {
    // skip title page (i=1)
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(
      `Page ${i - 1}`, // content page numbers start at 1
      PAGE_WIDTH / 2,
      PAGE_HEIGHT - MARGIN_BOTTOM + 5,
      { align: "center" },
    );
  }

  // Output as ArrayBuffer and send
  const pdfOutput = doc.output("arraybuffer");
  return new NextResponse(pdfOutput, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${title || "script"}.pdf"`,
    },
  });
}

function generateFountain(
  scenes: Database["public"]["Tables"]["scenes"]["Row"][],
  title: string,
) {
  let output = "";
  for (const scene of scenes) {
    const heading = scene.heading?.trim() || "";
    output += heading + "\n";
    const content = scene.content as any;
    if (content?.root?.children) {
      for (const child of content.root.children) {
        const nodeType = child.type;
        const text = child.children?.map((c: any) => c.text).join("") || "";
        if (nodeType === "outline") continue;
        if (nodeType === "scene-heading") {
          // Already added heading
        } else if (nodeType === "action") {
          output += text + "\n";
        } else if (nodeType === "character") {
          output += "\n" + text.toUpperCase() + "\n";
        } else if (nodeType === "dialogue") {
          output += text + "\n";
        } else if (nodeType === "parenthetical") {
          output += "(" + text + ")\n";
        } else if (nodeType === "transition") {
          output += "\n" + text.toUpperCase() + "\n";
        }
      }
    }
    output += "\n\n";
  }

  return new NextResponse(output.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${title || "script"}.fountain"`,
    },
  });
}

function generatePlainText(
  scenes: Database["public"]["Tables"]["scenes"]["Row"][],
  title: string,
) {
  let output = "";
  for (const scene of scenes) {
    const content = scene.content as any;
    if (content?.root?.children) {
      for (const child of content.root.children) {
        if (child.type === "outline") continue;
        const text = child.children?.map((c: any) => c.text).join(" ") || "";
        output += text + "\n";
      }
    }
  }

  return new NextResponse(output.trim(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename="${title || "script"}.txt"`,
    },
  });
}
