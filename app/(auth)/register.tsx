import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform, KeyboardAvoidingView } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [allergies, setAllergies] = useState('');
  const [phone, setPhone] = useState('');
  const [weight, setWeight] = useState('');
  const { register, loading } = useAuth();
  const router = useRouter();

  const handleRegister = async () => {
    if (!name || !email || !password) { Alert.alert('Error', 'Name, email & password are required'); return; }
    if (password.length < 8) { Alert.alert('Error', 'Password must be at least 8 characters'); return; }
    try {
      await register({
        full_name: name, email: email.trim().toLowerCase(), password,
        gender: gender || undefined, date_of_birth: dob || undefined,
        blood_group: bloodGroup || undefined, allergies: allergies || undefined,
        phone: phone || undefined, weight_kg: weight ? parseFloat(weight) : undefined,
      });
    } catch (e: any) { Alert.alert('Failed', e.response?.data?.detail || e.message); }
  };

  const genders = ['Male', 'Female', 'Other'];
  const bloods = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.inner} keyboardShouldPersistTaps="handled">
        <View style={s.iconWrap}>
          <MaterialCommunityIcons name="account-plus" size={36} color="#fff" />
        </View>
        <Text style={s.logo}>Create Account</Text>
        <Text style={s.sub}>Your health information helps us provide better diagnosis</Text>

        <Text style={s.sectionTitle}>Account Details</Text>
        <Input icon="account" placeholder="Full Name *" value={name} onChangeText={setName} />
        <Input icon="email-outline" placeholder="Email *" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <Input icon="lock-outline" placeholder="Password * (min 8 chars)" value={password} onChangeText={setPassword} secureTextEntry />
        <Input icon="phone" placeholder="Phone Number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

        <Text style={s.sectionTitle}>Health Profile</Text>

        <Text style={s.label}>Gender</Text>
        <View style={s.chips}>
          {genders.map((g) => (
            <TouchableOpacity key={g} style={[s.chip, gender === g && s.chipActive]} onPress={() => setGender(g)}>
              <Text style={[s.chipText, gender === g && { color: '#fff' }]}>{g}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input icon="calendar" placeholder="Date of Birth (YYYY-MM-DD)" value={dob} onChangeText={setDob} />

        <Text style={s.label}>Blood Group</Text>
        <View style={s.chips}>
          {bloods.map((b) => (
            <TouchableOpacity key={b} style={[s.chip, s.chipSmall, bloodGroup === b && s.chipActive]} onPress={() => setBloodGroup(b)}>
              <Text style={[s.chipText, bloodGroup === b && { color: '#fff' }]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input icon="alert-circle-outline" placeholder="Allergies (e.g., Penicillin, Dust)" value={allergies} onChangeText={setAllergies} />
        <Input icon="weight-kilogram" placeholder="Weight (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleRegister} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Creating...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.back()} style={s.link}>
          <Text style={s.linkText}>Already have an account? <Text style={{ color: '#1A73E8', fontWeight: '700' }}>Sign In</Text></Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Input({ icon, ...props }: any) {
  return (
    <View style={s.inputWrap}>
      <MaterialCommunityIcons name={icon} size={20} color="#9AA0A6" style={{ marginLeft: 16 }} />
      <TextInput style={s.input} placeholderTextColor="#9AA0A6" autoCapitalize="none" {...props} />
    </View>
  );
}

const s = StyleSheet.create({
  inner: { flexGrow: 1, paddingHorizontal: 32, paddingVertical: 48, backgroundColor: '#F8F9FA' },
  iconWrap: { width: 72, height: 72, borderRadius: 20, backgroundColor: '#1A73E8', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  logo: { fontSize: 28, fontWeight: '800', color: '#202124', textAlign: 'center' },
  sub: { fontSize: 14, color: '#5F6368', textAlign: 'center', marginTop: 8, marginBottom: 28 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: '#1A73E8', marginTop: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  label: { fontSize: 13, fontWeight: '600', color: '#202124', marginBottom: 8, marginTop: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#DADCE0', borderRadius: 12, marginBottom: 12 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 14, fontSize: 15, color: '#202124' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: '#DADCE0', backgroundColor: '#fff' },
  chipSmall: { paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: '#1A73E8', borderColor: '#1A73E8' },
  chipText: { fontSize: 14, color: '#5F6368', fontWeight: '500' },
  btn: { backgroundColor: '#1A73E8', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 20, marginBottom: 24 },
  linkText: { color: '#5F6368', fontSize: 14 },
});
