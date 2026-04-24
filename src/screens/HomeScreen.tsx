import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../navigation/types';
import { getAllMeals } from '../database/database';
import { Meal } from '../types/meal';
import MealCard from '../components/MealCard';
import EmptyState from '../components/EmptyState';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

function getTodayLabel(dateStr: string): string {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  if (dateStr === today) return 'Hoje';
  if (dateStr === yesterday) return 'Ontem';
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

function groupByDate(meals: Meal[]): { date: string; data: Meal[] }[] {
  const map = new Map<string, Meal[]>();
  for (const meal of meals) {
    const list = map.get(meal.date) ?? [];
    list.push(meal);
    map.set(meal.date, list);
  }
  return Array.from(map.entries()).map(([date, data]) => ({ date, data }));
}

export default function HomeScreen({ navigation }: Props) {
  const [meals, setMeals] = useState<Meal[]>([]);

  useFocusEffect(
    useCallback(() => {
      setMeals(getAllMeals());
    }, [])
  );

  const groups = groupByDate(meals);
  const totalToday = meals.filter(
    (m) => m.date === new Date().toISOString().split('T')[0]
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />

      {/* Header */}
      <LinearGradient
        colors={['#FF6B6B', '#E85555']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 32,
          borderBottomLeftRadius: 32,
          borderBottomRightRadius: 32,
        }}
      >
        <View className="flex-row justify-between items-center">
          <View className="gap-0.5">
            <Text className="text-white/70 text-sm font-medium">Olá! 👋</Text>
            <Text className="text-white text-3xl font-bold">Minhas Refeições</Text>
          </View>
          <View
            className="rounded-2xl px-4 py-2 items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', minWidth: 64 }}
          >
            <Text className="text-white text-3xl font-black">{totalToday}</Text>
            <Text className="text-white/70 text-xs font-medium">hoje</Text>
          </View>
        </View>
      </LinearGradient>

      {/* List */}
      <FlatList
        data={groups}
        keyExtractor={(item) => item.date}
        contentContainerStyle={
          groups.length === 0 ? { flex: 1 } : { paddingTop: 20, paddingBottom: 100 }
        }
        ListEmptyComponent={<EmptyState />}
        renderItem={({ item }) => (
          <View>
            <View className="flex-row items-center px-4 my-2 gap-2">
              <Text className="text-dim text-xs font-bold uppercase tracking-widest">
                {getTodayLabel(item.date)}
              </Text>
              <View className="flex-1 h-px bg-border" />
            </View>
            {item.data.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => navigation.navigate('MealDetail', { mealId: meal.id })}
              />
            ))}
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        className="absolute bottom-8 right-5"
        onPress={() => navigation.navigate('AddMeal')}
        activeOpacity={0.8}
        style={{
          shadowColor: '#FF6B6B',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <LinearGradient
          colors={['#FF6B6B', '#E85555']}
          style={{ width: 60, height: 60, borderRadius: 30, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text className="text-white text-4xl font-light" style={{ marginTop: -2 }}>+</Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
}



