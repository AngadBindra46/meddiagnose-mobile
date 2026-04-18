import { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator, Image, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { diagnosisAPI } from '../../src/services/api';

export default function UploadScreen() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [files, setFiles] = useState<any[]>([]);
  const [vitals, setVitals] = useState<{
    systolic?: number; diastolic?: number; spo2?: number; heartRate?: number;
    temperature?: number; respiratoryRate?: number; bloodSugar?: number; weightKg?: number; painLevel?: number;
    ecgNotes?: string;
  }>({});
  const [analyzing, setAnalyzing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const startVoiceInput = async () => {
    try {
      const ExpoSpeechRecognition = require('expo-speech-recognition');
      if (!ExpoSpeechRecognition) throw new Error('Not available');

      const { status } = await ExpoSpeechRecognition.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Microphone access is needed for voice input.');
        return;
      }
      setIsListening(true);
      ExpoSpeechRecognition.start({ lang: 'en-US' });
      ExpoSpeechRecognition.addOnResultListener((event: any) => {
        if (event.results?.[0]?.transcript) {
          setSymptoms((prev) => prev ? `${prev} ${event.results[0].transcript}` : event.results[0].transcript);
        }
      });
      ExpoSpeechRecognition.addOnEndListener(() => setIsListening(false));
    } catch {
      Alert.alert(
        'Voice Input',
        Platform.OS === 'web'
          ? 'Voice input is not supported in web preview. It works on iOS/Android devices.'
          : 'Voice input requires the expo-speech-recognition package. Install it with: npx expo install expo-speech-recognition',
      );
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    try {
      const ExpoSpeechRecognition = require('expo-speech-recognition');
      ExpoSpeechRecognition?.stop();
    } catch {}
    setIsListening(false);
  };

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: true, quality: 0.8 });
    if (!result.canceled) setFiles((p) => [...p, ...result.assets.map((a) => ({ uri: a.uri, name: a.fileName || 'photo.jpg', type: 'image/jpeg', preview: a.uri }))]);
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) { Alert.alert('Permission required', 'Camera access is needed to take photos of reports'); return; }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 });
    if (!result.canceled) setFiles((p) => [...p, ...result.assets.map((a) => ({ uri: a.uri, name: a.fileName || 'report-photo.jpg', type: 'image/jpeg', preview: a.uri }))]);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });
    if (!result.canceled && result.assets?.[0]) {
      const a = result.assets[0];
      setFiles((p) => [...p, { uri: a.uri, name: a.name, type: a.mimeType || 'application/pdf' }]);
    }
  };

  const removeFile = (idx: number) => setFiles((p) => p.filter((_, i) => i !== idx));

  const analyze = async () => {
    if (!symptoms.trim()) { Alert.alert('Required', 'Please describe your symptoms'); return; }
    setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append('symptoms', symptoms.trim());
      fd.append('clinical_notes', notes.trim());
      files.forEach((f) => fd.append('files', { uri: f.uri, name: f.name, type: f.type } as any));
      if (vitals.systolic != null) fd.append('vitals_systolic', String(vitals.systolic));
      if (vitals.diastolic != null) fd.append('vitals_diastolic', String(vitals.diastolic));
      if (vitals.spo2 != null) fd.append('vitals_spo2', String(vitals.spo2));
      if (vitals.heartRate != null) fd.append('vitals_heart_rate', String(vitals.heartRate));
      if (vitals.temperature != null) fd.append('vitals_temperature', String(vitals.temperature));
      if (vitals.respiratoryRate != null) fd.append('vitals_respiratory_rate', String(vitals.respiratoryRate));
      if (vitals.bloodSugar != null) fd.append('vitals_blood_sugar', String(vitals.bloodSugar));
      if (vitals.weightKg != null) fd.append('vitals_weight_kg', String(vitals.weightKg));
      if (vitals.painLevel != null) fd.append('vitals_pain_level', String(vitals.painLevel));
      if (vitals.ecgNotes) fd.append('vitals_ecg_notes', vitals.ecgNotes);

      const r = await diagnosisAPI.analyze(fd);
      setSymptoms('');
      setNotes('');
      setFiles([]);
      setVitals({});
      router.push(`/diagnosis/${r.data.id}`);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.detail || 'Failed to analyze. Please try again.');
    } finally { setAnalyzing(false); }
  };

  return (
    <ScrollView style={s.container} keyboardShouldPersistTaps="handled">
      <View style={s.section}>
        <View style={s.stepBadge}><Text style={s.stepNum}>1</Text></View>
        <Text style={s.sectionTitle}>Describe Your Symptoms *</Text>
        <Text style={s.hint}>Tell us what you're experiencing — type or use the microphone</Text>
        <View style={{ position: 'relative' }}>
          <TextInput
            style={s.textArea}
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="e.g., I've had a persistent cough for 3 days, mild fever (100°F), sore throat, and body aches..."
            placeholderTextColor="#9AA0A6"
            multiline
            numberOfLines={5}
          />
          <TouchableOpacity
            style={[s.micBtn, isListening && s.micBtnActive]}
            onPress={isListening ? stopVoiceInput : startVoiceInput}
          >
            <MaterialCommunityIcons
              name={isListening ? 'microphone-off' : 'microphone'}
              size={22}
              color={isListening ? '#fff' : '#1A73E8'}
            />
          </TouchableOpacity>
        </View>
        {isListening && (
          <View style={s.listeningBanner}>
            <ActivityIndicator size="small" color="#1A73E8" />
            <Text style={s.listeningText}>Listening... Speak your symptoms</Text>
          </View>
        )}
      </View>

      <View style={s.section}>
        <View style={s.stepBadge}><Text style={s.stepNum}>2</Text></View>
        <Text style={s.sectionTitle}>Upload Medical Reports</Text>
        <Text style={s.hint}>Lab results, prescriptions, X-rays, or any medical documents (optional)</Text>

        <View style={s.mediaButtons}>
          <TouchableOpacity style={s.mediaBtn} onPress={takePhoto}>
            <MaterialCommunityIcons name="camera" size={24} color="#1A73E8" />
            <Text style={s.mediaBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.mediaBtn} onPress={pickImages}>
            <MaterialCommunityIcons name="image-multiple" size={24} color="#34A853" />
            <Text style={s.mediaBtnText}>Gallery</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.mediaBtn} onPress={pickDocument}>
            <MaterialCommunityIcons name="file-pdf-box" size={24} color="#EA4335" />
            <Text style={s.mediaBtnText}>PDF</Text>
          </TouchableOpacity>
        </View>

        {files.length > 0 && (
          <View style={s.fileList}>
            {files.map((f, i) => (
              <View key={i} style={s.fileItem}>
                {f.preview ? (
                  <Image source={{ uri: f.preview }} style={s.fileThumb} />
                ) : (
                  <View style={[s.fileThumb, { backgroundColor: '#FDECEA', alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="file-pdf-box" size={20} color="#EA4335" />
                  </View>
                )}
                <Text style={s.fileName} numberOfLines={1}>{f.name}</Text>
                <TouchableOpacity onPress={() => removeFile(i)}><MaterialCommunityIcons name="close-circle" size={22} color="#EA4335" /></TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={s.section}>
        <View style={s.stepBadge}><Text style={s.stepNum}>3</Text></View>
        <Text style={s.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={s.notesInput}
          value={notes}
          onChangeText={setNotes}
          placeholder="Any other relevant information — existing conditions, current medications..."
          placeholderTextColor="#9AA0A6"
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={s.section}>
        <View style={s.stepBadge}><Text style={s.stepNum}>4</Text></View>
        <Text style={s.sectionTitle}>Vital Signs (optional)</Text>
        <Text style={s.hint}>BP machine, oximeter, or ECG report — helps improve diagnosis accuracy</Text>
        <View style={s.vitalsRow}>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>Systolic</Text>
            <TextInput style={s.vitalsInput} value={vitals.systolic != null ? String(vitals.systolic) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, systolic: t ? parseInt(t, 10) : undefined }))} placeholder="120" keyboardType="number-pad" />
          </View>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>Diastolic</Text>
            <TextInput style={s.vitalsInput} value={vitals.diastolic != null ? String(vitals.diastolic) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, diastolic: t ? parseInt(t, 10) : undefined }))} placeholder="80" keyboardType="number-pad" />
          </View>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>SpO2 %</Text>
            <TextInput style={s.vitalsInput} value={vitals.spo2 != null ? String(vitals.spo2) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, spo2: t ? parseInt(t, 10) : undefined }))} placeholder="98" keyboardType="number-pad" />
          </View>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>HR bpm</Text>
            <TextInput style={s.vitalsInput} value={vitals.heartRate != null ? String(vitals.heartRate) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, heartRate: t ? parseInt(t, 10) : undefined }))} placeholder="72" keyboardType="number-pad" />
          </View>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>Temp °F</Text>
            <TextInput style={s.vitalsInput} value={vitals.temperature != null ? String(vitals.temperature) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, temperature: t ? parseFloat(t) : undefined }))} placeholder="98.6" keyboardType="decimal-pad" />
          </View>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>RR /min</Text>
            <TextInput style={s.vitalsInput} value={vitals.respiratoryRate != null ? String(vitals.respiratoryRate) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, respiratoryRate: t ? parseInt(t, 10) : undefined }))} placeholder="16" keyboardType="number-pad" />
          </View>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>Glucose</Text>
            <TextInput style={s.vitalsInput} value={vitals.bloodSugar != null ? String(vitals.bloodSugar) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, bloodSugar: t ? parseInt(t, 10) : undefined }))} placeholder="100" keyboardType="number-pad" />
          </View>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>Weight kg</Text>
            <TextInput style={s.vitalsInput} value={vitals.weightKg != null ? String(vitals.weightKg) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, weightKg: t ? parseFloat(t) : undefined }))} placeholder="70" keyboardType="decimal-pad" />
          </View>
          <View style={s.vitalsField}>
            <Text style={s.vitalsLabel}>Pain 0-10</Text>
            <TextInput style={s.vitalsInput} value={vitals.painLevel != null ? String(vitals.painLevel) : ''} onChangeText={(t) => setVitals((v) => ({ ...v, painLevel: t ? parseInt(t, 10) : undefined }))} placeholder="0" keyboardType="number-pad" />
          </View>
        </View>
        <TextInput
          style={[s.notesInput, { marginTop: 12 }]}
          value={vitals.ecgNotes ?? ''}
          onChangeText={(t) => setVitals((v) => ({ ...v, ecgNotes: t || undefined }))}
          placeholder="ECG interpretation: e.g. Normal sinus rhythm, ST elevation..."
          placeholderTextColor="#9AA0A6"
        />
      </View>

      <View style={{ paddingHorizontal: 20, paddingBottom: 40 }}>
        {analyzing ? (
          <View style={s.analyzingWrap}>
            <ActivityIndicator size="large" color="#1A73E8" />
            <Text style={s.analyzingText}>Analyzing your reports...</Text>
            <Text style={s.analyzingSub}>Our AI is reviewing your symptoms and reports</Text>
          </View>
        ) : (
          <TouchableOpacity style={s.analyzeBtn} onPress={analyze}>
            <MaterialCommunityIcons name="stethoscope" size={22} color="#fff" />
            <Text style={s.analyzeBtnText}>Get AI Diagnosis</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  section: { backgroundColor: '#fff', marginTop: 10, padding: 20, position: 'relative' },
  stepBadge: { position: 'absolute', top: 16, right: 16, width: 28, height: 28, borderRadius: 14, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  stepNum: { fontSize: 14, fontWeight: '800', color: '#1A73E8' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#202124', marginBottom: 4 },
  hint: { fontSize: 13, color: '#5F6368', marginBottom: 16, lineHeight: 18 },
  textArea: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#DADCE0', borderRadius: 12, padding: 16, fontSize: 15, color: '#202124', minHeight: 120, textAlignVertical: 'top', lineHeight: 22 },
  notesInput: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#DADCE0', borderRadius: 12, padding: 16, fontSize: 15, color: '#202124', minHeight: 80, textAlignVertical: 'top' },
  mediaButtons: { flexDirection: 'row', gap: 12 },
  mediaBtn: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 20, borderWidth: 1.5, borderColor: '#DADCE0', borderRadius: 12, borderStyle: 'dashed', backgroundColor: '#FAFAFA' },
  mediaBtnText: { fontSize: 13, fontWeight: '600', color: '#5F6368' },
  fileList: { marginTop: 16, gap: 8 },
  fileItem: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#F8F9FA', padding: 10, borderRadius: 10 },
  fileThumb: { width: 40, height: 40, borderRadius: 8 },
  fileName: { flex: 1, fontSize: 13, color: '#202124', fontWeight: '500' },
  analyzeBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#1A73E8', paddingVertical: 18, borderRadius: 14, shadowColor: '#1A73E8', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  analyzeBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
  analyzingWrap: { alignItems: 'center', paddingVertical: 32, gap: 12 },
  analyzingText: { fontSize: 16, fontWeight: '700', color: '#1A73E8' },
  analyzingSub: { fontSize: 13, color: '#5F6368' },
  micBtn: { position: 'absolute', right: 10, bottom: 10, width: 40, height: 40, borderRadius: 20, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center' },
  micBtnActive: { backgroundColor: '#EA4335' },
  listeningBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#E8F0FE', padding: 10, borderRadius: 8, marginTop: 8 },
  listeningText: { fontSize: 13, color: '#1A73E8', fontWeight: '600' },
  vitalsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  vitalsField: { flex: 1, minWidth: 70 },
  vitalsLabel: { fontSize: 11, color: '#5F6368', marginBottom: 4, fontWeight: '600' },
  vitalsInput: { backgroundColor: '#F8F9FA', borderWidth: 1, borderColor: '#DADCE0', borderRadius: 10, padding: 12, fontSize: 14, color: '#202124' },
});
