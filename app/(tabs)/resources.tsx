import { ResourceListScreen } from '@/features/resources/screens/ResourceListScreen';
import { useNavigation } from 'expo-router';

export default function ResourcesRoute() {
  const navigation = useNavigation();
  return <ResourceListScreen navigation={navigation} />;
}
