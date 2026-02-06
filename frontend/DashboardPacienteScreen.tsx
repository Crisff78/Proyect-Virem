import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ✅ Si usas Expo, comenta los imports de abajo y usa:
// import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ViremLogo = require('./assets/imagenes/descarga.png');

// Avatar default (local) -> crea una imagen en tu proyecto:
// ./assets/imagenes/avatar-default.png
const DefaultAvatar = require('./assets/imagenes/avatar-default.png');

const STORAGE_KEY = 'user'; // <-- aquí debe estar el usuario guardado al iniciar sesión

/* ===================== TIPOS ===================== */
type User = {
  id?: number | string;
  nombres?: string;
  apellidos?: string;
  email?: string;
  plan?: string;        // "Premium" / "Básico"
  fotoUrl?: string;     // URL de la foto si la subió
};

type QuickActionProps = {
  icon: string;
  label: string;
  color: string;
  bg: string;
};

type AppointmentCardProps = {
  doctor: string;
  detail: string;
  avatar: ImageSourcePropType;
  simple?: boolean;
};

type DocRowProps = {
  icon: string;
  title: string;
  sub: string;
};

type DoctorCardProps = {
  name: string;
  spec: string;
  avatar: ImageSourcePropType;
};

/* ===================== COMPONENTES ===================== */
const QuickAction: React.FC<QuickActionProps> = ({ icon, label, color, bg }) => (
  <TouchableOpacity style={styles.quickCard}>
    <View style={[styles.quickIconBox, { backgroundColor: bg }]}>
      <MaterialIcons name={icon} size={26} color={color} />
    </View>
    <Text style={styles.quickLabel}>{label}</Text>
  </TouchableOpacity>
);

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  doctor,
  detail,
  avatar,
  simple = false,
}) => (
  <View style={styles.apptCard}>
    <Image source={avatar} style={styles.apptAvatar} />
    <View style={{ flex: 1 }}>
      <Text style={styles.apptDoctor}>{doctor}</Text>
      <Text style={styles.apptDetail}>{detail}</Text>
    </View>

    <View style={styles.apptBtns}>
      {!simple && (
        <TouchableOpacity style={styles.smallBtnGray}>
          <Text style={styles.smallBtnGrayText}>Posponer</Text>
        </TouchableOpacity>
      )}
      <TouchableOpacity style={styles.smallBtnBlue}>
        <Text style={styles.smallBtnBlueText}>Detalles</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const DocRow: React.FC<DocRowProps> = ({ icon, title, sub }) => (
  <View style={styles.docRow}>
    <View style={styles.docLeft}>
      <View style={styles.docIconBox}>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.docTitle} numberOfLines={1}>
          {title}
        </Text>
        <Text style={styles.docSub} numberOfLines={1}>
          {sub}
        </Text>
      </View>
    </View>
    <TouchableOpacity>
      <MaterialIcons name="download" size={20} color={colors.muted} />
    </TouchableOpacity>
  </View>
);

const DoctorCard: React.FC<DoctorCardProps> = ({ name, spec, avatar }) => (
  <View style={styles.doctorCard}>
    <Image source={avatar} style={styles.doctorAvatar} />
    <Text style={styles.doctorName} numberOfLines={1}>
      {name}
    </Text>
    <Text style={styles.doctorSpec} numberOfLines={1}>
      {spec}
    </Text>
    <TouchableOpacity style={styles.reserveBtn}>
      <Text style={styles.reserveText}>RESERVAR</Text>
    </TouchableOpacity>
  </View>
);

