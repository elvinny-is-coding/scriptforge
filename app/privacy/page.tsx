// app/privacy/page.tsx

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Effective date: August 1, 2026
      </p>

      <section className="space-y-4 text-sm">
        <p>
          ScriptForge is a non‑commercial prototype built by a solo developer
          for the <strong>IBM AI Builders Challenge</strong>. This privacy
          policy explains what information we collect and how we use it, in
          accordance with the principles of Malaysia&#39;s{" "}
          <strong>Personal Data Protection Act 2010 (PDPA)</strong>. Because
          this is a competition entry and not a commercial service, our data
          processing is minimal and strictly limited to the purposes described
          below.
        </p>

        <h2 className="text-lg font-semibold">1. Information we collect</h2>
        <ul className="list-disc ml-6">
          <li>
            <strong>Authentication data</strong>: when you sign in with a magic
            link we store your email address. When you sign in with Google we
            store the name and email address provided by your Google account.
          </li>
          <li>
            <strong>User‑generated content</strong>: screenplays, scene notes,
            AI chat history, and character color choices that you create while
            using the editor.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">2. How we use your data</h2>
        <ul className="list-disc ml-6">
          <li>
            <strong>Authentication</strong> – to identify you and keep you
            signed in.
          </li>
          <li>
            <strong>Providing the service</strong> – storing your scripts and AI
            conversations so you can continue writing across sessions.
          </li>
          <li>
            We <strong>do not</strong> use your data for marketing, profiling,
            automated decision‑making, or any purpose beyond delivering the core
            functionality of ScriptForge.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">3. Data sharing</h2>
        <ul className="list-disc ml-6">
          <li>
            We use <strong>Supabase</strong> for database, authentication, and
            storage. Your data resides on Supabase&#39;s infrastructure.
          </li>
          <li>
            We use <strong>Groq</strong> and{" "}
            <strong>Cloudflare Workers AI</strong>
            to process AI queries. Prompts are transmitted to these services but
            are not stored by them for model training.
          </li>
          <li>
            We do not sell, rent, or trade your personal information to any
            third party.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">4. Data retention</h2>
        <p>
          Your data is retained for as long as your account exists. You can
          request deletion of your account and all associated data by contacting
          us (see below). Because this is a temporary prototype, we may delete
          all data after the competition ends without prior notice.
        </p>

        <h2 className="text-lg font-semibold">5. Your rights</h2>
        <ul className="list-disc ml-6">
          <li>
            <strong>Access & correction</strong> – you can view and edit your
            scripts directly in the app. For personal data changes, contact us.
          </li>
          <li>
            <strong>Withdrawal of consent</strong> – you can stop using
            ScriptForge at any time. To delete your data, contact us.
          </li>
          <li>
            <strong>Right to be informed</strong> – this policy explains how
            your data is handled. If anything changes, we will update it.
          </li>
        </ul>

        <h2 className="text-lg font-semibold">6. Security</h2>
        <p>
          We rely on Supabase&#39;s built‑in security measures (Row‑Level
          Security, SSL encryption). However, as a prototype, we cannot
          guarantee absolute security. Please do not store sensitive or real
          personal information in your scripts.
        </p>

        <h2 className="text-lg font-semibold">7. Contact</h2>
        <p>
          For any questions about this privacy policy or to request data
          deletion, please open an issue on our{" "}
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
