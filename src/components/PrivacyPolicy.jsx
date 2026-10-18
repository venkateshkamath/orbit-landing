import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './PrivacyPolicy.css';

const policySections = [
  {
    "title": "1. Introduction",
    "content": [
      "Orbit (“Orbit”, “we”, “us” or “our”) is a social activity discovery and gathering platform operated by Gravitate India Private Limited, India.",
      "Orbit enables users to discover and create social activities called catchups, request to join activities, participate in real-world experiences, communicate with other participants and build connections through shared interests.",
      "This Privacy Policy explains how we collect, use, store, disclose and protect personal information when you access or use the Orbit mobile application and related services.",
      "We are committed to handling personal information transparently and responsibly. This Policy describes our data practices and the choices available to you.",
      "By using Orbit, you acknowledge that you have been provided access to this Privacy Policy. Where consent is required for a particular type of processing, we will seek that consent separately through an appropriate mechanism. Reading or accepting this Policy does not, by itself, replace any consent required by applicable law.",
      "This Policy applies to the Orbit mobile application and related services operated by Gravitate India Private Limited. It does not govern third-party websites, applications or services that operate independently of Orbit."
    ]
  },
  {
    "title": "2. Information We Collect",
    "content": [],
    "items": [
      {
        "heading": "2.1 Information You Provide",
        "content": [
          "Account information: We collect your email address and information required to create, authenticate and manage your account. Orbit currently uses email and a one-time password (OTP) for authentication.",
          "Profile information: Depending on the fields you complete, we may collect your name, username, phone number, city, date of birth, gender, profile photograph, interests and biography.",
          "Catchup information: When you create, discover, request to join or participate in a catchup, we process relevant information such as activity details, date and time, meeting location, host information, join requests, approvals, cancellations and participation status.",
          "Ratings and social interactions: We process ratings, feedback and other social signals submitted or generated through supported Orbit features.",
          "Messages: When you use a catchup's chat feature, we process messages and associated information necessary to provide and maintain the conversation.",
          "Communications and reports: If you contact us, submit feedback, report a user or raise a safety concern, we collect the information you provide and information reasonably necessary to review and respond to your request."
        ]
      },
      {
        "heading": "2.2 Information Collected Automatically",
        "content": [
          "When you use Orbit, we may collect or generate the following information, depending on the app's implementation and configuration:",
          "• Device information, such as device model, operating system and app version.",
          "• Technical identifiers and network information, such as IP address and device or installation identifiers, where available.",
          "• Usage information, including app interactions, feature usage, timestamps and notification interactions.",
          "• Diagnostic information, including server error logs and performance data.",
          "• Location information, as described in Section 3.",
          "Orbit does not currently use third-party crash-reporting or analytics SDKs. Server logs are retained for up to 30 days.",
          "The specific information collected may depend on the technical services and configurations used to operate Orbit."
        ]
      },
      {
        "heading": "2.3 Information Received Through Other Users",
        "content": [
          "We may receive information associated with interactions other users have with you on Orbit. This may include catchup invitations, join approvals, attendance records, ratings, reports and messages involving your account.",
          "Orbit does not access your device's address book or contacts for contact discovery."
        ]
      }
    ]
  },
  {
    "title": "3. Location Information",
    "content": [
      "Location is relevant to Orbit's discovery and real-world gathering features. Depending on the feature, your device settings and the permissions you grant, Orbit may process approximate or precise location information."
    ],
    "items": [
      {
        "heading": "3.1 How We Use Location",
        "content": [
          "We may use location information to:",
          "• Show catchups relevant to your location.",
          "• Support location-based discovery and coordination.",
          "• Enable location-dependent features you choose to use.",
          "• Support the operation and safety of catchups where reasonably necessary and permitted."
        ]
      },
      {
        "heading": "3.2 When We Collect Location",
        "content": [
          "Orbit asks for location permission when you open the app and uses your location only while the app is in use. Orbit does not collect location in the background."
        ]
      },
      {
        "heading": "3.3 Location Sharing",
        "content": [
          "Other users may see approximately how far away you are and a catchup's meeting point, but not your exact location.",
          "You should not assume that your location is private from other participants if you voluntarily share it through an in-app feature or message."
        ]
      },
      {
        "heading": "3.4 Location Permissions and Retention",
        "content": [
          "You can manage or revoke Orbit's location permissions through your device settings. Revoking permission may prevent location-dependent features from functioning properly.",
          "Orbit stores only your most recent location and does not keep a location history.",
        ]
      }
    ]
  },
  {
    "title": "4. How We Use Information",
    "content": [
      "We use personal information for the following purposes, where relevant to your use of Orbit:",
      "1. Account management: To create, authenticate, secure and maintain your account.",
      "2. Discovery: To surface relevant catchups and support location-dependent features.",
      "3. Catchup management: To process event creation, join requests, approvals, attendance, cancellations and related notifications.",
      "4. Communication: To enable chat and relevant communication between participants of the same catchup.",
      "5. Community features: To display profiles, participation information, ratings and other supported social signals.",
      "6. Safety and integrity: To investigate reports, address harassment, identify suspicious activity, manage abuse and enforce our applicable terms and community standards.",
      "7. Service operation: To diagnose technical problems, maintain performance, troubleshoot errors and improve Orbit's reliability and usability.",
      "8. Customer support: To respond to questions, feedback, complaints and requests.",
      "9. Legal compliance: To comply with applicable laws, lawful orders and other legal obligations.",
      "We do not currently use personal information to deliver advertisements within Orbit. We do not sell personal information to third parties for their own marketing purposes.",
      "If our purposes or data practices change materially, we will update this Policy and provide any notices or obtain any consent required by law."
    ]
  },
  {
    "title": "5. Chat and User-Generated Content",
    "content": [
      "Orbit allows users to communicate through chats associated with catchups and to create content such as profile descriptions, catchup details, ratings and feedback."
    ],
    "items": [
      {
        "heading": "5.1 Chat Visibility",
        "content": [
          "Catchup chat messages are intended for participants authorized to access the relevant catchup chat. They are not intended to be publicly accessible to all Orbit users.",
          "However, participants may copy, screenshot, photograph, save or share messages outside Orbit. We cannot guarantee the conduct of other participants or the confidentiality of information you voluntarily disclose to them."
        ]
      },
      {
        "heading": "5.2 Chat Storage and Retention",
        "content": [
          "We process and store chat messages as necessary to provide chat functionality, maintain conversation history and address legitimate safety, security or legal needs.",
          "Messages are kept while your account is active. When you delete your account, your messages are removed or de-identified.",
          "Messages may be retained for longer where a specific legal obligation or documented safety, fraud-prevention or dispute-resolution need justifies doing so. Any extended retention is limited to the relevant information and duration."
        ]
      },
      {
        "heading": "5.3 Safety Reviews",
        "content": [
          "We may access or review relevant messages and associated information when reasonably necessary to investigate a user report, suspected abuse, a safety incident, a security concern or a lawful request.",
          "Access is limited to authorized personnel and the information reasonably necessary for the relevant investigation. We do not intend to use private catchup chat messages for advertising."
        ]
      },
      {
        "heading": "5.4 Reporting and Moderation",
        "content": [
          "We may review user-generated content, restrict access to content, investigate reported conduct or take action against accounts that violate our applicable terms or community standards.",
          "Reporting, blocking and other moderation features are subject to their actual availability and implementation in Orbit. This Policy does not replace any separate terms of service or community guidelines."
        ]
      }
    ]
  },
  {
    "title": "6. How We Share Information",
    "content": [
      "We do not sell personal information to third parties for their own marketing purposes. We may disclose or make information available in the following circumstances."
    ],
    "items": [
      {
        "heading": "6.1 Other Orbit Users",
        "content": [
          "Depending on the feature and your interactions, other users may see information such as your name or username, profile photograph or avatar, biography, interests, relevant catchup details, participation status, ratings, Activity Band and other supported profile or social signals.",
          "Information associated with a catchup may be visible to its host or participants as necessary to operate that catchup.",
          "Please do not include information in your profile or messages that you are unwilling to share with the audience permitted to see it."
        ]
      },
      {
        "heading": "6.2 Service Providers",
        "content": [
          "Orbit is hosted on Amazon Web Services (AWS) in India (Mumbai region) and on MongoDB Atlas, and media is delivered through Amazon CloudFront.",
          "• Expo push notification service, delivered via Google Firebase Cloud Messaging and Apple Push Notification service. Chat notifications may include a preview of the message.",
          "• Maps: Google Maps on Android and Apple Maps on iOS.",
          "• Address and place lookup: Amazon Location Service (HERE) and OpenStreetMap.",
          "• An email delivery provider for sending login codes.",
          "• WhatsApp, if you contact us for support through it.",
          "We seek to ensure that service providers process information only as necessary to provide their services and are subject to appropriate contractual and security safeguards.",
        ]
      },
      {
        "heading": "6.3 Legal, Safety and Security Disclosures",
        "content": [
          "We may disclose information where we reasonably believe disclosure is necessary to comply with applicable law or a lawful request, protect users or the public, investigate suspected fraud or abuse, enforce our terms, or establish, exercise or defend legal claims.",
          "We will seek to limit such disclosures to what is reasonably necessary and legally permitted."
        ]
      },
      {
        "heading": "6.4 Corporate Transactions",
        "content": [
          "If Gravitate India Private Limited undergoes a merger, acquisition, restructuring or transfer of relevant business assets, information may be transferred as part of that transaction, subject to applicable law and appropriate confidentiality and data-protection safeguards."
        ]
      }
    ]
  },
  {
    "title": "7. Notifications",
    "content": [
      "We may send service-related notifications, such as catchup updates, join-request responses, event reminders and account-related messages, where supported by the app and permitted by your settings.",
    ]
  },
  {
    "title": "8. Data Retention",
    "content": [
      "We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, unless a longer period is required or permitted by applicable law.",
      "Retention depends on the type of information, the purpose for which it is processed, the functionality of Orbit and legitimate safety, security or legal requirements.",
      "Our intended retention approach is as follows:",
      "• Account and profile information: Retained while the account remains active and processed as necessary to complete an account-deletion request, subject to legitimate retention exceptions.",
      "• Catchup and participation records: Retained as necessary to operate the service, maintain relevant activity records and address legitimate safety or dispute-resolution needs.",
      "• Chat messages: Messages are kept while your account is active. When you delete your account, your messages are removed or de-identified.",
      "• Location information: Orbit stores only your most recent location and does not keep a location history.",
      "• Safety reports and investigation records: Retained for the period reasonably necessary to investigate, resolve and document an incident or meet legal obligations.",
      "• Technical and diagnostic logs: Retained for up to 30 days.",
      "When information is no longer required, we will delete it or take appropriate steps to irreversibly anonymize it, subject to applicable law, legitimate retention exceptions and technical backup-expiry procedures."
    ]
  },
  {
    "title": "9. Account Deletion",
    "content": [
      "You can delete your account from within the Orbit app, or email hello@joinorbit.org for help.",
      "Account deletion is intended to remove your account and associated personal information from active systems, subject to information that must or may legitimately be retained for legal compliance, security, fraud prevention, dispute resolution or the establishment, exercise or defence of legal claims.",
      "Where information is retained, retention is limited to the relevant purpose and duration, and access is appropriately restricted.",
      "Deletion from active systems may not immediately remove information from backups or records that must be retained. Such information will be removed or will expire according to the applicable retention schedule, unless a legitimate exception applies.",
      "Deleting the app from your device does not, by itself, delete your Orbit account or associated server-side information. You must use the account-deletion procedure to initiate deletion."
    ]
  },
  {
    "title": "10. Your Privacy Rights and Choices",
    "content": [
      "Depending on applicable law and the circumstances of processing, you may have rights or choices concerning your personal information, including:",
      "• Requesting information about personal data associated with your account.",
      "• Requesting correction of inaccurate or incomplete information.",
      "• Requesting deletion of personal information, subject to applicable retention exceptions.",
      "• Withdrawing consent where processing relies on consent.",
      "• Managing device permissions, including location access.",
      "• Raising a complaint or requesting review of a privacy-related concern.",
      "• Exercising any additional rights available under applicable law, including through an authorized representative where legally permitted.",
      "You may update profile fields through available app settings. You can manage location permissions through your device settings. Withdrawal of permission or consent may prevent features that depend on the relevant information from functioning.",
      "To exercise a privacy right, raise a concern or ask a question about how Orbit handles your information, contact us at hello@joinorbit.org. You may also contact our Grievance Officer using the details in Section 16.",
      "We may need to verify your identity or account ownership before fulfilling a request. We will handle requests in accordance with applicable law and explain if a request cannot be fulfilled in full because a lawful retention exception or other legal restriction applies.",
      "Where required by applicable law, you may also have the right to nominate another person to exercise certain rights on your behalf or to lodge a complaint with the relevant authority.",
    ]
  },
  {
    "title": "11. Children's Privacy and Minimum Age",
    "content": [
      "Orbit is intended exclusively for individuals aged 18 years or older. Individuals under 18 are not permitted to create or use an Orbit account. Users must confirm they are 18 or older when signing up.",
      "We do not knowingly intend to collect personal information from individuals under 18 for use of the service.",
      "If we become aware that an account belongs to an individual under 18, we may restrict or terminate the account and take appropriate steps to delete associated personal information, subject to applicable law and legitimate retention requirements."
    ]
  },
  {
    "title": "12. Data Security",
    "content": [
      "We take reasonable steps to protect personal information against unauthorized access, disclosure, alteration, loss and misuse.",
      "Our safeguards include encryption in transit (TLS), encryption at rest for stored media, passwordless email login with hashed one-time codes, and rate limiting.",
      "No internet-based service or storage system can be guaranteed to be completely secure. Users should keep their email accounts secure and avoid sharing OTPs or other authentication information.",
      "If we become aware of a personal-data breach, we will assess and respond to it and provide notices to affected users or relevant authorities where required by applicable law.",
    ]
  },
  {
    "title": "13. International Processing",
    "content": [
      "Orbit is operated from India. Our primary infrastructure is hosted on AWS in India. Media may be delivered through Amazon CloudFront's global network, and some service providers listed in Section 6.2 may process information outside India.",
      "Where personal information is processed or transferred across borders, we will comply with applicable legal requirements and implement appropriate safeguards where required."
    ]
  },
  {
    "title": "14. Third-Party Services and External Links",
    "content": [
      "Orbit may contain links or references to third-party websites or services. We are not responsible for the independent privacy practices of third parties that operate outside our control.",
      "Where Orbit integrates a third-party service or software component that collects or processes personal information, that processing is disclosed in this Policy where required by applicable law.",
      "Users should review the privacy policies of third-party services before providing information directly to them."
    ]
  },
  {
    "title": "15. Changes to This Privacy Policy",
    "content": [
      "We may update this Policy to reflect changes in Orbit's features, technical systems, business practices or legal obligations.",
      "When a material change is made, we will provide appropriate notice through the app, our website or another suitable communication channel where required by law.",
      "The revised Policy will state its updated effective or last-updated date. Where a change requires renewed consent, we will seek that consent before relying on it for the relevant processing."
    ]
  },
  {
    "title": "16. Contact Us",
    "content": [
      "For questions about this Privacy Policy, requests concerning personal information, account-deletion assistance or privacy complaints, contact:",
      "Gravitate India Private Limited",
      "Operator of Orbit",
      "Office address:",
      "Door No. 13 - 8 - 1018, Sri Laxmi Narasimha Mutt Compound, Ganapathy Temple Road",
      "Mangalore 575001",
      "Karnataka, India",
      "Privacy contact email: hello@joinorbit.org",
      "Grievance Officer: Prasad, Founder, Gravitate India Private Limited",
      "Email: hello@joinorbit.org",
      "We will review privacy-related enquiries and respond in accordance with applicable law."
    ]
  }
];


