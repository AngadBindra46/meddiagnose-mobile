import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const DISCLAIMER_KEY = 'disclaimer_accepted';

export async function hasAcceptedDisclaimer(): Promise<boolean> {
  const val = await AsyncStorage.getItem(DISCLAIMER_KEY);
  return val === 'true';
}

export default function DisclaimerScreen() {
  const router = useRouter();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
    router.replace('/(auth)/login');
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
        <View style={s.iconWrap}>
          <MaterialCommunityIcons name="shield-check" size={56} color="#1A73E8" />
        </View>

        <Text style={s.title}>Medical Disclaimer</Text>
        <Text style={s.subtitle}>Please read carefully before using MedDiagnose</Text>

        <View style={s.card}>
          <View style={s.cardRow}>
            <MaterialCommunityIcons name="alert-circle" size={22} color="#EA4335" />
            <Text style={s.cardTitle}>Not a Substitute for Medical Advice</Text>
          </View>
          <Text style={s.cardBody}>
            MedDiagnose is an AI-powered informational tool. It does NOT replace professional medical advice, diagnosis, or treatment. The information provided by this app should not be used as the sole basis for making health decisions.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.cardRow}>
            <MaterialCommunityIcons name="doctor" size={22} color="#1A73E8" />
            <Text style={s.cardTitle}>Always Consult a Healthcare Provider</Text>
          </View>
          <Text style={s.cardBody}>
            Always seek the advice of a qualified healthcare professional with any questions you may have regarding a medical condition. Never disregard professional medical advice or delay seeking it because of something you read on this app.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.cardRow}>
            <MaterialCommunityIcons name="pill" size={22} color="#EA8600" />
            <Text style={s.cardTitle}>Medication Recommendations</Text>
          </View>
          <Text style={s.cardBody}>
            All medication suggestions are for informational purposes only. Do NOT self-medicate based on this app's recommendations without consulting a licensed doctor or pharmacist. Dosages, interactions, and contraindications require professional evaluation.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.cardRow}>
            <MaterialCommunityIcons name="phone-alert" size={22} color="#EA4335" />
            <Text style={s.cardTitle}>Emergency Situations</Text>
          </View>
          <Text style={s.cardBody}>
            If you believe you are experiencing a medical emergency, call your local emergency number (911, 112, 108) immediately. Do not rely on this app in emergency situations.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.cardRow}>
            <MaterialCommunityIcons name="shield-lock" size={22} color="#34A853" />
            <Text style={s.cardTitle}>Privacy & Data</Text>
          </View>
          <Text style={s.cardBody}>
            Your health data is stored securely. We do not share your personal health information with third parties without your consent. By using this app, you agree to our Privacy Policy and Terms of Service.
          </Text>
        </View>

        <View style={s.card}>
          <View style={s.cardRow}>
            <MaterialCommunityIcons name="robot" size={22} color="#8430CE" />
            <Text style={s.cardTitle}>AI Limitations</Text>
          </View>
          <Text style={s.cardBody}>
            The AI model powering this app has limitations. It may produce inaccurate, incomplete, or inappropriate results. Accuracy depends on the quality and completeness of information you provide. AI-generated diagnoses should always be verified by a medical professional.
          </Text>
        </View>

        <TouchableOpacity
          style={s.checkRow}
          activeOpacity={0.7}
          onPress={() => setAccepted(!accepted)}
        >
          <MaterialCommunityIcons
            name={accepted ? 'checkbox-marked' : 'checkbox-blank-outline'}
            size={24}
            color={accepted ? '#1A73E8' : '#9AA0A6'}
          />
          <Text style={s.checkText}>
            I have read and understand that MedDiagnose provides informational content only and is not a substitute for professional medical advice, diagnosis, or treatment.
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.acceptBtn, !accepted && s.acceptBtnDisabled]}
          onPress={handleAccept}
          disabled={!accepted}
        >
          <Text style={[s.acceptBtnText, !accepted && s.acceptBtnTextDisabled]}>
            I Understand — Continue
          </Text>
        </TouchableOpacity>

        <Text style={s.legalFooter}>
          By continuing, you agree to our{' '}
          <Text style={s.link}>Privacy Policy</Text> and{' '}
          <Text style={s.link}>Terms of Service</Text>.
        </Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  scroll: { padding: 24, paddingBottom: 48 },
  iconWrap: { alignItems: 'center', marginTop: 16, marginBottom: 8 },
  title: { fontSize: 26, fontWeight: '800', color: '#202124', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#5F6368', textAlign: 'center', marginTop: 6, marginBottom: 24 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#202124', flex: 1 },
  cardBody: { fontSize: 13, color: '#5F6368', lineHeight: 20 },
  checkRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: 20, marginBottom: 20, paddingHorizontal: 4 },
  checkText: { flex: 1, fontSize: 13, color: '#202124', lineHeight: 20 },
  acceptBtn: { backgroundColor: '#1A73E8', paddingVertical: 18, borderRadius: 14, alignItems: 'center', shadowColor: '#1A73E8', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  acceptBtnDisabled: { backgroundColor: '#DADCE0', shadowOpacity: 0 },
  acceptBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  acceptBtnTextDisabled: { color: '#9AA0A6' },
  legalFooter: { fontSize: 12, color: '#9AA0A6', textAlign: 'center', marginTop: 16, lineHeight: 18 },
  link: { color: '#1A73E8', textDecorationLine: 'underline' },
});
