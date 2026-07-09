import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Raptim",
  description: "Privacy Policy for Raptim AI Job Tracker",
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-bg-base text-text-primary py-20 px-6 lg:px-16">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-text-tertiary hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-8 tracking-tight">Privacy Policy</h1>
        
        <div className="prose prose-invert prose-purple max-w-none text-text-secondary">
          <p>Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          
          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information you provide directly to us, such as when you create or modify your account, upload a resume, input job application data, request customer support, or otherwise communicate with us.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve our services, including using Artificial Intelligence to analyze your resume and draft outreach messages. Your resume data is only used for your specific account features.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">3. Data Security</h2>
          <p className="mb-4">
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
          </p>

          <h2 className="text-2xl font-semibold text-white mt-8 mb-4">4. Contact Us</h2>
          <p className="mb-4">
            If you have any questions about this Privacy Policy, please contact us at:
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
