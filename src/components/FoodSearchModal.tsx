import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FoodItem, searchFoods } from '../services/foodSearch';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (food: FoodItem) => void;
}

function MacroPill({
  emoji,
  value,
  unit,
  color,
}: {
  emoji: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <View
      className="flex-row items-center rounded-full px-2 py-0.5 gap-0.5"
      style={{ backgroundColor: color + '22' }}
    >
      <Text style={{ fontSize: 11 }}>{emoji}</Text>
      <Text className="text-xs font-semibold" style={{ color }}>
        {value}
        {unit}
      </Text>
    </View>
  );
}

export default function FoodSearchModal({ visible, onClose, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setSearched(false);
    try {
      const foods = await searchFoods(q);
      setResults(foods);
    } catch (err: any) {
      const msg = err?.message ?? String(err);
      Alert.alert('Erro na busca', `Não foi possível buscar alimentos.\n\n${msg}`);
      setResults([]);
    } finally {
      setLoading(false);
      setSearched(true);
    }
  }

  function handleSelect(food: FoodItem) {
    onSelect(food);
    setQuery('');
    setResults([]);
    setSearched(false);
  }

  function handleClose() {
    setQuery('');
    setResults([]);
    setSearched(false);
    onClose();
  }

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <SafeAreaView className="flex-1 bg-background">
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Header */}
          <View className="flex-row items-center justify-between px-4 pt-4 pb-3 border-b border-border">
            <Text className="text-ink text-xl font-bold">🔍 Buscar Alimento</Text>
            <TouchableOpacity onPress={handleClose} className="p-1">
              <Text className="text-dim text-2xl">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Search bar */}
          <View className="flex-row items-center gap-2 px-4 pt-4 pb-2">
            <TextInput
              className="flex-1 bg-surface rounded-xl px-4 text-ink border border-border"
              style={{ paddingVertical: 12, fontSize: 15 }}
              value={query}
              onChangeText={setQuery}
              placeholder="Ex: arroz branco, frango grelhado..."
              placeholderTextColor="#B2BEC3"
              returnKeyType="search"
              onSubmitEditing={handleSearch}
              autoFocus
            />
            <TouchableOpacity
              onPress={handleSearch}
              className="rounded-xl px-4 items-center justify-center"
              style={{ backgroundColor: '#4ECDC4', paddingVertical: 12 }}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-sm">Buscar</Text>
            </TouchableOpacity>
          </View>

          <Text className="text-muted text-xs px-5 pb-3">
            Valores nutricionais por 100g · Fonte: Open Food Facts
          </Text>

          {/* Content */}
          {loading ? (
            <View className="flex-1 items-center justify-center gap-3">
              <ActivityIndicator size="large" color="#4ECDC4" />
              <Text className="text-dim text-sm">Buscando alimentos...</Text>
            </View>
          ) : searched && results.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-2 px-8">
              <Text style={{ fontSize: 48 }}>🤷</Text>
              <Text className="text-ink text-lg font-bold text-center">
                Nenhum resultado
              </Text>
              <Text className="text-dim text-sm text-center">
                Tente outro nome ou verifique a ortografia
              </Text>
            </View>
          ) : !searched ? (
            <View className="flex-1 items-center justify-center gap-2 px-8">
              <Text style={{ fontSize: 52 }}>🥦</Text>
              <Text className="text-ink text-lg font-bold text-center">
                Pesquise um alimento
              </Text>
              <Text className="text-dim text-sm text-center">
                Digite o nome acima e toque em Buscar
              </Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item, idx) => `${item.name}-${idx}`}
              contentContainerStyle={{ padding: 16, paddingBottom: 40, gap: 10 }}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelect(item)}
                  activeOpacity={0.85}
                >
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
                    <Text className="text-ink text-base font-bold" numberOfLines={1}>
                      {item.name}
                    </Text>
                    {item.brand ? (
                      <Text className="text-dim text-xs" numberOfLines={1}>
                        {item.brand}
                      </Text>
                    ) : null}
                    <View className="flex-row flex-wrap gap-1.5 mt-1">
                      <MacroPill emoji="🔥" value={item.calories} unit="kcal" color="#FF6B6B" />
                      <MacroPill emoji="🥩" value={item.protein} unit="g prot" color="#4ECDC4" />
                      <MacroPill emoji="🌾" value={item.carbs} unit="g carb" color="#FFB347" />
                      <MacroPill emoji="🫒" value={item.fat} unit="g gord" color="#9B89C9" />
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
