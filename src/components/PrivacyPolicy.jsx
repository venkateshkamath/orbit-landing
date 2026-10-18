import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './PrivacyPolicy.css';

const policySections = [
  {
    "title": "1. Introduction",
    "content": [
      "Orbit (“Orbit”, “we”, “us” or “our”) is a social activity discovery and gathering platform operated by Gravitate India Private Limited, India.",
      "Orbit enables users to discover and create social activities called Gatherings, request to join activities, participate in real-world experiences, communicate with other participants and build connections through shared interests.",
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
          "Profile information: Depending on the fields you complete, we may collect your name, username, profile photograph or selected avatar, hometown, interests and biography.",
          "Gathering information: When you create, discover, request to join or participate in a Gathering, we process relevant information such as activity details, date and time, meeting location, host information, join requests, approvals, cancellations and participation status.",
          "Ratings and social interactions: We process ratings, feedback, Kudos and other social signals submitted or generated through supported Orbit features.",
          "Messages: When you use a Gathering's chat feature, we process messages and associated information necessary to provide and maintain the conversation.",
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
          "• Diagnostic information, including error logs, crash reports and performance data.",
          "• Location information, as described in Section 3.",
          "The specific information collected may depend on the technical services and configurations used to operate Orbit."
        ]
      },
      {
        "heading": "2.3 Information Received Through Other Users",
        "content": [
          "We may receive information associated with interactions other users have with you on Orbit. This may include Gathering invitations, join approvals, attendance records, ratings, Kudos, reports and messages involving your account.",
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
          "• Show Gatherings relevant to your location.",
          "• Support location-based discovery and coordination.",
          "• Enable location-dependent features you choose to use.",
          "• Support the operation and safety of Gatherings where reasonably necessary and permitted."
        ]
      },
      {
        "heading": "3.2 Foreground and Background Location",
        "content": [
          "Orbit may collect location information while the app is in use and, where the relevant feature and device permissions permit, while the app is running in the background.",
          "Background location collection is used only in connection with applicable location-dependent functionality and must be consistent with the permissions and disclosures presented to users.",
          "*[REQUIRED BEFORE PUBLICATION: Confirm the precise circumstances in which background location collection starts and stops, whether it continues when the app is closed or terminated, whether collection is continuous or periodic, which features require it, and whether location is transmitted to or stored on Orbit's servers.]*",
          "We will request device permissions where required and provide appropriate feature-specific disclosures and consent mechanisms where required by applicable law or platform policy.",
          "Granting a device permission does not mean every location-dependent feature is always active."
        ]
      },
      {
        "heading": "3.3 Location Sharing",
        "content": [
          "Location information may be used to determine which Gatherings are relevant to you. Where a feature requires location information to be shared with a host or another participant, such sharing should be limited to the feature's stated purpose and disclosed appropriately.",
          "*[REQUIRED BEFORE PUBLICATION: Confirm whether hosts or attendees can see your precise location, whether only a meeting-point address is shared, and whether any live location is visible to other users.]*",
          "You should not assume that your location is private from other participants if you voluntarily share it through an in-app feature or message."
        ]
      },
      {
        "heading": "3.4 Location Permissions and Retention",
        "content": [
          "You can manage or revoke Orbit's location permissions through your device settings. Revoking permission may prevent location-dependent features from functioning properly.",
          "We intend to retain location information only for as long as necessary for the purpose for which it was collected, subject to applicable legal obligations and legitimate safety or security needs. We do not intend to maintain location histories for unrelated purposes.",
          "*[REQUIRED BEFORE PUBLICATION: Confirm whether location coordinates or location histories are stored, the retention period for location logs, and what happens to location information after a Gathering ends or an account is deleted.]*"
        ]
      }
    ]
  },
  {
    "title": "4. How We Use Information",
    "content": [
      "We use personal information for the following purposes, where relevant to your use of Orbit:",
      "1. Account management: To create, authenticate, secure and maintain your account.",
      "2. Discovery: To surface relevant Gatherings and support location-dependent features.",
      "3. Gathering management: To process event creation, join requests, approvals, attendance, cancellations, waitlists and related notifications.",
      "4. Communication: To enable chat and relevant communication between participants of the same Gathering.",
      "5. Community features: To display profiles, participation information, ratings, Kudos and other supported social signals.",
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
      "Orbit allows users to communicate through chats associated with Gatherings and to create content such as profile descriptions, Gathering details, ratings and feedback."
    ],
    "items": [
      {
        "heading": "5.1 Chat Visibility",
        "content": [
          "Gathering chat messages are intended for participants authorized to access the relevant Gathering chat. They are not intended to be publicly accessible to all Orbit users.",
          "However, participants may copy, screenshot, photograph, save or share messages outside Orbit. We cannot guarantee the conduct of other participants or the confidentiality of information you voluntarily disclose to them."
        ]
      },
      {
        "heading": "5.2 Chat Storage and Retention",
        "content": [
          "We process and store chat messages as necessary to provide chat functionality, maintain conversation history and address legitimate safety, security or legal needs.",
          "Messages are retained for a fixed period after a Gathering closes.",
          "*[REQUIRED BEFORE PUBLICATION: Specify the actual post-event chat retention period and confirm whether deletion is automatic.]*",
          "Messages may be retained for longer where a specific legal obligation or documented safety, fraud-prevention or dispute-resolution need justifies doing so. Any extended retention should be limited to the relevant information and duration."
        ]
      },
      {
        "heading": "5.3 Safety Reviews",
        "content": [
          "We may access or review relevant messages and associated information when reasonably necessary to investigate a user report, suspected abuse, a safety incident, a security concern or a lawful request.",
          "Access should be limited to authorized personnel and the information reasonably necessary for the relevant investigation. We do not intend to use private Gathering chat messages for advertising."
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
          "Depending on the feature and your interactions, other users may see information such as your name or username, profile photograph or avatar, biography, interests, relevant Gathering details, participation status, ratings and other supported profile or social signals.",
          "Information associated with a Gathering may be visible to its host or participants as necessary to operate that Gathering.",
          "*[REQUIRED BEFORE PUBLICATION: Confirm which profile fields are visible to all users, which are visible only to Gathering participants, and whether Activity Band or equivalent participation metrics are displayed publicly.]*",
          "Please do not include information in your profile or messages that you are unwilling to share with the audience permitted to see it."
        ]
      },
      {
        "heading": "6.2 Service Providers",
        "content": [
          "We use Amazon Web Services (AWS) as infrastructure for operating Orbit.",
          "Depending on our configuration, AWS services may process information for hosting, storage, authentication, email delivery, notifications, diagnostics, security and related operational purposes.",
          "We seek to ensure that service providers process information only as necessary to provide their services and are subject to appropriate contractual and security safeguards.",
          "*[REQUIRED BEFORE PUBLICATION: Verify the exact AWS services used, including those responsible for authentication, email OTP delivery, databases, file storage, push notifications, logging and backups. Confirm whether any additional SDKs or third-party providers receive user information.]*"
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
    "title": "7. Advertising and Marketing",
    "content": [
      "Orbit does not currently serve advertisements within the app and does not currently use personal information to create advertising profiles.",
      "This does not constitute a promise that Orbit will never introduce advertising or other monetization features. If we introduce new data uses, advertising partners or tracking technologies, we will update this Policy and make any additional disclosures or obtain any consent required before implementing the relevant practices.",
      "We may send service-related notifications, such as Gathering updates, join-request responses, event reminders and account-related messages, where supported by the app and permitted by your settings.",
      "*[REQUIRED BEFORE PUBLICATION: Confirm whether Orbit currently sends promotional emails, push notifications or marketing messages, and whether users can opt out separately from essential service communications.]*"
    ]
  },
  {
    "title": "8. Data Retention",
    "content": [
      "We retain personal information only for as long as reasonably necessary for the purposes described in this Policy, unless a longer period is required or permitted by applicable law.",
      "Retention depends on the type of information, the purpose for which it is processed, the functionality of Orbit and legitimate safety, security or legal requirements.",
      "Our intended retention approach is as follows:",
      "• Account and profile information: Retained while the account remains active and processed as necessary to complete an account-deletion request, subject to legitimate retention exceptions.",
      "• Gathering and participation records: Retained as necessary to operate the service, maintain relevant activity records and address legitimate safety or dispute-resolution needs.",
      "• Chat messages: Retained for the configured fixed period following event closure, subject to justified exceptions.",
      "• Location information: Retained only for the necessary feature-related or legitimate operational purpose, subject to the applicable retention schedule.",
      "• Safety reports and investigation records: Retained for the period reasonably necessary to investigate, resolve and document an incident or meet legal obligations.",
      "• Technical and diagnostic logs: Retained according to relevant operational, security and troubleshooting requirements.",
      "*[REQUIRED BEFORE PUBLICATION: Confirm the actual retention periods for chat messages, location logs, account data after deletion, safety reports and technical logs. Confirm the deletion or expiry process for backups.]*",
      "When information is no longer required, we will delete it or take appropriate steps to irreversibly anonymize it, subject to applicable law, legitimate retention exceptions and technical backup-expiry procedures."
    ]
  },
  {
    "title": "9. Account Deletion",
    "content": [
      "You may request deletion of your Orbit account through the account-deletion option available within the app.",
      "Account deletion is intended to remove your account and associated personal information from active systems, subject to information that must or may legitimately be retained for legal compliance, security, fraud prevention, dispute resolution or the establishment, exercise or defence of legal claims.",
      "Where information is retained, retention should be limited to the relevant purpose and duration, and access should be appropriately restricted.",
      "Deletion from active systems may not immediately remove information from backups or records that must be retained. Such information should be removed or expire according to the applicable retention schedule, unless a legitimate exception applies.",
      "*[MANDATORY BEFORE GOOGLE PLAY SUBMISSION: Orbit currently has in-app account deletion only. Create and publish an external webpage through which users can request account and associated data deletion without reinstalling the app. Insert the verified public URL here: https://[INPUT REQUIRED].]*",
      "*[REQUIRED BEFORE PUBLICATION: State the normal time required to complete a deletion request, how users receive confirmation, and how any legally justified retained information is handled.]*",
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
      "To exercise a privacy right, raise a concern or ask a question about how Orbit handles your information, contact us at hello@joinorbit.org.",
      "We may need to verify your identity or account ownership before fulfilling a request. We will handle requests in accordance with applicable law and explain if a request cannot be fulfilled in full because a lawful retention exception or other legal restriction applies.",
      "Where required by applicable law, you may also have the right to nominate another person to exercise certain rights on your behalf or to lodge a complaint with the relevant authority.",
      "*[REQUIRED BEFORE PUBLICATION: Confirm the designated grievance officer or privacy contact, the applicable complaint-escalation procedure and the legally required response timelines.]*"
    ]
  },
  {
    "title": "11. Children's Privacy and Minimum Age",
    "content": [
      "Orbit is intended exclusively for individuals aged 18 years or older. Individuals under 18 are not permitted to create or use an Orbit account. Orbit enforces an 18+ age restriction during onboarding.",
      "We do not knowingly intend to collect personal information from individuals under 18 for use of the service.",
      "If we become aware that an account belongs to an individual under 18, we may restrict or terminate the account and take appropriate steps to delete associated personal information, subject to applicable law and legitimate retention requirements."
    ]
  },
  {
    "title": "12. Data Security",
    "content": [
      "We take reasonable steps to protect personal information against unauthorized access, disclosure, alteration, loss and misuse.",
      "Depending on the systems involved, safeguards may include access controls, secure authentication, encryption in transit, infrastructure security measures, monitoring and restricted access to operational systems.",
      "No internet-based service or storage system can be guaranteed to be completely secure. Users should keep their email accounts secure and avoid sharing OTPs or other authentication information.",
      "If we become aware of a personal-data breach, we will assess and respond to it and provide notices to affected users or relevant authorities where required by applicable law.",
      "*[REQUIRED BEFORE PUBLICATION: Verify which safeguards are actually implemented, including encryption in transit and at rest, administrative access controls, logging, backup protection and incident-response procedures. Do not publish any safeguard as an established fact unless verified.]*"
    ]
  },
  {
    "title": "13. International Processing",
    "content": [
      "Orbit is operated from India and uses AWS infrastructure. Depending on the AWS region, service configuration, backup arrangements and any other service providers, personal information may be stored or processed outside India.",
      "*[REQUIRED BEFORE PUBLICATION: Confirm the AWS regions used for production databases, file storage, backups, logs and other systems that process personal information. Identify any cross-border transfers or additional providers.]*",
      "Where personal information is processed or transferred across borders, we will comply with applicable legal requirements and implement appropriate safeguards where required."
    ]
  },
  {
    "title": "14. Third-Party Services and External Links",
    "content": [
      "Orbit may contain links or references to third-party websites or services. We are not responsible for the independent privacy practices of third parties that operate outside our control.",
      "Where Orbit integrates a third-party service or software component that collects or processes personal information, that processing must be assessed and disclosed where required by applicable law and platform policy.",
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
      "*[REQUIRED BEFORE PUBLICATION: Designated Grievance Officer / privacy officer name and designation to be confirmed.]*",
      "*[REQUIRED BEFORE PUBLICATION: External account-deletion request page URL to be added.]*",
      "We will review privacy-related enquiries and respond in accordance with applicable law."
    ]
  }
];

const openPoints = [
  "1 | External account deletion | Build and test a public web deletion-request route; confirm URL and process.",
  "2 | Background location | Confirm start/stop behavior, app-closed behavior, frequency, purpose, permission and sharing.",
  "3 | Location visibility and retention | Confirm what users/hosts see and how long location data/logs are retained.",
  "4 | Chat retention | Insert actual fixed post-event retention period and confirm automatic deletion.",
  "5 | Profile visibility | Verify public versus participant-only profile fields and Activity Band/social metrics.",
  "6 | AWS and SDK inventory | Document all AWS services, OTP/email delivery, notifications, analytics, crash reporting and third-party SDKs.",
  "7 | Promotional messaging | Confirm promotional email/push practices and opt-out controls.",
  "8 | Retention and backups | Document account-deletion timelines, safety logs, technical logs and backup expiry.",
  "9 | Grievance officer | Confirm name, designation, email and complaint escalation process with legal counsel.",
  "10 | Security claims | Verify encryption, access control, logging, backup security and incident response.",
  "11 | International processing | Confirm AWS regions, backups and any cross-border data transfers.",
  "12 | Company address and effective date | Confirm registered-office status and policy effective date."
];

const EMAIL = 'hello@joinorbit.org';

function renderLine(line, key) {
  if (line.startsWith('*') && line.endsWith('*')) {
    return (
      <p key={key} className="privacy-policy-legal-flag">
        {line.slice(1, -1)}
      </p>
    );
  }
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
            <p className="privacy-policy-draft">Working Draft — Not Ready for Publication</p>
          </div>

          <div className="privacy-policy-standalone">
            <p>Last updated: 13 October 2026</p>
            <p>Effective date: [CONFIRM BEFORE PUBLICATION]</p>
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

          <section className="privacy-policy-section open-points">
            <h2>Open Points for Legal Review</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Status / Detail</th>
                </tr>
              </thead>
              <tbody>
                {openPoints.map((point) => {
                  const [number, item, status] = point.split(' | ');
                  return (
                    <tr key={number}>
                      <td data-label="#">{number}</td>
                      <td data-label="Item">{item}</td>
                      <td data-label="Status / Detail">{status}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

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
