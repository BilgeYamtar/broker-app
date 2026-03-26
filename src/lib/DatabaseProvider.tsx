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

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // 1. Open DB synchronously — no async race
        const database = getDatabase();

        // 2. Wait for Zustand persist hydration before checking hasSeeded
        if (!useOnboardingStore.persist.hasHydrated()) {
          await new Promise<void>((resolve) => {
            const unsub = useOnboardingStore.persist.onFinishHydration(() => {
              unsub();
              resolve();
            });
          });
        }

        if (cancelled) return;

        // 3. Seed demo data on first launch
        const { hasSeeded, markSeeded } = useOnboardingStore.getState();
        if (!hasSeeded) {
          try {
            await seedDemoData();
            markSeeded();
          } catch (seedErr) {
            console.warn("Demo data seeding failed:", seedErr);
            // Non-fatal — continue without demo data
            markSeeded(); // Prevent retry loops
          }
        }

        if (cancelled) return;
        setDb(database);
      } catch (err) {
        if (cancelled) return;
        console.error("Database initialization failed:", err);
        setError(err instanceof Error ? err.message : "Database init failed");
      }
    }

    init();
    return () => { cancelled = true; };
  }, []);

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
