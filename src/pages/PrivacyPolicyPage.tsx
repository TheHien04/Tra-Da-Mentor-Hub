// src/pages/PrivacyPolicyPage.tsx
import './LegalPage.css';

export const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Introduction</h2>
          <p>
            Welcome to Mentor Platform ("we," "our," or "us"). We are committed to protecting your
            personal information and your right to privacy. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you use our mentorship
            platform.
          </p>
        </section>

        <section>
          <h2>2. Information We Collect</h2>
          <h3>2.1 Personal Information</h3>
          <p>We collect information that you provide directly to us, including:</p>
          <ul>
            <li>Name, email address, and contact information</li>
            <li>Profile information (bio, expertise, interests)</li>
            <li>Account credentials (encrypted passwords)</li>
            <li>Payment information (processed securely through Stripe)</li>
            <li>Communication preferences</li>
          </ul>

          <h3>2.2 Usage Data</h3>
          <p>We automatically collect certain information about your device and how you interact with our platform:</p>
          <ul>
            <li>IP address, browser type, and operating system</li>
            <li>Pages visited, time spent, and clickstream data</li>
            <li>Session logs and analytics data</li>
          </ul>

          <h3>2.3 Cookies and Tracking Technologies</h3>
          <p>
            We use cookies, web beacons, and similar technologies to enhance your experience.
            You can control cookies through your browser settings. See our Cookie Policy for more details.
          </p>
        </section>

        <section>
          <h2>3. How We Use Your Information</h2>
          <p>We use your information for the following purposes:</p>
          <ul>
            <li>Providing and maintaining our mentorship services</li>
            <li>Matching mentors with mentees</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Sending notifications and updates</li>
            <li>Improving our platform through analytics</li>
            <li>Complying with legal obligations</li>
          </ul>
        </section>

        <section>
          <h2>4. Information Sharing and Disclosure</h2>
          <p>We do not sell your personal information. We may share your information with:</p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party vendors like Stripe (payments), SendGrid (emails), and Google (authentication)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
          </ul>
        </section>

        <section>
          <h2>5. Your Rights (GDPR Compliance)</h2>
          <p>If you are a resident of the European Economic Area (EEA), you have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Rectification:</strong> Correct inaccurate or incomplete data</li>
            <li><strong>Erasure:</strong> Request deletion of your personal data ("right to be forgotten")</li>
            <li><strong>Restriction:</strong> Limit how we process your data</li>
            <li><strong>Portability:</strong> Receive your data in a structured, machine-readable format</li>
            <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
            <li><strong>Withdraw Consent:</strong> Withdraw consent for data processing at any time</li>
          </ul>
          <p>
            To exercise these rights, contact us at <a href="mailto:privacy@mentor-platform.com">privacy@mentor-platform.com</a>.
          </p>
        </section>

        <section>
          <h2>6. Data Security</h2>
          <p>
            We implement industry-standard security measures to protect your information, including:
          </p>
          <ul>
            <li>Encryption of data in transit (HTTPS/TLS)</li>
            <li>Password hashing using bcrypt</li>
            <li>Secure authentication with JWT tokens</li>
            <li>Regular security audits and updates</li>
          </ul>
          <p>
            However, no method of transmission over the Internet is 100% secure. We cannot guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2>7. Data Retention</h2>
          <p>
            We retain your personal information for as long as necessary to provide our services and
            comply with legal obligations. You can request deletion of your account at any time.
          </p>
        </section>

        <section>
          <h2>8. International Data Transfers</h2>
          <p>
            Your information may be transferred to and processed in countries other than your country
            of residence. We ensure appropriate safeguards are in place for such transfers in compliance
            with GDPR and other applicable laws.
          </p>
        </section>

        <section>
          <h2>9. Children's Privacy</h2>
          <p>
            Our platform is not intended for users under 16 years of age. We do not knowingly collect
            personal information from children. If you believe we have collected information from a
            child, please contact us immediately.
          </p>
        </section>

        <section>
          <h2>10. Changes to This Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of material changes
            by posting the new policy on this page and updating the "Last Updated" date.
          </p>
        </section>

        <section>
          <h2>11. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us:</p>
          <ul>
            <li>Email: <a href="mailto:privacy@mentor-platform.com">privacy@mentor-platform.com</a></li>
            <li>Address: [Your Company Address]</li>
            <li>Data Protection Officer: <a href="mailto:dpo@mentor-platform.com">dpo@mentor-platform.com</a></li>
          </ul>
        </section>
      </div>
    </div>
  );
};
