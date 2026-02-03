import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from './navigation/types';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'SeleccionPerfil'>;

const colors = {
  primary: '#137fec',
  blueDeep: '#0A1931',
  blueDark: '#1A3D63',
  blueMedium: '#4A7FA7',
  blueLight: '#B3CFE5',
  pageBg: '#F6FAFD',
  white: '#FFFFFF',
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.pageBg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  contentWrapper: {
    width: '100%',
    maxWidth: 768,
    alignItems: 'center',
  },
  title: {
    color: colors.blueDeep,
    fontSize: 32,
    fontWeight: 'bold',
    paddingTop: 24,
    paddingBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    color: colors.blueMedium,
    fontSize: 16,
    maxWidth: 400,
    textAlign: 'center',
    marginBottom: 48,
  },
  cardsGrid: {
    width: '100%',
    flexDirection: Dimensions.get('window').width > 600 ? 'row' : 'column',
    justifyContent: 'center',
    gap: 32,
    paddingHorizontal: 16,
  },
  card: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.blueLight,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  iconWrapper: {
    height: 80,
    width: 80,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 40,
    backgroundColor: 'rgba(179, 207, 229, 0.3)',
    marginBottom: 24,
  },
  cardTitle: {
    color: colors.blueDeep,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  registerButton: {
    marginTop: 24,
    minWidth: 180,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  buttonMedico: {
    backgroundColor: colors.blueDark,
  },
  buttonPaciente: {
    backgroundColor: colors.blueMedium,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  footerWrapper: {
    marginTop: 48,
  },
  footerText: {
    color: colors.blueMedium,
    fontSize: 14,
  },
  footerLink: {
    color: colors.blueDark,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});

const SeleccionPerfil: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  const handleRegister = (profile: 'Medico' | 'Paciente') => {
    const route = profile === 'Paciente' ? 'RegistroPaciente' : 'RegistroMedico';
    navigation.navigate(route);
  };

  const handleLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.contentWrapper}>
        <Text style={styles.title}>Elige cómo quieres registrarte</Text>
        <Text style={styles.subtitle}>
          Selecciona tu perfil para acceder a las herramientas y funciones diseñadas específicamente para ti.
        </Text>

        <View style={styles.cardsGrid}>
          {/* TARJETA 1: MÉDICO */}
          <View style={styles.card}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="stethoscope" size={50} color={colors.blueDark} />
            </View>
            <Text style={styles.cardTitle}>Médico</Text>
            <TouchableOpacity
              style={[styles.registerButton, styles.buttonMedico]}
              onPress={() => handleRegister('Medico')}
            >
              <Text style={styles.buttonText}>Registrarme</Text>
            </TouchableOpacity>
          </View>

          {/* TARJETA 2: PACIENTE */}
          <View style={styles.card}>
            <View style={styles.iconWrapper}>
              <MaterialCommunityIcons name="account" size={50} color={colors.blueDark} />
            </View>
            <Text style={styles.cardTitle}>Paciente</Text>
            <TouchableOpacity
              style={[styles.registerButton, styles.buttonPaciente]}
              onPress={() => handleRegister('Paciente')}
            >
              <Text style={styles.buttonText}>Registrarme</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footerWrapper}>
          <Text style={styles.footerText}>
            ¿Ya tienes una cuenta?{' '}
            <Text style={styles.footerLink} onPress={handleLogin}>
              Inicia sesión aquí.
            </Text>
          </Text>
        </View>
      </View>
    </View>
  );
};

export default SeleccionPerfil;
