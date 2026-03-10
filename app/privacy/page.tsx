import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Privacy Policy - MenuSafe',
  description: 'Privacy Policy for MenuSafe app',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <Link 
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Link>

      <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground mb-8">Privacy Policy</h1>
      
      <div className="prose prose-neutral dark:prose-invert max-w-none">
        <p className="text-muted-foreground">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <h2 className="text-xl font-semibold mt-8 mb-4">1. Introduction</h2>
        <p>
          MenuSafe (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our mobile application and website (collectively, the &quot;Service&quot;).
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
        
        <h3 className="text-lg font-medium mt-6 mb-3">2.1 Information You Provide</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account Information:</strong> Email address and password when you create an account</li>
          <li><strong>Dietary Preferences:</strong> Your selected dietary restrictions, allergies, and food intolerances</li>
          <li><strong>Menu Scans:</strong> Photos of restaurant menus you upload for analysis</li>
          <li><strong>Restaurant Information:</strong> Names, addresses, and locations of restaurants you save</li>
          <li><strong>Payment Information:</strong> Processed securely by Lemon Squeezy (web), Apple, or Google (mobile); we do not store payment details</li>
        </ul>

        <h3 className="text-lg font-medium mt-6 mb-3">2.2 Information Collected Automatically</h3>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Device Information:</strong> Device type, operating system, and unique device identifiers</li>
          <li><strong>Location Data:</strong> Only when you explicitly grant permission to save restaurant locations</li>
          <li><strong>Usage Data:</strong> How you interact with our Service, including features used and time spent</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide and maintain our Service</li>
          <li>To analyze menu images and identify dietary-safe options</li>
          <li>To personalize your experience based on your dietary preferences</li>
          <li>To process payments and manage subscriptions</li>
          <li>To send important service updates and notifications</li>
          <li>To improve our AI analysis accuracy</li>
          <li>To respond to customer support requests</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">4. Data Sharing and Disclosure</h2>
        <p>We do not sell your personal information. We may share your information with:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Service Providers:</strong> Third parties that help us operate our Service (e.g., cloud hosting, payment processing, AI services)</li>
          <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
          <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">5. Data Security</h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal information, including encryption, secure servers, and regular security assessments. However, no method of transmission over the Internet is 100% secure.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">6. Data Retention</h2>
        <p>
          We retain your personal information for as long as your account is active or as needed to provide you services. You can request deletion of your data at any time through your account settings or by contacting us.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">7. Your Rights</h2>
        <p>Depending on your location, you may have the right to:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Access your personal information</li>
          <li>Correct inaccurate data</li>
          <li>Delete your data</li>
          <li>Export your data in a portable format</li>
          <li>Opt-out of certain data processing</li>
          <li>Withdraw consent where processing is based on consent</li>
        </ul>

        <h2 className="text-xl font-semibold mt-8 mb-4">8. Children&apos;s Privacy</h2>
        <p>
          Our Service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">9. International Data Transfers</h2>
        <p>
          Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
        </p>

        <h2 className="text-xl font-semibold mt-8 mb-4">11. Contact Us</h2>
        <p>
          If you have questions about this Privacy Policy, please contact us at:
        </p>
        <p className="mt-2">
          <strong>Email:</strong> privacy@menusafe.app
        </p>
      </div>
    </div>
  )
}
