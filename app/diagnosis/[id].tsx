import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Share } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { diagnosisAPI } from '../../src/services/api';
import { scheduleNotificationsForMedications } from '../../src/services/reminders';

const SEV_COLORS: Record<string, { bg: string; fg: string }> = {
  mild: { bg: '#E6F4EA', fg: '#34A853' },
  moderate: { bg: '#FEF7E0', fg: '#EA8600' },
  severe: { bg: '#FDECEA', fg: '#EA4335' },
  critical: { bg: '#FDECEA', fg: '#D93025' },
};

const PILL_ICONS: Record<string, string> = {
  tablet: 'pill', capsule: 'pill', syrup: 'cup', injection: 'needle', topical: 'lotion', inhaler: 'weather-windy',
};

export default function DiagnosisDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [d, setD] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => { try { const r = await diagnosisAPI.get(Number(id)); setD(r.data); } catch {} setLoading(false); })();
  }, [id]);

  if (loading) return <View style={s.loader}><ActivityIndicator size="large" color="#1A73E8" /></View>;
  if (!d) return <View style={s.loader}><Text style={{ color: '#5F6368' }}>Diagnosis not found</Text></View>;

  const sev = SEV_COLORS[d.ai_severity] || SEV_COLORS.mild;
  const confPct = d.ai_confidence != null ? Math.round(d.ai_confidence * 100) : null;

  return (
    <ScrollView style={s.container}>
      {/* Diagnosis Header */}
      <View style={[s.header, { backgroundColor: sev.bg }]}>
        <View style={s.headerTop}>
          <View style={[s.sevPill, { backgroundColor: sev.fg }]}>
            <Text style={s.sevPillText}>{(d.ai_severity || 'pending').toUpperCase()}</Text>
          </View>
          {confPct != null && <Text style={[s.confBadge, { color: sev.fg }]}>{confPct}% confidence</Text>}
        </View>
        <Text style={s.diagnosisTitle}>{d.ai_diagnosis || 'Analysis in progress'}</Text>
        {d.symptoms_text && <Text style={s.symptomsRef}>Symptoms: {d.symptoms_text}</Text>}
      </View>

      {/* Differential Diagnoses */}
      {d.ai_differential_diagnoses?.length > 0 && (
        <Section icon="source-branch" title="Differential Diagnoses" color="#5C6BC0">
          <Text style={s.diffSubtitle}>Alternative possibilities considered</Text>
          {d.ai_differential_diagnoses.map((dd: any, i: number) => {
            const pct = dd.confidence != null ? Math.round(dd.confidence * 100) : 0;
            return (
              <View key={i} style={s.diffCard}>
                <View style={s.diffHeader}>
                  <Text style={s.diffName}>{dd.diagnosis}</Text>
                  <View style={s.diffBadge}>
                    <Text style={s.diffBadgeText}>{pct}%</Text>
                  </View>
                </View>
                <View style={s.diffBarBg}>
                  <View style={[s.diffBarFill, { width: `${pct}%` }]} />
                </View>
                {dd.reasoning ? <Text style={s.diffReason}>{dd.reasoning}</Text> : null}
              </View>
            );
          })}
        </Section>
      )}

      {/* AI Reasoning */}
      {d.ai_reasoning && (
        <Section icon="brain" title="AI Analysis" color="#8430CE">
          <Text style={s.body}>{d.ai_reasoning}</Text>
        </Section>
      )}

      {/* Medications */}
      {d.ai_medications?.length > 0 && (
        <Section icon="pill" title="Recommended Medications" color="#1A73E8">
          {d.ai_medications.map((med: any, i: number) => (
            <View key={i} style={s.medCard}>
              <View style={s.medHeader}>
                <View style={s.medIconWrap}>
                  <MaterialCommunityIcons name={(PILL_ICONS[med.type] || 'pill') as any} size={18} color="#1A73E8" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={s.medName}>{med.name}</Text>
                  <Text style={s.medType}>{med.type}</Text>
                </View>
              </View>
              <View style={s.medDetails}>
                <MedDetail icon="scale" label="Dosage" value={med.dosage} />
                <MedDetail icon="clock-outline" label="Frequency" value={med.frequency} />
                <MedDetail icon="calendar-range" label="Duration" value={med.duration} />
              </View>
              {med.notes && <View style={s.medNote}><MaterialCommunityIcons name="information" size={14} color="#1A73E8" /><Text style={s.medNoteText}>{med.notes}</Text></View>}
            </View>
          ))}
          <View style={s.disclaimer}>
            <MaterialCommunityIcons name="alert-circle-outline" size={16} color="#EA8600" />
            <Text style={s.disclaimerText}>These are AI-suggested medications. Please consult a doctor before taking any medicine.</Text>
          </View>
        </Section>
      )}

      {/* Drug Interactions */}
      {d.ai_drug_interactions?.length > 0 && (
        <Section icon="alert-octagon" title="Drug Interaction Warnings" color="#D93025">
          {d.ai_drug_interactions.map((ix: any, i: number) => (
            <View key={i} style={s.interactionCard}>
              <View style={s.interactionHeader}>
                <MaterialCommunityIcons name={ix.severity === 'critical' ? 'alert-circle' : 'alert'} size={18} color={ix.severity === 'critical' ? '#D93025' : '#EA8600'} />
                <Text style={[s.interactionSev, { color: ix.severity === 'critical' ? '#D93025' : '#EA8600' }]}>{(ix.severity || '').toUpperCase()}</Text>
              </View>
              <Text style={s.interactionDrugs}>{ix.drug_a}  +  {ix.drug_b}</Text>
              <Text style={s.interactionDesc}>{ix.description}</Text>
              {ix.recommendation && <Text style={s.interactionRec}>{ix.recommendation}</Text>}
            </View>
          ))}
        </Section>
      )}

      {/* Findings */}
      {d.ai_findings?.length > 0 && (
        <Section icon="magnify" title="Key Findings" color="#5F6368">
          {d.ai_findings.map((f: any, i: number) => {
            const fc = SEV_COLORS[f.severity === 'low' ? 'mild' : f.severity === 'high' ? 'severe' : f.severity] || SEV_COLORS.mild;
            return (
              <View key={i} style={s.findingRow}>
                <View style={[s.findingDot, { backgroundColor: fc.fg }]} />
                <Text style={s.findingText}>{f.finding}</Text>
              </View>
            );
          })}
        </Section>
      )}

      {/* Lifestyle Recommendations */}
      {d.ai_lifestyle?.length > 0 && (
        <Section icon="heart-pulse" title="Lifestyle Recommendations" color="#34A853">
          {d.ai_lifestyle.map((tip: string, i: number) => (
            <View key={i} style={s.tipRow}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#34A853" />
              <Text style={s.tipText}>{tip}</Text>
            </View>
          ))}
        </Section>
      )}

      {/* Precautions */}
      {d.ai_precautions?.length > 0 && (
        <Section icon="shield-alert" title="Precautions" color="#EA8600">
          {d.ai_precautions.map((p: string, i: number) => (
            <View key={i} style={s.tipRow}>
              <MaterialCommunityIcons name="alert" size={18} color="#EA8600" />
              <Text style={s.tipText}>{p}</Text>
            </View>
          ))}
        </Section>
      )}

      {/* Recommended Tests */}
      {d.ai_recommended_tests?.length > 0 && (
        <Section icon="test-tube" title="Recommended Tests" color="#8430CE">
          {d.ai_recommended_tests.map((t: string, i: number) => (
            <View key={i} style={s.tipRow}>
              <MaterialCommunityIcons name="flask-outline" size={18} color="#8430CE" />
              <Text style={s.tipText}>{t}</Text>
            </View>
          ))}
        </Section>
      )}

      {/* When to See Doctor */}
      {d.ai_when_to_see_doctor && (
        <View style={s.doctorCard}>
          <MaterialCommunityIcons name="hospital" size={24} color="#EA4335" />
          <View style={{ flex: 1 }}>
            <Text style={s.doctorTitle}>When to See a Doctor</Text>
            <Text style={s.doctorText}>{d.ai_when_to_see_doctor}</Text>
          </View>
        </View>
      )}

      {/* Action Buttons */}
      <View style={s.actionRow}>
        <TouchableOpacity style={s.actionBtn} onPress={() => router.push({ pathname: '/chat', params: { diagnosisId: id } })}>
          <MaterialCommunityIcons name="robot" size={20} color="#1A73E8" />
          <Text style={s.actionBtnText}>Ask AI</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.actionBtn, { borderColor: '#EA8600' }]} onPress={async () => {
          if (!d.ai_medications?.length) { Alert.alert('No Medications', 'No medications to set reminders for.'); return; }
          try {
            const reminders = await scheduleNotificationsForMedications(d.id, d.ai_medications);
            Alert.alert('Reminders Set', `${reminders.length} medication reminder(s) scheduled. You'll receive notifications at the scheduled times.`);
          } catch { Alert.alert('Error', 'Failed to set reminders'); }
        }}>
          <MaterialCommunityIcons name="bell-ring" size={20} color="#EA8600" />
          <Text style={[s.actionBtnText, { color: '#EA8600' }]}>Reminders</Text>
        </TouchableOpacity>
      </View>
      <View style={[s.actionRow, { marginTop: 0 }]}>
        <TouchableOpacity style={s.actionBtn} onPress={async () => {
          const text = `MedDiagnose Report\n\nDiagnosis: ${d.ai_diagnosis}\nSeverity: ${d.ai_severity}\nConfidence: ${Math.round((d.ai_confidence || 0) * 100)}%\n\nReasoning: ${d.ai_reasoning}\n\nMedications:\n${(d.ai_medications || []).map((m: any) => `- ${m.name} ${m.dosage} (${m.frequency}, ${m.duration})`).join('\n')}\n\nLifestyle:\n${(d.ai_lifestyle || []).map((l: string) => `- ${l}`).join('\n')}\n\nPrecautions:\n${(d.ai_precautions || []).map((p: string) => `- ${p}`).join('\n')}\n\nWhen to See Doctor: ${d.ai_when_to_see_doctor || 'N/A'}\n\n⚠ This is an AI-generated report for informational purposes only. Consult a doctor before taking any action.`;
          try { await Share.share({ message: text, title: 'MedDiagnose Report' }); } catch {}
        }}>
          <MaterialCommunityIcons name="share-variant" size={20} color="#34A853" />
          <Text style={[s.actionBtnText, { color: '#34A853' }]}>Share Report</Text>
        </TouchableOpacity>
      </View>

      {/* Medical Disclaimer Footer */}
      <View style={s.legalFooter}>
        <MaterialCommunityIcons name="shield-alert-outline" size={18} color="#9AA0A6" />
        <Text style={s.legalText}>
          This AI-generated assessment is for informational purposes only and does not constitute medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making health decisions or taking any medication.
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

