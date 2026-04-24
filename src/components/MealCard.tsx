import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Meal, CATEGORY_EMOJI, CATEGORY_LABELS } from '../types/meal';
import { Colors } from '../theme';

interface MealCardProps {
  meal: Meal;
  onPress: () => void;
}

export default function MealCard({ meal, onPress }: MealCardProps) {
  const gradient = Colors.categoryGradient[meal.category];
  const catColor = Colors.category[meal.category];

  return (
    <TouchableOpacity className="mx-4 my-1.5" onPress={onPress} activeOpacity={0.85}>
      <View
        className="bg-surface rounded-2xl flex-row items-center p-4 gap-4"
        style={{
          shadowColor: '#00000020',
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 1,
          shadowRadius: 8,
          elevation: 3,
        }}
      >
        <LinearGradient
          colors={gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text style={{ fontSize: 26 }}>{CATEGORY_EMOJI[meal.category]}</Text>
        </LinearGradient>

        <View className="flex-1 gap-1">
          <Text className="text-ink text-base font-bold" numberOfLines={1}>
            {meal.name}
          </Text>
          {meal.description ? (
            <Text className="text-dim text-sm" numberOfLines={1}>
              {meal.description}
            </Text>
          ) : null}
          <View className="flex-row items-center justify-between mt-1">
            <View className="px-2 py-0.5 rounded-full" style={{ backgroundColor: catColor + '30' }}>
              <Text className="text-xs font-semibold" style={{ color: catColor }}>
                {CATEGORY_LABELS[meal.category]}
              </Text>
            </View>
            <Text className="text-muted text-xs">{meal.time}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}



