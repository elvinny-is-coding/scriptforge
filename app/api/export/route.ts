// app/api/export/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";
import { jsPDF } from "jspdf";

const PAGE_WIDTH = 215.9;
const PAGE_HEIGHT = 279.4;
const MARGIN_LEFT = 25.4;
const MARGIN_RIGHT = 25.4;
const MARGIN_TOP = 25.4;
const MARGIN_BOTTOM = 25.4;
const USABLE_WIDTH = PAGE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT;

function addFormattedText(
  doc: jsPDF,
  text: string,
  y: number,
  options: {
    fontSize?: number;
    align?: "left" | "center" | "right";
    bold?: boolean;
    indent?: number;
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
  const lines = doc.splitTextToSize(text, maxWidth);

  for (const line of lines as string[]) {
    if (y + lineSpacing * (fontSize * 0.3528) > PAGE_HEIGHT - MARGIN_BOTTOM) {
      doc.addPage();
      y = MARGIN_TOP;
    }
    doc.text(line, x, y, { align, maxWidth });
    y += lineSpacing * (fontSize * 0.3528);
  }
  return y;
}

// ---------- FDX helpers ----------
function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function mapNodeTypeToFdxType(lexicalType: string): string {
  switch (lexicalType) {
    case "scene-heading":
      return "Scene Heading";
    case "action":
      return "Action";
    case "character":
      return "Character";
    case "dialogue":
      return "Dialogue";
    case "parenthetical":
      return "Parenthetical";
    case "transition":
      return "Transition";
    default:
      return "Action";
  }
}

function generateFdx(
  scenes: Database["public"]["Tables"]["scenes"]["Row"][],
  title: string,
): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<FinalDraft DocumentType="Script" Template="No" Version="5">
  <Content>
`;
  for (const scene of scenes) {
    const heading = scene.heading?.trim() || "";
    const content = scene.content as any;
    const children = content?.root?.children;
    xml += `    <Paragraph Type="Scene Heading">
      <Text>${escapeXml(heading)}</Text>
    </Paragraph>
`;
    if (children) {
      for (const child of children) {
        const nodeType = child.type;
        if (nodeType === "outline") continue;
        const text = child.children?.map((c: any) => c.text).join("") || "";
        const fdxType = mapNodeTypeToFdxType(nodeType);
        xml += `    <Paragraph Type="${fdxType}">
      <Text>${escapeXml(text)}</Text>
    </Paragraph>
`;
      }
    }
  }
  xml += `  </Content>
</FinalDraft>`;
  return xml;
}

// ---------- Main export handler ----------
export async function POST(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { projectId, format } = await req.json();

  if (!projectId) {
    return NextResponse.json({ error: "Missing projectId" }, { status: 400 });
  }

  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select("id, user_id, title")
    .eq("id", projectId)
    .single();

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

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

  if (format === "fdx") {
    const fdxXml = generateFdx(scenes, project.title);
    return new NextResponse(fdxXml, {
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="${project.title || "script"}.fdx"`,
      },
    });
  } else if (format === "pdf") {
    return generatePdf(scenes, project.title);
  } else if (format === "plaintext") {
    return generatePlainText(scenes, project.title);
  } else {
    return generateFountain(scenes, project.title);
  }
}

async function generatePdf(
  scenes: Database["public"]["Tables"]["scenes"]["Row"][],
  title: string,
) {
  const doc = new jsPDF({ unit: "mm", format: "letter" });
  doc.setFont("Courier");
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
  doc.addPage();
  let y = MARGIN_TOP;

  for (const scene of scenes) {
    const heading = scene.heading?.trim() || "";
    y = addFormattedText(doc, heading, y, { bold: true, fontSize: 12 });
    const content = scene.content as any;
    if (content?.root?.children) {
      for (const child of content.root.children) {
        const nodeType = child.type;
        if (nodeType === "outline") continue;
        const text = child.children?.map((c: any) => c.text).join("") || "";
        switch (nodeType) {
          case "action":
            y = addFormattedText(doc, text, y);
            break;
          case "character":
            y = addFormattedText(doc, text.toUpperCase(), y, {
              align: "center",
              bold: true,
              indent: 50,
            });
            break;
          case "dialogue":
            y = addFormattedText(doc, text, y, {
              indent: 25,
              lineSpacing: 1.2,
            });
            break;
          case "parenthetical":
            y = addFormattedText(doc, `(${text})`, y, {
              indent: 30,
              fontSize: 10,
              lineSpacing: 1,
            });
            break;
          case "transition":
            y = addFormattedText(doc, text.toUpperCase(), y, {
              align: "right",
              bold: true,
            });
            break;
        }
      }
    }
    y += 6;
  }

  const totalPages = doc.internal.pages.length - 1;
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.text(`Page ${i - 1}`, PAGE_WIDTH / 2, PAGE_HEIGHT - MARGIN_BOTTOM + 5, {
      align: "center",
    });
  }
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
    output += (scene.heading?.trim() || "") + "\n";
    const content = scene.content as any;
    if (content?.root?.children) {
      for (const child of content.root.children) {
        const nodeType = child.type;
        if (nodeType === "outline") continue;
        const text = child.children?.map((c: any) => c.text).join("") || "";
        if (nodeType === "scene-heading") {
          /* already added */
        } else if (nodeType === "action") output += text + "\n";
        else if (nodeType === "character")
          output += "\n" + text.toUpperCase() + "\n";
        else if (nodeType === "dialogue") output += text + "\n";
        else if (nodeType === "parenthetical") output += "(" + text + ")\n";
        else if (nodeType === "transition")
          output += "\n" + text.toUpperCase() + "\n";
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
