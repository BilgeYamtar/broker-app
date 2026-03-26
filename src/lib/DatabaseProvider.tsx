import { createContext, useContext, useEffect, useState } from "react";
import { View, Text } from "react-native";
import * as SQLite from "expo-sqlite";
import { getDatabase } from "@/lib/database";
import { colors } from "@/constants/colors";
import { useOnboardingStore } from "@/features/onboarding/useOnboardingStore";
import { seedDemoData } from "@/data/demoData";

const DatabaseContext = createContext<SQLite.SQLiteDatabase | null>(null);

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to rehydrate from AsyncStorage
  useEffect(() => {
    const unsub = useOnboardingStore.persist.onFinishHydration(() => {
      setHydrated(true);
    });
    // If already hydrated (e.g. sync storage or fast resolve)
    if (useOnboardingStore.persist.hasHydrated()) {
      setHydrated(true);
    }
    return () => { unsub(); };
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    (async () => {
      try {
        const database = await getDatabase();

        // Seed demo data on first launch
        const { hasSeeded, markSeeded } = useOnboardingStore.getState();
        if (!hasSeeded) {
          await seedDemoData();
          markSeeded();
        }

        setDb(database);
      } catch (err) {
        console.error("Database initialization failed:", err);
        setError(err instanceof Error ? err.message : "Database init failed");
      }
    })();
  }, [hydrated]);

  if (error) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.maritime.base,
          alignItems: "center",
          justifyContent: "center",
          padding: 32,
        }}
      >
        <Text style={{ color: colors.maritime.danger, fontSize: 16, fontWeight: "600" }}>
          Veritabanı Hatası
        </Text>
        <Text
          style={{
            color: colors.maritime.muted,
            fontSize: 14,
            marginTop: 8,
            textAlign: "center",
          }}
        >
          {error}
        </Text>
      </View>
    );
  }

  if (!db) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.maritime.base,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: colors.maritime.muted, fontSize: 14 }}>
          Veritabanı yükleniyor...
        </Text>
      </View>
    );
  }

  return (
    <DatabaseContext.Provider value={db}>{children}</DatabaseContext.Provider>
  );
}

export function useDatabase(): SQLite.SQLiteDatabase {
  const db = useContext(DatabaseContext);
  if (!db) {
    throw new Error("useDatabase must be used within DatabaseProvider");
  }
  return db;
}
