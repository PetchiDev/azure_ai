import { ResourceDetailScreen } from '@/features/resources/screens/ResourceDetailScreen';
import { useNavigation, useLocalSearchParams } from 'expo-router';

export default function ResourceDetailRoute() {
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  
  // Wrap params in the structure ResourceDetailScreen expects
  const route = { params };

  return <ResourceDetailScreen navigation={navigation} route={route} />;
}
