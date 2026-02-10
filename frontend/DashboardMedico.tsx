import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  TextInput,
  Platform,
} from 'react-native';
import type { ImageSourcePropType } from 'react-native';

// ✅ Expo:
// import { MaterialIcons } from '@expo/vector-icons';

// ✅ RN vector icons:
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const ViremLogo = require('./assets/imagenes/descarga.png');

// Usa tu logo como avatar default (para no depender de avatar-default.png)
const DefaultAvatar = ViremLogo;

// Placeholders (puedes cambiarlos por imágenes locales si quieres)
const DoctorAvatar: ImageSourcePropType = {
  uri: 'https://i.pravatar.cc/150?img=13',
};
const PatientAvatar: ImageSourcePropType = {
  uri: 'https://i.pravatar.cc/150?img=22',
};

type SideItem = {
  icon: string;
  label: string;
  badge?: { text: string; color: string };
  active?: boolean;
};

type StatCardProps = {
  title: string;
  value: string;
  icon: string;
  trendText: string;
  trendUp?: boolean;
};

type AgendaItemProps = {
  time: string;
  name: string;
  detail: string;
};

type FileCardProps = {
  name: string;
  id: string;
  lastSeen: string;
};

const colors = {
  primary: '#137fec',
  viremDark: '#0A1931',
  viremLight: '#B3CFE5',
  viremMuted: '#4A7FA7',
  viremDeep: '#1A3D63',
  bgLight: '#F6FAFD',
  white: '#FFFFFF',
  green: '#16a34a',
  red: '#ef4444',
};

const SidebarItem: React.FC<SideItem & { onPress?: () => void }> = ({
  icon,
  label,
  badge,
  active,
  onPress,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.sideItem, active ? styles.sideItemActive : null]}
      activeOpacity={0.85}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={active ? colors.primary : colors.viremMuted}
      />
      <Text style={[styles.sideItemText, active ? styles.sideItemTextActive : null]}>
        {label}
      </Text>

      {badge ? (
        <View style={[styles.badge, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeText}>{badge.text}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trendText, trendUp = true }) => {
  return (
    <View style={styles.statCard}>
      <View style={styles.statTopRow}>
        <Text style={styles.statTitle}>{title}</Text>
        <MaterialIcons name={icon} size={20} color={colors.primary} />
      </View>

      <View style={styles.statBottomRow}>
        <Text style={styles.statValue}>{value}</Text>
        <View style={styles.trendRow}>
          <MaterialIcons
            name={trendUp ? 'trending-up' : 'trending-down'}
            size={16}
            color={trendUp ? colors.green : colors.red}
          />
          <Text style={[styles.trendText, { color: trendUp ? colors.green : colors.red }]}>
            {trendText}
          </Text>
        </View>
      </View>
    </View>
  );
};

const AgendaRow: React.FC<AgendaItemProps> = ({ time, name, detail }) => (
  <TouchableOpacity activeOpacity={0.85} style={styles.agendaRow}>
    <View style={styles.agendaLeft}>
      <Text style={styles.agendaTime}>{time}</Text>
      <View style={styles.agendaTexts}>
        <Text style={styles.agendaName}>{name}</Text>
        <Text style={styles.agendaDetail}>{detail}</Text>
      </View>
    </View>
    <MaterialIcons name="chevron-right" size={22} color={colors.viremLight} />
  </TouchableOpacity>
);

const FileCard: React.FC<FileCardProps> = ({ name, id, lastSeen }) => (
  <TouchableOpacity activeOpacity={0.85} style={styles.fileCard}>
    <View style={styles.fileTop}>
      <View style={styles.fileIconBox}>
        <MaterialIcons name="folder-shared" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.fileName}>{name}</Text>
        <Text style={styles.fileId}>{id}</Text>
      </View>
    </View>
    <Text style={styles.fileLastSeen}>{lastSeen}</Text>
  </TouchableOpacity>
);

