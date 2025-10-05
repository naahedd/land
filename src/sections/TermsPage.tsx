"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
  viewport: { once: true, margin: "-80px" },
};

export default function TermsPage() {
  return (
    <section className="pt-24 pb-24 bg-gradient-to-b from-white to-[#fff8ef] overflow-x-clip">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag">Terms</div>
          </div>

          <motion.h1
            className="section-title mt-5 text-center"
            {...fadeUp}
            transition={{ duration: 0.6 }}
          >
            Terms of Service
          </motion.h1>

          <motion.p
            className="section-description mt-5 mb-10 max-w-2xl mx-auto text-center"
            {...fadeUp}
            transition={{ delay: 0.05 }}
          >
            Last updated: <span className="font-medium">October 4, 2025</span>.
            By using <span className="font-semibold">resum8</span>, you agree to
            these terms.
          </motion.p>
        </div>

        <div className="max-w-3xl mx-auto space-y-8">
          {/* Acceptance */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              1) Acceptance of Terms
            </h2>
            <p className="text-gray-700">
              These Terms form a binding agreement between you and resum8.
            </p>
          </motion.div>

          {/* Eligibility & Accounts */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.05 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              2) Eligibility & Accounts
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Accounts are created through Google Sign-In only.</li>
            </ul>
          </motion.div>

          {/* Use of Service */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              3) Use of the Service
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Don’t misuse the service, attempt to break security, or violate laws.</li>
              <li>You’re responsible for content you upload (e.g., resumes, job posts).</li>
              <li>
                AI outputs may be inaccurate or incomplete; always review before use.
              </li>
            </ul>
          </motion.div>

          {/* Payments (if any) */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              4) Plans & Billing
            </h2>
            <p className="text-gray-700">
              If you purchase a paid plan, you authorize resum8 (and our
              payment processor) to charge your payment method. Fees are
              non-refundable except where required by law or stated otherwise.
            </p>
          </motion.div>

          {/* IP */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.2 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              5) Intellectual Property
            </h2>
            <p className="text-gray-700">
              The resum8 platform, branding, and content are owned by us or our
              licensors. You retain rights to your uploads. You grant us a
              limited license to process your content for providing the service.
            </p>
          </motion.div>

          {/* Termination */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.25 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              6) Termination
            </h2>
            <p className="text-gray-700">
              We may suspend or terminate accounts that violate these Terms or
              for security/legal reasons. You can stop using the service at any
              time; some provisions survive termination.
            </p>
          </motion.div>

          {/* Disclaimers */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              7) Disclaimers
            </h2>
            <p className="text-gray-700">
              The service is provided “as is” without warranties of any kind.
              AI suggestions are for informational purposes only and do not
              guarantee interview results or job offers.
            </p>
          </motion.div>

          {/* Liability */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.35 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              8) Limitation of Liability
            </h2>
            <p className="text-gray-700">
              To the maximum extent permitted by law, resum8 and its affiliates
              are not liable for indirect, incidental, or consequential damages.
            </p>
          </motion.div>

          {/* Governing law */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              9) Governing Law
            </h2>
            <p className="text-gray-700">
              These Terms are governed by the laws of{" "}
              <span className="italic">IL, USA</span>, excluding
              its conflict of law rules.
            </p>
          </motion.div>

          {/* Changes */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.45 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              10) Changes to Terms
            </h2>
            <p className="text-gray-700">
              We may update these Terms. If changes are material, we’ll provide
              notice as required. Continued use means you accept the new Terms.
            </p>
          </motion.div>

          {/* Contact */}
          <motion.div
            className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
            {...fadeUp}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-3">
              11) Contact
            </h2>
            <p className="text-gray-700">
              Questions about these Terms? Email{" "}
              <a
                href="mailto:legal@resum8.app"
                className="text-orange-600 underline"
              >
                legal@resum8.app
              </a>
              .
            </p>
          </motion.div>

          {/* Friendly note */}
          <motion.p
            className="text-sm text-gray-500 text-center pt-2"
            {...fadeUp}
            transition={{ delay: 0.55 }}
          >
            This is a simple, non-jurisdiction-specific template and not legal advice.
          </motion.p>
        </div>
      </div>
    </section>
  );
}
