import React, { useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useAuthStore } from '../../../store/useAuthStore';
import { useNavigation } from '@react-navigation/native';


import { ChatMessage, ConversationContext } from '../types/chat.types';
import { parseIntent } from '../services/chatIntentParser';
import { executeIntent, continueCreation } from '../services/chatAzureExecutor';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Bot, User, ChevronRight, Sparkles, Plus, Search, MessageSquare, Globe, Cpu, Zap, Activity, Info, CircleAlert, CircleCheck, Mic, LogOut } from 'lucide-react-native';

const SUGGESTIONS = [
  'Empty storage accounts?',
  'Security audit for VMs',
  'Monthly cost report',
  'Delete my test app',
  'Create premium SQL DB',
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
  const dataArray = Array.isArray(data) ? data : (data ? [data] : []);
  const validData = dataArray.filter(item => item !== null && item !== undefined);
  if (validData.length === 0) return null;
  const keys = Object.keys(validData[0]);

  return (
    <View className="mt-4 rounded-md overflow-hidden border border-outline-variant/10 bg-surface-container">
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          <View className="flex-row bg-surface-container-high p-3 border-b border-outline-variant/10">
            {keys.map(k => (
              <Text key={k} className="w-24 text-[9px] font-bold text-primary uppercase tracking-wider">{k}</Text>
            ))}
          </View>
          {validData.slice(0, 8).map((row, i) => (
            <View key={i} className={`flex-row p-3 ${i % 2 === 0 ? 'bg-transparent' : 'bg-surface-container-low/30'}`}>
              {keys.map(k => (
                <Text key={k} className="w-24 text-[10px] font-medium text-on-surface-variant" numberOfLines={1}>
                  {(() => {
                    const val = row[k];
                    if (val && typeof val === 'object') {
                      return val.name || val.displayName || val.text || JSON.stringify(val);
                    }
                    return String(val ?? '—');
                  })()}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </ScrollView>
      {data.length > 8 && (
        <View className="py-2 bg-surface-container-high border-t border-outline-variant/10">
          <Text className="text-[9px] font-bold text-primary text-center uppercase tracking-widest">+{data.length - 8} MORE ITEMS</Text>
        </View>
      )}
    </View>
  );
}

// ── Sub-component: Message Bubble ──────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  return (
    <View className={`flex-col mb-8 gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
      {!isUser && (
        <View className="flex-row items-center gap-2 mb-2 px-1">
          <View className="w-1.5 h-1.5 rounded-full bg-primary" />
          <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">[ KINETIC_CORE ]</Text>
        </View>
      )}
      
      <View className={`flex-row max-w-[90%] items-end gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <View className={`w-8 h-8 rounded-md items-center justify-center flex-shrink-0 shadow-sm ${isUser ? 'bg-primary' : 'bg-surface-container border border-outline-variant/10'}`}>
          {isUser
            ? <User size={16} color="white" />
            : <Bot size={16} color="#904d00" />
          }
        </View>
        
        <View className={`flex-1 p-4 rounded-md shadow-kinetic ${isUser ? 'bg-primary rounded-br-none' : 'bg-surface-container-low border border-outline-variant/10 rounded-bl-none'} ${isError ? 'border-error-container bg-error-container/10' : ''}`}>
          <RenderMarkdown text={message.text} isUser={isUser} isError={isError} />
          {message.data && <DataTable data={message.data} />}
          
          <View className="flex-row items-center justify-between mt-3 opacity-30">
             <Text className={`text-[8px] font-bold uppercase tracking-tighter ${isUser ? 'text-white' : 'text-on-surface-variant'}`}>
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
             </Text>
             {isUser && <CircleCheck size={8} color="white" />}
          </View>
        </View>
      </View>
    </View>
  );
}

// Improved Markdown renderer for lists and formatting
function RenderMarkdown({ text, isUser, isError }: { text: string; isUser: boolean; isError?: boolean }) {
  const textColor = isUser ? 'text-white' : (isError ? 'text-error' : 'text-on-surface');
  
  // Split by lines to handle bullet points and blocks
  const lines = text.split('\n');

  return (
    <View className="gap-1.5">
      {lines.map((line, lineIdx) => {
        const trimmedLine = line.trim();
        
        // Handle Bullet Points
        const isBullet = trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ') || trimmedLine.startsWith('• ');
        const isHeader = trimmedLine.startsWith('#');
        
        // Handle bold/italic in the line
        const parts = line.split(/(\*\*[^*]+\*\*|_[^_]+_)/);

        return (
          <View key={lineIdx} className={`flex-row ${isBullet ? 'pl-4' : ''}`}>
             {isBullet && <Text className={`mr-2 ${textColor} opacity-60`}>•</Text>}
             <Text className="flex-1 leading-relaxed">
               {parts.map((part, i) => {
                 if (part.startsWith('**') && part.endsWith('**')) {
                   return <Text key={i} className={`text-sm ${isHeader ? 'text-base font-extrabold' : 'font-bold'} ${textColor}`}>{part.slice(2, -2)}</Text>;
                 }
                 if (part.startsWith('_') && part.endsWith('_')) {
                   return <Text key={i} className={`text-sm italic opacity-80 ${textColor}`}>{part.slice(1, -1)}</Text>;
                 }
                 if (isHeader) {
                    return <Text key={i} className={`text-base font-extrabold ${textColor}`}>{part.replace(/^#+\s/, '')}</Text>;
                 }
                 return <Text key={i} className={`text-sm font-medium ${textColor}`}>{part}</Text>;
               })}
             </Text>
          </View>
        );
      })}
    </View>
  );
}

// ── Sub-component: Typing Indicator ───────────────────────────────────
function TypingIndicator() {
  return (
    <View className="flex-row mb-8 items-end gap-3">
      <View className="w-8 h-8 rounded-md bg-surface-container border border-outline-variant/10 items-center justify-center shadow-sm">
        <Bot size={16} color="#904d00" />
      </View>
      <View className="bg-surface-container-low border border-outline-variant/5 p-4 rounded-md rounded-bl-none shadow-kinetic flex-row items-center gap-3">
        <ActivityIndicator size="small" color="#904d00" />
        <View>
          <Text className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-none mb-1">Kinetic Intelligence</Text>
          <Text className="text-[9px] font-medium text-primary uppercase tracking-tighter">Analyzing Cloud Topology...</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ────────────────────────────────────────────────────────
export const ChatScreen = ({ navigation }: { navigation: any }) => {
  const { user, accessToken, logout } = useAuthStore();


  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationContext, setConversationContext] = useState<ConversationContext | null>(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const listRef = useRef<FlatList>(null);

  const getInitials = () => {
    if (accessToken) {
      try {
        const payload = accessToken.split('.')[1];
        if (payload) {
          const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
          const decoded = typeof atob !== 'undefined' ? atob(base64) : Buffer.from(base64, 'base64').toString('utf8');
          const parsed = JSON.parse(decoded);
          if (parsed.given_name || parsed.family_name) {
             const g = parsed.given_name?.[0] || '';
             const f = parsed.family_name?.[0] || '';
             return (g + f).toUpperCase();
          }
        }
      } catch (e) {}
    }
    // Fallback
    const name = user?.name;
    if (!name) return 'U';
    const parts = name.split(/[. _-]/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };


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
      // Map history for contextual intent discovery
      const history = messages.slice(-5).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const result = await executeIntent({ 
        rawInput: text.trim(), 
        action: 'unknown', 
        entity: 'resource', 
        params: {} 
      }, history);

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
    <View className="flex-1 bg-surface font-body text-on-surface">
      {/* Top AppBar */}
      <View className="flex-row items-center justify-between px-6 pt-14 pb-4 bg-surface-container-lowest shadow-sm border-b border-outline-variant/10 z-50">
        {/* Left: Logo */}
        <View className="flex-row items-center gap-1.5">
           <View className="w-5 h-5 rounded-sm bg-primary items-center justify-center">
              <Zap size={12} color="white" />
           </View>
           <Text className="text-sm font-black tracking-[3px] text-on-surface uppercase">Kinetic</Text>
        </View>

        
        {/* Right: Avatar & Dropdown */}
        <View className="flex-row items-center gap-4 relative">
          <TouchableOpacity className="w-10 h-10 rounded-md bg-surface-container flex items-center justify-center active:scale-95 transition-all">
             <Search size={18} color="#564334" />
          </TouchableOpacity>
          
          <View className="relative">
            <TouchableOpacity 
              onPress={() => setShowDropdown(!showDropdown)}
              className="w-10 h-10 rounded-full bg-primary flex items-center justify-center overflow-hidden border border-outline-variant/20 shadow-sm active:scale-95 transition-all"
            >
              <Text className="text-white font-bold text-lg tracking-widest">{getInitials()}</Text>
            </TouchableOpacity>

            {/* Dropdown Menu */}
            {showDropdown && (
              <View className="absolute top-12 right-0 w-36 bg-surface-container-lowest border border-outline-variant/10 rounded-md shadow-premium overflow-hidden z-50">
                <TouchableOpacity 
                  onPress={handleLogout}
                  className="w-full flex-row items-center gap-3 px-4 py-3 bg-error-container/10 active:bg-error-container/30 transition-all border-l-2 border-error"
                >
                  <LogOut size={16} color="#ba1a1a" />
                  <Text className="text-sm font-bold text-error">Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Hero Section from Design */}
      {messages.length <= 1 && (
        <View className="px-6 py-10 items-center">
            <View className="px-4 py-1.5 rounded-full bg-orange-50 border border-orange-100 flex-row items-center gap-2 mb-6">
                <View className="w-2 h-2 rounded-full bg-primary" />
                <Text className="text-[10px] font-bold text-primary uppercase tracking-[0.1em]">Kinetic Intelligence Active</Text>
            </View>
            <Text className="text-4xl font-extrabold text-on-surface text-center tracking-tighter leading-[1.1] font-headline">
                How can I architect your cloud today?
            </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={({ item }) => <MessageBubble message={item} />}
        ListFooterComponent={isLoading ? <TypingIndicator /> : null}
        contentContainerStyle={{ padding: 20, paddingBottom: 140 }}
        onLayout={scrollToBottom}
        className="flex-1"
      />

      {/* Input Bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View className="px-6 pb-[110px] pt-4 bg-surface-container-lowest border-t border-outline-variant/10">
          
          {/* Suggestions Layer */}
          {messages.length <= 1 && !inputText && (
            <View>
              <Text className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-[0.2em] mb-4 ml-1">Optimize Performance</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2 mb-6">
                {SUGGESTIONS.map((item) => (
                  <TouchableOpacity 
                    key={item} 
                    onPress={() => sendMessage(item)}
                    className="bg-surface-container-high px-5 py-2.5 rounded-full border border-outline-variant/5 shadow-sm active:bg-orange-50 active:scale-95 transition-all"
                  >
                    <Text className="text-[10px] font-bold text-primary uppercase tracking-widest">{item}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Main Input area matching Design */}
          <View className="flex-row items-center bg-surface-container-highest rounded-full p-1.5 shadow-kinetic border border-transparent focus-within:border-primary">
             <TouchableOpacity className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mr-2 active:scale-95 transition-all">
                <Plus size={20} color="#564334" />
             </TouchableOpacity>
             
             <TextInput
               className="flex-1 text-sm font-medium text-on-surface min-h-[44px] max-h-32 px-3 outline-none border-0"
               value={inputText}
               onChangeText={setInputText}
               placeholder="Ask Kinetic Intelligence..."
               placeholderTextColor="#56433480"
               multiline
             />

             <TouchableOpacity className="p-2 mr-1">
                <Mic size={20} color="#564334" opacity={0.6} />
             </TouchableOpacity>

             <TouchableOpacity
               onPress={() => sendMessage(inputText)}
               disabled={!inputText.trim() || isLoading}
               className={`w-12 h-12 rounded-full items-center justify-center transition-all ${!inputText.trim() || isLoading ? 'bg-surface-container' : 'bg-primary shadow-premium'}`}
             >
                {isLoading 
                  ? <ActivityIndicator size="small" color="white" /> 
                  : <Send size={20} color="white" />
                }
             </TouchableOpacity>
          </View>
          <Text className="text-[10px] text-center text-on-surface-variant/40 mt-3 font-medium">Kinetic AI can make mistakes. Verify critical infrastructure changes.</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

