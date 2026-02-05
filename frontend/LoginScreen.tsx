import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';

import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as SecureStore from 'expo-secure-store';

import { RootStackParamList } from './navigation/types';
import { apiUrl, BACKEND_URL } from './config/backend';
import { isValidEmail } from './utils/validation';

import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const ViremLogo = require('./assets/imagenes/descarga.png');

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

const COLORS = {
  primary: '#1F4770',
  backgroundLight: '#F3F6F9',
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  borderLight: '#E0E0E0',
  cardLight: '#FFFFFF',
  link: '#1F4770',
  iconColor: '#888888',
};

async function saveSession(token?: string, userProfile?: any) {
  // ✅ Web: usar localStorage (SecureStore suele fallar en web)
  if (Platform.OS === 'web') {
    try {
      if (token) localStorage.setItem('authToken', token);
      if (userProfile) localStorage.setItem('userProfile', JSON.stringify(userProfile));
    } catch (e) {
      console.log('⚠️ localStorage falló:', e);
    }
    return;
  }

  // ✅ Mobile: SecureStore
  try {
    if (token) await SecureStore.setItemAsync('authToken', token);
    if (userProfile) await SecureStore.setItemAsync('userProfile', JSON.stringify(userProfile));
  } catch (e) {
    console.log('⚠️ SecureStore falló:', e);
  }
}

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const emailTrim = email.toLowerCase().trim();

    if (!emailTrim || !password) {
      Alert.alert('Error', 'Completa correo y contraseña.');
      return;
    }

    if (!isValidEmail(emailTrim)) {
      Alert.alert('Error', 'El correo no tiene un formato válido.');
      return;
    }

    setIsLoading(true);

    const url = apiUrl('/api/auth/login');

    console.log('================ LOGIN ================');
    console.log('Platform:', Platform.OS);
    console.log('BACKEND_URL:', BACKEND_URL);
    console.log('Login URL:', url);
    console.log('Email:', emailTrim);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailTrim, password }),
      });

      // ✅ leer texto primero evita crashes de json
      const raw = await response.text();
      console.log('HTTP:', response.status);
      console.log('RAW:', raw);

      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }

      if (!response.ok || !data?.success) {
        Alert.alert('Error', data?.message || `Login falló (HTTP ${response.status}).`);
        return;
      }

      const token = data?.token ?? data?.data?.token ?? '';
      const userProfile = data?.user ?? data?.data?.user ?? null;

      // ✅ Guardar sesión sin bloquear navegación
      await saveSession(token, userProfile);

      console.log('✅ Login OK -> DashboardPaciente');

      // ✅ Navega directo (sin depender de Alert)
      navigation.reset({ index: 0, routes: [{ name: 'DashboardPaciente' as any }] });

      // ✅ opcional: mostrar mensaje DESPUÉS (no bloquea navegación)
      setTimeout(() => {
        Alert.alert('✅ Éxito', 'Iniciaste sesión correctamente.');
      }, 200);

    } catch (err: any) {
      console.log('❌ ERROR LOGIN:', err?.message || err);
      Alert.alert(
        'Error de red',
        `No se pudo conectar al backend.\n\nBackend actual: ${BACKEND_URL}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => navigation.navigate('RecuperarContrasena');
  const handleGoToRegister = () => navigation.navigate('SeleccionPerfil');

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.backgroundLight} />

      <View style={styles.container}>
        <View style={styles.card}>
          <View style={styles.logoSectionHorizontal}>
            <Image source={ViremLogo} style={styles.logoSmallOriginal} />
            <Text style={styles.appNameHorizontal}>VIREM</Text>
          </View>

          <Text style={styles.title}>Accede a tu cuenta</Text>
          <Text style={styles.subtitle}>
            Bienvenido de nuevo. Por favor, introduce tus credenciales.
          </Text>

          <View style={styles.form}>
            <Text style={styles.inputLabel}>Correo Electrónico</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="email-outline"
                size={22}
                color={COLORS.iconColor}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <Text style={styles.inputLabel}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={22}
                color={COLORS.iconColor}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Introduce tu contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
            </View>

            <TouchableOpacity onPress={handleForgotPassword} style={styles.forgotPasswordLink}>
              <Text style={styles.linkText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]}
              activeOpacity={0.8}
              onPress={handleLogin}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Iniciar Sesión</Text>}
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleGoToRegister} style={styles.registerLink}>
            <Text style={styles.registerText}>
              ¿No tienes cuenta? <Text style={styles.linkTextBold}>Regístrate</Text>
            </Text>
          </TouchableOpacity>

          <Text style={{ marginTop: 14, fontSize: 12, color: '#4A7FA7' }}>
            Backend: {BACKEND_URL}
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.backgroundLight },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20 },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: COLORS.cardLight,
    borderRadius: 16,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  logoSectionHorizontal: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  logoSmallOriginal: { width: 30, height: 30, resizeMode: 'contain', marginRight: 8 },
  appNameHorizontal: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.textPrimary, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, textAlign: 'center', marginBottom: 30, paddingHorizontal: 10 },
  form: { width: '100%', gap: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 5 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 8,
    backgroundColor: COLORS.cardLight,
  },
  inputIcon: { paddingLeft: 12, paddingRight: 8 },
  input: { flex: 1, fontSize: 16, color: COLORS.textPrimary },
  forgotPasswordLink: { alignSelf: 'flex-end', paddingVertical: 5, marginTop: -5 },
  linkText: { color: COLORS.link, fontSize: 14, fontWeight: '600' },
  button: { width: '100%', height: 48, backgroundColor: COLORS.primary, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  buttonText: { color: COLORS.cardLight, fontSize: 18, fontWeight: 'bold' },
  registerLink: { marginTop: 20 },
  registerText: { fontSize: 14, color: COLORS.textSecondary },
  linkTextBold: { color: COLORS.link, fontSize: 14, fontWeight: 'bold' },
});
