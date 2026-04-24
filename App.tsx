import './global.css';
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
// DB table is created synchronously at module load in database.ts
import './src/database/database';

export default function App() {
  return <AppNavigator />;
}
