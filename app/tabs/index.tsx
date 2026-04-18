import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { diagnosisAPI } from '../../src/services/api';

export default function HomeScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [recent, setRecent] = useState<any[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      const r = await diagnosisAPI.list({ per_page: 5 });
      const items = r.data.items || [];
      setRecent(items);
      setStats({ total: r.data.total, completed: items.filter((i: any) => i.status === 'completed').length });
    } catch {}
  };

  useEffect(() => { load(); }, []);
  const refresh = async () => { setRefreshing(true); await load(); setRefreshing(false); };

  const firstName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <ScrollView style={s.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}>
      <View style={s.hero}>
        <Text style={s.greeting}>Hello, {firstName} 👋</Text>
        <Text style={s.heroSub}>How are you feeling today?</Text>
      </View>

      <TouchableOpacity style={s.uploadCTA} onPress={() => router.push('/tabs/upload')}>
        <View style={s.ctaIcon}>
          <MaterialCommunityIcons name="file-document-edit" size={32} color="#1A73E8" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.ctaTitle}>Upload Medical Report</Text>
          <Text style={s.ctaSub}>Get AI-powered diagnosis with medications</Text>
        </View>
        <MaterialCommunityIcons name="arrow-right-circle" size={28} color="#1A73E8" />
      </TouchableOpacity>

      <View style={s.statsRow}>
        <View style={s.statCard}>
          <MaterialCommunityIcons name="file-document-multiple" size={24} color="#1A73E8" />
          <Text style={s.statVal}>{stats.total}</Text>
          <Text style={s.statLabel}>Total Reports</Text>
        </View>
        <View style={s.statCard}>
          <MaterialCommunityIcons name="check-decagram" size={24} color="#34A853" />
          <Text style={s.statVal}>{stats.completed}</Text>
          <Text style={s.statLabel}>Diagnosed</Text>
        </View>
      </View>

      {recent.length > 0 && (
        <>
          <View style={s.sectionHeader}>
            <Text style={s.sectionTitle}>Recent Diagnoses</Text>
            <TouchableOpacity onPress={() => router.push('/tabs/reports')}><Text style={s.seeAll}>See All</Text></TouchableOpacity>
          </View>
          {recent.slice(0, 3).map((d) => (
            <TouchableOpacity key={d.id} style={s.reportCard} onPress={() => router.push(`/diagnosis/${d.id}`)}>
              <View style={[s.sevDot, { backgroundColor: d.ai_severity === 'severe' ? '#EA4335' : d.ai_severity === 'moderate' ? '#EA8600' : '#34A853' }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.reportTitle} numberOfLines={1}>{d.ai_diagnosis || 'Processing...'}</Text>
                <Text style={s.reportMeta}>{d.symptoms_text?.substring(0, 50) || 'No symptoms'} • {new Date(d.created_at).toLocaleDateString()}</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#DADCE0" />
            </TouchableOpacity>
          ))}
        </>
      )}

      <View style={s.infoCard}>
        <MaterialCommunityIcons name="shield-check" size={20} color="#1A73E8" />
        <Text style={s.infoText}>Your data is encrypted and confidential. AI diagnosis is for guidance — always consult a doctor for treatment.</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  hero: { padding: 24, paddingBottom: 20, backgroundColor: '#1A73E8' },
  greeting: { fontSize: 26, fontWeight: '800', color: '#fff' },
  heroSub: { fontSize: 15, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  uploadCTA: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', margin: 16, marginTop: -1, padding: 20, borderRadius: 16, gap: 16, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  ctaIcon: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  ctaTitle: { fontSize: 16, fontWeight: '700', color: '#202124' },
  ctaSub: { fontSize: 13, color: '#5F6368', marginTop: 2 },
  statsRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 12 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 20, alignItems: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  statVal: { fontSize: 28, fontWeight: '800', color: '#202124' },
  statLabel: { fontSize: 12, color: '#5F6368', fontWeight: '500' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginTop: 24, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#202124' },
  seeAll: { fontSize: 14, color: '#1A73E8', fontWeight: '600' },
  reportCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 8, padding: 16, borderRadius: 12, gap: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  sevDot: { width: 10, height: 10, borderRadius: 5 },
  reportTitle: { fontSize: 15, fontWeight: '600', color: '#202124' },
  reportMeta: { fontSize: 12, color: '#5F6368', marginTop: 2 },
  infoCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#E8F0FE', margin: 16, marginTop: 24, padding: 16, borderRadius: 12 },
  infoText: { flex: 1, fontSize: 12, color: '#1A73E8', lineHeight: 18 },
});
