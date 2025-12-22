'use client'
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div>
      <button
        onClick={() => router.back()}
        className="flex items-center text-white hover:text-gray-300 transition-colors duration-300 px-4 py-2"
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        Back
      </button>
      {/* Main content for Privacy Policy page */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy – Sphere Community Portal</h1>
        <section className="prose max-w-none">
          <p>Last Updated: December 22, 2025</p>

          <p>At Sphere Community Portal (“Sphere”, “we”, “our”, “us”), your privacy is important to us. This Privacy Policy explains how we collect, use, store, and protect your information when you use our platform.</p>

          <h2>1. Information We Collect</h2>
          <p>We may collect the following information:</p>

          <h3>a) Information You Provide</h3>
          <ul>
            <li>Name, username, email address</li>
            <li>Profile details and content you post (posts, comments, messages)</li>
            <li>Information shared during workshops or live sessions</li>
          </ul>

          <h3>b) Automatically Collected Information</h3>
          <ul>
            <li>Device and browser information</li>
            <li>IP address and usage data</li>
            <li>Pages visited and interactions on the platform</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>We use your information to:</p>
          <ul>
            <li>Provide and improve Sphere’s features</li>
            <li>Manage accounts and community interactions</li>
            <li>Enable posts, comments, leaderboards, and live sessions</li>
            <li>Communicate updates, announcements, or support messages</li>
            <li>Maintain platform security and prevent misuse</li>
          </ul>

          <h2>3. Live Sessions & Recordings</h2>
          <p>Live sessions or workshops may be recorded for learning, quality, or moderation purposes. By joining a live session, you consent to such recordings.</p>

          <h2>4. Sharing of Information</h2>
          <p>We do not sell your personal data.</p>
          <p>We may share information:</p>
          <ul>
            <li>With trusted service providers (hosting, analytics, authentication)</li>
            <li>If required by law or legal process</li>
            <li>To protect Sphere, its users, or platform integrity</li>
          </ul>

          <h2>5. Cookies & Tracking</h2>
          <p>Sphere may use cookies or similar technologies to:</p>
          <ul>
            <li>Keep you logged in</li>
            <li>Improve user experience</li>
            <li>Analyze platform usage</li>
          </ul>
          <p>You can control cookies through your browser settings.</p>

          <h2>6. Data Security</h2>
          <p>We take reasonable measures to protect your information. However, no online platform can guarantee 100% security.</p>

          <h2>7. Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access or update your personal information</li>
            <li>Request deletion of your account</li>
            <li>Stop using the platform at any time</li>
          </ul>

          <h2>8. Children’s Privacy</h2>
          <p>Sphere is not intended for children under the age of 13. We do not knowingly collect data from children.</p>

          <h2>9. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Continued use of Sphere means you accept the updated policy.</p>
        </section>
      </main>
    </div>
  );
}
