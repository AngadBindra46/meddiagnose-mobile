import { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { chatAPI } from '../src/services/api';

interface Message { id: number; role: string; content: string; created_at: string; }

export default function ChatScreen() {
  const params = useLocalSearchParams<{ diagnosisId?: string }>();
  const diagnosisId = params.diagnosisId ? Number(params.diagnosisId) : undefined;
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await chatAPI.history(diagnosisId);
        setMessages(r.data);
      } catch {}
      setLoading(false);
    })();
  }, [diagnosisId]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setInput('');
    setSending(true);

    const tempMsg: Message = { id: Date.now(), role: 'user', content: text, created_at: new Date().toISOString() };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const r = await chatAPI.send(text, diagnosisId);
      setMessages(r.data.history);
    } catch {
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'assistant', content: 'Sorry, something went wrong. Please try again.', created_at: new Date().toISOString() }]);
    }
    setSending(false);
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[s.msgRow, isUser && s.msgRowUser]}>
        {!isUser && (
          <View style={s.botAvatar}>
            <MaterialCommunityIcons name="robot" size={18} color="#1A73E8" />
          </View>
        )}
        <View style={[s.bubble, isUser ? s.bubbleUser : s.bubbleBot]}>
          <Text style={[s.msgText, isUser && { color: '#fff' }]}>{item.content}</Text>
        </View>
      </View>
    );
  };

  if (loading) return <View style={s.loader}><ActivityIndicator size="large" color="#1A73E8" /></View>;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={90}>
      {messages.length === 0 ? (
        <View style={s.welcome}>
          <View style={s.welcomeIcon}><MaterialCommunityIcons name="robot-happy" size={48} color="#1A73E8" /></View>
          <Text style={s.welcomeTitle}>MedDiagnose AI Assistant</Text>
          <Text style={s.welcomeSub}>Ask me about medications, side effects, diet, exercise, or any health questions.</Text>
          <View style={s.suggestions}>
            {['Can I take this with milk?', 'What foods should I avoid?', 'When should I see a doctor?', 'What are the side effects?'].map((q) => (
              <TouchableOpacity key={q} style={s.sugBtn} onPress={() => { setInput(q); }}>
                <Text style={s.sugText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(m) => String(m.id)}
          renderItem={renderMessage}
          contentContainerStyle={s.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={s.inputBar}>
        <TextInput
          style={s.textInput}
          value={input}
          onChangeText={setInput}
          placeholder="Ask a health question..."
          placeholderTextColor="#9AA0A6"
          multiline
          maxLength={500}
        />
        <TouchableOpacity style={[s.sendBtn, (!input.trim() || sending) && { opacity: 0.4 }]} onPress={send} disabled={!input.trim() || sending}>
          {sending ? <ActivityIndicator size="small" color="#fff" /> : <MaterialCommunityIcons name="send" size={20} color="#fff" />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  messageList: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowUser: { justifyContent: 'flex-end' },
  botAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  bubble: { maxWidth: '78%', borderRadius: 16, padding: 14 },
  bubbleUser: { backgroundColor: '#1A73E8', borderBottomRightRadius: 4 },
  bubbleBot: { backgroundColor: '#fff', borderBottomLeftRadius: 4, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  msgText: { fontSize: 14, color: '#202124', lineHeight: 20 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', padding: 12, paddingBottom: Platform.OS === 'ios' ? 28 : 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E8EAED', gap: 8 },
  textInput: { flex: 1, backgroundColor: '#F8F9FA', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: '#202124', maxHeight: 100 },
  sendBtn: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#1A73E8', alignItems: 'center', justifyContent: 'center' },
  welcome: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  welcomeIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F0FE', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  welcomeTitle: { fontSize: 22, fontWeight: '800', color: '#202124', marginBottom: 8 },
  welcomeSub: { fontSize: 14, color: '#5F6368', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  suggestions: { gap: 8, width: '100%' },
  sugBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#DADCE0', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 16 },
  sugText: { fontSize: 14, color: '#1A73E8', fontWeight: '500' },
});
