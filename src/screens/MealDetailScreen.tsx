import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../navigation/types';
import { getMealById, deleteMeal } from '../database/database';
import { Meal, CATEGORY_EMOJI, CATEGORY_LABELS } from '../types/meal';
import { Colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'MealDetail'>;

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}/${y}`;
}

export default function MealDetailScreen({ navigation, route }: Props) {
  const { mealId } = route.params;
  const [meal, setMeal] = useState<Meal | null>(null);

  useFocusEffect(
    useCallback(() => {
      const found = getMealById(mealId);
      if (!found) { navigation.goBack(); return; }
      setMeal(found);
    }, [mealId])
  );

  function handleDelete() {
    Alert.alert(
      'Excluir refeição',
      `Deseja excluir "${meal?.name}"? Essa ação não pode ser desfeita.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => { deleteMeal(mealId); navigation.goBack(); },
        },
      ]
    );
  }

  if (!meal) return null;

  const gradient = Colors.categoryGradient[meal.category];

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* Hero header */}
      <LinearGradient
        colors={gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          paddingTop: 20,
          paddingBottom: 36,
          paddingHorizontal: 16,
          borderBottomLeftRadius: 40,
          borderBottomRightRadius: 40,
          alignItems: 'center',
        }}
      >
        <View className="w-full flex-row justify-between mb-4">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
            <Text className="text-white text-2xl font-bold">←</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate('AddMeal', { meal })}
            className="p-1"
          >
            <Text style={{ fontSize: 22 }}>✏️</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ fontSize: 60 }}>{CATEGORY_EMOJI[meal.category]}</Text>
        <Text
          className="text-white text-2xl font-bold text-center mt-3"
          style={{ maxWidth: 260 }}
        >
          {meal.name}
        </Text>
        <View
          className="mt-3 px-4 py-1 rounded-full"
          style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
        >
          <Text className="text-white font-bold text-sm">
            {CATEGORY_LABELS[meal.category]}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 12 }}
      >
        {/* Date & Time cards */}
        <View className="flex-row gap-3 mt-2">
          {[
            { icon: '📅', label: 'Data', value: formatDate(meal.date) },
            { icon: '🕐', label: 'Hora', value: meal.time },
          ].map((item) => (
            <View
              key={item.label}
              className="flex-1 bg-surface rounded-2xl items-center py-4 gap-1"
              style={{
                shadowColor: '#00000015',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 1,
                shadowRadius: 6,
                elevation: 2,
              }}
            >
              <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              <Text className="text-dim text-xs font-bold uppercase tracking-widest">
                {item.label}
              </Text>
              <Text className="text-ink text-base font-bold">{item.value}</Text>
            </View>
          ))}
        </View>

        {/* Description */}
        <View
          className="bg-surface rounded-2xl p-4 gap-2"
          style={{
            shadowColor: '#00000015',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 1,
            shadowRadius: 6,
            elevation: 2,
          }}
        >
          <Text className="text-ink text-base font-bold">📝 Descrição</Text>
          <Text
            className={
              meal.description
                ? 'text-dim text-base leading-6'
                : 'text-muted text-base italic'
            }
          >
            {meal.description || 'Sem descrição.'}
          </Text>
        </View>

        {/* Registered at */}
        <Text className="text-muted text-xs text-center mt-1">
          Registrado em{' '}
          {new Date(meal.created_at).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
          })}
        </Text>

        {/* Delete Button */}
        <TouchableOpacity
          onPress={handleDelete}
          activeOpacity={0.85}
          className="mt-2 rounded-2xl border-2 border-danger py-4 items-center"
          style={{ backgroundColor: '#FF767512' }}
        >
          <Text className="text-danger text-base font-bold">🗑️ Excluir refeição</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
