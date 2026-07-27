// app/terms/page.tsx

export default function TermsOfServicePage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Effective date: August 1, 2026
      </p>

      <section className="space-y-4 text-sm">
        <p>
          ScriptForge is a non‑commercial prototype developed by a solo
          developer for the <strong>IBM AI Builders Challenge</strong>. By using
          ScriptForge (&quot;the Service&quot;), you agree to these Terms of
          Service. If you do not agree, please do not use the Service.
        </p>

        <h2 className="text-lg font-semibold">1. Nature of the Service</h2>
        <ul className="list-disc ml-6">
          <li>
            The Service is provided &quot;as‑is&quot; and
            &quot;as‑available&quot; for evaluation and demonstration purposes
            only.
          </li>
          <li>
            We make no guarantees regarding uptime, data persistence, or fitness
            for any particular purpose.
          </li>
          <li>
            We may modify or discontinue the Service at any time without prior
            notice.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">2. User Responsibilities</h2>
        <ul className="list-disc ml-6">
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials.
          </li>
          <li>
            You agree not to use the Service for any unlawful purpose or to
            create content that is defamatory, abusive, or infringes on the
            rights of others.
          </li>
          <li>
            You must not misuse the AI features to generate harmful, illegal, or
            offensive material.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">3. Intellectual Property</h2>
        <ul className="list-disc ml-6">
          <li>
            <strong>Your content:</strong> you retain all rights to the
            screenplays, text, and creative material you create using
            ScriptForge.
          </li>
          <li>
            <strong>Our rights:</strong> we do not claim ownership of your
            content. However, by submitting content to the Service, you grant us
            a limited license to store and display it solely for the purpose of
            providing the Service to you.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">4. Limitation of Liability</h2>
        <p>
          To the fullest extent permitted by applicable law, ScriptForge and its
          developer shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits or
          revenues, whether incurred directly or indirectly, or any loss of
          data, use, goodwill, or other intangible losses resulting from (a)
          your use or inability to use the Service; (b) any unauthorized access
          to or use of our servers and/or any personal information stored
          therein; (c) any interruption or cessation of transmission to or from
          the Service.
        </p>

        <h2 className="text-lg font-semibold">5. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of Malaysia. Any disputes arising out of or relating to these
          Terms shall be subject to the exclusive jurisdiction of the courts of
          Malaysia.
        </p>

        <h2 className="text-lg font-semibold">6. Changes to these Terms</h2>
        <p>
          We reserve the right to modify these Terms at any time. We will post
          the revised version on this page. Your continued use of the Service
          after any changes constitutes your acceptance of the new Terms.
        </p>

        <h2 className="text-lg font-semibold">7. Contact</h2>
        <p>
          For any questions about these Terms, please open an issue on our{" "}
          <a
            href="https://github.com/elvinny-is-coding/scriptforge"
            className="underline text-primary"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub repository
          </a>
          .
        </p>
      </section>
    </div>
  );
}
