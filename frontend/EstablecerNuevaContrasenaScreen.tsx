import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiUrl } from './config/backend';
import { RootStackParamList } from './navigation/types';

type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  'EstablecerNuevaContrasena'
>;
type RouteProps = RouteProp<RootStackParamList, 'EstablecerNuevaContrasena'>;

const ViremLogo = require('./assets/imagenes/Virem.png');
const { width } = Dimensions.get('window');

const colors = {
  primary: '#4A7FA7',
  backgroundLight: '#F6FAFD',
  textPrimary: '#0A1931',
  textSecondary: '#1A3D63',
  borderColor: '#B3CFE5',
  cardLight: '#FFFFFF',
  placeholder: '#9ca3af',
};

const EstablecerNuevaContrasenaScreen: React.FC = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RouteProps>();
  const email = route.params?.email; // Traemos el email desde la pantalla anterior

  const checkRule = (rule: string) => {
    if (!newPassword) return false;
    switch (rule) {
      case 'min8':
        return newPassword.length >= 8;
      case 'uppercase':
        return /[A-Z]/.test(newPassword);
      case 'number':
        return /[0-9]/.test(newPassword);
      case 'special':
        return /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);
      default:
        return false;
    }
  };

  const rules = useMemo(
    () => [
      { key: 'min8', label: 'Mínimo 8 caracteres' },
      { key: 'uppercase', label: 'Una mayúscula (A-Z)' },
      { key: 'number', label: 'Un número (0-9)' },
      { key: 'special', label: 'Un símbolo (!@#...)' },
    ],
    []
  );

  const handlePasswordReset = async () => {
    if (!email) {
      Alert.alert('Error', 'No se encontró el correo para actualizar la contraseña.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    if (
      newPassword.length < 8 ||
      !checkRule('uppercase') ||
      !checkRule('number') ||
      !checkRule('special')
    ) {
      Alert.alert('Seguridad', 'La contraseña no cumple con los requisitos.');
      return;
    }

    setIsLoading(true);

    try {
      // PETICIÓN PARA ACTUALIZAR LA CLAVE EN POSTGRES
      const response = await fetch(apiUrl('/actualizar-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email?.toLowerCase().trim(),
          newPassword: newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        Alert.alert('¡Éxito!', 'Contraseña actualizada. Ya puedes iniciar sesión.');
        navigation.navigate('Login');
      } else {
        Alert.alert('Error', data.message || 'No se pudo actualizar.');
      }
    } catch (error) {
      Alert.alert('Error', 'No hay conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => navigation.navigate('Login');

  return (
    <View style={styles.mainContainer}>
      <View style={styles.cardContainer}>
        <View style={styles.logoWrapper}>
          <Image source={ViremLogo} style={styles.logoImage} />
          <Text style={styles.logoText}>Virem</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>Establecer nueva contraseña</Text>
          <Text style={styles.subtitle}>
            Crea una contraseña segura para tu cuenta.
          </Text>
          {!!email && (
            <Text style={[styles.subtitle, { marginTop: 6 }]} numberOfLines={1}>
              {email}
            </Text>
          )}
        </View>

        <View style={styles.formSection}>
          {/* Nueva contraseña */}
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Nueva contraseña</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Escribe tu nueva contraseña"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!isPasswordVisible}
                value={newPassword}
                onChangeText={setNewPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.visibilityIconWrapper}
                onPress={() => setIsPasswordVisible((v) => !v)}
              >
                <MaterialIcons
                  name={isPasswordVisible ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirmar contraseña */}
          <View style={styles.labelContainer}>
            <Text style={styles.labelText}>Confirmar contraseña</Text>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="Confirma tu contraseña"
                placeholderTextColor={colors.placeholder}
                secureTextEntry={!isConfirmPasswordVisible}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
              />

              <TouchableOpacity
                style={styles.visibilityIconWrapper}
                onPress={() => setIsConfirmPasswordVisible((v) => !v)}
              >
                <MaterialIcons
                  name={isConfirmPasswordVisible ? 'visibility' : 'visibility-off'}
                  size={22}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Reglas */}
          <View style={styles.rulesGrid}>
            {rules.map((r) => {
              const ok = checkRule(r.key);
              return (
                <View key={r.key} style={styles.ruleItem}>
                  <MaterialIcons
                    name={ok ? 'check-circle' : 'radio-button-unchecked'}
                    size={16}
                    color={ok ? colors.primary : colors.borderColor}
                  />
                  <Text style={styles.ruleText}>{r.label}</Text>
                </View>
              );
            })}
          </View>

          {/* Botón actualizar */}
          <TouchableOpacity
            style={styles.updateButton}
            onPress={handlePasswordReset}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Actualizar contraseña</Text>
            )}
          </TouchableOpacity>

          {/* Volver */}
          <TouchableOpacity
            style={styles.footerLinkWrapper}
            onPress={handleBackToLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <MaterialIcons name="arrow-back" size={18} color={colors.textSecondary} />
            <Text style={styles.footerLinkText}>Volver al login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  logoWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  logoImage: {
    width: 32,
    height: 32,
    tintColor: colors.primary,
    resizeMode: 'contain',
  },
  logoText: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary },
  cardContainer: {
    width: width < 400 ? '95%' : 380,
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    elevation: 3,
    padding: 25,
    alignItems: 'center',
  },
  header: { width: '100%', alignItems: 'center', marginBottom: 18 },
  title: {
    color: colors.textPrimary,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', marginTop: 5 },
  formSection: { width: '100%' },
  labelContainer: { marginBottom: 15 },
  labelText: { color: colors.textPrimary, fontSize: 14, fontWeight: '500', marginBottom: 5 },
  inputGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderColor,
    borderRadius: 8,
    height: 48,
    overflow: 'hidden',
  },
  input: { flex: 1, paddingHorizontal: 12, color: colors.textPrimary },
  visibilityIconWrapper: {
    width: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderLeftWidth: 1,
    borderLeftColor: colors.borderColor,
  },
  rulesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 2,
  },
  ruleItem: { flexDirection: 'row', alignItems: 'center', width: '48%', marginBottom: 6 },
  ruleText: { color: colors.textSecondary, fontSize: 11, marginLeft: 6 },
  updateButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: { color: 'white', fontSize: 15, fontWeight: 'bold' },
  footerLinkWrapper: { flexDirection: 'row', alignItems: 'center', marginTop: 18 },
  footerLinkText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
    textDecorationLine: 'underline',
  },
});

export default EstablecerNuevaContrasenaScreen;
