import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { initDatabase } from './src/database/init';
import { getModulesByAudience } from './src/database/queries';
import { Module } from './src/database/schema'; // <-- Import indispensable

export default function App() {
  // On précise bien <Module[]> ici
  const [modules, setModules] = useState<Module[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function startEngine() {
      try {
        const db = await initDatabase();
        const data = await getModulesByAudience(db, 'all');
        setModules(data);
      } catch (e: any) {
        setError(e.message);
      }
    }
    startEngine();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>🧪 Banc de Test JanaCore</Text>
      
      {error && <Text style={{ color: 'red' }}>Erreur : {error}</Text>}
      
      {modules.length > 0 ? (
        <View style={{ marginTop: 20 }}>
          <Text style={{ color: 'green', marginBottom: 10 }}>✅ Base de données connectée !</Text>
          {/* Ici, on précise que m est un Module */}
          {modules.map((m: Module) => (
            <Text key={m.id}>- {m.name} ({m.target_audience})</Text>
          ))}
        </View>
      ) : (
        <Text style={{ marginTop: 20 }}>Chargement des données...</Text>
      )}
    </ScrollView>
  );
}