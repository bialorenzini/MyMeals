import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';

import { RootStackParamList } from '../navigation/types';
import { insertMeal, updateMeal, getIngredientsByMealId, replaceIngredients } from '../database/database';
import {
  MealCategory,
  MealInput,
  CATEGORY_EMOJI,
  CATEGORY_LABELS,
  CATEGORY_ORDER,
} from '../types/meal';
import { Colors } from '../theme';
import FoodSearchModal from '../components/FoodSearchModal';
import { FoodItem } from '../services/foodSearch';

type Props = NativeStackScreenProps<RootStackParamList, 'AddMeal'>;

interface FoodEntry {
  id: string;
  food: FoodItem;
  grams: number;
}

function computeMacros(food: FoodItem, grams: number) {
  const f = grams / 100;
  return {
    calories: Math.round(food.calories * f),
    protein:  Math.round(food.protein  * f * 10) / 10,
    carbs:    Math.round(food.carbs    * f * 10) / 10,
    fat:      Math.round(food.fat      * f * 10) / 10,
  };
}

function initDate(dateStr?: string): Date {
  if (dateStr) return new Date(dateStr + 'T12:00:00');
  return new Date();
}

function initTime(timeStr?: string): Date {
  const d = new Date();
  if (timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    d.setHours(h, m, 0, 0);
  }
  return d;
}

function formatDateDisplay(d: Date): string {
  return d.toLocaleDateString('pt-BR', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric',
  });
}