/* ===================== PANTALLA ===================== */
const DashboardPacienteScreen: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // ✅ Cargar usuario real desde storage (guardado al loguearse)
  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setUser(JSON.parse(raw));
        else setUser(null);
      } catch {
        setUser(null);
      } finally {
        setLoadingUser(false);
      }
    };

    loadUser();
  }, []);

  const fullName = useMemo(() => {
    const nombres = (user?.nombres || '').trim();
    const apellidos = (user?.apellidos || '').trim();
    const name = `${nombres} ${apellidos}`.trim();
    return name || 'Paciente';
  }, [user]);

  const planLabel = useMemo(() => {
    const plan = (user?.plan || '').trim();
    return plan ? `Paciente ${plan}` : 'Paciente';
  }, [user]);

  // ✅ Foto: si no hay fotoUrl, usar avatar default
  const userAvatarSource: ImageSourcePropType = useMemo(() => {
    if (user?.fotoUrl && user.fotoUrl.trim().length > 0) {
      return { uri: user.fotoUrl.trim() };
    }
    return DefaultAvatar;
  }, [user]);

  // ✅ Doctores placeholder (esto no depende del usuario)
  const Doctor1: ImageSourcePropType = { uri: 'https://i.pravatar.cc/150?img=12' };
  const Doctor2: ImageSourcePropType = { uri: 'https://i.pravatar.cc/150?img=32' };

  if (loadingUser) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 10, color: colors.muted, fontWeight: '700' }}>
          Cargando tu información...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ===================== SIDEBAR ===================== */}
      <View style={styles.sidebar}>
        <View>
          {/* Logo */}
          <View style={styles.logoBox}>
            <Image source={ViremLogo} style={styles.logo} />
            <View>
              <Text style={styles.logoTitle}>VIREM</Text>
              <Text style={styles.logoSubtitle}>Portal Paciente</Text>
            </View>
          </View>

          {/* Perfil mini (REAL) */}
          <View style={styles.userBox}>
            <Image source={userAvatarSource} style={styles.userAvatar} />
            <Text style={styles.userName}>{fullName}</Text>
            <Text style={styles.userPlan}>{planLabel}</Text>

            {/* ✅ Si no tiene foto, le sugieres subirla (sin inventar) */}
            {!user?.fotoUrl ? (
              <Text style={styles.hintText}>
                No tienes foto. Ve a Perfil para agregarla.
              </Text>
            ) : null}
          </View>

          {/* Menú */}
          <View style={styles.menu}>
            <TouchableOpacity style={[styles.menuItemRow, styles.menuItemActive]}>
              <MaterialIcons name="grid-view" size={20} color={colors.primary} />
              <Text style={[styles.menuText, styles.menuTextActive]}>Inicio</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItemRow}>
              <MaterialIcons name="person-search" size={20} color={colors.muted} />
              <Text style={styles.menuText}>Buscar Médico</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItemRow}>
              <MaterialIcons name="calendar-today" size={20} color={colors.muted} />
              <Text style={styles.menuText}>Mis Citas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItemRow}>
              <MaterialIcons name="videocam" size={20} color={colors.muted} />
              <Text style={styles.menuText}>Videollamada</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItemRow}>
              <MaterialIcons name="chat-bubble" size={20} color={colors.muted} />
              <Text style={styles.menuText}>Chat</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItemRow}>
              <MaterialIcons name="description" size={20} color={colors.muted} />
              <Text style={styles.menuText}>Recetas / Documentos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItemRow}>
              <MaterialIcons name="account-circle" size={20} color={colors.muted} />
              <Text style={styles.menuText}>Perfil</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cerrar sesión */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={async () => {
            // ✅ al cerrar sesión borras el usuario y token
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem(STORAGE_KEY);

            // aquí navegas al login (ejemplo):
            // navigation.replace('Login');
          }}
        >
          <MaterialIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* ===================== MAIN ===================== */}
      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.header}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color={colors.muted} />
            <TextInput
              placeholder="Busca un médico para consulta online"
              placeholderTextColor="#8aa7bf"
              style={styles.searchInput}
            />
          </View>

          <TouchableOpacity style={styles.notifBtn}>
            <MaterialIcons name="notifications" size={22} color={colors.dark} />
            <View style={styles.notifDot} />
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Hola, {fullName.split(' ')[0] || 'Paciente'}</Text>
        <Text style={styles.subtitle}>
          Hoy tienes una cita programada con el equipo de cardiología.
        </Text>

        {/* Card grande */}
        <View style={styles.bigCard}>
          <View style={styles.bigCardLeft}>
            <View style={styles.liveRow}>
              <View style={styles.liveDot} />
              <Text style={styles.liveText}>En directo ahora</Text>
            </View>

            <Text style={styles.bigCardTitle}>
              Próxima Videoconsulta: Dr. Alejandro García
            </Text>

            <Text style={styles.bigCardSub}>
              Cardiología · Hoy, 16:30 PM (en 15 minutos)
            </Text>

            <View style={styles.bigCardActions}>
              <TouchableOpacity style={styles.primaryBtn}>
                <MaterialIcons name="videocam" size={18} color="#fff" />
                <Text style={styles.primaryBtnText}>Entrar a Videollamada</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.secondaryBtn}>
                <Text style={styles.secondaryBtnText}>Ver preparativos</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bigCardRight}>
            <Image source={Doctor1} style={styles.bigCardImage} />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.quickGrid}>
          <QuickAction
            icon="add-circle"
            label="Nueva consulta"
            color={colors.primary}
            bg="rgba(19,127,236,0.12)"
          />
          <QuickAction
            icon="calendar-month"
            label="Agendar cita"
            color="#f97316"
            bg="#fff7ed"
          />
          <QuickAction icon="chat" label="Consultar Chat" color="#14b8a6" bg="#f0fdfa" />
          <QuickAction
            icon="medical-information"
            label="Mis recetas"
            color="#a855f7"
            bg="#faf5ff"
          />
        </View>

        <View style={styles.twoCols}>
          <View style={styles.colLeft}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionTitle}>Citas pendientes</Text>
              <TouchableOpacity>
                <Text style={styles.link}>Ver todas</Text>
              </TouchableOpacity>
            </View>

            <AppointmentCard
              doctor="Dra. Marta Sánchez"
              detail="Dermatología · 24 Oct, 10:00 AM"
              avatar={Doctor2}
            />
            <AppointmentCard
              doctor="Dr. Ricardo Ruiz"
              detail="Medicina General · 28 Oct, 09:15 AM"
              avatar={Doctor1}
              simple
            />
          </View>

          <View style={styles.colRight}>
            <Text style={styles.sectionTitle}>Mensajes recientes</Text>

            <View style={styles.chatCard}>
              <View style={styles.chatHeader}>
                <Image source={Doctor1} style={styles.chatAvatar} />
                <View>
                  <Text style={styles.chatName}>Dr. Ricardo Ruiz</Text>
                  <View style={styles.onlineRow}>
                    <View style={styles.onlineDot} />
                    <Text style={styles.onlineText}>Online</Text>
                  </View>
                </View>
              </View>

              <View style={styles.chatBody}>
                <View style={styles.msgLeft}>
                  <Text style={styles.msgLeftText}>
                    Hola {fullName.split(' ')[0] || 'Paciente'}, ¿has podido completar los análisis?
                  </Text>
                </View>

                <View style={styles.msgRight}>
                  <Text style={styles.msgRightText}>
                    Sí Doctor, se los envié por el portal esta mañana.
                  </Text>
                </View>
              </View>

              <View style={styles.chatInputRow}>
                <TextInput
                  placeholder="Responder..."
                  placeholderTextColor="#8aa7bf"
                  style={styles.chatInput}
                />
                <TouchableOpacity>
                  <MaterialIcons name="send" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.twoCols}>
          <View style={styles.colLeft}>
            <Text style={styles.sectionTitle}>Recetas y Documentos</Text>
            <View style={styles.listCard}>
              <DocRow
                icon="picture-as-pdf"
                title="Receta_Medica_Oct2023.pdf"
                sub="Dra. Marta Sánchez · 24 Oct 2023"
              />
              <DocRow
                icon="analytics"
                title="Analisis_Sangre_Sept.pdf"
                sub="Laboratorio Central · 15 Sep 2023"
              />
            </View>
          </View>

          <View style={styles.colRight}>
            <Text style={styles.sectionTitle}>Doctores frecuentes</Text>
            <View style={styles.doctorsGrid}>
              <DoctorCard name="Dr. Alejandro García" spec="Cardiología" avatar={Doctor1} />
              <DoctorCard name="Dr. Ricardo Ruiz" spec="Med. General" avatar={Doctor2} />
            </View>
          </View>
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryHead}>
            <View style={styles.summaryIconBox}>
              <MaterialCommunityIcons name="history" size={18} color="#fff" />
            </View>
            <Text style={styles.summaryTitle}>Resumen de última consulta</Text>
          </View>

          <View style={styles.summaryInner}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.summaryLabel}>Diagnóstico Principal</Text>
                <Text style={styles.summaryDiag}>Gripe común estacional</Text>
              </View>
              <Text style={styles.summaryDate}>12 Oct 2023</Text>
            </View>

            <Text style={styles.summaryText}>
              Paciente presenta síntomas de resfriado leve. Se recomienda descanso, hidratación constante
              y el uso de analgésicos según receta adjunta. Revisión en 5 días si los síntomas persisten.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

