import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import './PrivacyPolicy.css';

const policySections = [
  {
    title: '1. Information We Collect',
    items: [
      {
        heading: '1.1 Information you give us directly',
        content: [
          '• Account details: name, username, phone number (verified via OTP), date of birth, gender',
          '• Profile information: profile picture or selected default avatar, hometown, interests (minimum 3, maximum 8, selected from our fixed list), bio (optional)',
          '• Gatherings activity: events you create or join, RSVPs, cancellations, Vibe Ratings you give or receive, Kudos given or received',
          '• Chat messages: content of messages sent within a Gather chat thread tied to an event',
          '• Communications with us: anything you send us directly, e.g. support requests, feedback',
        ],
      },
      {
        heading: '1.2 Information we collect automatically',
        content: [
          '• Location data — see Section 3, it gets its own section because it deserves one',
          '• Device information: device model, operating system, unique device identifiers, IP address',
          '• Usage data: how you interact with the app — screens viewed, features used, notification interactions',
          '• Log data: crash reports, diagnostic data, timestamps of activity',
        ],
      },
      {
        heading: '1.3 Information from others',
        content: [
          'If another user adds you to their Gathering, shares an event with you, or gives you Kudos, we receive that information in connection with your account.',
          '*[LEGAL INPUT NEEDED] Confirm whether Orbit collects contacts/address book access at any point (e.g. for invite flows). If yes, this needs its own disclosure and explicit permission flow — do not bundle into general "device information."*',
        ],
      },
    ],
  },
  {
    title: '2. Why We Collect It',
    content: [
      'We use your information to:',
      '• Create and manage your Orbit account',
      '• Match you into relevant Gatherings and, when Pulse is active, surface nearby opt-in users',
      '• Run the mechanics that make Gatherings work: join requests, acceptances, waitlists, cancellations, reminders',
      '• Calculate your Activity Band and related in-app signals from your confirmed meetup history',
      '• Enable chat between people in the same Gathering',
      '• Send you notifications tied to events you\'ve created or joined',
      '• Keep the platform safe — detect fake accounts, no-show patterns, abuse, and enforce our Terms & Conditions',
      '• Improve the app based on how people actually use it',
      '• Comply with legal obligations under Indian law',
      '',
      'We do not use your information to build an advertising profile, and we do not sell your personal data to third parties for marketing purposes.',
      '*[LEGAL INPUT NEEDED] Confirm this last line is accurate as a forward-looking commitment — if there\'s any chance Orbit monetizes via ads later (noted as an open exploration area), this sentence needs to be softened now or amended later with proper notice.*',
    ],
  },
  {
    title: '3. Location Data',
    content: [
      'Orbit is a proximity-based app. Location is core to how it works, so here\'s the straight version of what happens with yours.',
      '• Gatherings: We use your approximate (coarse) location by default to show you relevant nearby events. We only access your precise location once you\'ve been accepted into a Gathering — this is so the host and confirmed attendees can coordinate the actual meeting point. You are asked for location permission the first time you interact with Gatherings, not during onboarding.',
      '• Pulse: If you turn Pulse on, Orbit uses your live location to enable real-time proximity discovery with other opted-in users nearby. Pulse is off by default and invisible to others unless you actively switch it on. Turning Pulse off stops this collection immediately.',
      '• We do not track or store your location history for any purpose beyond making the active feature work. [LEGAL INPUT NEEDED — confirm retention window for location logs, if any, for safety/fraud investigation purposes.]',
      '• You can revoke location permission at any time through your device settings. Gatherings and Pulse won\'t function properly without it, and we\'ll tell you that plainly in-app rather than pretend otherwise.',
      '*[LEGAL INPUT NEEDED] Google Play\'s Data Safety form treats "location shared in background" as a high-scrutiny category. Confirm exact technical behavior with Venkatesh (is location ever collected when the app is closed/backgrounded, even for Pulse) before this section is finalized — the answer changes both this text and the Play Console declaration.*',
    ],
  },
  {
    title: '4. Chat Data',
    content: [
      'When you\'re accepted into a Gathering, a chat thread opens between you and the other confirmed attendees, tied to that specific event.',
      '• We store chat content on our servers to keep the thread functional (so messages sync across your devices and persist for the life of the event).',
      '• Messages can be edited or deleted only within a 5-minute window after sending; after that they\'re locked.',
      '• Chat threads are visible only to people confirmed for that specific Gathering — not to other Orbit users.',
      '• We may access chat content if required to investigate a safety report, harassment complaint, or legal request. We do not read chats for any other reason, including marketing or profiling.',
      '*[LEGAL INPUT NEEDED] Confirm chat retention period after an event closes — is it deleted, archived, or kept indefinitely? This needs a firm answer, not a "may" clause.*',
    ],
  },
  {
    title: '5. Who We Share Your Information With',
    content: [
      '• Other users: Your username, profile picture/avatar, bio, interests, and Activity Band are visible to other users as designed into the app\'s Profile Page. Your phone number, exact date of birth, and precise location (outside an accepted Gathering) are never shown to other users.',
      '• Service providers: We use third-party infrastructure to run Orbit — including Amazon Web Services (AWS) for hosting, storage, and notifications, and [Firebase Auth / OTP provider name] for phone verification. These providers process data on our behalf under contractual confidentiality obligations; they don\'t get to use your data for their own purposes.',
      '• Legal and safety: We may disclose information if required by Indian law, court order, or government request, or if necessary to protect the safety of our users or the public.',
      '• Business transfers: If Orbit is acquired, merged, or restructured, your information may transfer as part of that transaction, subject to this Policy or its successor.',
      '',
      'We do not sell your personal data to third parties.',
    ],
  },
  {
    title: '6. Data Retention',
    content: [
      'We keep your information for as long as your account is active, and for a reasonable period after account deletion to comply with legal obligations, resolve disputes, and enforce our agreements.',
      '*[LEGAL INPUT NEEDED] This needs actual numbers before publishing — Amruta to confirm retention periods for: account data post-deletion, chat logs, location logs, and safety-report records, in line with DPDP Act data minimization requirements.*',
    ],
  },
  {
    title: '7. Your Rights',
    content: [
      'Under the Digital Personal Data Protection Act, 2023, and its rules, you have the right to:',
      '• Access the personal data we hold about you',
      '• Correct inaccurate or incomplete data',
      '• Request erasure of your data, subject to our legal retention obligations',
      '• Withdraw consent for processing at any time — note that withdrawing consent for core functions (',
      '• Nominate another individual to exercise these rights on your behalf in the event of your death or incapacity',
      '• File a complaint with us, and if unresolved, with the Data Protection Board of India',
      '',
      'To exercise any of these rights, contact our Grievance Officer at [EMAIL / NAME — LEGAL INPUT NEEDED].',
      '*[LEGAL INPUT NEEDED] DPDP Act requires a named Grievance Officer with published contact details. Confirm who holds this role — likely needs to be Amruta or a designated founder, not a generic support inbox.*',
    ],
  },
  {
    title: '8. Children and Minimum Age',
    content: [
      'Orbit is intended for users who are [18+ — LEGAL INPUT NEEDED, confirm minimum age policy]. We do not currently verify age beyond self-declared date of birth at onboarding.',
      '*[FLAGGED — cross-reference Open Points from Onboarding PRD: "No minimum age gate (accepted risk, logged in Open Points)." This is a genuine legal exposure for a stranger-meetup app and needs a real decision before launch, not a policy line that papers over it. Recommend this gets escalated with Amruta as a standalone discussion, not just a T&C clause.]*',
    ],
  },
  {
    title: '9. Data Security',
    content: [
      'We use reasonable technical and organizational measures to protect your information, including encrypted data transmission and access controls on our infrastructure. No system is completely secure, and we can\'t guarantee absolute security — if we become aware of a breach affecting your data, we\'ll notify you and the relevant authorities as required by law.',
    ],
  },
  {
    title: '10. Changes to This Policy',
    content: [
      'We may update this Policy as Orbit evolves. If we make material changes, we\'ll notify you in-app or via the contact details on your account before the changes take effect. Continuing to use Orbit after an update means you accept the revised Policy.',
    ],
  },
  {
    title: '11. Contact Us',
    content: [
      'For questions about this Policy or how we handle your data, reach out to:',
      '',
      'Gravitate India Private Limited',
      '[Registered Address]',
      '[Grievance Officer Name and Email]',
    ],
  },
];

