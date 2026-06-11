import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const prompt = `
You are an expert ATS resume parser. Extract the following raw resume text into a structured JSON object.

Raw Resume Text:
"""
${text}
"""

IMPORTANT: Extract ALL sections from the resume. Pay special attention to:
- Skills should be grouped by category (Frontend, Backend, Tools, etc.)
- Projects should include name, tech stack, description with metrics
- Education should include coursework if listed
- Include certifications if present

Return EXACTLY this JSON schema with no other text:
{
  "basics": {
    "name": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "location": "City, State/Country",
    "title": "Job Title / Role",
    "links": ["Portfolio URL", "GitHub URL", "LinkedIn URL"],
    "objective": "The objective or professional summary paragraph"
  },
  "skills": {
    "Frontend": "React.js, Next.js, etc.",
    "Backend": "Node.js, Express.js, etc.",
    "Tools & Deployment": "Git, GitHub, etc."
  },
  "work": [
    {
      "company": "Company Name",
      "position": "Job Title",
      "startDate": "Month Year",
      "endDate": "Month Year or Present",
      "bullets": ["Achievement bullet 1", "Achievement bullet 2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "tech": "Next.js, Tailwind CSS, MongoDB",
      "link": "Live Link URL or null",
      "description": "One or two line description with metrics"
    }
  ],
  "education": [
    {
      "degree": "B.Tech in Computer Science",
      "institution": "University Name",
      "cgpa": "8.25",
      "startDate": "2020",
      "endDate": "2024",
      "coursework": "Data Structures, Algorithms, etc."
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "year": "2024"
    }
  ]
}

Rules:
- For "skills", group them by category as they appear in the resume. Use the exact category names from the resume.
- For "projects", combine the description lines into a single "description" string. Include metrics like percentages.
- If a section doesn't exist in the resume, return an empty array [] or empty object {}.
- Output MUST be valid JSON only.
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const jsonString = completion.choices[0]?.message?.content || "{}";
    const resumeJson = JSON.parse(jsonString);

    console.log("Structurize: parsed sections:", Object.keys(resumeJson));

    await dbConnect();
    const userId = session.user.id as string;

    // Use native MongoDB driver to bypass Mongoose model cache
    const db = mongoose.connection.db;
    const result = await db!.collection("users").updateOne(
      { _id: new mongoose.Types.ObjectId(userId) },
      { $set: { resumeJson } }
    );
    console.log("Structurize: save result:", JSON.stringify(result));

    return NextResponse.json({ success: true, resumeJson });
  } catch (error) {
    console.error("Structurize Error:", error);
    return NextResponse.json({ error: "Failed to structurize resume" }, { status: 500 });
  }
}
