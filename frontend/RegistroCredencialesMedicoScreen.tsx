import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import {
  Alert,
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
import { RootStackParamList, DatosPersonalesMedico } from './navigation/types';
import { BACKEND_URL, apiUrl } from './config/backend';
import { isStrongPassword, isValidEmail } from './utils/validation';

type NavigationProps = NativeStackNavigationProp<RootStackParamList, 'RegistroCredencialesMedico'>;
type RegistroMedicoRouteProp = RouteProp<RootStackParamList, 'RegistroCredencialesMedico'>;

const ViremLogo = require('./assets/imagenes/descarga.png');

const colors = {
  primary: '#137fec',
  backgroundLight: '#F6FAFD',
  navyDark: '#0A1931',
  blueGray: '#4A7FA7',
  slate50: '#f8fafc',
};

function esDatosMedico(x: any): x is DatosPersonalesMedico {
  return (
    x &&
    typeof x.nombreCompleto === 'string' &&
    typeof x.fechanacimiento === 'string' &&
    typeof x.genero === 'string' &&
    typeof x.especialidad === 'string' &&
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

const RegistroCredencialesMedicoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();
  const route = useRoute<RegistroMedicoRouteProp>();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleFinish = async () => {
    if (!route.params?.datosPersonales) {
      showAlert('Error', 'Faltan datos del medico para completar el registro.');
      return;
    }

    const dm = route.params.datosPersonales;
    if (!esDatosMedico(dm)) {
      showAlert('Error', 'Este registro de credenciales esta configurado para medicos.');
      return;
    }

    if (!email || !password || !confirmPassword) {
      showAlert('Error', 'Complete todos los campos.');
      return;
    }

    const emailTrim = email.toLowerCase().trim();
    if (!isValidEmail(emailTrim)) {
      showAlert('Error', 'El correo no tiene un formato valido.');
      return;
    }

    if (!isStrongPassword(password)) {
      showAlert(
        'Seguridad',
        'La contrasena debe tener al menos 8 caracteres, una mayuscula, un numero y un caracter especial.'
      );
      return;
    }

    if (password !== confirmPassword) {
      showAlert('Error', 'Las contrasenas no coinciden.');
      return;
    }

    setIsLoading(true);

    try {
      const bodyCompleto = {
        nombreCompleto: String(dm.nombreCompleto || '').trim(),
        fechanacimiento: String(dm.fechanacimiento || '').trim(),
        genero: String(dm.genero || '').trim(),
        especialidad: String(dm.especialidad || '').trim(),
        cedula: String(dm.cedula || '').replace(/\D/g, '').slice(0, 11),
        telefono: String(dm.telefono || '').replace(/\D/g, '').slice(0, 15),
        email: emailTrim,
        password: String(password),
      };

      const response = await fetch(apiUrl('/api/auth/register-medico'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyCompleto),
      });

      const res = await response.json().catch(() => null);

      if (!response.ok || !res?.success) {
        const detalle = res?.error ? `\n\nDetalle: ${res.error}` : '';
        showAlert('Error', (res?.message || `Fallo (HTTP ${response.status}).`) + detalle);
        return;
      }

      showAlert('Exito', 'Cuenta de medico creada correctamente. Ahora inicia sesion.');
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
            <Text style={styles.progressTitle}>Credenciales de Acceso (Medico)</Text>
            <View style={styles.progressBarBackground}>
              <View style={styles.progressBarFill} />
            </View>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.cardTitle}>Finalizar Registro</Text>
            <Text style={styles.cardSubtitle}>
              Hola {route.params?.datosPersonales?.nombreCompleto ?? ''}, crea tu cuenta profesional.
            </Text>

            <View style={styles.infoBox}>
              <Text style={styles.infoText}>
                Especialidad: {route.params?.datosPersonales?.especialidad ?? 'No definida'}
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electronico</Text>
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
              <Text style={styles.label}>Contrasena</Text>
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
              <Text style={styles.label}>Confirmar Contrasena</Text>
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
  cardSubtitle: { fontSize: 15, color: colors.blueGray, textAlign: 'center', marginBottom: 15 },
  infoBox: { backgroundColor: colors.slate50, borderRadius: 10, padding: 10, marginBottom: 16 },
  infoText: { color: colors.navyDark, fontSize: 13, textAlign: 'center' },

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

export default RegistroCredencialesMedicoScreen;
