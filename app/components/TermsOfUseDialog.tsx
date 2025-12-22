'use client'

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface TermsOfUseDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function TermsOfUseDialog({ open, onClose }: TermsOfUseDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-card border-[#27584F]/30 text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-card z-10 p-6 border-b border-[#27584F]/30">
          <DialogTitle className="flex items-center justify-between text-2xl font-bold text-foreground">
            Terms of Use – Sphere Community Portal
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 prose dark:prose-invert max-w-none text-foreground">
          <p>Last Updated: December 22, 2025</p>

          <h2>1. Eligibility and Account Responsibility</h2>
          <p>You must be at least 18 years of age and capable of entering into a legally binding contract to access or use the Services. You are responsible for maintaining the confidentiality of your account credentials and for all activities occurring under your account.</p>

          <h2>2. License to Use Services</h2>
          <p>Subject to your compliance with these Terms, NeuralArc grants you a limited, non-exclusive, non-transferable, revocable license to access and use the Services solely for your internal business purposes. You shall not use the Services to develop competing products or reverse engineer any aspect of the platform.</p>

          <h2>3. Prohibited Conduct</h2>
          <p>You shall not:</p>
          <ul>
            <li>Use the Services in any manner that infringes any intellectual property or proprietary rights of any party;</li>
            <li>Use or access the Services to violate any applicable law or regulation;</li>
            <li>Introduce malware or harmful code, scrape data, or interfere with service functionality;</li>
            <li>Misrepresent your identity or affiliation.</li>
          </ul>

          <h2>4. Ownership and Intellectual Property</h2>
          <p>All content, trademarks, and software associated with the Services are the exclusive property of NeuralArc or its licensors. No rights are granted except as explicitly set forth herein.</p>

          <h2>5. Third-Party Integrations</h2>
          <p>The Services may contain links or integrations with third-party platforms. NeuralArc is not responsible for the content, functionality, or privacy practices of such third parties.</p>

          <h2>6. Disclaimers</h2>
          <p>The Services are provided "as is" and "as available." NeuralArc makes no warranties or representations, express or implied, regarding the Services, including but not limited to merchantability, fitness for a particular purpose, accuracy, or non-infringement.</p>

          <h2>7. Limitation of Liability</h2>
          <p>To the maximum extent permitted by applicable law, NeuralArc shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or for loss of profits or revenue, arising from or related to your use of the Services.</p>

          <h2>8. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless NeuralArc, its officers, directors, employees, and affiliates from any claim, demand, liability, or expense arising out of your breach of these Terms or violation of applicable law.</p>

          <h2>9. Governing Law and Jurisdiction</h2>
          <p>These Terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in Pune, Maharashtra.</p>

          <h2>10. Changes</h2>
          <p>We reserve the right to modify these Terms at any time. Continued use after changes constitutes acceptance of the updated Terms.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
