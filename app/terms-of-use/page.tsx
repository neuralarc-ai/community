'use client'
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';

export default function TermsOfUsePage() {
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
      {/* Main content for Terms of Use page */}
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Use – Sphere Community Portal</h1>
        <section className="prose max-w-none">
          <p>Last Updated: December 22, 2025</p>

          <p>Welcome to Sphere Community Portal (“Sphere”, “we”, “our”, “us”). By accessing or using Sphere, you agree to comply with and be bound by these Terms of Use. If you do not agree, please do not use the platform.</p>

          <h2>1. Acceptance of Terms</h2>
          <p>By creating an account or using Sphere, you confirm that:</p>
          <ul>
            <li>You are at least 13 years old</li>
            <li>You agree to follow these Terms and all applicable laws</li>
            <li>You are responsible for your activity on the platform</li>
          </ul>

          <h2>2. About Sphere</h2>
          <p>Sphere is a community platform designed to:</p>
          <ul>
            <li>Share posts, ideas, and discussions</li>
            <li>Participate in workshops, live sessions, and leaderboards</li>
            <li>Engage with other members in a respectful environment</li>
          </ul>

          <h2>3. User Accounts</h2>
          <ul>
            <li>You are responsible for keeping your login credentials secure</li>
            <li>Do not share your account with others</li>
            <li>We may suspend or terminate accounts that violate these terms</li>
          </ul>

          <h2>4. Community Guidelines</h2>
          <p>When using Sphere, you agree NOT to:</p>
          <ul>
            <li>Post harmful, abusive, hateful, or illegal content</li>
            <li>Harass, threaten, or impersonate others</li>
            <li>Share spam, misleading information, or malicious links</li>
            <li>Attempt to hack, exploit, or disrupt the platform</li>
          </ul>
          <p>We reserve the right to remove content or users that violate community standards.</p>

          <h2>5. User Content</h2>
          <ul>
            <li>You retain ownership of the content you post</li>
            <li>By posting on Sphere, you grant us permission to display and distribute your content within the platform</li>
            <li>You are responsible for the accuracy and legality of your content</li>
          </ul>

          <h2>6. Live Sessions & Workshops</h2>
          <ul>
            <li>Live sessions may be recorded for quality and educational purposes</li>
            <li>Do not disrupt live events or misuse audio/video features</li>
            <li>Ending or leaving a live session does not guarantee data recovery</li>
          </ul>

          <h2>7. Leaderboards & Rewards</h2>
          <ul>
            <li>Leaderboard rankings are based on activity, engagement, or other criteria defined by Sphere</li>
            <li>Rankings may change and are not guaranteed</li>
            <li>Rewards (if any) are subject to change or removal</li>
          </ul>

          <h2>8. Platform Availability</h2>
          <ul>
            <li>Sphere is provided “as is” and “as available”</li>
            <li>We do not guarantee uninterrupted or error-free service</li>
            <li>Features may be updated, modified, or removed at any time</li>
          </ul>

          <h2>9. Privacy</h2>
          <p>Your use of Sphere is also governed by our Privacy Policy, which explains how we collect and use your data.</p>

          <h2>10. Termination</h2>
          <p>We may suspend or terminate your access if:</p>
          <ul>
            <li>You violate these Terms</li>
            <li>Your activity harms the community or platform</li>
            <li>Required by law or security reasons</li>
          </ul>
          <p>You may stop using Sphere at any time.</p>

          <h2>11. Limitation of Liability</h2>
          <p>Sphere is not responsible for:</p>
          <ul>
            <li>User-generated content</li>
            <li>Loss of data, earnings, or reputation</li>
            <li>Technical issues beyond our control</li>
          </ul>
          <p>Use the platform at your own risk.</p>

          <h2>12. Changes to Terms</h2>
          <p>We may update these Terms from time to time. Continued use of Sphere after changes means you accept the updated Terms.</p>
        </section>
      </main>
    </div>
  );
}
