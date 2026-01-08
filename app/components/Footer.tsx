import React, { useState } from "react";
import Link from "next/link";
import TermsOfUseDialog from "./TermsOfUseDialog";
import PrivacyPolicyDialog from "./PrivacyPolicyDialog";

export default function Footer() {
  const [isTermsOfUseOpen, setIsTermsOfUseOpen] = useState(false);
  const [isPrivacyPolicyOpen, setIsPrivacyPolicyOpen] = useState(false);
  return (
    <footer className=" w-full">
      <TermsOfUseDialog
        open={isTermsOfUseOpen}
        onClose={() => setIsTermsOfUseOpen(false)}
      />
      <PrivacyPolicyDialog
        open={isPrivacyPolicyOpen}
        onClose={() => setIsPrivacyPolicyOpen(false)}
      />

      {/* Footer Text Section */}
      <div className="bg-card m-2 py-6 px-4 sm:px-6 shadow rounded-lg">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 text-muted-foreground text-sm">
            {/* Left - Terms of Use and Privacy Policy */}
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => setIsTermsOfUseOpen(true)}
                className="hover:text-gray-300 transition-colors duration-300"
              >
                Terms Of Use
              </button>
              <button
                onClick={() => setIsPrivacyPolicyOpen(true)}
                className="hover:text-gray-300 transition-colors duration-300"
              >
                Privacy Policy
              </button>
            </div>

            {/* Center - Copyright */}
            <div className="text-center ">
              © 2025 Sphere Community Portal. All rights reserved.
            </div>

            {/* Right - Product by Neural Arc Inc */}
            <div className="text-right">
              Product by{" "}
              <Link
                href="https://neuralarc.ai"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-300 transition-colors duration-300"
              >
                Neural Arc Inc
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