const EMAIL = 'hello@joinorbit.org';

function renderLine(line, key) {
  if (line.includes(EMAIL)) {
    const [before, after] = line.split(EMAIL);
    return (
      <p key={key}>
        {before}
        <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        {after}
      </p>
    );
  }
  return <p key={key}>{line}</p>;
}

export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy-wrapper">
      <header className="privacy-policy-header container">
        <Link to="/" className="privacy-policy-logo" aria-label="Go back home">
          orbit
        </Link>
        <ThemeToggle />
      </header>

      <main className="privacy-policy-main container">
        <article className="privacy-policy-article">
          <div className="privacy-policy-headline-block">
            <p className="privacy-policy-kicker">Privacy Policy</p>
            <h1 className="privacy-policy-title">ORBIT — PRIVACY POLICY</h1>
          </div>

          <div className="privacy-policy-standalone">
            <p>Last updated: 19 October 2026</p>
          </div>

          {policySections.map((section) => (
            <section className="privacy-policy-section" key={section.title}>
              <h2>{section.title}</h2>
              {(section.content || []).map((line, index) =>
                renderLine(line, `${section.title}-${index}`),
              )}
              {(section.items || []).map((item) => (
                <div key={item.heading} className="privacy-policy-subsection">
                  <h3>{item.heading}</h3>
                  {item.content.map((line, index) =>
                    renderLine(line, `${item.heading}-${index}`),
                  )}
                </div>
              ))}
            </section>
          ))}

          <div className="privacy-policy-footer-actions">
            <Link to="/" className="privacy-policy-button">
              <ArrowLeft size={18} />
              Back to Home
            </Link>
          </div>
        </article>
      </main>
    </div>
  );
}
