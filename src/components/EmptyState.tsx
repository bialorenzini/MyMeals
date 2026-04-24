import React from 'react';
import { View, Text } from 'react-native';

export default function EmptyState() {
  return (
    <View className="flex-1 items-center justify-center px-8 pb-16 gap-3">
      <Text style={{ fontSize: 72 }}>🍽️</Text>
      <Text className="text-ink text-2xl font-bold text-center mt-4">
        Nenhuma refeição ainda
      </Text>
      <Text className="text-dim text-base text-center leading-6">
        Toque no botão{' '}
        <Text className="text-primary font-bold">+</Text>{' '}
        para registrar sua primeira refeição!
      </Text>
    </View>
  );
}