function Section({ icon, title, color, children }: any) {
  return (
    <View style={s.section}>
      <View style={s.sectionHeader}>
        <MaterialCommunityIcons name={icon} size={20} color={color} />
        <Text style={[s.sectionTitle, { color }]}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function MedDetail({ icon, label, value }: any) {
  return (
    <View style={s.medDetailItem}>
      <MaterialCommunityIcons name={icon} size={14} color="#5F6368" />
      <Text style={s.medDetailLabel}>{label}:</Text>
      <Text style={s.medDetailValue}>{value}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingBottom: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sevPill: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  sevPillText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  confBadge: { fontSize: 13, fontWeight: '700' },
  diagnosisTitle: { fontSize: 22, fontWeight: '800', color: '#202124', lineHeight: 30 },
  symptomsRef: { fontSize: 13, color: '#5F6368', marginTop: 8 },
  section: { backgroundColor: '#fff', marginTop: 8, padding: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 15, fontWeight: '700' },
  body: { fontSize: 14, color: '#202124', lineHeight: 22 },
  medCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 16, marginBottom: 10 },
  medHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  medIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  medName: { fontSize: 15, fontWeight: '700', color: '#202124' },
  medType: { fontSize: 12, color: '#5F6368', textTransform: 'capitalize', marginTop: 1 },
  medDetails: { gap: 6 },
  medDetailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  medDetailLabel: { fontSize: 12, color: '#5F6368', width: 72 },
  medDetailValue: { fontSize: 13, fontWeight: '600', color: '#202124', flex: 1 },
  medNote: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, marginTop: 10, backgroundColor: '#E8F0FE', padding: 10, borderRadius: 8 },
  medNoteText: { flex: 1, fontSize: 12, color: '#1A73E8', lineHeight: 17 },
  disclaimer: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginTop: 12, backgroundColor: '#FEF7E0', padding: 12, borderRadius: 10 },
  disclaimerText: { flex: 1, fontSize: 12, color: '#EA8600', lineHeight: 17 },
  findingRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F1F3F4' },
  findingDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5 },
  findingText: { flex: 1, fontSize: 14, color: '#202124', lineHeight: 20 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingVertical: 8 },
  tipText: { flex: 1, fontSize: 14, color: '#202124', lineHeight: 20 },
  doctorCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, backgroundColor: '#FDECEA', margin: 16, padding: 18, borderRadius: 14 },
  doctorTitle: { fontSize: 14, fontWeight: '700', color: '#EA4335', marginBottom: 4 },
  doctorText: { fontSize: 13, color: '#202124', lineHeight: 20 },
  actionRow: { flexDirection: 'row', gap: 10, paddingHorizontal: 16, marginTop: 12 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#fff', paddingVertical: 14, borderRadius: 12, borderWidth: 1, borderColor: '#DADCE0' },
  actionBtnText: { fontSize: 14, fontWeight: '700', color: '#1A73E8' },
  interactionCard: { backgroundColor: '#FFF3F3', borderRadius: 10, padding: 14, marginBottom: 10, borderLeftWidth: 3, borderLeftColor: '#EA4335' },
  interactionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  interactionSev: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  interactionDrugs: { fontSize: 14, fontWeight: '700', color: '#202124', marginBottom: 4 },
  interactionDesc: { fontSize: 13, color: '#5F6368', lineHeight: 18 },
  interactionRec: { fontSize: 12, color: '#1A73E8', marginTop: 6, fontStyle: 'italic' },
  legalFooter: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginHorizontal: 16, marginTop: 16, padding: 16, backgroundColor: '#F1F3F4', borderRadius: 12 },
  legalText: { flex: 1, fontSize: 11, color: '#9AA0A6', lineHeight: 16 },
  diffSubtitle: { fontSize: 12, color: '#9AA0A6', marginBottom: 12 },
  diffCard: { backgroundColor: '#F8F9FA', borderRadius: 12, padding: 14, marginBottom: 10 },
  diffHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  diffName: { fontSize: 14, fontWeight: '600', color: '#202124', flex: 1 },
  diffBadge: { backgroundColor: '#E8EAF6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  diffBadgeText: { fontSize: 12, fontWeight: '800', color: '#5C6BC0' },
  diffBarBg: { height: 6, backgroundColor: '#E0E0E0', borderRadius: 3, marginBottom: 8 },
  diffBarFill: { height: 6, backgroundColor: '#5C6BC0', borderRadius: 3 },
  diffReason: { fontSize: 12, color: '#5F6368', lineHeight: 17 },
});
