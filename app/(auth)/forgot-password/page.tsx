import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password - Raptim",
  description: "Reset your Raptim account password.",
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
