import { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { diagnosisAPI } from '../../src/services/api';

const SEV = { mild: { color: '#34A853', bg: '#E6F4EA', icon: 'check-circle' }, moderate: { color: '#EA8600', bg: '#FEF7E0', icon: 'alert-circle' }, severe: { color: '#EA4335', bg: '#FDECEA', icon: 'alert' }, critical: { color: '#D93025', bg: '#FDECEA', icon: 'alert-octagon' } } as const;

export default function ReportsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { const r = await diagnosisAPI.list({ per_page: 50 }); setItems(r.data.items || []); } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, []);

  return (
    <View style={s.container}>
      <FlatList
        data={items}
        keyExtractor={(i) => i.id.toString()}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
        ListEmptyComponent={!loading ? (
          <View style={s.empty}>
            <MaterialCommunityIcons name="clipboard-text-clock-outline" size={56} color="#DADCE0" />
            <Text style={s.emptyTitle}>No reports yet</Text>
            <Text style={s.emptySub}>Upload your first medical report to get started</Text>
            <TouchableOpacity style={s.emptyBtn} onPress={() => router.push('/tabs/upload')}>
              <Text style={s.emptyBtnText}>Upload Report</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        renderItem={({ item }) => {
          const sev = SEV[item.ai_severity as keyof typeof SEV] || SEV.mild;
          const date = new Date(item.created_at);
          const confPct = item.ai_confidence != null ? Math.round(item.ai_confidence * 100) : null;
          return (
            <TouchableOpacity style={s.card} onPress={() => router.push(`/diagnosis/${item.id}`)}>
              <View style={s.cardHeader}>
                <View style={[s.sevBadge, { backgroundColor: sev.bg }]}>
                  <MaterialCommunityIcons name={sev.icon as any} size={16} color={sev.color} />
                  <Text style={[s.sevText, { color: sev.color }]}>{item.ai_severity || 'pending'}</Text>
                </View>
                <Text style={s.date}>{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</Text>
              </View>

              <Text style={s.diagnosis} numberOfLines={2}>{item.ai_diagnosis || 'Analysis in progress...'}</Text>

              {item.symptoms_text && <Text style={s.symptoms} numberOfLines={1}>Symptoms: {item.symptoms_text}</Text>}

              <View style={s.cardFooter}>
                {confPct != null && (
                  <View style={s.confWrap}>
                    <View style={s.confBar}><View style={[s.confFill, { width: `${confPct}%`, backgroundColor: sev.color }]} /></View>
                    <Text style={s.confText}>{confPct}%</Text>
                  </View>
                )}
                {item.ai_medications?.length > 0 && (
                  <View style={s.medBadge}>
                    <MaterialCommunityIcons name="pill" size={14} color="#1A73E8" />
                    <Text style={s.medText}>{item.ai_medications.length} medications</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sevBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  sevText: { fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  date: { fontSize: 12, color: '#9AA0A6' },
  diagnosis: { fontSize: 16, fontWeight: '600', color: '#202124', lineHeight: 22, marginBottom: 6 },
  symptoms: { fontSize: 13, color: '#5F6368', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  confWrap: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 8 },
  confBar: { flex: 1, height: 5, backgroundColor: '#F1F3F4', borderRadius: 3, overflow: 'hidden', maxWidth: 120 },
  confFill: { height: '100%', borderRadius: 3 },
  confText: { fontSize: 12, fontWeight: '700', color: '#5F6368' },
  medBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#E8F0FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  medText: { fontSize: 12, fontWeight: '600', color: '#1A73E8' },
  empty: { alignItems: 'center', paddingTop: 80, gap: 8 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#202124' },
  emptySub: { fontSize: 14, color: '#5F6368' },
  emptyBtn: { backgroundColor: '#1A73E8', paddingHorizontal: 28, paddingVertical: 14, borderRadius: 10, marginTop: 16 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
