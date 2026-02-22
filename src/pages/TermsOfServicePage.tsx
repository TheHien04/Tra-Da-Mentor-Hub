// src/pages/TermsOfServicePage.tsx
import './LegalPage.css';

export const TermsOfServicePage = () => {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="last-updated">Last Updated: {new Date().toLocaleDateString()}</p>

        <section>
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using Mentor Platform ("the Service"), you accept and agree to be bound
            by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not
            use our Service.
          </p>
        </section>

        <section>
          <h2>2. Description of Service</h2>
          <p>
            Mentor Platform is an online mentorship platform that connects mentors and mentees. We
            provide tools for scheduling, communication, progress tracking, and analytics to facilitate
            meaningful mentorship relationships.
          </p>
        </section>

        <section>
          <h2>3. User Accounts</h2>
          <h3>3.1 Registration</h3>
          <p>
            You must register for an account to use certain features of the Service. You agree to:
          </p>
          <ul>
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and promptly update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Notify us immediately of any unauthorized use of your account</li>
          </ul>

          <h3>3.2 Account Responsibilities</h3>
          <p>
            You are responsible for all activities that occur under your account. We are not liable for
            any loss or damage arising from unauthorized use of your account.
          </p>
        </section>

        <section>
          <h2>4. User Conduct</h2>
          <p>You agree NOT to:</p>
          <ul>
            <li>Use the Service for any illegal or unauthorized purpose</li>
            <li>Violate any laws in your jurisdiction</li>
            <li>Harass, abuse, or harm other users</li>
            <li>Impersonate any person or entity</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Scrape, crawl, or use automated tools to access the Service</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Attempt to gain unauthorized access to any part of the Service</li>
          </ul>
        </section>

        <section>
          <h2>5. Mentorship Relationships</h2>
          <h3>5.1 No Professional Advice</h3>
          <p>
            Our platform facilitates mentorship connections but does not provide professional advice
            (legal, medical, financial, etc.). Mentors are not licensed professionals unless explicitly
            stated. Users should seek appropriate professional advice for specific situations.
          </p>

          <h3>5.2 User Responsibility</h3>
          <p>
            Mentorship relationships occur between users. We are not responsible for the quality,
            accuracy, or outcomes of mentorship interactions. Users engage in mentorship at their own risk.
          </p>
        </section>

        <section>
          <h2>6. Subscription and Payments</h2>
          <h3>6.1 Subscription Plans</h3>
          <p>
            We offer Free, Pro, and Premium subscription plans. Paid plans are billed monthly and
            automatically renew unless cancelled.
          </p>

          <h3>6.2 Billing</h3>
          <ul>
            <li>All payments are processed securely through Stripe</li>
            <li>Prices are in USD unless otherwise stated</li>
            <li>We reserve the right to change pricing with 30 days' notice</li>
          </ul>

          <h3>6.3 Refunds</h3>
          <p>
            We offer a 14-day money-back guarantee for first-time subscribers. After 14 days, payments
            are non-refundable. You may cancel your subscription at any time to prevent future charges.
          </p>

          <h3>6.4 Cancellation</h3>
          <p>
            You can cancel your subscription through your account settings or by contacting support.
            Cancellation takes effect at the end of the current billing period.
          </p>
        </section>

        <section>
          <h2>7. Intellectual Property</h2>
          <h3>7.1 Our Content</h3>
          <p>
            The Service and its original content, features, and functionality are owned by Mentor
            Platform and are protected by international copyright, trademark, and other intellectual
            property laws.
          </p>

          <h3>7.2 User Content</h3>
          <p>
            You retain ownership of content you submit to the Service. By submitting content, you grant
            us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display
            your content for the purpose of operating the Service.
          </p>
        </section>

        <section>
          <h2>8. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice, for any reason,
            including but not limited to:
          </p>
          <ul>
            <li>Breach of these Terms</li>
            <li>Fraudulent or illegal activity</li>
            <li>Prolonged inactivity</li>
          </ul>
          <p>
            Upon termination, your right to use the Service will immediately cease. All provisions of
            these Terms that should survive termination will remain in effect.
          </p>
        </section>

        <section>
          <h2>9. Disclaimers and Limitation of Liability</h2>
          <h3>9.1 "As Is" Service</h3>
          <p>
            The Service is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, either
            express or implied, including but not limited to implied warranties of merchantability,
            fitness for a particular purpose, or non-infringement.
          </p>

          <h3>9.2 Limitation of Liability</h3>
          <p>
            To the fullest extent permitted by law, Mentor Platform shall not be liable for any indirect,
            incidental, special, consequential, or punitive damages, including loss of profits, data,
            or goodwill, arising out of or related to your use of the Service.
          </p>
        </section>

        <section>
          <h2>10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless Mentor Platform, its affiliates, and their
            respective officers, directors, employees, and agents from any claims, damages, losses,
            liabilities, and expenses arising out of:
          </p>
          <ul>
            <li>Your use of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another user</li>
          </ul>
        </section>

        <section>
          <h2>11. Dispute Resolution</h2>
          <h3>11.1 Governing Law</h3>
          <p>
            These Terms shall be governed by the laws of [Your Jurisdiction], without regard to its
            conflict of law provisions.
          </p>

          <h3>11.2 Arbitration</h3>
          <p>
            Any disputes arising from these Terms or the Service shall be resolved through binding
            arbitration in accordance with the rules of [Arbitration Organization].
          </p>
        </section>

        <section>
          <h2>12. Changes to Terms</h2>
          <p>
            We reserve the right to modify these Terms at any time. We will notify users of material
            changes via email or through the Service. Your continued use of the Service after changes
            constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2>13. Contact Us</h2>
          <p>If you have questions about these Terms, please contact us:</p>
          <ul>
            <li>Email: <a href="mailto:legal@mentor-platform.com">legal@mentor-platform.com</a></li>
            <li>Address: [Your Company Address]</li>
          </ul>
        </section>

        <section>
          <h2>14. Severability</h2>
          <p>
            If any provision of these Terms is found to be unenforceable or invalid, that provision
            shall be limited or eliminated to the minimum extent necessary, and the remaining provisions
            shall remain in full force and effect.
          </p>
        </section>

        <section>
          <h2>15. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy, constitute the entire agreement between you
            and Mentor Platform regarding the use of the Service.
          </p>
        </section>
      </div>
    </div>
  );
};
