import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      console.error("No file received");
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const isPdf = file.name.toLowerCase().endsWith(".pdf");

    // Upload to Cloudinary
    // PDFs must use resource_type "raw" — "auto" defaults them to "image"
    // which produces /image/upload/ URLs that browsers refuse to display as PDF.
    const uploadResult = await new Promise<{secure_url: string; public_id: string}>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { resource_type: isPdf ? "raw" : "auto", folder: "raptim_resumes" },
        (error, result) => {
           if (error) reject(error);
           else resolve(result as {secure_url: string; public_id: string});
        }
      ).end(buffer);
    });

    // Update User profile
    await dbConnect();
    const user = await User.findById(session.user?.id as string);
    if (user) {
       user.resumeUrl = uploadResult.secure_url;
       // We would ideally process text extraction here or via a webhook
       // For now, we just save the URL
       await user.save();
    }

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
