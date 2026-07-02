import { NextResponse } from "next/server";
import { generateContent } from "@/lib/grok";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || !url.startsWith("http")) {
      return NextResponse.json({ error: "Invalid URL provided." }, { status: 400 });
    }

    console.log("Scraping URL:", url);

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 999) {
        return NextResponse.json({ error: "Site blocks automated scraping." }, { status: 403 });
      }
      throw new Error(`Failed to fetch URL. Status: ${response.status}`);
    }

    const html = await response.text();

    // Very basic extraction of the body text to reduce token count
    let bodyText = "";
    
    // Attempt to extract body content
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    
    let rawText = "";
    if (titleMatch && titleMatch[1]) rawText += titleMatch[1] + "\n\n";
    
    if (bodyMatch && bodyMatch[1]) {
      // Strip script and style tags
      let cleanBody = bodyMatch[1]
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ");
      
      // Strip HTML tags
      cleanBody = cleanBody.replace(/<[^>]+>/g, " ");
      
      // Collapse whitespace
      cleanBody = cleanBody.replace(/\s+/g, " ").trim();
      rawText += cleanBody;
    } else {
      // Fallback
      rawText += html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    }

    // Truncate to avoid exceeding context limits (Groq allows up to 8k-128k depending on model, we'll use first 15000 chars)
    const truncatedText = rawText.slice(0, 15000);

    const prompt = `You are an elite data extraction assistant. Extract the job posting details from the provided web page text.
CRITICAL RULE: DO NOT SUMMARIZE the Job Description. You must extract the FULL, complete job description, including all bullet points, requirements, and responsibilities exactly as they appear (just clean up weird formatting or extra spaces). Summarizing it will ruin downstream analysis.

CRITICAL JSON RULES:
1. You MUST properly escape ALL double quotes (") inside the jobDescription string using backslashes (\\").
2. Do NOT use unescaped newlines inside strings. Use \\n instead.
3. Output ONLY the raw JSON object. Do not include markdown formatting or conversational text.

Extract location and salary info ONLY if explicitly mentioned in the text. If not found, leave them empty.

Web Page Text:
${truncatedText}

Expected JSON Format:
{
  "title": "<Extracted Job Title>",
  "company": "<Extracted Company Name>",
  "jobDescription": "<The ENTIRE unsummarized job description with all bullet points>",
  "location": "<Extracted location, e.g. 'New York, NY' or 'Remote'. Leave empty if none>",
  "salaryMin": "<Number only, e.g. 120000. Leave empty if none>",
  "salaryMax": "<Number only, e.g. 150000. Leave empty if none>",
  "salaryCurrency": "<e.g. 'USD' or 'INR'. Default to USD if missing>"
}`;

    const rawGrok = await generateContent(prompt);
    
    let parsed;
    try {
      const match = rawGrok.match(/\{[\s\S]*\}/);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        parsed = JSON.parse(rawGrok.trim());
      }
    } catch (e) {
      throw new Error(`Failed to parse AI response: ${rawGrok.substring(0, 50)}...`);
    }

    return NextResponse.json(parsed);

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("Scraping error:", msg);
    return NextResponse.json({ error: "Failed to scrape job details." }, { status: 500 });
  }
}
