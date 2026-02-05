import Layout from '@/components/layout/Layout';
import { Helmet } from 'react-helmet';

const Privacy = () => {
    const effectiveDate = 'January 15, 2025';
    const version = '1.0';

    return (
        <Layout>
            <Helmet>
                <title>Privacy Policy | Cynergists</title>
                <meta
                    name="description"
                    content="Cynergists Privacy Policy. Learn how we collect, use, process, and protect your personal and business information."
                />
                <link rel="canonical" href="/privacy" />
            </Helmet>

            {/* Hero Section */}
            <section className="bg-background pt-32 pb-8">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl text-center">
                        <h1 className="mb-6 text-4xl font-bold md:text-5xl">
                            Privacy Policy
                        </h1>
                    </div>
                </div>
            </section>

            {/* Content Section */}
            <section className="bg-background pb-16">
                <div className="container mx-auto px-4">
                    <div className="prose prose-invert prose-sm prose-h2:text-base prose-h2:font-semibold prose-h2:mt-6 prose-h2:mb-3 prose-h3:text-base prose-h3:font-medium prose-p:font-normal prose-p:my-3 prose-headings:text-foreground prose-p:text-foreground/80 prose-li:text-foreground/80 prose-li:font-normal prose-a:text-primary prose-strong:font-semibold mx-auto max-w-4xl">
                        <p className="text-lg">
                            <strong>Effective Date:</strong> {effectiveDate}
                        </p>

                        <h2>1. Introduction</h2>
                        
                        <p>
                            Welcome to Cynergists ("we," "our," or "us"). We are committed to protecting your privacy and
                            ensuring transparency in how we collect, use, and safeguard your personal information. This
                            Privacy Policy explains our practices regarding data we collect through our AI agent platform
                            and related services (collectively, the "Services").
                        </p>
                        <p>
                            By accessing or using our Services, you agree to this Privacy Policy. If you do not agree with
                            our practices, please do not use our Services.
                        </p>

                        <h2>2. Information We Collect</h2>

                        <h3>2.1 Information You Provide</h3>
                        <p>We collect information that you voluntarily provide to us, including:</p>
                        <ul>
                            <li>
                                <strong>Account Information:</strong> Name, email address, phone number, company name, and
                                billing information when you create an account or subscribe to our Services
                            </li>
                            <li>
                                <strong>Profile Information:</strong> Business details, team member information, and
                                preferences you configure in your account
                            </li>
                            <li>
                                <strong>Communications:</strong> Messages, feedback, and support requests you send to us
                            </li>
                            <li>
                                <strong>Business Data:</strong> Information you provide to our AI agents for task execution,
                                including documents, contacts, and other business-related data
                            </li>
                            <li>
                                <strong>Payment Information:</strong> Credit card details and billing addresses (processed
                                securely through third-party payment processors)
                            </li>
                        </ul>

                        <h3>2.2 Information We Collect Automatically</h3>
                        <p>When you use our Services, we automatically collect:</p>
                        <ul>
                            <li>
                                <strong>Usage Data:</strong> Information about how you interact with our Services, including
                                features used, time spent, and actions taken
                            </li>
                            <li>
                                <strong>Device Information:</strong> IP address, browser type, operating system, device
                                identifiers, and mobile network information
                            </li>
                            <li>
                                <strong>Log Data:</strong> Server logs, error reports, and performance metrics
                            </li>
                            <li>
                                <strong>Cookies and Similar Technologies:</strong> We use cookies, web beacons, and similar
                                tracking technologies to enhance your experience and analyze usage patterns
                            </li>
                        </ul>

                        <h3>2.3 Information from Third Parties</h3>
                        <p>We may receive information about you from:</p>
                        <ul>
                            <li>Third-party services you connect to our platform (e.g., CRM systems, email providers)</li>
                            <li>Partners and affiliates who refer you to our Services</li>
                            <li>Public databases and data providers for business verification purposes</li>
                        </ul>

                        <h2>3. How We Use Your Information</h2>
                        <p>We use the information we collect for the following purposes:</p>

                        <h3>3.1 Service Delivery and Improvement</h3>
                        <ul>
                            <li>Provide, maintain, and improve our AI agent platform</li>
                            <li>Process transactions and manage your account</li>
                            <li>Train and optimize our AI agents to better serve your needs</li>
                            <li>Develop new features and Services</li>
                            <li>Troubleshoot technical issues and ensure platform security</li>
                        </ul>

                        <h3>3.2 Communication</h3>
                        <ul>
                            <li>Send you service-related notifications and updates</li>
                            <li>Respond to your inquiries and support requests</li>
                            <li>Send marketing communications (with your consent)</li>
                            <li>Share important changes to our Services or policies</li>
                        </ul>

                        <h3>3.3 Business Operations</h3>
                        <ul>
                            <li>Comply with legal obligations and enforce our terms</li>
                            <li>Prevent fraud, abuse, and security incidents</li>
                            <li>Conduct analytics and research to improve our Services</li>
                            <li>Manage partnerships and business relationships</li>
                        </ul>

                        <h2>4. AI and Data Processing</h2>

                        <h3>4.1 AI Agent Operations</h3>
                        <p>
                            Our AI agents process your business data to perform tasks on your behalf. This may include:
                        </p>
                        <ul>
                            <li>Analyzing documents and extracting insights</li>
                            <li>Managing communications and scheduling</li>
                            <li>Processing customer interactions</li>
                            <li>Generating content and reports</li>
                        </ul>

                        <h3>4.2 Model Training</h3>
                        <p>
                            We may use aggregated and anonymized data to train and improve our AI models. We do not use
                            your confidential business data for training purposes without explicit consent. You retain
                            ownership of all data you provide to our Services.
                        </p>

                        <h3>4.3 Third-Party AI Services</h3>
                        <p>
                            Our platform may utilize third-party AI services (such as OpenAI, Anthropic) to power certain
                            features. These providers process data according to their own privacy policies and security
                            standards. We carefully vet all third-party providers to ensure they meet our data protection
                            requirements.
                        </p>

                        <h2>5. Data Sharing and Disclosure</h2>
                        <p>We share your information only in the following circumstances:</p>

                        <h3>5.1 Service Providers</h3>
                        <p>
                            We engage trusted third-party vendors to perform services on our behalf, including:
                        </p>
                        <ul>
                            <li>Cloud hosting and infrastructure providers</li>
                            <li>Payment processors</li>
                            <li>Customer support platforms</li>
                            <li>Analytics and marketing services</li>
                            <li>AI and machine learning services</li>
                        </ul>
                        <p>
                            These providers are contractually obligated to protect your information and use it only for the
                            purposes we specify.
                        </p>

                        <h3>5.2 Business Transfers</h3>
                        <p>
                            If we are involved in a merger, acquisition, or sale of assets, your information may be
                            transferred as part of that transaction. We will notify you of any such change and the choices
                            you may have regarding your information.
                        </p>

                        <h3>5.3 Legal Requirements</h3>
                        <p>We may disclose your information when required by law or to:</p>
                        <ul>
                            <li>Comply with legal processes and government requests</li>
                            <li>Enforce our Terms of Service and other agreements</li>
                            <li>Protect our rights, property, and safety, or that of our users</li>
                            <li>Prevent fraud or security threats</li>
                        </ul>

                        <h3>5.4 With Your Consent</h3>
                        <p>
                            We may share your information with third parties when you explicitly consent to such sharing.
                        </p>

                        <h2>6. Data Security</h2>
                        <p>
                            We implement robust security measures to protect your information, including:
                        </p>
                        <ul>
                            <li>Encryption of data in transit and at rest</li>
                            <li>Regular security audits and penetration testing</li>
                            <li>Access controls and authentication mechanisms</li>
                            <li>Employee training on data protection practices</li>
                            <li>Incident response procedures for data breaches</li>
                        </ul>
                        <p>
                            While we strive to protect your information, no security system is impenetrable. We cannot
                            guarantee absolute security of your data.
                        </p>

                        <h2>7. Data Retention</h2>
                        <p>
                            We retain your information for as long as necessary to provide our Services and fulfill the
                            purposes outlined in this Privacy Policy, unless a longer retention period is required by law.
                        </p>
                        <p>When you close your account, we will:</p>
                        <ul>
                            <li>Delete or anonymize your personal information within 90 days</li>
                            <li>Retain certain information as required by law or for legitimate business purposes</li>
                            <li>Maintain backups for disaster recovery, which are deleted according to our backup schedule</li>
                        </ul>

                        <h2>8. Your Rights and Choices</h2>

                        <h3>8.1 Access and Portability</h3>
                        <p>
                            You have the right to access your personal information and request a copy in a portable format.
                        </p>

                        <h3>8.2 Correction and Update</h3>
                        <p>
                            You can update your account information at any time through your account settings or by
                            contacting us.
                        </p>

                        <h3>8.3 Deletion</h3>
                        <p>
                            You may request deletion of your account and personal information, subject to certain legal
                            exceptions.
                        </p>

                        <h3>8.4 Opt-Out</h3>
                        <p>You can opt out of:</p>
                        <ul>
                            <li>Marketing communications by using the unsubscribe link in our emails</li>
                            <li>Cookies through your browser settings</li>
                            <li>Certain data processing activities by contacting us</li>
                        </ul>

                        <h3>8.5 Data Portability</h3>
                        <p>
                            You can export your data from our platform at any time using our data export tools.
                        </p>

                        <h2>9. Children's Privacy</h2>
                        <p>
                            Our Services are not intended for individuals under 18 years of age. We do not knowingly
                            collect personal information from children. If you believe we have collected information from a
                            child, please contact us immediately.
                        </p>

                        <h2>10. International Data Transfers</h2>
                        <p>
                            Your information may be transferred to and processed in countries other than your country of
                            residence. These countries may have different data protection laws. We ensure appropriate
                            safeguards are in place for such transfers, including:
                        </p>
                        <ul>
                            <li>Standard contractual clauses approved by regulatory authorities</li>
                            <li>Adequacy decisions by the European Commission</li>
                            <li>Other legally approved transfer mechanisms</li>
                        </ul>

                        <h2>11. California Privacy Rights (CCPA)</h2>
                        <p>
                            If you are a California resident, you have additional rights under the California Consumer
                            Privacy Act (CCPA):
                        </p>
                        <ul>
                            <li>Right to know what personal information we collect and how we use it</li>
                            <li>Right to delete your personal information</li>
                            <li>Right to opt-out of the sale of your personal information (we do not sell your information)</li>
                            <li>Right to non-discrimination for exercising your privacy rights</li>
                        </ul>
                        <p>
                            To exercise these rights, please contact us using the information provided below.
                        </p>

                        <h2>12. European Privacy Rights (GDPR)</h2>
                        <p>
                            If you are located in the European Economic Area (EEA), you have rights under the General Data
                            Protection Regulation (GDPR):
                        </p>
                        <ul>
                            <li>Right of access to your personal data</li>
                            <li>Right to rectification of inaccurate data</li>
                            <li>Right to erasure (right to be forgotten)</li>
                            <li>Right to restrict processing</li>
                            <li>Right to data portability</li>
                            <li>Right to object to processing</li>
                            <li>Right to withdraw consent</li>
                        </ul>

                        <h2>13. Changes to This Privacy Policy</h2>
                        <p>
                            We may update this Privacy Policy from time to time to reflect changes in our practices or for
                            legal, operational, or regulatory reasons. We will notify you of material changes by:
                        </p>
                        <ul>
                            <li>Posting the updated policy on our website</li>
                            <li>Sending you an email notification</li>
                            <li>Displaying a prominent notice in our Services</li>
                        </ul>
                        <p>
                            Your continued use of our Services after such changes constitutes acceptance of the updated
                            Privacy Policy.
                        </p>

                        <h2>14. Contact Us</h2>
                        <p>
                            If you have questions, concerns, or requests regarding this Privacy Policy or our data
                            practices, please contact us:
                        </p>
                        <p>
                            <strong>Cynergists</strong>
                            <br />
                            Email: <a href="mailto:privacy@cynergists.ai">privacy@cynergists.ai</a>
                            <br />
                            Website: <a href="https://cynergists.ai">https://cynergists.ai</a>
                            <br />
                            Address: [Your Business Address]
                        </p>
                        <p>
                            We will respond to your inquiry within 30 days. For urgent matters, please indicate "URGENT" in
                            your subject line.
                        </p>

                        <h2>15. Dispute Resolution</h2>
                        <p>
                            Any disputes arising from this Privacy Policy will be resolved in accordance with the dispute
                            resolution provisions in our Terms of Service.
                        </p>
                    </div>
                </div>
            </section>

            {/* Version Info */}
            <section className="bg-background pb-16">
                <div className="container mx-auto px-4">
                    <div className="mx-auto max-w-4xl space-y-1 text-center text-muted-foreground">
                        <p>Version: {version}</p>
                        <p>Effective Date: {effectiveDate}</p>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default Privacy;
