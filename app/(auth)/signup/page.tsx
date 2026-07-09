import { SignupForm } from "@/components/auth/SignupForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - Raptim",
  description: "Create your account.",
};

export default function SignupPage() {
  return <SignupForm />;
}