const openPoints = [
  '1 | Confirm minimum age policy — currently no age gate exists in-product | Unresolved — needs product + legal decision',
  '2 | Confirm chat data retention period post-event closure | Needs firm number',
  '3 | Confirm location log retention for safety/fraud investigation | Needs firm number',
  '4 | Name Grievance Officer per DPDP Act requirement | Needs assignment',
  '5 | Confirm whether contacts/address book is ever accessed | Needs Venkatesh input',
  '6 | Confirm background location behavior for Pulse (open vs closed app) | Needs Venkatesh input — affects Play Console declaration',
  '7 | Confirm no-ads commitment is safe to state given future monetization exploration | Needs founder decision',
  '8 | Confirm OTP/auth provider name for accurate third-party disclosure | Needs Venkatesh input',
];

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
            <p className="privacy-policy-draft">
              Draft v0.1 · Working Draft for Legal Review · Not for Publication
            </p>
            <p className="privacy-policy-meta">
              Prepared for review by Amruta (G C Bhat &amp; Associates) before Play Console submission.
            </p>
            <p className="privacy-policy-legal-flag">
              *[LEGAL INPUT NEEDED]* This entire document is a first draft. Every section needs Amruta&apos;s sign-off before it goes anywhere near the Play Store listing or the app itself. Flags are placed inline where I&apos;ve made an assumption that legal needs to confirm.
            </p>
          </div>

          <div className="privacy-policy-standalone">
            <p>Last updated: 11/10/2026</p>
            <p>
              Gravitate India Private Limited (&quot;<strong>Orbit</strong>,&quot; &quot;<strong>we</strong>,&quot; &quot;<strong>us</strong>,&quot; &quot;<strong>our</strong>&quot;), the company behind the Orbit app, respects your privacy. This Privacy Policy explains what information we collect when you use Orbit, why we collect it, who we share it with, and the choices you have.
            </p>
            <p>
              By creating an account or using Orbit, you agree to this Policy. If you don&apos;t agree, please don&apos;t use the app.
            </p>
            <p>
              This Policy applies to the Orbit mobile application and any related services. It does not apply to third-party apps, websites, or services you may access through Orbit, or to anything that happens after you meet someone in person — what you do offline is between you and them.
            </p>
          </div>

          {policySections.map((section) => (
            <section className="privacy-policy-section" key={section.title}>
              <h2>{section.title}</h2>
              {section.items ? (
                section.items.map((item) => (
                  <div key={item.heading} className="privacy-policy-subsection">
                    <h3>{item.heading}</h3>
                    {item.content.map((line, index) => (
                      <p key={`${item.heading}-${index}`}>{line}</p>
                    ))}
                  </div>
                ))
              ) : (
                <>
                  {section.content.map((line, index) => (
                    <p key={`${section.title}-${index}`}>{line}</p>
                  ))}
                </>
              )}
            </section>
          ))}

          <section className="privacy-policy-section open-points">
            <h2>Open Points for Legal Review</h2>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Item</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {openPoints.map((point) => {
                  const [number, item, status] = point.split(' | ');
                  return (
                    <tr key={number}>
                      <td data-label="#">{number}</td>
                      <td data-label="Item">{item}</td>
                      <td data-label="Status">{status}</td>
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
