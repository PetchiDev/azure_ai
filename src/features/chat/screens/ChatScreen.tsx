import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated as RNAnimated,
} from 'react-native';
import { THEME } from '@/constants/theme';

import { ChatMessage, ConversationContext } from '../types/chat.types';
import { parseIntent } from '../services/chatIntentParser';
import { executeIntent, continueCreation } from '../services/chatAzureExecutor';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Bot, User, ChevronRight } from 'lucide-react-native';

const SUGGESTIONS = [
  'List all resources',
  'Show blob storage',
  'Check billing',
  'Show activity logs',
  'Who has access',
  'Show function apps',
];

const generateId = () => Math.random().toString(36).slice(2);

const WELCOME: ChatMessage = {
  id: 'welcome',
  role: 'assistant',
  text: "👋 Hi! I'm your **Azure AI Assistant**.\n\nI can help you manage your cloud resources using natural language. Try asking me something!",
  timestamp: new Date(),
};

// ── Sub-component: Data Table ──────────────────────────────────────────
function DataTable({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;
  const keys = Object.keys(data[0]);

  return (
    <View style={styles.tableContainer}>
      <View style={styles.tableHeader}>
        {keys.map(k => (
          <Text key={k} style={styles.tableHeaderCell}>{k.toUpperCase()}</Text>
        ))}
      </View>
      {data.slice(0, 8).map((row, i) => (
        <View key={i} style={[styles.tableRow, i % 2 === 0 && styles.tableRowAlt]}>
          {keys.map(k => (
            <Text key={k} style={styles.tableCell} numberOfLines={1}>{String(row[k] ?? '—')}</Text>
          ))}
        </View>
      ))}
      {data.length > 8 && (
        <Text style={styles.tableMore}>+{data.length - 8} more</Text>
      )}
    </View>
  );
}

// ── Sub-component: Message Bubble ──────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.messageRow, isUser && styles.messageRowUser]}>
      <View style={[styles.avatar, isUser ? styles.avatarUser : styles.avatarAssistant]}>
        {isUser
          ? <User size={14} color="white" />
          : <Bot size={14} color={THEME.colors.primary} />
        }
      </View>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <RenderMarkdown text={message.text} isUser={isUser} />
        {message.data && <DataTable data={message.data} />}
        <Text style={styles.timestamp}>
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );
}

// Simple bold/italic renderer
function RenderMarkdown({ text, isUser }: { text: string; isUser: boolean }) {
  const color = isUser ? 'white' : THEME.colors.onSurface;
  const parts = text.split(/(\*\*[^*]+\*\*|_[^_]+_)/);

  return (
    <Text>
      {parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <Text key={i} style={[styles.msgText, { color, fontWeight: 'bold' }]}>{part.slice(2, -2)}</Text>;
        }
        if (part.startsWith('_') && part.endsWith('_')) {
          return <Text key={i} style={[styles.msgText, { color, opacity: 0.7, fontStyle: 'italic' }]}>{part.slice(1, -1)}</Text>;
        }
        return <Text key={i} style={[styles.msgText, { color }]}>{part}</Text>;
      })}
    </Text>
  );
}

