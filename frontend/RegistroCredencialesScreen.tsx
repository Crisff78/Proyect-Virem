import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Image,
  Platform,
} from 'react-native';
import { RootStackParamList } from './navigation/types';
import { BACKEND_URL, apiUrl } from './config/backend';
import { isStrongPassword, isValidEmail } from './utils/validation';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'RegistroCredenciales'>;
type RegistroRouteProp = RouteProp<RootStackParamList, 'RegistroCredenciales'>;

const { width } = Dimensions.get('window');
const ViremLogo = require('./assets/imagenes/descarga.png');

const colors = {
  primary: '#137fec',
  backgroundLight: '#F6FAFD',
  navyDark: '#0A1931',
  navyMedium: '#1A3D63',
  blueGray: '#4A7FA7',
  white: '#FFFFFF',
  slate50: '#f8fafc',
};

type DatosPaciente = {
  nombres: string;
  apellidos: string;
  fechanacimiento: string;
  genero: string;
  cedula: string;
  telefono: string;
};

function esDatosPaciente(x: any): x is DatosPaciente {
  return (
    x &&
    typeof x.nombres === 'string' &&
    typeof x.apellidos === 'string' &&
    typeof x.fechanacimiento === 'string' &&
    typeof x.genero === 'string' &&
    typeof x.cedula === 'string' &&
    typeof x.telefono === 'string'
  );
}

function showAlert(title: string, message: string) {
  if (Platform.OS === 'web') {
    // @ts-ignore
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
}

const RegistroCredencialesScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RegistroRouteProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    if (!route.params?.datosPersonales) {
      showAlert('Error', 'Faltan datos personales para completar el registro.');
      return;
    }

    const dpAny = route.params.datosPersonales;
    if (!esDatosPaciente(dpAny)) {
      showAlert('Error', 'Este registro de credenciales está configurado para Paciente.');
      return;
    }

    if (!email || !password || !confirmPassword) {
      showAlert('Error', 'Complete todos los campos.');
      return;
    }

    const emailTrim = email.toLowerCase().trim();

    if (!isValidEmail(emailTrim)) {
      showAlert('Error', 'El correo no tiene un formato válido.');
      return;
    }

    if (!isStrongPassword(password)) {
      showAlert(
        'Seguridad',
        'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un carácter especial.\n\nEj: Toribio123!'
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Las contraseñas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const telefonoDigits = String(dpAny.telefono || '').replace(/\D/g, '');
      const cedulaClean = String(dpAny.cedula || '').trim();

      const bodyCompleto = {
        nombres: String(dpAny.nombres || '').trim(),
        apellidos: String(dpAny.apellidos || '').trim(),
        fechanacimiento: String(dpAny.fechanacimiento || '').trim(),
        genero: String(dpAny.genero || '').trim(),
        cedula: cedulaClean,
        telefono: telefonoDigits,
        email: emailTrim,
        password: String(password),
      };

      console.log('🌐 BACKEND_URL:', BACKEND_URL);
      console.log('🌐 Register URL:', apiUrl('/api/auth/register'));
      console.log('📦 Enviando body register:', bodyCompleto);

      const response = await fetch(apiUrl('/api/auth/register'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyCompleto),
      });

      const res = await response.json().catch(() => null);

      if (!response.ok || !res?.success) {
        // ✅ aquí mostramos el error real del backend si viene
        const detalle = res?.error ? `\n\nDetalle: ${res.error}` : '';
        showAlert('Error', (res?.message || `Fallo (HTTP ${response.status}).`) + detalle);
        return;
      }

      showAlert('¡Éxito!', 'Cuenta creada correctamente. Ahora inicia sesión.');
      navigation.replace('Login');
    } catch (error) {
      showAlert('Error de Red', `No se pudo conectar al servidor.\n\nBackend actual: ${BACKEND_URL}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.mainWrapper}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoGroup}>
            <Image source={ViremLogo} style={styles.logoImage} />
            <Text style={styles.logoText}>VIREM</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.contentWrapper}>
          <View style={styles.progressSection}>
            <Text style={styles.progressTitle}>Credenciales de Acceso</Text>
            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarFill} />
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Finalizar Registro</Text>
            <Text style={styles.cardSubtitle}>
              Hola {(route.params?.datosPersonales as any)?.nombres ?? ''}, crea tu cuenta para acceder.
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color={colors.blueGray} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="nombre@correo.com"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Contraseña</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color={colors.blueGray} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Toribio123!"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={secureText}
                />
                <TouchableOpacity onPress={() => setSecureText(!secureText)}>
                  <MaterialIcons name={secureText ? 'visibility' : 'visibility-off'} size={20} color={colors.blueGray} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color={colors.blueGray} style={{ marginRight: 10 }} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Ej: Toribio123!"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={secureText}
                />
              </View>
            </View>

            <TouchableOpacity style={styles.btnPrimary} onPress={handleFinish} disabled={isLoading}>
              {isLoading ? <ActivityIndicator color="white" /> : <Text style={styles.btnPrimaryText}>Crear Cuenta</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnBack} onPress={() => navigation.goBack()}>
              <Text style={styles.btnBackText}>Volver</Text>
            </TouchableOpacity>

            <Text style={{ marginTop: 14, fontSize: 12, color: colors.blueGray, textAlign: 'center' }}>
              Backend: {BACKEND_URL}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: colors.backgroundLight },
  header: {
    height: 70,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerContent: { flexDirection: 'row', alignItems: 'center' },

  logoGroup: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoImage: { width: 42, height: 42, resizeMode: 'contain', borderRadius: 10 },
  logoText: { fontSize: 22, fontWeight: 'bold', color: colors.navyDark },

  contentWrapper: { padding: 20, maxWidth: 500, alignSelf: 'center', width: '100%' },
  progressSection: { marginBottom: 25 },
  progressTitle: { fontSize: 18, fontWeight: 'bold', color: colors.navyDark, marginBottom: 10 },
  progressBarBackground: { height: 8, backgroundColor: '#e2e8f0', borderRadius: 4, overflow: 'hidden' },
  progressBarFill: { height: '100%', width: '100%', backgroundColor: colors.primary },

  formCard: { backgroundColor: 'white', borderRadius: 20, padding: 25, elevation: 5 },
  cardTitle: { fontSize: 24, fontWeight: 'bold', color: colors.navyDark, textAlign: 'center', marginBottom: 10 },
  cardSubtitle: { fontSize: 15, color: colors.blueGray, textAlign: 'center', marginBottom: 25 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: colors.navyDark, marginBottom: 8 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 50,
    backgroundColor: colors.slate50,
  },
  textInput: { flex: 1, fontSize: 16, color: colors.navyDark },

  btnPrimary: {
    backgroundColor: colors.primary,
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  btnPrimaryText: { color: 'white', fontSize: 16, fontWeight: 'bold' },

  btnBack: { marginTop: 20, alignItems: 'center' },
  btnBackText: { color: colors.blueGray, fontWeight: '600' },
});

export default RegistroCredencialesScreen;
