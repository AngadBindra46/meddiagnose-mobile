import { ScrollView, Text, View, StyleSheet } from 'react-native';

export default function PrivacyPolicyScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Privacy Policy</Text>
      <Text style={s.updated}>Last Updated: February 27, 2026</Text>

      <Section title="1. Information We Collect">
        {`MedDiagnose collects the following information when you create an account and use our services:

• Personal Information: Name, email address, phone number, date of birth, gender, blood group.
• Health Information: Symptoms you describe, medical reports you upload, allergy information, diagnosis history.
• Device Information: Device type, operating system, app version.
• Usage Data: App interaction patterns, features used, timestamps.`}
      </Section>

      <Section title="2. How We Use Your Information">
        {`We use your information to:

• Provide AI-powered health assessments based on your symptoms and medical reports.
• Personalize diagnosis results based on your medical profile (age, gender, allergies, blood group).
• Filter out medications you may be allergic to.
• Improve our AI models and service quality.
• Communicate important health-related updates.
• Comply with legal obligations.`}
      </Section>

      <Section title="3. Data Storage & Security">
        {`• All health data is encrypted in transit (TLS 1.2+) and at rest (AES-256).
• Access to patient data is restricted to authorized systems only.
• We maintain audit logs of all data access.
• We conduct regular security assessments.
• Your data is stored on secure, compliant cloud infrastructure.`}
      </Section>

      <Section title="4. Data Sharing">
        {`We do NOT sell your personal health information. We may share data only:

• With your explicit consent.
• To comply with legal requirements or court orders.
• With service providers who assist in app operation (under strict data processing agreements).
• In anonymized, aggregated form for research purposes.`}
      </Section>

      <Section title="5. Your Rights">
        {`You have the right to:

• Access your personal data.
• Correct inaccurate information.
• Request deletion of your account and data.
• Export your health data.
• Withdraw consent at any time.
• Lodge a complaint with a data protection authority.

To exercise these rights, contact us at privacy@meddiagnose.app.`}
      </Section>

      <Section title="6. Data Retention">
        {`• Account data is retained for as long as your account is active.
• Health records are retained for 7 years after last activity (in compliance with medical record retention laws).
• You may request early deletion by contacting support.
• Deleted data is purged from backups within 90 days.`}
      </Section>

      <Section title="7. Children's Privacy">
        {`MedDiagnose is not intended for children under 13 without parental consent. If you are a parent and believe your child has provided health information without consent, please contact us immediately.`}
      </Section>

      <Section title="8. Changes to This Policy">
        {`We may update this policy periodically. Significant changes will be communicated via in-app notification. Continued use of the app after changes constitutes acceptance of the updated policy.`}
      </Section>

      <Section title="9. Contact Us">
        {`For privacy-related questions or concerns:

Email: privacy@meddiagnose.app
Address: [Your Business Address]

For data deletion requests, please include your registered email address.`}
      </Section>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: string }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      <Text style={s.sectionBody}>{children}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: '800', color: '#202124', marginBottom: 4 },
  updated: { fontSize: 13, color: '#5F6368', marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#202124', marginBottom: 8 },
  sectionBody: { fontSize: 14, color: '#5F6368', lineHeight: 22 },
});
