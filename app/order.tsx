import { OrderFlowScreen } from '@/features/resources/screens/OrderFlowScreen';
import { useNavigation } from 'expo-router';

export default function OrderRoute() {
  const navigation = useNavigation();
  return <OrderFlowScreen navigation={navigation} />;
}