const DashboardMedico: React.FC = () => {
  // Simulación de datos (puedes conectar luego a tu auth/backend)
  const [doctorName] = useState('Dr. Ricardo Sosa');
  const [doctorSpec] = useState('Cardiólogo');

  const dateText = useMemo(() => 'Lunes, 24 de Mayo', []);
  const timeText = useMemo(() => '09:15 AM', []);

  const sideItems: SideItem[] = [
    { icon: 'dashboard', label: 'Dashboard', active: true },
    { icon: 'calendar-today', label: 'Agenda' },
    { icon: 'group', label: 'Pacientes' },
    { icon: 'notification-important', label: 'Solicitudes', badge: { text: '5', color: colors.red } },
    { icon: 'chat-bubble', label: 'Mensajes', badge: { text: '3', color: colors.primary } },
    { icon: 'person', label: 'Perfil' },
    { icon: 'settings', label: 'Configuración' },
  ];

  return (
    <View style={styles.container}>
      {/* ===================== SIDEBAR ===================== */}
      <View style={styles.sidebar}>
        <View style={styles.sidebarInner}>
          <View style={styles.sidebarTop}>
            {/* Logo */}
            <View style={styles.brandRow}>
              <View style={styles.brandIcon}>
                <MaterialIcons name="health-and-safety" size={22} color="#fff" />
              </View>
              <View style={styles.brandTextBox}>
                <Text style={styles.brandTitle}>VIREM</Text>
                <Text style={styles.brandSubtitle}>HEALTH PLATFORM</Text>
              </View>
            </View>

            {/* Nav */}
            <View style={styles.nav}>
              {sideItems.map((it) => (
                <SidebarItem
                  key={it.label}
                  icon={it.icon}
                  label={it.label}
                  badge={it.badge}
                  active={it.active}
                  onPress={() => {}}
                />
              ))}
            </View>
          </View>

          {/* Bottom */}
          <View style={styles.sidebarBottom}>
            <View style={styles.docCard}>
              <Image source={DoctorAvatar} style={styles.docAvatar} />
              <View style={styles.docMeta}>
                <Text numberOfLines={1} style={styles.docName}>
                  {doctorName}
                </Text>
                <Text numberOfLines={1} style={styles.docSpec}>
                  {doctorSpec}
                </Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.85} style={styles.logoutRow} onPress={() => {}}>
              <MaterialIcons name="logout" size={20} color={colors.viremMuted} />
              <Text style={styles.logoutText}>Cerrar Sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ===================== MAIN ===================== */}
      <ScrollView style={styles.main} contentContainerStyle={{ paddingBottom: 28 }}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <View style={styles.headerRow}>
            <View style={styles.headerLeft}>
              <Text style={styles.h1}>Dashboard del Médico</Text>
              <Text style={styles.hSub}>
                Bienvenido de nuevo, Dr. Sosa. Aquí está el resumen de su jornada para hoy.
              </Text>
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.headerDate}>{dateText}</Text>
              <Text style={styles.headerTime}>{timeText}</Text>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <StatCard title="Citas Completadas" value="12" icon="check-circle" trendText="+15%" trendUp />
          <StatCard title="Nuevos Pacientes" value="4" icon="person-add" trendText="+10%" trendUp />
          <StatCard
            title="Mensajes Pendientes"
            value="2"
            icon="mail"
            trendText="-5%"
            trendUp={false}
          />
        </View>

        {/* Banner call */}
        <View style={styles.banner}>
          <View style={styles.bannerRow}>
            <View style={styles.bannerLeft}>
              <View style={styles.patientRing}>
                <Image source={PatientAvatar} style={styles.patientAvatar} />
              </View>

              <View style={styles.bannerTexts}>
                <View style={styles.bannerTitleRow}>
                  <View style={styles.nowPill}>
                    <Text style={styles.nowPillText}>AHORA</Text>
                  </View>
                  <Text style={styles.bannerTitle}>Videollamada con Juan Pérez</Text>
                </View>
                <Text style={styles.bannerSub}>
                  Consulta de Seguimiento Post-Operatorio • Programada 10:30 AM
                </Text>
              </View>
            </View>

            <TouchableOpacity activeOpacity={0.9} style={styles.bannerBtn} onPress={() => {}}>
              <MaterialIcons name="videocam" size={20} color="#fff" />
              <Text style={styles.bannerBtnText}>Iniciar Videollamada</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.bannerIconGhost}>
            <MaterialIcons name="video-call" size={160} color="#fff" />
          </View>
        </View>

        {/* Bottom grid */}
        <View style={styles.bottomGrid}>
          {/* Agenda */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Agenda de hoy</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>Ver calendario</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.boxCard}>
              <AgendaRow time="11:30 AM" name="Elena Martínez" detail="Examen Físico Anual" />
              <AgendaRow time="12:15 PM" name="Roberto Gómez" detail="Revisión de Laboratorio" />
              <AgendaRow time="01:00 PM" name="Sofía Ruiz" detail="Consulta de Hipertensión" />
            </View>
          </View>

          {/* Expedientes */}
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>Expedientes Recientes</Text>
              <TouchableOpacity>
                <Text style={styles.sectionLink}>Ver todos</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filesGrid}>
              <FileCard name="Carlos Mendoza" id="ID: #VM-2049" lastSeen="Visto por última vez: Ayer" />
              <FileCard name="Lucía Fernández" id="ID: #VM-1158" lastSeen="Visto por última vez: 2 días" />
            </View>

            <View style={styles.searchWrap}>
              <View style={styles.searchBox}>
                <MaterialIcons name="search" size={18} color={colors.viremMuted} />
                <TextInput
                  placeholder="Buscar paciente por nombre o ID..."
                  placeholderTextColor={colors.viremMuted}
                  style={styles.searchInput}
                />
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardMedico;

