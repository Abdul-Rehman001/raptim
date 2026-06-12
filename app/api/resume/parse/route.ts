import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
// @ts-expect-error Type mismatch workaround
import pdfParse from "pdf-parse";

// Force Node.js runtime
export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    if (!file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // pdf-parse v1.1.1 uses pdfjs-dist v2.x which runs natively in Node.js
    // — no canvas, no DOMMatrix, no workers needed.
    
    const data = await pdfParse(buffer);

    const text: string = (data.text ?? "").trim();

    if (!text) {
      return NextResponse.json(
        {
          error:
            "No text found in this PDF. It may be scanned/image-based — please paste your resume text manually.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (error) {
    console.error("PDF parse error:", error);
    return NextResponse.json(
      { error: "Failed to parse PDF. Please paste your resume text manually." },
      { status: 500 }
    );
  }
}
