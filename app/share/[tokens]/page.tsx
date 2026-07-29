// app/share/[token]/page.tsx
import { notFound } from "next/navigation";

async function getSharedData(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

  const res = await fetch(`${baseUrl}/api/share/${token}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

interface SceneData {
  id: string;
  heading: string;
  content: any;
}

function extractText(content: any): { type: string; text: string }[] {
  if (!content?.root?.children) return [];
  return content.root.children
    .filter((child: any) => child.type !== "outline")
    .map((child: any) => ({
      type: child.type,
      text: child.children?.map((c: any) => c.text).join("") || "",
    }));
}

export default async function SharedScriptPage({
  params,
}: {
  params: { token: string };
}) {
  const data = await getSharedData(params.token);
  if (!data) notFound();

  const { title, scenes } = data as {
    title: string;
    scenes: SceneData[];
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-8 max-w-4xl mx-auto print:p-0">
      {/* Title page */}
      <div className="text-center my-16 print:my-8">
        <h1 className="text-4xl font-bold mb-4">
          {title || "Untitled Script"}
        </h1>
        <p className="text-sm text-muted-foreground">Shared via ScriptForge</p>
      </div>

      <hr className="mb-8 print:mb-4" />

      {/* Content */}
      {scenes.map((scene) => {
        const elements = extractText(scene.content);
        return (
          <div key={scene.id} className="mb-8">
            <h2 className="font-bold uppercase text-lg mb-4">
              {scene.heading}
            </h2>
            {elements.map((el, idx) => {
              if (el.type === "action") {
                return (
                  <p key={idx} className="mb-3 leading-relaxed">
                    {el.text}
                  </p>
                );
              }
              if (el.type === "character") {
                return (
                  <p
                    key={idx}
                    className="text-center uppercase font-bold mt-4 mb-0"
                  >
                    {el.text.toUpperCase()}
                  </p>
                );
              }
              if (el.type === "dialogue") {
                return (
                  <p key={idx} className="mx-16 mb-2">
                    {el.text}
                  </p>
                );
              }
              if (el.type === "parenthetical") {
                return (
                  <p key={idx} className="mx-20 text-sm italic mb-1">
                    ({el.text})
                  </p>
                );
              }
              if (el.type === "transition") {
                return (
                  <p
                    key={idx}
                    className="text-right uppercase text-sm mt-4 mb-2"
                  >
                    {el.text.toUpperCase()}
                  </p>
                );
              }
              return null;
            })}
          </div>
        );
      })}
    </div>
  );
}
