import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../navigation/types';
import { insertMeal, updateMeal } from '../database/database';
import {
  MealCategory,
  MealInput,
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from '../types/meal';
import { Colors } from '../theme';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMeal'>;

function todayDate() {
  return new Date().toISOString().split('T')[0];
}

function currentTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AddMealScreen({ navigation, route }: Props) {
  const editing = route.params?.meal;

  const [name, setName] = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [category, setCategory] = useState<MealCategory>(editing?.category ?? 'lunch');
  const [date, setDate] = useState(editing?.date ?? todayDate());
  const [time, setTime] = useState(editing?.time ?? currentTime());

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, informe o nome da refeição.');
      return;
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      Alert.alert('Data inválida', 'Use o formato AAAA-MM-DD. Ex: 2026-04-24');
      return;
    }
    if (!/^\d{2}:\d{2}$/.test(time)) {
      Alert.alert('Hora inválida', 'Use o formato HH:MM. Ex: 12:30');
      return;
    }

    const meal: MealInput = {
      name: name.trim(),
      description: description.trim(),
      category,
      date,
      time,
    };

    if (editing) {
      updateMeal(editing.id, meal);
    } else {
      insertMeal(meal);
    }
    navigation.goBack();
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <LinearGradient
          colors={['#4ECDC4', '#38B2AB']}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 16,
            paddingTop: 20,
            paddingBottom: 24,
            borderBottomLeftRadius: 32,
            borderBottomRightRadius: 32,
            gap: 12,
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
            <Text className="text-white text-2xl font-bold">←</Text>
          </TouchableOpacity>
          <Text className="text-white text-2xl font-bold">
            {editing ? '✏️ Editar' : '🍴 Nova Refeição'}
          </Text>
        </LinearGradient>

        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 20, paddingBottom: 48, gap: 4 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* Category */}
          <Text className="text-dim text-xs font-bold uppercase tracking-widest mt-4 mb-2">
            Categoria
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {CATEGORY_ORDER.map((cat) => {
              const active = cat === category;
              const catColor = Colors.category[cat];
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => setCategory(cat)}
                  activeOpacity={0.75}
                >
                  {active ? (
                    <LinearGradient
                      colors={Colors.categoryGradient[cat]}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 999,
                        gap: 6,
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{CATEGORY_EMOJI[cat]}</Text>
                      <Text className="text-white text-sm font-bold">
                        {CATEGORY_LABELS[cat]}
                      </Text>
                    </LinearGradient>
                  ) : (
                    <View
                      className="flex-row items-center rounded-full"
                      style={{
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        gap: 6,
                        backgroundColor: catColor + '20',
                        borderWidth: 1.5,
                        borderColor: catColor + '50',
                      }}
                    >
                      <Text style={{ fontSize: 18 }}>{CATEGORY_EMOJI[cat]}</Text>
                      <Text className="text-sm font-semibold" style={{ color: catColor }}>
                        {CATEGORY_LABELS[cat]}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Name */}
          <Text className="text-dim text-xs font-bold uppercase tracking-widest mt-5 mb-2">
            Nome da refeição *
          </Text>
          <TextInput
            className="bg-surface rounded-xl px-4 text-ink border border-border"
            style={{ paddingVertical: 12, fontSize: 15 }}
            value={name}
            onChangeText={setName}
            placeholder="Ex: Frango grelhado com legumes"
            placeholderTextColor="#B2BEC3"
            maxLength={80}
          />

          {/* Description */}
          <Text className="text-dim text-xs font-bold uppercase tracking-widest mt-5 mb-2">
            Descrição
          </Text>
          <TextInput
            className="bg-surface rounded-xl px-4 text-ink border border-border"
            style={{ paddingVertical: 12, fontSize: 15, minHeight: 80, textAlignVertical: 'top' }}
            value={description}
            onChangeText={setDescription}
            placeholder="Ingredientes, observações..."
            placeholderTextColor="#B2BEC3"
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          {/* Date & Time */}
          <View className="flex-row gap-4 mt-1">
            <View className="flex-1">
              <Text className="text-dim text-xs font-bold uppercase tracking-widest mt-5 mb-2">
                Data (AAAA-MM-DD)
              </Text>
              <TextInput
                className="bg-surface rounded-xl px-4 text-ink border border-border"
                style={{ paddingVertical: 12, fontSize: 15 }}
                value={date}
                onChangeText={setDate}
                placeholder="2026-04-24"
                placeholderTextColor="#B2BEC3"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View className="flex-1">
              <Text className="text-dim text-xs font-bold uppercase tracking-widest mt-5 mb-2">
                Hora (HH:MM)
              </Text>
              <TextInput
                className="bg-surface rounded-xl px-4 text-ink border border-border"
                style={{ paddingVertical: 12, fontSize: 15 }}
                value={time}
                onChangeText={setTime}
                placeholder="12:30"
                placeholderTextColor="#B2BEC3"
                keyboardType="numeric"
                maxLength={5}
              />
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            className="mt-8 rounded-2xl overflow-hidden"
            style={{
              shadowColor: '#FF6B6B',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.4,
              shadowRadius: 10,
              elevation: 6,
            }}
          >
            <LinearGradient
              colors={['#FF6B6B', '#E85555']}
              style={{ paddingVertical: 16, alignItems: 'center', borderRadius: 16 }}
            >
              <Text className="text-white text-base font-bold tracking-wide">
                {editing ? 'Salvar alterações' : 'Registrar refeição'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
