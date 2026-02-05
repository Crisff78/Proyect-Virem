import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';

const ViremLogo = require('./assets/imagenes/descarga.png');

const DashboardPacienteScreen = () => {
  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        {/* Logo */}
        <View style={styles.logoBox}>
          <Image source={ViremLogo} style={styles.logo} />
          <View>
            <Text style={styles.logoTitle}>VIREM</Text>
            <Text style={styles.logoSubtitle}>Portal Paciente</Text>
          </View>
        </View>

        {/* Menú */}
        <View style={styles.menu}>
          <Text style={styles.menuItemActive}>🏠 Inicio</Text>
          <Text style={styles.menuItem}>🔍 Buscar Médicos</Text>
          <Text style={styles.menuItem}>📅 Mis Citas</Text>
          <Text style={styles.menuItem}>📄 Historial Médico</Text>
          <Text style={styles.menuItem}>👤 Perfil</Text>
        </View>

        {/* Botón cerrar */}
        <TouchableOpacity style={styles.logoutButton}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <ScrollView style={styles.main}>
        <Text style={styles.title}>¡Hola, Juan Pérez!</Text>
        <Text style={styles.subtitle}>
          Bienvenido de nuevo a tu portal de salud VIREM.
        </Text>

        {/* Search bar */}
        <View style={styles.searchBox}>
          <Text style={styles.searchPlaceholder}>
            🔍 ¿Qué especialista buscas hoy?
          </Text>
          <TouchableOpacity style={styles.searchButton}>
            <Text style={{ color: 'white', fontWeight: 'bold' }}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {/* Próxima cita */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Próxima Cita</Text>
          <Text style={styles.cardText}>
            Dr. Alejandro Ruiz - Cardiología
          </Text>
          <Text style={styles.cardText}>25 Octubre - 10:30 AM</Text>

          <TouchableOpacity style={styles.callButton}>
            <Text style={styles.callButtonText}>📹 Entrar a Videollamada</Text>
          </TouchableOpacity>
        </View>

        {/* Salud al día */}
        <View style={styles.healthCard}>
          <Text style={styles.healthTitle}>Tu Salud al Día</Text>
          <Text style={styles.healthText}>❤️ Ritmo Cardíaco: 72 bpm</Text>
          <Text style={styles.healthText}>👣 Pasos Hoy: 8,432</Text>
        </View>
      </ScrollView>
    </View>
  );
};

export default DashboardPacienteScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#F6FAFD',
  },

  /* Sidebar */
  sidebar: {
    width: 250,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'space-between',
    borderRightWidth: 1,
    borderRightColor: '#ddd',
  },

  logoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  logo: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
  },

  logoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A1931',
  },

  logoSubtitle: {
    fontSize: 10,
    color: '#4A7FA7',
    fontWeight: '600',
  },

  menu: {
    marginTop: 40,
    gap: 15,
  },

  menuItem: {
    fontSize: 15,
    color: '#4A7FA7',
    fontWeight: '500',
  },

  menuItemActive: {
    fontSize: 15,
    color: '#137fec',
    fontWeight: 'bold',
  },

  logoutButton: {
    backgroundColor: '#1A3D63',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  logoutText: {
    color: 'white',
    fontWeight: 'bold',
  },

  /* Main */
  main: {
    flex: 1,
    padding: 30,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0A1931',
  },

  subtitle: {
    fontSize: 16,
    color: '#4A7FA7',
    marginBottom: 25,
  },

  searchBox: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  searchPlaceholder: {
    fontSize: 14,
    color: '#999',
  },

  searchButton: {
    backgroundColor: '#137fec',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 10,
  },

  card: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#0A1931',
  },

  cardText: {
    fontSize: 14,
    color: '#4A7FA7',
  },

  callButton: {
    marginTop: 15,
    backgroundColor: '#137fec',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  callButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },

  healthCard: {
    backgroundColor: '#1A3D63',
    padding: 20,
    borderRadius: 20,
  },

  healthTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 10,
  },

  healthText: {
    color: '#B3CFE5',
    fontSize: 14,
    marginBottom: 5,
  },
});
