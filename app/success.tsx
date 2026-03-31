import { OrderSuccessScreen } from '@/features/resources/screens/OrderSuccessScreen';
import { useNavigation } from 'expo-router';

export default function SuccessRoute() {
  const navigation = useNavigation();
  return <OrderSuccessScreen navigation={navigation} />;
}
