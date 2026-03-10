import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Terms of Service - MenuSafe',
  description: 'Terms of Service for MenuSafe app',
}

export default function TermsOfServicePage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link 
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mb-8">Terms of Service</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
        <p>
          By accessing or using MenuSafe (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not use the Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Description of Service</h2>
        <p>
          MenuSafe is an AI-powered application that analyzes restaurant menu images to identify dishes that may be suitable for users with specific dietary restrictions, allergies, or food intolerances. The Service provides informational guidance only.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. Important Health Disclaimer</h2>
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4 my-4">
          <p className="font-semibold text-amber-800 dark:text-amber-200">
            MENUASFE IS NOT A SUBSTITUTE FOR PROFESSIONAL MEDICAL ADVICE
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-3 text-amber-700 dark:text-amber-300">
            <li>Our AI analysis is assistive technology and may not be 100% accurate</li>
            <li>Always confirm ingredients with restaurant staff before ordering</li>
            <li>Cross-contamination risks cannot be detected from menu images</li>
            <li>For severe allergies or medical conditions, consult healthcare professionals</li>
            <li>We are not responsible for allergic reactions or adverse health effects</li>
          </ul>
        </div>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. User Accounts</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>You must be at least 13 years old to use the Service</li>
          <li>You are responsible for maintaining the security of your account</li>
          <li>You must provide accurate and complete information</li>
          <li>You may not share your account with others</li>
          <li>You are responsible for all activities under your account</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Subscription and Payments</h2>
        <h3 className="text-lg font-medium mt-6 mb-3">5.1 Free Tier</h3>
        <p>The free tier includes limited menu scans per month. Features and limits may change.</p>
        
        <h3 className="text-lg font-medium mt-6 mb-3">5.2 Paid Subscriptions</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li>Pro subscription costs €2.90 per month</li>
          <li>Web payments are processed securely through Lemon Squeezy (merchant of record)</li>
          <li>iOS payments are processed through Apple App Store</li>
          <li>Android payments are processed through Google Play Store</li>
          <li>Subscriptions auto-renew unless cancelled before the renewal date</li>
          <li>You can cancel anytime through your payment provider</li>
          <li>No refunds for partial subscription periods</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">5.3 Cancellation</h3>
        <p>You may cancel your subscription at any time. Access continues until the end of the current billing period.</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Use the Service for any unlawful purpose</li>
          <li>Upload malicious content or attempt to compromise security</li>
          <li>Reverse engineer or attempt to extract source code</li>
          <li>Use automated systems to access the Service without permission</li>
          <li>Resell or redistribute the Service without authorization</li>
          <li>Harass, abuse, or harm other users</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Intellectual Property</h2>
        <p>
          The Service, including its design, features, and content, is owned by MenuSafe and protected by intellectual property laws. You retain ownership of content you upload but grant us a license to use it for providing the Service.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">8. Limitation of Liability</h2>
        <p>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, MENUSAFE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Health issues or allergic reactions resulting from reliance on the Service</li>
          <li>Loss of data or business interruption</li>
          <li>Inaccuracies in AI analysis or menu interpretation</li>
        </ul>
        <p className="mt-4">
          Our total liability shall not exceed the amount paid by you for the Service in the 12 months preceding the claim.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">9. Indemnification</h2>
        <p>
          You agree to indemnify and hold harmless MenuSafe and its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the Service or violation of these Terms.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">10. Termination</h2>
        <p>
          We may terminate or suspend your account at any time for violations of these Terms. Upon termination, your right to use the Service ceases immediately. Provisions that should survive termination will remain in effect.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">11. Changes to Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will notify you of material changes via email or in-app notification. Continued use after changes constitutes acceptance.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">12. Governing Law</h2>
        <p>
          These Terms are governed by the laws of Austria and the European Union. For EU consumers, mandatory consumer protection laws of your country of residence apply.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">13. Dispute Resolution</h2>
        <p>
          For EU consumers: You may use the EU Online Dispute Resolution platform at https://ec.europa.eu/consumers/odr. We commit to seeking amicable resolution before any legal proceedings.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">14. Contact Us</h2>
        <p>
          If you have questions about these Terms, please contact us at:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> legal@menusafe.app
        </p>
      </div>
    </div>
  )
}