// ── Sub-component: Typing Indicator ───────────────────────────────────
function TypingIndicator() {
  return (
    <View style={[styles.messageRow]}>
      <View style={[styles.avatar, styles.avatarAssistant]}>
        <Bot size={14} color={THEME.colors.primary} />
      </View>
      <View style={[styles.bubble, styles.bubbleAssistant, styles.typingBubble]}>
        <ActivityIndicator size="small" color={THEME.colors.primary} />
        <Text style={[styles.msgText, { color: THEME.colors.onSurfaceVariant, marginLeft: 8 }]}>
          Querying Azure...
        </Text>
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export const ChatScreen = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // Track multi-step guided creation state
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const listRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      text: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      let result;

      if (conversationContext) {
        // We're in the middle of a guided creation — pipe the answer through
        result = await continueCreation(conversationContext, text.trim());
      } else {
        const intent = parseIntent(text.trim());
        result = await executeIntent(intent);
      }

      // Update context for next turn
      setConversationContext(result.nextContext ?? null);

      const botMsg: ChatMessage = {
        id: generateId(),
        role: result.isError ? 'error' : 'assistant',
        text: result.summary,
        data: result.data,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      setConversationContext(null);
      setMessages(prev => [...prev, {
        id: generateId(),
        role: 'error',
        text: `❌ Unexpected error: ${err.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
      scrollToBottom();
    }
  }, [isLoading, scrollToBottom, conversationContext]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient
        colors={THEME.colors.kineticGradient as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Bot size={22} color="white" />
        <Text style={styles.headerTitle}>Azure AI Assistant</Text>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>LIVE</Text>
        </View>
      </LinearGradient>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        contentContainerStyle={styles.listContent}
        onLayout={scrollToBottom}
        style={styles.list}
      />

      {/* Suggestions */}
      {messages.length <= 1 && (
        <View style={styles.suggestions}>
          <FlatList
            horizontal
            data={SUGGESTIONS}
            keyExtractor={s => s}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.chip} onPress={() => sendMessage(item)}>
                <ChevronRight size={12} color={THEME.colors.primary} style={{ marginRight: 4 }} />
                <Text style={styles.chipText}>{item}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Input Bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask Azure anything..."
            placeholderTextColor={THEME.colors.onSurfaceVariant}
            multiline
            maxLength={500}
            onSubmitEditing={() => sendMessage(inputText)}
            returnKeyType="send"
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
            onPress={() => sendMessage(inputText)}
            disabled={!inputText.trim() || isLoading}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="white" />
              : <Send size={18} color="white" />
            }
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'ios' ? 52 : 16,
    paddingBottom: 16,
    gap: 10,
  },
  headerTitle: {
    ...THEME.typography.h2,
    color: 'white',
    flex: 1,
    fontSize: 17,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  headerBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  list: { flex: 1 },
  listContent: { padding: 12, paddingBottom: 8 },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-end',
    gap: 8,
  },
  messageRowUser: { flexDirection: 'row-reverse' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarUser: { backgroundColor: THEME.colors.primary },
  avatarAssistant: {
    backgroundColor: THEME.colors.surfaceContainerHighest || THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.primary,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    padding: 12,
  },
  bubbleUser: {
    backgroundColor: THEME.colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: THEME.colors.surfaceContainerLowest || THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.outlineVariant,
    borderBottomLeftRadius: 4,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  msgText: {
    ...THEME.typography.body,
    lineHeight: 20,
  },
  timestamp: {
    ...THEME.typography.label,
    fontSize: 9,
    opacity: 0.5,
    marginTop: 6,
  },

  // Table
  tableContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: THEME.colors.outlineVariant,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.primary + '22',
    padding: 6,
  },
  tableHeaderCell: {
    flex: 1,
    ...THEME.typography.label,
    fontSize: 9,
    color: THEME.colors.primary,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 6,
  },
  tableRowAlt: {
    backgroundColor: THEME.colors.surfaceContainerLowest || 'rgba(255,255,255,0.03)',
  },
  tableCell: {
    flex: 1,
    ...THEME.typography.label,
    fontSize: 10,
    color: THEME.colors.onSurfaceVariant,
  },
  tableMore: {
    ...THEME.typography.label,
    fontSize: 10,
    color: THEME.colors.primary,
    textAlign: 'center',
    padding: 6,
  },

  // Suggestions
  suggestions: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.outlineVariant,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.surface,
    borderWidth: 1,
    borderColor: THEME.colors.primary + '55',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
  },
  chipText: {
    ...THEME.typography.label,
    fontSize: 11,
    color: THEME.colors.primary,
  },

  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 10,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    backgroundColor: THEME.colors.surface,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.outlineVariant,
    gap: 8,
  },
  input: {
    flex: 1,
    ...THEME.typography.body,
    color: THEME.colors.onSurface,
    backgroundColor: THEME.colors.surfaceContainerLowest || THEME.colors.background,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxHeight: 120,
    borderWidth: 1,
    borderColor: THEME.colors.outlineVariant,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: THEME.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