function formatTime(d: Date): string {
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export default function AddMealScreen({ navigation, route }: Props) {
  const editing = route.params?.meal;

  const [name, setName]               = useState(editing?.name ?? '');
  const [description, setDescription] = useState(editing?.description ?? '');
  const [category, setCategory]       = useState<MealCategory>(editing?.category ?? 'lunch');
  const [pickedDate, setPickedDate]   = useState<Date>(() => initDate(editing?.date));
  const [pickedTime, setPickedTime]   = useState<Date>(() => initTime(editing?.time));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [foodEntries, setFoodEntries] = useState<FoodEntry[]>(() => {
    if (!editing) return [];
    // Carrega ingredientes já salvos para edição
    return getIngredientsByMealId(editing.id).map((ing) => ({
      id: `saved-${ing.id}`,
      grams: ing.grams,
      food: {
        name: ing.name,
        brand: ing.brand,
        calories: ing.grams > 0 ? Math.round((ing.calories / ing.grams) * 100) : ing.calories,
        protein:  ing.grams > 0 ? Math.round((ing.protein  / ing.grams) * 1000) / 10 : ing.protein,
        carbs:    ing.grams > 0 ? Math.round((ing.carbs    / ing.grams) * 1000) / 10 : ing.carbs,
        fat:      ing.grams > 0 ? Math.round((ing.fat      / ing.grams) * 1000) / 10 : ing.fat,
      },
    }));
  });
  const [searchVisible, setSearchVisible] = useState(false);

  // Computed totals from all entries
  const totals = foodEntries.reduce(
    (acc, e) => {
      const m = computeMacros(e.food, e.grams);
      return {
        calories: acc.calories + m.calories,
        protein:  Math.round((acc.protein + m.protein) * 10) / 10,
        carbs:    Math.round((acc.carbs   + m.carbs)   * 10) / 10,
        fat:      Math.round((acc.fat     + m.fat)     * 10) / 10,
      };
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  // If no entries, keep existing values when editing; otherwise use computed totals
  const macrosToSave = foodEntries.length > 0
    ? totals
    : { calories: editing?.calories ?? 0, protein: editing?.protein ?? 0, carbs: editing?.carbs ?? 0, fat: editing?.fat ?? 0 };

  function handleFoodSelect(food: FoodItem) {
    if (!name.trim()) setName(food.name);
    const id = `${Date.now()}-${Math.random()}`;
    setFoodEntries((prev) => [...prev, { id, food, grams: 100 }]);
    setSearchVisible(false);
  }

  function updateGrams(id: string, text: string) {
    const g = Math.max(0, parseInt(text, 10) || 0);
    setFoodEntries((prev) => prev.map((e) => (e.id === id ? { ...e, grams: g } : e)));
  }

  function removeEntry(id: string) {
    setFoodEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function handleSave() {
    if (!name.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, informe o nome da refeição.');
      return;
    }

    const meal: MealInput = {
      name:        name.trim(),
      description: description.trim(),
      category,
      date:        pickedDate.toISOString().split('T')[0],
      time:        formatTime(pickedTime),
      ...macrosToSave,
    };

    if (editing) {
      updateMeal(editing.id, meal);
    } else {
      const newId = insertMeal(meal);
      if (foodEntries.length > 0) {
        replaceIngredients(newId, foodEntries.map((e) => ({
          name:     e.food.name,
          brand:    e.food.brand,
          grams:    e.grams,
          ...computeMacros(e.food, e.grams),
        })));
      }
      navigation.goBack();
      return;
    }
    // Ao editar, sempre substitui os ingredientes (mesmo que vazio = limpa)
    if (editing) {
      replaceIngredients(editing.id, foodEntries.map((e) => ({
        name:     e.food.name,
        brand:    e.food.brand,
        grams:    e.grams,
        ...computeMacros(e.food, e.grams),
      })));
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
              const active    = cat === category;
              const catColor  = Colors.category[cat];
              return (
                <TouchableOpacity key={cat} onPress={() => setCategory(cat)} activeOpacity={0.75}>
                  {active ? (
                    <LinearGradient
                      colors={Colors.categoryGradient[cat]}
                      style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, gap: 6 }}
                    >
                      <Text style={{ fontSize: 18 }}>{CATEGORY_EMOJI[cat]}</Text>
                      <Text className="text-white text-sm font-bold">{CATEGORY_LABELS[cat]}</Text>
                    </LinearGradient>
                  ) : (
                    <View
                      className="flex-row items-center rounded-full"
                      style={{ paddingHorizontal: 14, paddingVertical: 8, gap: 6, backgroundColor: catColor + '20', borderWidth: 1.5, borderColor: catColor + '50' }}
                    >
                      <Text style={{ fontSize: 18 }}>{CATEGORY_EMOJI[cat]}</Text>
                      <Text className="text-sm font-semibold" style={{ color: catColor }}>{CATEGORY_LABELS[cat]}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Date & Time pickers */}
          <View className="flex-row gap-3 mt-5">
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-1 bg-surface rounded-xl p-3 border border-border flex-row items-center gap-2"
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 22 }}>📅</Text>
              <View className="flex-1">
                <Text className="text-muted" style={{ fontSize: 10 }}>DATA</Text>
                <Text className="text-ink text-sm font-semibold" numberOfLines={1}>
                  {formatDateDisplay(pickedDate)}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              className="bg-surface rounded-xl p-3 border border-border flex-row items-center gap-2"
              style={{ minWidth: 90 }}
              activeOpacity={0.75}
            >
              <Text style={{ fontSize: 22 }}>🕐</Text>
              <View>
                <Text className="text-muted" style={{ fontSize: 10 }}>HORA</Text>
                <Text className="text-ink text-base font-bold">{formatTime(pickedTime)}</Text>
              </View>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={pickedDate}
              mode="date"
              display="default"
              onChange={(_: DateTimePickerEvent, selected?: Date) => {
                setShowDatePicker(false);
                if (selected) setPickedDate(selected);
              }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={pickedTime}
              mode="time"
              is24Hour
              display="default"
              onChange={(_: DateTimePickerEvent, selected?: Date) => {
                setShowTimePicker(false);
                if (selected) setPickedTime(selected);
              }}
            />
          )}

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
            style={{ paddingVertical: 12, fontSize: 15, minHeight: 72, textAlignVertical: 'top' }}
            value={description}
            onChangeText={setDescription}
            placeholder="Ingredientes, observações..."
            placeholderTextColor="#B2BEC3"
            multiline
            numberOfLines={3}
            maxLength={200}
          />

          {/* Food / macro section */}
          <View className="flex-row items-center justify-between mt-6 mb-2">
            <Text className="text-dim text-xs font-bold uppercase tracking-widest">
              🥗 Ingredientes
            </Text>
            <TouchableOpacity
              onPress={() => setSearchVisible(true)}
              activeOpacity={0.8}
              className="flex-row items-center gap-1 rounded-full px-3 py-1"
              style={{ backgroundColor: '#4ECDC420', borderWidth: 1, borderColor: '#4ECDC460' }}
            >
              <Text style={{ fontSize: 14, color: '#38B2AB', fontWeight: '900' }}>+</Text>
              <Text className="text-xs font-bold" style={{ color: '#38B2AB' }}>Adicionar</Text>
            </TouchableOpacity>
          </View>

          {foodEntries.length === 0 ? (
            <>
              {/* Ao editar: mostra os macros já salvos */}
              {editing && (editing.calories > 0 || editing.protein > 0) && (
                <View
                  className="rounded-2xl p-3 mb-2 gap-2"
                  style={{ backgroundColor: '#4ECDC410', borderWidth: 1, borderColor: '#4ECDC440' }}
                >
                  <Text className="text-dim text-xs font-semibold">
                    Valores salvos — adicione ingredientes para recalcular
                  </Text>
                  <View className="flex-row flex-wrap gap-1">
                    {[
                      { emoji: '🔥', value: editing.calories, unit: 'kcal', color: '#FF6B6B' },
                      { emoji: '🥩', value: editing.protein,  unit: 'g prot', color: '#4ECDC4' },
                      { emoji: '🌾', value: editing.carbs,    unit: 'g carb', color: '#FFB347' },
                      { emoji: '🫒', value: editing.fat,      unit: 'g gord', color: '#9B89C9' },
                    ].map((pill) => (
                      <View
                        key={pill.unit}
                        className="flex-row items-center rounded-full px-2 py-0.5 gap-0.5"
                        style={{ backgroundColor: pill.color + '22' }}
                      >
                        <Text style={{ fontSize: 11 }}>{pill.emoji}</Text>
                        <Text className="text-xs font-semibold" style={{ color: pill.color }}>
                          {pill.value} {pill.unit}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
              <TouchableOpacity
                onPress={() => setSearchVisible(true)}
                activeOpacity={0.7}
                className="rounded-2xl items-center justify-center py-6"
                style={{ borderWidth: 1.5, borderColor: '#4ECDC440', borderStyle: 'dashed', backgroundColor: '#4ECDC408' }}
              >
                <Text style={{ fontSize: 30 }}>🔍</Text>
                <Text className="text-dim text-sm font-semibold mt-1">Buscar alimento</Text>
                <Text className="text-muted text-xs mt-0.5">Pesquise e adicione os ingredientes</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="gap-2">
              {foodEntries.map((entry) => {
                const m = computeMacros(entry.food, entry.grams);
                return (
                  <View
                    key={entry.id}
                    className="bg-surface rounded-2xl p-3 gap-2"
                    style={{ borderWidth: 1, borderColor: '#DFE6E9' }}
                  >
                    {/* Name + remove */}
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 mr-2">
                        <Text className="text-ink text-sm font-bold" numberOfLines={2}>{entry.food.name}</Text>
                        {entry.food.brand ? (
                          <Text className="text-muted text-xs">{entry.food.brand}</Text>
                        ) : null}
                      </View>
                      <TouchableOpacity onPress={() => removeEntry(entry.id)} className="p-1">
                        <Text style={{ color: '#FF7675', fontWeight: 'bold', fontSize: 16 }}>✕</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Grams input */}
                    <View className="flex-row items-center gap-2">
                      <Text className="text-dim text-xs">Quantidade:</Text>
                      <TextInput
                        className="bg-background rounded-lg px-3 text-ink border border-border text-center font-bold"
                        style={{ paddingVertical: 5, fontSize: 14, minWidth: 64 }}
                        value={entry.grams > 0 ? String(entry.grams) : ''}
                        onChangeText={(t) => updateGrams(entry.id, t)}
                        keyboardType="numeric"
                        maxLength={5}
                        placeholder="100"
                        placeholderTextColor="#B2BEC3"
                      />
                      <Text className="text-ink text-sm font-semibold">g</Text>
                    </View>

                    {/* Macro pills */}
                    <View className="flex-row flex-wrap gap-1">
                      {[
                        { emoji: '🔥', value: m.calories, unit: 'kcal', color: '#FF6B6B' },
                        { emoji: '🥩', value: m.protein,  unit: 'g prot', color: '#4ECDC4' },
                        { emoji: '🌾', value: m.carbs,    unit: 'g carb', color: '#FFB347' },
                        { emoji: '🫒', value: m.fat,      unit: 'g gord', color: '#9B89C9' },
                      ].map((pill) => (
                        <View
                          key={pill.unit}
                          className="flex-row items-center rounded-full px-2 py-0.5 gap-0.5"
                          style={{ backgroundColor: pill.color + '22' }}
                        >
                          <Text style={{ fontSize: 10 }}>{pill.emoji}</Text>
                          <Text className="text-xs font-semibold" style={{ color: pill.color }}>
                            {pill.value} {pill.unit}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                );
              })}

              {/* Total card */}
              <View
                className="rounded-2xl p-3"
                style={{ backgroundColor: '#2D343612' }}
              >
                <Text className="text-ink text-xs font-bold mb-2">Total da refeição</Text>
                <View className="flex-row flex-wrap gap-2">
                  {[
                    { emoji: '🔥', label: 'kcal',   value: totals.calories, color: '#FF6B6B' },
                    { emoji: '🥩', label: 'g prot',  value: totals.protein,  color: '#4ECDC4' },
                    { emoji: '🌾', label: 'g carb',  value: totals.carbs,    color: '#FFB347' },
                    { emoji: '🫒', label: 'g gord',  value: totals.fat,      color: '#9B89C9' },
                  ].map((t) => (
                    <View
                      key={t.label}
                      className="flex-row items-center gap-1 rounded-full px-3 py-1"
                      style={{ backgroundColor: t.color + '25' }}
                    >
                      <Text style={{ fontSize: 14 }}>{t.emoji}</Text>
                      <Text className="font-black text-sm" style={{ color: t.color }}>{t.value}</Text>
                      <Text className="text-xs" style={{ color: t.color + 'cc' }}>{t.label}</Text>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            activeOpacity={0.85}
            className="mt-8 rounded-2xl overflow-hidden"
            style={{ shadowColor: '#FF6B6B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 }}
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

      <FoodSearchModal
        visible={searchVisible}
        onClose={() => setSearchVisible(false)}
        onSelect={handleFoodSelect}
      />
    </SafeAreaView>
  );
}
