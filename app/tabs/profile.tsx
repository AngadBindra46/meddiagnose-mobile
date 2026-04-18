import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Modal, ActivityIndicator, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/store/auth';
import { LANGUAGES, setLanguage, getLanguage, Language } from '../../src/i18n';
import { isHealthKitAvailable, requestHealthKitAuthorization, readHealthData } from '../../src/services/healthKit';
import { wearableAPI } from '../../src/services/api';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [langModal, setLangModal] = useState(false);
  const [currentLang, setCurrentLang] = useState(getLanguage());
  const [healthSyncLoading, setHealthSyncLoading] = useState(false);

  const handleLogout = () => Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
    { text: 'Cancel', style: 'cancel' },
    { text: 'Sign Out', style: 'destructive', onPress: logout },
  ]);

  if (!user) return null;
  const initials = user.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2);

  return (
    <ScrollView style={s.container}>
      <View style={s.header}>
        <View style={s.avatar}><Text style={s.avatarText}>{initials}</Text></View>
        <Text style={s.name}>{user.full_name}</Text>
        <Text style={s.email}>{user.email}</Text>
      </View>

      <View style={s.section}>
        <Text style={s.sectionTitle}>Health Profile</Text>
        {user.gender && <InfoRow icon="gender-male-female" label="Gender" value={user.gender} />}
        {user.date_of_birth && <InfoRow icon="calendar" label="Date of Birth" value={user.date_of_birth} />}
        {user.blood_group && <InfoRow icon="water" label="Blood Group" value={user.blood_group} />}
        {user.allergies && <InfoRow icon="alert-circle-outline" label="Allergies" value={user.allergies} />}
        {user.weight_kg && <InfoRow icon="weight-kilogram" label="Weight" value={`${user.weight_kg} kg`} />}
        {user.phone && <InfoRow icon="phone" label="Phone" value={user.phone} />}
        {!user.gender && !user.date_of_birth && !user.blood_group && (
          <Text style={s.emptyProfile}>No health profile data added yet</Text>
        )}
      </View>

      {Platform.OS === 'ios' && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Health Data</Text>
          <TouchableOpacity
            style={[s.menuItem, healthSyncLoading && s.menuItemDisabled]}
            onPress={async () => {
              if (healthSyncLoading) return;
              if (!isHealthKitAvailable()) {
                Alert.alert('Apple Health', 'HealthKit requires a development build. Run "npx expo run:ios" instead of Expo Go.');
                return;
              }
              setHealthSyncLoading(true);
              try {
                const auth = await requestHealthKitAuthorization();
                if (!auth.authorized && auth.error) {
                  Alert.alert('Authorization', auth.error);
                  return;
                }
                const records = await readHealthData(30);
                if (records.length === 0) {
                  Alert.alert('No Data', 'No health data found for the last 30 days. Make sure Apple Health has data and you have granted access.');
                  return;
                }
                const { data } = await wearableAPI.syncAppleHealth(records, 'Apple Health');
                const total = ((data as any)?.records_created ?? 0) + ((data as any)?.records_updated ?? 0);
                Alert.alert('Sync Complete', `Synced ${total} health records to your fitness tracker.`);
              } catch (e: any) {
                Alert.alert('Sync Failed', e?.response?.data?.detail || e?.message || 'Could not sync Apple Health data.');
              } finally {
                setHealthSyncLoading(false);
              }
            }}
            disabled={healthSyncLoading}
          >
            {healthSyncLoading ? (
              <ActivityIndicator size="small" color="#1A73E8" />
            ) : (
              <MaterialCommunityIcons name="heart-pulse" size={20} color="#1A73E8" />
            )}
            <Text style={s.menuText}>
              {healthSyncLoading ? 'Syncing Apple Health…' : 'Connect & Sync Apple Health'}
            </Text>
            {!healthSyncLoading && <MaterialCommunityIcons name="chevron-right" size={20} color="#DADCE0" />}
          </TouchableOpacity>
        </View>
      )}

      <View style={s.section}>
        <Text style={s.sectionTitle}>App</Text>
        <MenuItem icon="translate" label={`Language — ${LANGUAGES.find(l => l.code === currentLang)?.nativeLabel || 'English'}`} onPress={() => setLangModal(true)} />
        <MenuItem icon="bell-outline" label="Notifications" />
        <MenuItem icon="shield-lock-outline" label="Privacy Policy" onPress={() => router.push('/privacy-policy')} />
        <MenuItem icon="file-document-outline" label="Terms of Service" onPress={() => router.push('/terms-of-service')} />
        <MenuItem icon="help-circle-outline" label="Help & Support" />
        <MenuItem icon="information-outline" label="About MedDiagnose" />
      </View>

      <Modal visible={langModal} transparent animationType="slide">
        <TouchableOpacity style={s.modalOverlay} activeOpacity={1} onPress={() => setLangModal(false)}>
          <View style={s.modalContent}>
            <Text style={s.modalTitle}>Select Language</Text>
            {LANGUAGES.map((lang) => (
              <TouchableOpacity key={lang.code} style={[s.langOption, currentLang === lang.code && s.langOptionActive]} onPress={async () => {
                await setLanguage(lang.code);
                setCurrentLang(lang.code);
                setLangModal(false);
                Alert.alert('Language Changed', `App language set to ${lang.label}. Some screens may need a restart to fully update.`);
              }}>
                <Text style={[s.langLabel, currentLang === lang.code && { color: '#1A73E8', fontWeight: '700' }]}>{lang.nativeLabel}</Text>
                <Text style={s.langSub}>{lang.label}</Text>
                {currentLang === lang.code && <MaterialCommunityIcons name="check-circle" size={20} color="#1A73E8" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
        <MaterialCommunityIcons name="logout" size={20} color="#EA4335" />
        <Text style={s.logoutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={s.version}>MedDiagnose v1.0.0</Text>
      <Text style={s.legal}>AI diagnosis is for informational purposes only. Always consult a licensed healthcare provider.</Text>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <View style={s.infoRow}>
      <MaterialCommunityIcons name={icon} size={20} color="#1A73E8" />
      <Text style={s.infoLabel}>{label}</Text>
      <Text style={s.infoValue}>{value}</Text>
    </View>
  );
}

function MenuItem({ icon, label, onPress }: any) {
  return (
    <TouchableOpacity style={s.menuItem} onPress={onPress}>
      <MaterialCommunityIcons name={icon} size={20} color="#5F6368" />
      <Text style={s.menuText}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={20} color="#DADCE0" />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  header: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff' },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 28, fontWeight: '700', color: '#1A73E8' },
  name: { fontSize: 22, fontWeight: '700', color: '#202124', marginTop: 16 },
  email: { fontSize: 14, color: '#5F6368', marginTop: 4 },
  section: { backgroundColor: '#fff', marginTop: 10 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1A73E8', padding: 16, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F1F3F4' },
  infoLabel: { flex: 1, fontSize: 14, color: '#5F6368' },
  infoValue: { fontSize: 14, fontWeight: '600', color: '#202124' },
  emptyProfile: { fontSize: 14, color: '#9AA0A6', paddingHorizontal: 16, paddingVertical: 14 },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F3F4' },
  menuItemDisabled: { opacity: 0.7 },
  menuText: { flex: 1, fontSize: 15, color: '#202124' },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 20, marginTop: 28, paddingVertical: 16, borderRadius: 12, borderWidth: 1.5, borderColor: '#EA4335' },
  logoutText: { fontSize: 16, fontWeight: '700', color: '#EA4335' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#202124', marginBottom: 20 },
  langOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F3F4', gap: 12 },
  langOptionActive: { backgroundColor: '#E8F0FE', marginHorizontal: -8, paddingHorizontal: 8, borderRadius: 10 },
  langLabel: { fontSize: 16, color: '#202124', flex: 1 },
  langSub: { fontSize: 13, color: '#5F6368' },
  version: { textAlign: 'center', color: '#9AA0A6', fontSize: 12, marginTop: 24 },
  legal: { textAlign: 'center', color: '#9AA0A6', fontSize: 11, marginTop: 8, marginHorizontal: 32, marginBottom: 32, lineHeight: 16 },
});
