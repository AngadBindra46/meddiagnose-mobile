import { ScrollView, Text, View, StyleSheet } from 'react-native';

export default function TermsOfServiceScreen() {
  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>Terms of Service</Text>
      <Text style={s.updated}>Last Updated: February 27, 2026</Text>

      <Section title="1. Acceptance of Terms">
        {`By downloading, installing, or using MedDiagnose ("the App"), you agree to be bound by these Terms of Service. If you do not agree, do not use the App.`}
      </Section>

      <Section title="2. Nature of Service">
        {`MedDiagnose is an AI-powered health information tool. It provides preliminary health assessments based on symptoms and medical reports you provide.

IMPORTANT: MedDiagnose is NOT a medical device, is NOT a substitute for professional medical advice, and does NOT establish a doctor-patient relationship. All information provided is for educational and informational purposes only.`}
      </Section>

      <Section title="3. Medical Disclaimer">
        {`• The App does not provide medical diagnoses. It provides AI-generated health assessments that must be verified by a licensed healthcare professional.
• Medication suggestions are informational only. Do NOT take any medication based solely on App recommendations without consulting a doctor or pharmacist.
• The App is not designed for use in medical emergencies. In case of emergency, call your local emergency services immediately.
• Accuracy of results depends on the quality and completeness of information you provide. The AI may produce incorrect or incomplete results.`}
      </Section>

      <Section title="4. User Responsibilities">
        {`You agree to:

• Provide accurate and complete information about your symptoms and medical history.
• Use the App only for personal, non-commercial health information.
• Not rely solely on the App for medical decisions.
• Consult a qualified healthcare professional for any health concerns.
• Keep your account credentials secure.
• Not attempt to reverse-engineer, modify, or interfere with the App's operation.`}
      </Section>

      <Section title="5. Account Registration">
        {`• You must be at least 13 years old to create an account (or have parental consent).
• You are responsible for maintaining the confidentiality of your account.
• You must provide accurate registration information.
• We reserve the right to suspend or terminate accounts that violate these terms.`}
      </Section>

      <Section title="6. Intellectual Property">
        {`• The App, its content, features, and functionality are owned by MedDiagnose and protected by copyright, trademark, and other intellectual property laws.
• You are granted a limited, non-exclusive, non-transferable license to use the App for personal purposes.
• You may not copy, modify, distribute, or create derivative works based on the App.`}
      </Section>

      <Section title="7. Limitation of Liability">
        {`TO THE MAXIMUM EXTENT PERMITTED BY LAW:

• MedDiagnose is provided "AS IS" without warranties of any kind.
• We do not guarantee the accuracy, completeness, or reliability of any health information provided.
• We shall not be liable for any direct, indirect, incidental, special, or consequential damages resulting from your use of the App.
• We are not liable for any health outcomes that result from reliance on App-generated information.
• Our total liability shall not exceed the amount you paid for the App (if any).`}
      </Section>

      <Section title="8. Indemnification">
        {`You agree to indemnify and hold harmless MedDiagnose, its officers, directors, employees, and agents from any claims, damages, or expenses arising from your use of the App or violation of these Terms.`}
      </Section>

      <Section title="9. Termination">
        {`• You may delete your account at any time through the App settings.
• We may terminate or suspend your access at our discretion if you violate these Terms.
• Upon termination, your right to use the App ceases immediately.
• Data retention after termination is governed by our Privacy Policy.`}
      </Section>

      <Section title="10. Changes to Terms">
        {`We reserve the right to modify these Terms at any time. Material changes will be communicated via in-app notification at least 30 days before taking effect. Continued use after changes constitutes acceptance.`}
      </Section>

      <Section title="11. Governing Law">
        {`These Terms shall be governed by and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.`}
      </Section>

      <Section title="12. Contact">
        {`For questions about these Terms:

Email: legal@meddiagnose.app
Address: [Your Business Address]`}
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
