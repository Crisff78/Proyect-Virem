import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialIcons } from '@expo/vector-icons';

import { RootStackParamList } from './navigation/types';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'Home'>;

const DEFAULT_PATIENT_NAME = 'Juan Pérez';

const NAV_ITEMS = [
  { label: 'Inicio', icon: 'home', active: true },
  { label: 'Buscar Médicos', icon: 'search', active: false },
  { label: 'Mis Citas', icon: 'calendar-today', active: false },
  { label: 'Historial Médico', icon: 'description', active: false },
  { label: 'Perfil', icon: 'person', active: false },
];

const CATEGORY_ITEMS = [
  { label: 'General', icon: 'home-filled' },
  { label: 'Psicología', icon: 'psychology' },
  { label: 'Pediatría', icon: 'child-care' },
  { label: 'Nutrición', icon: 'restaurant' },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const [patientName, setPatientName] = useState(DEFAULT_PATIENT_NAME);

  const { width } = Dimensions.get('window');
  const isWideLayout = width >= 1024;

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const storedProfile = await SecureStore.getItemAsync('userProfile');
        if (!storedProfile) return;

        const profile = JSON.parse(storedProfile) as Record<string, string>;

        const fullName = (
          profile.nombreCompleto ||
          [
            profile.nombres || profile.nombre || profile.firstName || profile.name,
            profile.apellidos || profile.lastName || profile.surname,
          ]
            .filter(Boolean)
            .join(' ')
        ).trim();

        if (fullName && isMounted) {
          setPatientName(fullName);
        }
      } catch {
        // Mantiene el nombre por defecto si falla
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const mainContainerStyle = useMemo(
    () => [styles.mainLayout, !isWideLayout && styles.mainLayoutStacked],
    [isWideLayout]
  );

  const handleLogout = async () => {
    try {
      await SecureStore.deleteItemAsync('authToken');
      await SecureStore.deleteItemAsync('userProfile');

      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch {
      Alert.alert('Error', 'No se pudo cerrar la sesión. Intenta nuevamente.');
    }
  };

  return (
    <View style={styles.page}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={mainContainerStyle}>
          {/* SIDEBAR */}
          <View style={[styles.sidebar, !isWideLayout && styles.sidebarCompact]}>
            <View style={styles.sidebarHeader}>
              <View style={styles.logoIcon}>
                <MaterialIcons name="health-and-safety" size={24} color="#FFFFFF" />
              </View>
              <View>
                <Text style={styles.logoTitle}>VIREM</Text>
                <Text style={styles.logoSubtitle}>Portal Paciente</Text>
              </View>
            </View>

            {/* NAV ITEMS */}
            <View style={styles.navSection}>
              {NAV_ITEMS.map((item) => (
                <View
                  key={item.label}
                  style={[styles.navItem, item.active && styles.navItemActive]}
                >
                  <MaterialIcons
                    name={item.icon as keyof typeof MaterialIcons.glyphMap}
                    size={20}
                    color={item.active ? colors.primary : colors.blueGray}
                  />
                  <Text style={[styles.navLabel, item.active && styles.navLabelActive]}>
                    {item.label}
                  </Text>
                </View>
              ))}
            </View>

            {/* LOGOUT */}
            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <MaterialIcons name="logout" size={18} color="#FFFFFF" />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>

          {/* CONTENT */}
          <View style={styles.content}>
            <View style={styles.headerSection}>
              <Text style={styles.greeting}>¡Hola, {patientName}!</Text>
              <Text style={styles.subtitle}>
                Bienvenido de nuevo a tu portal de salud VIREM.
              </Text>
            </View>

            {/* DASHBOARD */}
            <View style={styles.dashboardGrid}>
              {/* MAIN COLUMN */}
              <View style={styles.mainColumn}>
                {/* SEARCH */}
                <View style={styles.searchCard}>
                  <View style={styles.searchInputRow}>
                    <MaterialIcons name="search" size={22} color={colors.blueGray} />
                    <TextInput
                      placeholder="¿Qué especialista buscas hoy?"
                      placeholderTextColor={colors.brandMuted}
                      style={styles.searchInput}
                    />
                    <TouchableOpacity style={styles.searchButton}>
                      <Text style={styles.searchButtonText}>Buscar</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* NEXT APPOINTMENT */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Próxima Cita</Text>

                  <View style={styles.appointmentCard}>
                    <View style={styles.appointmentContent}>
                      <View style={styles.reminderBadge}>
                        <Text style={styles.reminderText}>Recordatorio</Text>
                      </View>

                      <Text style={styles.doctorName}>Dr. Alejandro Ruiz</Text>
                      <Text style={styles.doctorSubtitle}>
                        Especialista en Cardiología | 25 Oct, 10:30 AM
                      </Text>

                      <TouchableOpacity style={styles.videoButton}>
                        <MaterialIcons name="videocam" size={18} color="#FFFFFF" />
                        <Text style={styles.videoButtonText}>Entrar a Videollamada</Text>
                      </TouchableOpacity>
                    </View>

                    {isWideLayout && (
                      <Image
                        source={{
                          uri: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=320&q=80',
                        }}
                        style={styles.appointmentImage}
                      />
                    )}
                  </View>
                </View>
              </View>

              {/* SIDEBAR COLUMN */}
              <View style={styles.sidebarColumn}>
                <View style={styles.healthCard}>
                  <Text style={styles.healthTitle}>Tu Salud al Día</Text>

                  <View style={styles.healthRow}>
                    <View style={styles.healthIconWrap}>
                      <MaterialIcons name="favorite" size={20} color={colors.brandMuted} />
                    </View>
                    <View>
                      <Text style={styles.healthLabel}>Ritmo Cardíaco</Text>
                      <Text style={styles.healthValue}>
                        72 <Text style={styles.healthUnit}>bpm</Text>
                      </Text>
                    </View>
                  </View>

                  <View style={styles.healthDivider} />

                  <Text style={styles.healthQuote}>
                    "Estás a solo 1,500 pasos de tu meta diaria. ¡Sigue así!"
                  </Text>
                </View>

                {/* CATEGORIES */}
                <View style={styles.card}>
                  <Text style={styles.sectionSubtitle}>Categorías Populares</Text>

                  <View style={styles.categoryGrid}>
                    {CATEGORY_ITEMS.map((item) => (
                      <View key={item.label} style={styles.categoryItem}>
                        <MaterialIcons
                          name={item.icon as keyof typeof MaterialIcons.glyphMap}
                          size={20}
                          color={colors.primary}
                        />
                        <Text style={styles.categoryLabel}>{item.label}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* ✅ COLORS (blueGray arreglado aquí) */
const colors = {
  primary: '#137fec',
  brandDark: '#0A1931',
  brandMuted: '#B3CFE5',
  brandBlue: '#4A7FA7',
  brandDeep: '#1A3D63',

  blueGray: '#64748B', // ✅ FIX

  backgroundLight: '#F6FAFD',
  white: '#FFFFFF',
  slate100: '#E2E8F0',
};

/* ✅ STYLES */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.backgroundLight },
  scrollContent: { padding: 24 },

  mainLayout: {
    flexDirection: 'row',
    gap: 24,
    width: '100%',
    maxWidth: 1280,
    alignSelf: 'center',
  },

  mainLayoutStacked: { flexDirection: 'column' },

  sidebar: {
    width: 260,
    backgroundColor: colors.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.slate100,
    justifyContent: 'space-between',
  },

  sidebarCompact: { width: '100%' },

  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 24,
  },

  logoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoTitle: { fontSize: 20, fontWeight: '800', color: colors.brandDark },

  logoSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.brandBlue,
  },

  navSection: { gap: 10 },

  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
  },

  navItemActive: { backgroundColor: 'rgba(19, 127, 236, 0.1)' },

  navLabel: { fontSize: 14, color: colors.brandBlue, fontWeight: '500' },

  navLabelActive: { color: colors.primary, fontWeight: '700' },

  logoutButton: {
    marginTop: 24,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.brandDeep,
    paddingVertical: 12,
    borderRadius: 14,
  },

  logoutText: { color: colors.white, fontWeight: '700', fontSize: 14 },

  content: { flex: 1, gap: 20 },

  headerSection: { gap: 6 },

  greeting: { fontSize: 28, fontWeight: '800', color: colors.brandDark },

  subtitle: { fontSize: 16, color: colors.brandBlue, fontWeight: '500' },

  dashboardGrid: { flexDirection: 'row', gap: 24, flexWrap: 'wrap' },

  mainColumn: { flex: 1, gap: 20, minWidth: 320 },

  sidebarColumn: { width: 300, gap: 20 },

  searchCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.slate100,
  },

  searchInputRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  searchInput: { flex: 1, fontSize: 14, color: colors.brandDark },

  searchButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },

  searchButtonText: { color: colors.white, fontWeight: '700', fontSize: 12 },

  section: { gap: 12 },

  sectionTitle: { fontSize: 18, fontWeight: '700', color: colors.brandDark },

  appointmentCard: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
    borderWidth: 1,
    borderColor: colors.slate100,
  },

  appointmentContent: { flex: 1, gap: 12 },

  reminderBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  reminderText: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.primary,
    fontWeight: '700',
  },

  doctorName: { fontSize: 18, fontWeight: '700', color: colors.brandDark },

  doctorSubtitle: { fontSize: 13, color: colors.brandBlue },

  videoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
  },

  videoButtonText: { color: colors.white, fontWeight: '700', fontSize: 12 },

  appointmentImage: { width: 140, height: 120, borderRadius: 16 },

  healthCard: {
    backgroundColor: colors.brandDeep,
    borderRadius: 20,
    padding: 18,
    gap: 16,
  },

  healthTitle: { fontSize: 16, fontWeight: '700', color: colors.white },

  healthRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },

  healthIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  healthLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    color: colors.brandMuted,
    fontWeight: '700',
  },

  healthValue: { fontSize: 18, fontWeight: '700', color: colors.white },

  healthUnit: { fontSize: 12, fontWeight: '400' },

  healthDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)' },

  healthQuote: { fontSize: 12, fontStyle: 'italic', color: colors.brandMuted },

  card: {
    backgroundColor: colors.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.slate100,
    gap: 14,
  },

  sectionSubtitle: { fontSize: 14, fontWeight: '700', color: colors.brandDark },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },

  categoryItem: {
    width: '47%',
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#EAF3FE',
    alignItems: 'center',
    gap: 6,
  },

  categoryLabel: { fontSize: 12, fontWeight: '700', color: colors.brandBlue },
});

export default HomeScreen;
