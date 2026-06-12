import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";
import cloudinary from "@/lib/cloudinary";

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { publicId } = await req.json();

    if (publicId) {
      // Try raw first (PDFs), then image
      try {
        await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
      } catch {
        await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
      }
    }

    await dbConnect();
    await User.findByIdAndUpdate(session.user.id, {
      $unset: { resumeUrl: "", resumeText: "" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete resume error:", error);
    return NextResponse.json({ error: "Failed to delete resume" }, { status: 500 });
  }
}
