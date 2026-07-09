import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Raptim",
  description: "Terms of Service for Raptim AI Job Tracker",
};

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary py-20 px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-text-tertiary hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Terms of Service</h1>
        
        <div className="prose prose-invert prose-purple max-w-none text-text-secondary">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing or using Raptim, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, then you may not access the service.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. Description of Service</h2>
          <p className="mb-4">
            Raptim provides an AI-powered job application tracking system, resume analysis, and career coaching tools. The Service is provided &quot;as is&quot; and &quot;as available&quot;.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. User Accounts</h2>
          <p className="mb-4">
            You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Contact Information</h2>
          <p className="mb-4">
            For any questions regarding these Terms, please contact us at:
            <br />
            <strong>Email:</strong> abdul.rehman.tahir7377@gmail.com
            <br />
            <strong>Address:</strong> Lucknow, India
            <br />
            <strong>Phone:</strong> +91 76199 31243
          </p>
        </div>
      </div>
    </div>
  );
}
