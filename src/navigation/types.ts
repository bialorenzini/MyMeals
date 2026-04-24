import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Meal } from '../types/meal';

export type RootStackParamList = {
  Home: undefined;
  AddMeal: { meal?: Meal } | undefined;
  MealDetail: { mealId: number };
};

export const Stack = createNativeStackNavigator<RootStackParamList>();
