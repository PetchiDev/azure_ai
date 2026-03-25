import React from 'react';
import { View, StyleSheet, Pressable, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from 'react-native-reanimated';
import { LucideIcon, Home, Layers, Sparkles, TrendingUp, Settings } from 'lucide-react-native';
import { COLORS, BORDER_RADIUS } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const TAB_ICONS: Record<string, LucideIcon> = {
  dashboard: Home,
  resources: Layers,
  nlp: Sparkles,
  costs: TrendingUp,
  settings: Settings,
};

export const CustomTabBar: React.FC<TabBarProps> = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  
  return (
    <View style={[styles.container, { bottom: insets.bottom + 16 }]}>
      <BlurView intensity={30} tint="dark" style={styles.blurContainer}>
        <View style={styles.tabItemsContainer}>
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const Icon = TAB_ICONS[route.name] || Home;

            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <Pressable
                key={route.key}
                onPress={onPress}
                style={styles.tabItem}
              >
                <AnimatedItem active={isFocused}>
                  <Icon
                    size={24}
                    color={isFocused ? COLORS.primary : COLORS.text.secondary}
                  />
                </AnimatedItem>
              </Pressable>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
};

const AnimatedItem = ({ active, children }: { active: boolean; children: React.ReactNode }) => {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(active ? 1.2 : 1, { damping: 12, stiffness: 300 });
  }, [active]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[styles.itemContent, animatedStyle]}>
      {children}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignSelf: 'center',
    width: '90%',
    height: 64,
  },
  blurContainer: {
    flex: 1,
    borderRadius: BORDER_RADIUS.full,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  tabItemsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
});