/* ===================== STYLES ===================== */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.bgLight,
  },

  /* Sidebar */
  sidebar: {
    width: 256,
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.viremLight,
  },
  sidebarInner: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  sidebarTop: {
    gap: 18,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  brandIcon: {
    width: 40,
    height: 40,
    backgroundColor: colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandTextBox: {
    flexDirection: 'column',
  },
  brandTitle: {
    color: colors.viremDark,
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 20,
  },
  brandSubtitle: {
    color: colors.viremMuted,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 2,
  },
  nav: {
    gap: 8,
    marginTop: 8,
  },
  sideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  sideItemActive: {
    backgroundColor: 'rgba(19,127,236,0.10)',
  },
  sideItemText: {
    color: colors.viremMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  sideItemTextActive: {
    color: colors.primary,
    fontWeight: '800',
  },
  badge: {
    marginLeft: 'auto',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },

  sidebarBottom: {
    gap: 14,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.viremLight,
    borderRadius: 14,
    backgroundColor: colors.white,
  },
  docAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
  },
  docMeta: {
    flex: 1,
    overflow: 'hidden',
  },
  docName: {
    color: colors.viremDark,
    fontSize: 12,
    fontWeight: '800',
  },
  docSpec: {
    color: colors.viremMuted,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  logoutText: {
    color: colors.viremMuted,
    fontSize: 14,
    fontWeight: '600',
  },

  /* Main */
  main: { flex: 1 },

  headerWrap: { paddingHorizontal: 32, paddingTop: 32, paddingBottom: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 14,
  },
  headerLeft: { flex: 1 },
  h1: {
    color: colors.viremDark,
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  hSub: {
    color: colors.viremMuted,
    fontSize: 16,
    marginTop: 6,
    fontWeight: '500',
  },
  headerRight: { alignItems: 'flex-end' },
  headerDate: { color: colors.viremDark, fontSize: 14, fontWeight: '800' },
  headerTime: { color: colors.viremMuted, fontSize: 12, marginTop: 2 },

  /* Stats */
  statsGrid: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  statCard: {
    flexGrow: 1,
    flexBasis: 260,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.viremLight,
    borderRadius: 14,
    padding: 18,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 1px 2px rgba(0,0,0,0.06)' as any }
      : {
          shadowColor: '#000',
          shadowOpacity: 0.06,
          shadowRadius: 6,
          shadowOffset: { width: 0, height: 2 },
          elevation: 2,
        }),
  },
  statTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statTitle: {
    color: colors.viremMuted,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  statBottomRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, marginTop: 10 },
  statValue: { color: colors.viremDark, fontSize: 30, fontWeight: '900' },
  trendRow: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingBottom: 2 },
  trendText: { fontSize: 13, fontWeight: '800' },

  /* Banner */
  banner: {
    marginHorizontal: 32,
    marginVertical: 16,
    backgroundColor: colors.viremDeep,
    borderRadius: 14,
    padding: 18,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? { boxShadow: '0px 8px 16px rgba(10,25,49,0.18)' as any }
      : {
          shadowColor: '#0A1931',
          shadowOpacity: 0.18,
          shadowRadius: 14,
          shadowOffset: { width: 0, height: 8 },
          elevation: 6,
        }),
  },
  bannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 16,
    zIndex: 2,
  },
  bannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  patientRing: {
    width: 64,
    height: 64,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: 'rgba(19,127,236,0.30)',
    padding: 4,
  },
  patientAvatar: { width: '100%', height: '100%', borderRadius: 999 },
  bannerTexts: { flex: 1 },
  bannerTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  nowPill: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  nowPillText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  bannerTitle: { color: '#fff', fontSize: 18, fontWeight: '900' },
  bannerSub: { color: colors.viremLight, fontSize: 13, marginTop: 4, fontWeight: '600' },

  bannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 10,
  },
  bannerBtnText: { color: '#fff', fontWeight: '900' },

  bannerIconGhost: {
    position: 'absolute',
    right: -10,
    top: -10,
    opacity: 0.1,
    zIndex: 1,
  },

  /* Bottom grid */
  bottomGrid: {
    paddingHorizontal: 32,
    paddingTop: 8,
    paddingBottom: 24,
    flexDirection: 'row',
    gap: 18,
    flexWrap: 'wrap',
  },
  section: {
    flexGrow: 1,
    flexBasis: 420,
    gap: 12,
  },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { color: colors.viremDark, fontSize: 18, fontWeight: '900' },
  sectionLink: { color: colors.primary, fontSize: 13, fontWeight: '900' },

  boxCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.viremLight,
    borderRadius: 14,
    overflow: 'hidden',
  },
  agendaRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: colors.viremLight,
  },
  agendaLeft: { flexDirection: 'row', alignItems: 'center', gap: 14, flex: 1 },
  agendaTime: { width: 72, color: colors.viremMuted, fontSize: 13, fontWeight: '900' },
  agendaTexts: { flex: 1 },
  agendaName: { color: colors.viremDark, fontSize: 13, fontWeight: '900' },
  agendaDetail: { color: colors.viremMuted, fontSize: 12, marginTop: 2, fontWeight: '600' },

  filesGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  fileCard: {
    flexGrow: 1,
    flexBasis: 220,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.viremLight,
    borderRadius: 14,
    padding: 14,
  },
  fileTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  fileIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(179,207,229,0.30)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: { color: colors.viremDark, fontSize: 13, fontWeight: '900' },
  fileId: { color: colors.viremMuted, fontSize: 12, marginTop: 2, fontWeight: '600' },
  fileLastSeen: { color: colors.viremMuted, fontSize: 12, fontStyle: 'italic' },

  searchWrap: { marginTop: 6 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.viremLight,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, color: colors.viremDark, fontWeight: '600' },
});
