'use client'

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/app/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface PrivacyPolicyDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function PrivacyPolicyDialog({ open, onClose }: PrivacyPolicyDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px] bg-card border-[#27584F]/30 text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-card z-10 p-6 border-b border-[#27584F]/30">
          <DialogTitle className="flex items-center justify-between text-2xl font-bold text-foreground">
            Privacy Policy – Sphere Community Portal
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

          <h2>1. Information We Collect</h2>
          <h3>Personal Data:</h3><p> Name, email, company, contact details.</p>

          <h3>Technical Data:</h3><p> IP address, browser type, device identifiers, usage logs.</p>

          <h3>Cookies:</h3><p> We use cookies for analytics and personalization.</p>

          <h2>2. Use of Information</h2>
          <p>We use the information to:</p>
          <ul>
            <li>Provide, maintain, and improve our Services;</li>
            <li>Process transactions and communicate with you;</li>
            <li>Monitor usage trends and enhance security;</li>
            <li>Comply with legal obligations.</li>
          </ul>

          <h2>3. Legal Basis for Processing</h2>
          <p>Where applicable, we process your data on the basis of your consent, our contractual obligations, compliance with legal obligations, or legitimate interests.</p>

          <h2>4. Data Sharing</h2>
          <p>We do not sell or rent your data. We may share it with:</p>
          <ul>
            <li>Authorized service providers (under strict confidentiality);</li>
            <li>Legal or regulatory authorities, when required;</li>
            <li>Affiliates and successors in interest, in the event of a business transfer.</li>
          </ul>

          <h2>5. Data Retention</h2>
          <p>We retain your data only as long as necessary to fulfill the purposes outlined in this Policy, unless a longer retention period is required by law.</p>

          <h2>6. Security</h2>
          <p>We implement appropriate administrative, technical, and physical safeguards to protect your information against unauthorized access or disclosure.</p>

          <h2>7. Your Rights</h2>
          <p>Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict the processing of your data. Please contact us at support@neuralarc.ai.</p>

          <h2>8. International Transfers</h2>
          <p>If your data is transferred outside of India, we ensure appropriate safeguards are in place, including data processing agreements and, where applicable, standard contractual clauses.</p>

          <h2>9. Changes</h2>
          <p>We may update this Privacy Policy periodically. We encourage you to review this page regularly.</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
