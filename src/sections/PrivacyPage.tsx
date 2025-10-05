"use client";

import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.5 },
  viewport: { once: true, margin: "-80px" },
};

export default function PrivacyPage() {
  return (
    <section className="bg-gradient-to-b from-[#f2ffd2] to-white py-24 overflow-x-clip">
      <div className="container">
        <div className="section-heading">
          <div className="flex justify-center">
            <div className="tag">Privacy</div>
          </div>

          <motion.h1
            className="section-title mt-5 text-center"
            {...fadeUp}
            transition={{ duration: 0.6 }}
          >
            Privacy Policy
          </motion.h1>

          <motion.p
            className="section-description mt-5 mb-10 max-w-2xl mx-auto text-center"
            {...fadeUp}
            transition={{ delay: 0.05 }}
          >
            Last updated: <span className="font-medium">October 4, 2025</span>.
            This policy explains what we collect, why we collect it, and how
            you can control your info when using <span className="font-semibold">resum8</span>.
          </motion.p>
        </div>

        <div className="relative">
          <div className="max-w-3xl mx-auto space-y-8">
            {/* What we collect */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                1) Information We Collect
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>
                  <span className="font-medium">Account & Contact</span>: name,
                  email, and settings you choose.
                </li>
                <li>
                  <span className="font-medium">Resume Content</span>: resumes,
                  job descriptions, feedback prompts, and edits you make.
                </li>
                <li>
                  <span className="font-medium">Usage Data</span>: device info,
                  pages viewed, and interactions (aggregated/analytical).
                </li>
                <li>
                  <span className="font-medium">Cookies</span>: to keep you
                  signed in and measure performance (see Cookies below).
                </li>
              </ul>
            </motion.div>

            {/* How we use it */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
              transition={{ delay: 0.05 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                2) How We Use Information
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Personalize resume suggestions and feedback.</li>
                <li>Operate, maintain, and improve our services.</li>
                <li>Provide support and communicate important updates.</li>
                <li>Detect abuse, prevent fraud, and ensure safety.</li>
                <li>Comply with legal obligations.</li>
              </ul>
            </motion.div>

            {/* Sharing */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                3) Sharing & Disclosure
              </h2>
              <p className="text-gray-700">
                We don’t sell personal information. We may share with:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-2">
                <li>
                  <span className="font-medium">Service providers</span> (e.g.,
                  hosting, analytics, email) under contracts that restrict use.
                </li>
                <li>
                  <span className="font-medium">Legal & safety</span> when
                  required by law or to protect rights and users.
                </li>
                
              </ul>
            </motion.div>

            {/* Cookies */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                4) Cookies & Tracking
              </h2>
              <p className="text-gray-700">
                Cookies help run the site, keep you signed in, remember
                preferences, and understand usage. You can control cookies in
                your browser; disabling some may affect features.
              </p>
            </motion.div>

            {/* Data retention */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
              transition={{ delay: 0.2 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                5) Data Retention
              </h2>
              <p className="text-gray-700">
                We keep personal data only as long as needed to provide the
                service and for legitimate business or legal purposes. You can
                request deletion (see Your Rights).
              </p>
            </motion.div>

            {/* Your rights */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
              transition={{ delay: 0.25 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                6) Your Rights & Choices
              </h2>
              <ul className="list-disc pl-5 space-y-2 text-gray-700">
                <li>Access, correct, or delete your information.</li>
                <li>Export your data where applicable.</li>
                <li>Opt out of non-essential emails.</li>
              </ul>
              
            </motion.div>

            {/* Security */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
              transition={{ delay: 0.3 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                7) Security
              </h2>
              <p className="text-gray-700">
              We use standard encryption and cloud security practices.
              </p>
            </motion.div>

            {/* Changes */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
              transition={{ delay: 0.35 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                8) Changes to This Policy
              </h2>
              <p className="text-gray-700">
                We’ll update this page when we make material changes and, where
                required, notify you.
              </p>
            </motion.div>

            {/* Contact */}
            <motion.div
              className="group bg-white/80 backdrop-blur-sm rounded-1xl p-8 shadow-lg border border-white/20"
              {...fadeUp}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-3">
                9) Contact
              </h2>
              <p className="text-gray-700">
                Questions? Email{" "}
                <a
                  href="mailto:privacy@resum8.app"
                  className="text-orange-600 underline"
                >
                  privacy@resum8.app
                </a>
                .
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
