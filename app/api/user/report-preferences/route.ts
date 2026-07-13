import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export async function PUT(req: Request) {
  try {
    const session = await auth();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = session?.user && 'id' in session.user ? (session.user as any).id : null;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { frequency } = body;

    if (!["daily", "weekly", "none"].includes(frequency)) {
      return NextResponse.json({ error: "Invalid frequency" }, { status: 400 });
    }

    await dbConnect();
    
    await User.findByIdAndUpdate(userId, {
      emailReportFrequency: frequency
    });

    return NextResponse.json({ success: true, frequency });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Update Preferences Error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