/* ===================== COLORES ===================== */
const colors = {
  primary: '#137fec',
  bg: '#F6FAFD',
  dark: '#0A1931',
  blue: '#1A3D63',
  muted: '#4A7FA7',
  light: '#B3CFE5',
  white: '#FFFFFF',
};

/* ===================== ESTILOS ===================== */
const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: colors.bg },

  sidebar: {
    width: 280,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: '#eef2f7',
    padding: 20,
    justifyContent: 'space-between',
  },

  logoBox: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 44, height: 44, resizeMode: 'contain' },
  logoTitle: { fontSize: 20, fontWeight: '800', color: colors.dark, letterSpacing: 0.5 },
  logoSubtitle: { fontSize: 11, fontWeight: '700', color: colors.muted },

  userBox: { marginTop: 18, alignItems: 'center', paddingVertical: 12 },
  userAvatar: {
    width: 76,
    height: 76,
    borderRadius: 76,
    marginBottom: 10,
    borderWidth: 4,
    borderColor: '#f5f7fb',
  },
  userName: { fontWeight: '800', color: colors.dark, fontSize: 14 },
  userPlan: { color: colors.muted, fontSize: 11, fontWeight: '700', marginTop: 2 },
  hintText: { marginTop: 6, color: colors.muted, fontSize: 11, fontWeight: '700' },

  menu: { marginTop: 10, gap: 6, flex: 1 },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  menuItemActive: {
    backgroundColor: 'rgba(19,127,236,0.10)',
    borderRightWidth: 3,
    borderRightColor: colors.primary,
  },
  menuText: { fontSize: 14, fontWeight: '700', color: colors.muted },
  menuTextActive: { color: colors.primary },

  logoutButton: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.blue,
    paddingVertical: 12,
    borderRadius: 12,
  },
  logoutText: { color: '#fff', fontWeight: '800' },

  main: { flex: 1, paddingHorizontal: 26, paddingTop: 18 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 },

  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: colors.dark,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  searchInput: { flex: 1, color: colors.dark, fontWeight: '600' },

  notifBtn: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.dark,
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  notifDot: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    borderWidth: 2,
    borderColor: '#fff',
  },

  title: { fontSize: 28, fontWeight: '900', color: colors.dark, marginTop: 8 },
  subtitle: { fontSize: 14, color: colors.muted, marginTop: 6, marginBottom: 18, fontWeight: '600' },

  bigCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 18,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 18,
    shadowColor: colors.dark,
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  bigCardLeft: { flex: 1 },
  bigCardRight: { width: 160, justifyContent: 'center', alignItems: 'center' },
  bigCardImage: { width: 140, height: 140, borderRadius: 20 },

  liveRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  liveDot: { width: 10, height: 10, borderRadius: 10, backgroundColor: '#22c55e' },
  liveText: { color: colors.primary, fontSize: 11, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },

  bigCardTitle: { fontSize: 18, fontWeight: '900', color: colors.dark, marginBottom: 6 },
  bigCardSub: { color: colors.muted, fontWeight: '700', marginBottom: 14 },

  bigCardActions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  primaryBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.primary, paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16 },
  primaryBtnText: { color: '#fff', fontWeight: '900' },
  secondaryBtn: { backgroundColor: '#f1f5f9', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 16 },
  secondaryBtnText: { color: colors.muted, fontWeight: '900' },

  sectionTitle: { fontSize: 16, fontWeight: '900', color: colors.dark, marginBottom: 10, marginTop: 10 },
  link: { color: colors.primary, fontWeight: '900', fontSize: 12 },

  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  quickCard: {
    width: '23%',
    minWidth: 140,
    padding: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: colors.dark,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  quickIconBox: { width: 56, height: 56, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  quickLabel: { fontWeight: '900', color: colors.dark, textAlign: 'center' },

  twoCols: { flexDirection: 'row', gap: 16, marginTop: 16 },
  colLeft: { flex: 2 },
  colRight: { flex: 1.2 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },

  apptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 18,
    marginTop: 10,
    shadowColor: colors.dark,
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  apptAvatar: { width: 52, height: 52, borderRadius: 16 },
  apptDoctor: { fontWeight: '900', color: colors.dark },
  apptDetail: { color: colors.muted, fontWeight: '700', marginTop: 2, fontSize: 12 },

  apptBtns: { flexDirection: 'row', gap: 8 },

  smallBtnGray: { backgroundColor: '#f1f5f9', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  smallBtnGrayText: { color: colors.muted, fontWeight: '900', fontSize: 12 },
  smallBtnBlue: { backgroundColor: 'rgba(19,127,236,0.12)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
  smallBtnBlueText: { color: colors.primary, fontWeight: '900', fontSize: 12 },

  chatCard: { backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', marginTop: 10, shadowColor: colors.dark, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  chatHeader: { flexDirection: 'row', gap: 10, alignItems: 'center', backgroundColor: '#f8fafc', padding: 12, borderBottomWidth: 1, borderBottomColor: '#eef2f7' },
  chatAvatar: { width: 40, height: 40, borderRadius: 40 },
  chatName: { fontWeight: '900', color: colors.dark, fontSize: 12 },
  onlineRow: { flexDirection: 'row', gap: 6, alignItems: 'center', marginTop: 2 },
  onlineDot: { width: 8, height: 8, borderRadius: 8, backgroundColor: '#22c55e' },
  onlineText: { color: colors.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  chatBody: { padding: 12, gap: 10, minHeight: 200 },
  msgLeft: { backgroundColor: '#f1f5f9', padding: 10, borderRadius: 16, alignSelf: 'flex-start', maxWidth: '90%' },
  msgLeftText: { color: colors.dark, fontWeight: '700', fontSize: 12 },
  msgRight: { backgroundColor: colors.primary, padding: 10, borderRadius: 16, alignSelf: 'flex-end', maxWidth: '90%' },
  msgRightText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  chatInputRow: { flexDirection: 'row', gap: 10, alignItems: 'center', padding: 12, borderTopWidth: 1, borderTopColor: '#eef2f7' },
  chatInput: { flex: 1, backgroundColor: '#f8fafc', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, color: colors.dark, fontWeight: '700' },

  listCard: { backgroundColor: '#fff', borderRadius: 22, overflow: 'hidden', marginTop: 10, shadowColor: colors.dark, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  docLeft: { flexDirection: 'row', gap: 12, alignItems: 'center', flex: 1 },
  docIconBox: { width: 44, height: 44, borderRadius: 16, backgroundColor: 'rgba(19,127,236,0.12)', alignItems: 'center', justifyContent: 'center' },
  docTitle: { fontWeight: '900', color: colors.dark, fontSize: 12 },
  docSub: { color: colors.muted, fontWeight: '700', fontSize: 11, marginTop: 2 },

  doctorsGrid: { flexDirection: 'row', gap: 12, marginTop: 10, flexWrap: 'wrap' },
  doctorCard: { width: '48%', backgroundColor: '#fff', padding: 14, borderRadius: 22, alignItems: 'center', shadowColor: colors.dark, shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 2 },
  doctorAvatar: { width: 64, height: 64, borderRadius: 64, marginBottom: 10, borderWidth: 4, borderColor: '#f5f7fb' },
  doctorName: { fontWeight: '900', color: colors.dark, textAlign: 'center', fontSize: 12 },
  doctorSpec: { color: colors.muted, fontWeight: '900', fontSize: 10, marginTop: 4, marginBottom: 10, letterSpacing: 1, textTransform: 'uppercase' },
  reserveBtn: { width: '100%', paddingVertical: 10, borderRadius: 14, backgroundColor: '#f1f5f9', alignItems: 'center' },
  reserveText: { color: colors.primary, fontWeight: '900', fontSize: 11 },

  summaryCard: { backgroundColor: colors.dark, borderRadius: 24, padding: 16, marginTop: 18 },
  summaryHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  summaryIconBox: { width: 34, height: 34, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.12)', alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { color: '#fff', fontWeight: '900', fontSize: 14 },
  summaryInner: { backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 18, padding: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.10)' },
  summaryLabel: { color: colors.light, fontWeight: '900', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase' },
  summaryDiag: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: 4 },
  summaryDate: { color: '#fff', opacity: 0.8, fontWeight: '800', fontSize: 11, backgroundColor: 'rgba(255,255,255,0.10)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  summaryText: { color: colors.light, fontWeight: '600', fontSize: 12, marginTop: 10, lineHeight: 18 },
});

export default DashboardPacienteScreen;
