import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { apiUrl } from './config/backend';
import { RootStackParamList } from './navigation/types';
import { isValidEmail } from './utils/validation';

type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  'RecuperarContrasena'
>;

const { width } = Dimensions.get('window');

// ===================================================
// ESTILOS BASE
// ===================================================
const colors = {
  primary: '#4A7FA7',
  backgroundLight: '#F6FAFD',
  backgroundDark: '#0A1931',
  textPrimaryLight: '#0A1931',
  textSecondaryLight: '#1A3D63',
  textSecondaryDark: '#B3CFE5',
  borderLight: '#B3CFE5',
  cardLight: '#FFFFFF',
  placeholder: '#617589',
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },

  cardContainer: {
    width: width < 400 ? '95%' : 380,
    backgroundColor: colors.cardLight,
    borderRadius: 12,
    padding: 22,
    elevation: 3,
  },

  iconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EAF2FA',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },

  icon: {
    color: colors.primary,
  },

  headerText: {
    alignItems: 'center',
    marginBottom: 18,
  },

  title: {
    color: colors.textPrimaryLight,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitle: {
    color: colors.textSecondaryLight,
    fontSize: 13,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 18,
  },

  labelText: {
    color: colors.textPrimaryLight,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },

  inputGroup: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 8,
    height: 48,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },

  input: {
    flex: 1,
    paddingHorizontal: 12,
    color: colors.textPrimaryLight,
  },

  sendCodeButton: {
    width: '100%',
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },

  buttonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: 'bold',
  },

  backToLoginLink: {
    marginTop: 18,
    alignItems: 'center',
  },

  backToLoginText: {
    color: colors.textSecondaryLight,
    fontSize: 14,
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

// ===================================================
// COMPONENTE PRINCIPAL
// ===================================================

const RecuperarContrasenaScreen: React.FC = () => {
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigation = useNavigation<NavigationProps>();

  const handleSendCode = async () => {
    const cleanedEmail = emailOrPhone.toLowerCase().trim();

    if (!cleanedEmail) {
      Alert.alert('Atención', 'Por favor, ingresa tu correo electrónico.');
      return;
    }

    if (!isValidEmail(cleanedEmail)) {
      Alert.alert('Atención', 'Ingresa un correo electrónico válido.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(apiUrl('/enviar-codigo'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ email: cleanedEmail }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        navigation.navigate('VerificarIdentidad', { email: cleanedEmail });
      } else {
        Alert.alert('Error', data.message || 'El correo ingresado no está registrado.');
      }
    } catch (error) {
      Alert.alert(
        'Error de Conexión',
        'No se pudo contactar al servidor. Revisa si el backend está encendido y la URL configurada.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <View style={styles.mainContainer}>
      <View style={styles.cardContainer}>
        <View style={styles.iconWrapper}>
          <MaterialCommunityIcons name="shield-check" size={30} style={styles.icon} />
        </View>

        <View style={styles.headerText}>
          <Text style={styles.title}>Recuperar Contraseña</Text>
          <Text style={styles.subtitle}>
            Ingresa tu correo electrónico asociado a tu cuenta para recibir un código de
            restablecimiento.
          </Text>
        </View>

        <Text style={styles.labelText}>Correo electrónico</Text>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.input}
            placeholder="ejemplo@correo.com"
            placeholderTextColor={colors.placeholder}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.sendCodeButton, isLoading && { opacity: 0.7 }]}
          onPress={handleSendCode}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.buttonText}>Enviar Código</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.backToLoginLink} onPress={handleBackToLogin}>
          <Text style={styles.backToLoginText}>Volver al Inicio de Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RecuperarContrasenaScreen;
