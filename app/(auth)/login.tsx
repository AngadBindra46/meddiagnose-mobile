import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../src/store/auth';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const { login, loading } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !password) { Alert.alert('Error', 'Enter email and password'); return; }
    try { await login(email.trim().toLowerCase(), password); }
    catch (e: any) { Alert.alert('Login Failed', e.response?.data?.detail || e.message); }
  };

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={s.inner}>
        <View style={s.iconWrap}>
          <MaterialCommunityIcons name="heart-pulse" size={48} color="#fff" />
        </View>
        <Text style={s.logo}>MedDiagnose</Text>
        <Text style={s.sub}>Upload your reports. Get instant AI diagnosis.</Text>

        <View style={s.inputWrap}>
          <MaterialCommunityIcons name="email-outline" size={20} color="#9AA0A6" style={{ marginLeft: 16 }} />
          <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="Your email" keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9AA0A6" />
        </View>

        <View style={s.inputWrap}>
          <MaterialCommunityIcons name="lock-outline" size={20} color="#9AA0A6" style={{ marginLeft: 16 }} />
          <TextInput style={s.input} value={password} onChangeText={setPassword} placeholder="Password" secureTextEntry={!showPwd} placeholderTextColor="#9AA0A6" />
          <TouchableOpacity onPress={() => setShowPwd(!showPwd)} style={{ paddingHorizontal: 16 }}>
            <MaterialCommunityIcons name={showPwd ? 'eye-off' : 'eye'} size={20} color="#9AA0A6" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.btn, loading && { opacity: 0.6 }]} onPress={handleLogin} disabled={loading}>
          <Text style={s.btnText}>{loading ? 'Signing in...' : 'Sign In'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => router.push('/(auth)/register')} style={s.link}>
          <Text style={s.linkText}>New here? <Text style={{ color: '#1A73E8', fontWeight: '700' }}>Create Account</Text></Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  inner: { flex: 1, justifyContent: 'center', paddingHorizontal: 32 },
  iconWrap: { width: 80, height: 80, borderRadius: 24, backgroundColor: '#1A73E8', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 20 },
  logo: { fontSize: 32, fontWeight: '800', color: '#202124', textAlign: 'center', letterSpacing: -0.5 },
  sub: { fontSize: 15, color: '#5F6368', textAlign: 'center', marginTop: 8, marginBottom: 40 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#DADCE0', borderRadius: 12, marginBottom: 14 },
  input: { flex: 1, paddingHorizontal: 12, paddingVertical: 16, fontSize: 16, color: '#202124' },
  btn: { backgroundColor: '#1A73E8', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  link: { alignItems: 'center', marginTop: 24 },
  linkText: { color: '#5F6368', fontSize: 15 },
});
