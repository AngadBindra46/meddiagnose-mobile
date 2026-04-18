import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { symptomAPI } from '../../src/services/api';

const SEVERITY_COLORS = ['#34A853', '#34A853', '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00', '#F4511E', '#E53935', '#C62828'];
const TREND_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  improving: { icon: 'trending-down', color: '#34A853', label: 'Improving' },
  worsening: { icon: 'trending-up', color: '#EA4335', label: 'Worsening' },
  stable: { icon: 'minus', color: '#5F6368', label: 'Stable' },
};

export default function TrackScreen() {
  const [symptom, setSymptom] = useState('');
  const [severity, setSeverity] = useState(5);
  const [notes, setNotes] = useState('');
  const [logging, setLogging] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const load = useCallback(async () => {
    try {
      const r = await symptomAPI.summary(days);
      setSummary(r.data);
    } catch {}
    setLoading(false);
  }, [days]);

  useEffect(() => { load(); }, [load]);

  const handleLog = async () => {
    if (!symptom.trim()) { Alert.alert('Required', 'Please enter the symptom name'); return; }
    setLogging(true);
    try {
      await symptomAPI.log({ symptom: symptom.trim(), severity, notes: notes.trim() || undefined });
      setSymptom('');
      setNotes('');
      setSeverity(5);
      Alert.alert('Logged', 'Symptom recorded successfully');
      load();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to log symptom');
    }
    setLogging(false);
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      {/* Log New Symptom */}
      <View style={s.card}>
        <View style={s.cardHeader}>
          <MaterialCommunityIcons name="plus-circle" size={20} color="#1A73E8" />
          <Text style={s.cardTitle}>Log Symptom</Text>
        </View>
        <TextInput style={s.input} placeholder="Symptom name (e.g., Headache, Cough)" placeholderTextColor="#9AA0A6" value={symptom} onChangeText={setSymptom} />

        <Text style={s.label}>Severity: {severity}/10</Text>
        <View style={s.severityRow}>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((v) => (
            <TouchableOpacity key={v} style={[s.sevDot, severity >= v && { backgroundColor: SEVERITY_COLORS[v - 1] }]} onPress={() => setSeverity(v)}>
              <Text style={[s.sevDotText, severity >= v && { color: '#fff' }]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TextInput style={[s.input, { minHeight: 60 }]} placeholder="Notes (optional)" placeholderTextColor="#9AA0A6" value={notes} onChangeText={setNotes} multiline />

        <TouchableOpacity style={[s.logBtn, logging && { opacity: 0.6 }]} onPress={handleLog} disabled={logging}>
          <MaterialCommunityIcons name="check" size={20} color="#fff" />
          <Text style={s.logBtnText}>{logging ? 'Saving...' : 'Log Symptom'}</Text>
        </TouchableOpacity>
      </View>

      {/* Period Selector */}
      <View style={s.periodRow}>
        {[7, 14, 30].map((d) => (
          <TouchableOpacity key={d} style={[s.periodBtn, days === d && s.periodBtnActive]} onPress={() => { setDays(d); setLoading(true); }}>
            <Text style={[s.periodText, days === d && { color: '#fff' }]}>{d}D</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Trends */}
      {loading ? (
        <ActivityIndicator size="large" color="#1A73E8" style={{ marginTop: 40 }} />
      ) : summary?.symptoms?.length > 0 ? (
        <View style={s.card}>
          <View style={s.cardHeader}>
            <MaterialCommunityIcons name="chart-timeline-variant" size={20} color="#8430CE" />
            <Text style={s.cardTitle}>Symptom Trends ({days} days)</Text>
          </View>
          {summary.symptoms.map((sym: any, i: number) => {
            const trend = TREND_ICONS[sym.trend] || TREND_ICONS.stable;
            return (
              <View key={i} style={s.trendCard}>
                <View style={s.trendHeader}>
                  <Text style={s.trendName}>{sym.symptom}</Text>
                  <View style={[s.trendBadge, { backgroundColor: trend.color + '20' }]}>
                    <MaterialCommunityIcons name={trend.icon as any} size={14} color={trend.color} />
                    <Text style={[s.trendLabel, { color: trend.color }]}>{trend.label}</Text>
                  </View>
                </View>
                <View style={s.trendStats}>
                  <Text style={s.trendStat}>Avg: {sym.avg_severity}/10</Text>
                  <Text style={s.trendStat}>Entries: {sym.count}</Text>
                </View>
                <View style={s.miniChart}>
                  {sym.entries.map((e: any, j: number) => (
                    <View key={j} style={[s.miniBar, { height: (e.severity / 10) * 40, backgroundColor: SEVERITY_COLORS[e.severity - 1] || '#DADCE0' }]} />
                  ))}
                </View>
              </View>
            );
          })}
        </View>
      ) : (
        <View style={s.empty}>
          <MaterialCommunityIcons name="chart-line" size={48} color="#DADCE0" />
          <Text style={s.emptyText}>No symptoms logged yet</Text>
          <Text style={s.emptySub}>Start tracking above to see trends</Text>
        </View>
      )}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  card: { backgroundColor: '#fff', margin: 12, marginBottom: 4, borderRadius: 14, padding: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: '#202124' },
  input: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#DADCE0', borderRadius: 10, padding: 14, fontSize: 15, color: '#202124', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#5F6368', marginBottom: 8 },
  severityRow: { flexDirection: 'row', gap: 4, marginBottom: 14 },
  sevDot: { width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F1F3F4' },
  sevDotText: { fontSize: 11, fontWeight: '700', color: '#5F6368' },
  logBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: '#1A73E8', paddingVertical: 14, borderRadius: 12 },
  logBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  periodRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginVertical: 12 },
  periodBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20, backgroundColor: '#fff', borderWidth: 1, borderColor: '#DADCE0' },
  periodBtnActive: { backgroundColor: '#1A73E8', borderColor: '#1A73E8' },
  periodText: { fontSize: 13, fontWeight: '700', color: '#5F6368' },
  trendCard: { backgroundColor: '#F8F9FA', borderRadius: 10, padding: 14, marginBottom: 10 },
  trendHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  trendName: { fontSize: 15, fontWeight: '700', color: '#202124', textTransform: 'capitalize' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  trendLabel: { fontSize: 12, fontWeight: '600' },
  trendStats: { flexDirection: 'row', gap: 16, marginBottom: 10 },
  trendStat: { fontSize: 12, color: '#5F6368' },
  miniChart: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 44 },
  miniBar: { flex: 1, borderRadius: 3, minHeight: 4 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 8 },
  emptyText: { fontSize: 16, fontWeight: '600', color: '#5F6368' },
  emptySub: { fontSize: 13, color: '#9AA0A6' },
});
