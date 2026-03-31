import { ChatScreen } from '@/features/chat/screens/ChatScreen';
import { useNavigation } from 'expo-router';

export default function ChatRoute() {
  const navigation = useNavigation();
  return <ChatScreen navigation={navigation} />;
}
