import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import { User } from "@/models/User";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      // Don't leak whether the user exists or not
      return NextResponse.json({ message: "If that email exists, we sent a code." }, { status: 200 });
    }

    if (user.provider !== "credentials") {
      return NextResponse.json({ error: "Cannot reset password for Google accounts" }, { status: 400 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;
    await user.save();

    const resendApiKey = process.env.RESEND_API_KEY;
    if (resendApiKey) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${resendApiKey}`
        },
        body: JSON.stringify({
          from: 'Raptim <onboarding@resend.dev>',
          to: email,
          subject: 'Reset your Raptim Password',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your password. Here is your verification code:</p>
              <h1 style="background: #f3f4f6; padding: 12px; letter-spacing: 4px; text-align: center; border-radius: 6px; color: #7c3aed;">${otp}</h1>
              <p>This code will expire in 15 minutes.</p>
              <p>If you didn't request this, you can safely ignore this email.</p>
            </div>
          `
        })
      });
    }

    return NextResponse.json({ message: "If that email exists, we sent a code." }, { status: 200 });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
