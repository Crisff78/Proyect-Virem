import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useMemo, useState } from "react";
import { Pressable } from "react-native";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import * as ImagePicker from "expo-image-picker";
import * as FaceDetector from "expo-face-detector";

import { RootStackParamList } from "./navigation/types";
import { apiUrl } from "./config/backend";

// Tipado navegación
type NavigationProps = NativeStackNavigationProp<
  RootStackParamList,
  "RegistroMedico"
>;

interface CountryCodeType {
  code: string;
  name: string;
  mask: string;
}

const ViremLogo = require("./assets/imagenes/descarga.png");
const { width } = Dimensions.get("window");

// Prefijos + máscara
const countryCodes: CountryCodeType[] = [
  { code: "+1", name: "República Dominicana", mask: "XXX XXX XXXX" },
  { code: "+593", name: "Ecuador", mask: "XX XXX XXXX" },
  { code: "+1", name: "USA/CAN", mask: "XXX XXX XXXX" },
  { code: "+506", name: "Costa Rica", mask: "XXXX XXXX" },
  { code: "+34", name: "España", mask: "XXX XX XX XX" },
];

// Especialidades
const ESPECIALIDADES = [
  "Medicina General",
  "Psicología",
  "Psiquiatría",
  "Ginecología",
  "Pediatría",
  "Dermatología",
  "Odontología",
  "Nutrición",
  "Neurología",
  "Neumología",
  "Infectología",
  "Endocrinología",
  "Reumatología",
  "Medicina Familiar",
];

// =========================================
// VALIDACIÓN: Fecha real (no futura / no imposible / no >120 años)
// =========================================
const esFechaValida = (fechaStr: string) => {
  if (fechaStr.length !== 10) return false;

  const [dia, mes, anio] = fechaStr.split("/").map(Number);
  const fecha = new Date(anio, mes - 1, dia);

  const esLogica =
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia;

  if (!esLogica) return false;

  const hoy = new Date();
  if (fecha > hoy) return false;

  if (anio < hoy.getFullYear() - 120) return false;

  return true;
};

// =========================================
// VALIDACIÓN: Solo mayores de 18
// =========================================
const esMayorDe18 = (fechaStr: string) => {
  if (!esFechaValida(fechaStr)) return false;

  const [dia, mes, anio] = fechaStr.split("/").map(Number);
  const nacimiento = new Date(anio, mes - 1, dia);

  const hoy = new Date();
  const cumple18 = new Date(
    nacimiento.getFullYear() + 18,
    nacimiento.getMonth(),
    nacimiento.getDate()
  );

  return hoy >= cumple18;
};

// =========================================
// VALIDACIÓN: Cédula Dominicana (limpia guiones y valida dígito verificador)
// =========================================
const validarCedulaDominicana = (cedula: string) => {
  const c = cedula.replace(/\D/g, "");
  if (c.length !== 11) return false;

  let suma = 0;
  const multiplicadores = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];
  for (let i = 0; i < 10; i++) {
    let n = parseInt(c[i]) * multiplicadores[i];
    if (n >= 10) n = Math.floor(n / 10) + (n % 10);
    suma += n;
  }
  const digitoVerificador = (10 - (suma % 10)) % 10;
  return digitoVerificador === parseInt(c[10]);
};

// =========================================
// HELPERS
// =========================================
const filterOnlyLetters = (text: string) =>
  text.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]/g, "");

const applyPhoneMask = (text: string, mask: string) => {
  const digits = text.replace(/\D/g, "");
  let formatted = "";
  let digitIndex = 0;
  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === "X") {
      formatted += digits[digitIndex];
      digitIndex++;
    } else {
      formatted += mask[i];
    }
  }
  return formatted;
};

const formatAndSetDate = (
  text: string,
  setter: React.Dispatch<React.SetStateAction<string>>
) => {
  const cleaned = text.replace(/[^0-9]/g, "");
  let formatted = "";
  if (cleaned.length > 0) {
    if (cleaned.length <= 2) formatted = cleaned;
    else if (cleaned.length <= 4)
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(2)}`;
    else
      formatted = `${cleaned.substring(0, 2)}/${cleaned.substring(
        2,
        4
      )}/${cleaned.substring(4, 8)}`;
  }
  setter(formatted.substring(0, 10));
};

// =========================================
// FORMATO: Cédula RD XXX-XXXXXXX-X
// =========================================
const formatCedulaRD = (text: string) => {
  const digits = text.replace(/\D/g, "").slice(0, 11);
  const p1 = digits.slice(0, 3);
  const p2 = digits.slice(3, 10);
  const p3 = digits.slice(10, 11);

  if (digits.length <= 3) return p1;
  if (digits.length <= 10) return `${p1}-${p2}`;
  return `${p1}-${p2}-${p3}`;
};

// =========================================
// API para validar teléfono
// =========================================
type ValidacionTelefonoBackendOk = { ok: true; meta?: any };
type ValidacionTelefonoBackendFail = { ok: false; reason: string };
type ValidacionTelefonoBackendResult =
  | ValidacionTelefonoBackendOk
  | ValidacionTelefonoBackendFail;

const validarTelefonoBackend = async (
  countryCode: string,
  phoneFormatted: string
): Promise<ValidacionTelefonoBackendResult> => {
  try {
    const digits = phoneFormatted.replace(/\D/g, "");

    const res = await fetch(apiUrl("/api/phone/validar-telefono"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ countryCode, phone: digits }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        ok: false as const,
        reason: data?.message || `No se pudo validar (HTTP ${res.status}).`,
      };
    }

    if (!data.valid) {
      return { ok: false as const, reason: "El número no es válido según Veriphone." };
    }

    return { ok: true as const, meta: data };
  } catch {
    return {
      ok: false as const,
      reason: "Error de red: no se pudo conectar con el backend.",
    };
  }
};

// =========================================
// ✅ API Exequátur (SNS) - TU ENDPOINT LOCAL
// Endpoint: POST /api/validar-exequatur
// =========================================
type ValidacionExequaturOk = { ok: true; meta?: any };
type ValidacionExequaturFail = { ok: false; reason: string };
type ValidacionExequaturResult = ValidacionExequaturOk | ValidacionExequaturFail;

const validarExequaturBackend = async (args: {
  cedula: string;
  nombres: string;
  apellidos: string;
}): Promise<ValidacionExequaturResult> => {
  try {
    const res = await fetch(apiUrl("/api/validar-exequatur"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cedula: args.cedula, // puede ir con guiones; el backend lo limpia
        nombres: args.nombres,
        apellidos: args.apellidos,
      }),
    });

    const data = await res.json().catch(() => null);

    if (!res.ok || !data?.success) {
      return {
        ok: false as const,
        reason: data?.message || `No se pudo validar Exequátur (HTTP ${res.status}).`,
      };
    }

    if (!data.exists) {
      return {
        ok: false as const,
        reason: "Este médico no aparece en el Exequátur del SNS. Verifica cédula y nombres.",
      };
    }

    return { ok: true as const, meta: data };
  } catch {
    return {
      ok: false as const,
      reason: "Error de red: no se pudo consultar el Exequátur.",
    };
  }
};

// =========================================
// Colores + Estilos
// =========================================
const colors = {
  primary: "#137fec",
  disabled: "#cbd5e1",
  backgroundLight: "#F6FAFD",
  navyDark: "#0A1931",
  navyMedium: "#1A3D63",
  blueGray: "#4A7FA7",
  white: "#FFFFFF",
  slate50: "#f8fafc",
  error: "#FF0000",
  shadowColor: "rgba(0, 0, 0, 0.1)",
};

const styles = StyleSheet.create({
  mainWrapper: { flex: 1, backgroundColor: colors.backgroundLight },
  header: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(26, 61, 99, 0.2)",
    elevation: 1,
    zIndex: 50,
  },
  headerContent: {
    maxWidth: 1200,
    width: "100%",
    marginHorizontal: "auto" as any,
    paddingHorizontal: width > 768 ? 24 : 16,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoGroup: { flexDirection: "row", alignItems: "center", gap: 12 },
  logoImage: { width: 40, height: 40, resizeMode: "contain" },
  logoText: {
    color: colors.navyDark,
    fontSize: 18,
    fontWeight: "bold",
    lineHeight: 20,
  },
  logoSubtitle: { color: colors.blueGray, fontSize: 10, fontWeight: "500" },

  mainContent: {
    flex: 1,
    paddingVertical: 32,
    paddingHorizontal: width > 768 ? 24 : 16,
  },
  contentWrapper: {
    maxWidth: 960,
    marginHorizontal: "auto" as any,
    width: "100%",
    gap: 24,
  },

  breadcrumbs: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  breadcrumbLink: { color: colors.blueGray, fontSize: 14, fontWeight: "500" },
  breadcrumbSeparator: { color: colors.blueGray, fontSize: 12 },
  breadcrumbCurrent: {
    color: colors.navyDark,
    fontSize: 14,
    fontWeight: "bold",
  },

  pageTitle: {
    color: colors.navyDark,
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    textAlign: "center",
  },

  formCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: width > 768 ? 32 : 24,
    shadowColor: colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "rgba(26, 61, 99, 0.3)",
  },

  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },
  progressTitle: { color: colors.navyDark, fontSize: 16, fontWeight: "bold" },
  progressPercent: { color: colors.blueGray, fontSize: 14, fontWeight: "500" },
  progressBarOuter: {
    height: 8,
    width: "100%",
    borderRadius: 4,
    backgroundColor: colors.slate50,
    overflow: "hidden",
    marginBottom: 24,
  },
  progressBarInner: {
    height: "100%",
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  formRow: {
    flexDirection: width > 768 ? "row" : "column",
    gap: 24,
    marginBottom: 16,
  },
  inputLabel: {
    color: colors.navyDark,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputWrapper: { flex: 1 },

  selectInput: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.navyMedium,
    backgroundColor: colors.slate50,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  inputField: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.navyMedium,
    backgroundColor: colors.slate50,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.navyDark,
  },

  phoneInputGroup: {
    flexDirection: "row",
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.navyMedium,
    backgroundColor: colors.slate50,
  },
  prefixButton: {
    width: width > 768 ? 90 : 70,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: colors.navyMedium,
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
    paddingLeft: 4,
  },
  prefixText: { color: colors.navyDark, fontSize: 14, fontWeight: "bold" },
  numberInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.navyDark,
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },

  cancelButtonText: { color: colors.blueGray, fontWeight: "bold" },
  continueButton: {
    width: width > 640 ? "auto" : "100%",
    height: 48,
    paddingHorizontal: 32,
    borderRadius: 8,
    backgroundColor: colors.primary,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  footerActions: {
    flexDirection: width > 640 ? "row" : "column-reverse",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 16,
    marginTop: 16,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: "rgba(26, 61, 99, 0.3)",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.slate50,
    borderWidth: 1,
    borderColor: colors.navyMedium,
  },
  modalOptionText: {
    fontSize: 16,
    color: colors.navyDark,
    textAlign: "center",
    fontWeight: "500",
  },

  inputError: { borderColor: colors.error, borderWidth: 1.5 },
  errorText: { color: colors.error, fontSize: 12, marginTop: 4, fontWeight: "500" },

  photoWrap: { alignItems: "center", marginBottom: 24 },
  photoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.slate50,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(26, 61, 99, 0.3)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  photoImg: { width: "100%", height: "100%" },
  photoBtn: {
    marginTop: 12,
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(26, 61, 99, 0.3)",
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  photoBtnText: { color: colors.blueGray, fontWeight: "bold" },
});

const RegistroMedicoScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProps>();

  // Campos
  const [names, setNames] = useState("");
  const [lastNames, setLastNames] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [cedula, setCedula] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedCountryCode, setSelectedCountryCode] = useState<CountryCodeType>(
    countryCodes[0]
  );

  // Médico
  const [especialidad, setEspecialidad] = useState("");
  const [showEspModal, setShowEspModal] = useState(false);
  const [espQuery, setEspQuery] = useState("");

  // Foto
  const [fotoUri, setFotoUri] = useState<string>("");
  const [fotoError, setFotoError] = useState(false);

  // UI
  const [isLoading, setIsLoading] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);
  const [showPrefixModal, setShowPrefixModal] = useState(false);

  const [showErrors, setShowErrors] = useState(false);
  const [cedulaError, setCedulaError] = useState(false);
  const [fechaError, setFechaError] = useState(false);
  const [fechaMayor18Error, setFechaMayor18Error] = useState(false);
  const [telefonoError, setTelefonoError] = useState<string>("");
  const [especialidadError, setEspecialidadError] = useState(false);

  // ✅ NUEVO: error exequátur
  const [exequaturError, setExequaturError] = useState<string>("");

  const isFormComplete =
    names.trim() !== "" &&
    lastNames.trim() !== "" &&
    birthDate.trim() !== "" &&
    gender !== "" &&
    cedula.trim() !== "" &&
    phone.trim() !== "" &&
    especialidad.trim() !== "" &&
    !!fotoUri;

  const completedFields = [
    names,
    lastNames,
    birthDate,
    gender,
    cedula,
    phone,
    especialidad,
    fotoUri,
  ].filter((x) => (typeof x === "string" ? x.trim() !== "" : !!x)).length;

  const progressPercent = Math.round((completedFields / 8) * 100);

  const especialidadesFiltradas = useMemo(() => {
    const q = espQuery.trim().toLowerCase();
    if (!q) return ESPECIALIDADES;
    return ESPECIALIDADES.filter((e) => e.toLowerCase().includes(q));
  }, [espQuery]);

  const validarQueSeaPersona = async (uri: string) => {
    // En WEB expo-face-detector no funciona confiable
    if (Platform.OS === "web") return true;

    try {
      const result = await FaceDetector.detectFacesAsync(uri, {
        mode: FaceDetector.FaceDetectorMode.fast,
        detectLandmarks: FaceDetector.FaceDetectorLandmarks.none,
        runClassifications: FaceDetector.FaceDetectorClassifications.none,
      });
      return (result?.faces?.length ?? 0) > 0;
    } catch {
      return false;
    }
  };

  const pickImage = async () => {
    try {
      if (Platform.OS !== "web") {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permiso requerido", "Necesitamos permiso para acceder a tus fotos.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.9,
      });

      if (result.canceled) return;
      const uri = result.assets[0].uri;

      setFotoUri(uri);
      setFotoError(false);

      if (Platform.OS !== "web") {
        setIsLoading(true);
        const ok = await validarQueSeaPersona(uri);
        setIsLoading(false);

        if (!ok) {
          setFotoUri("");
          setFotoError(true);
          Alert.alert("Foto no válida", "Selecciona una foto donde se vea claramente el rostro de una persona.");
          return;
        }
      }
    } catch {
      setIsLoading(false);
      Alert.alert("Error", "No se pudo abrir el selector de imágenes.");
    }
  };

  const handleContinue = async () => {
    setShowErrors(true);
    setCedulaError(false);
    setFechaError(false);
    setFechaMayor18Error(false);
    setTelefonoError("");
    setEspecialidadError(false);
    setFotoError(false);
    setExequaturError("");

    if (!fotoUri) {
      setFotoError(true);
      Alert.alert("Acción Requerida", "Debes subir una foto (rostro visible).");
      return;
    }

    if (!isFormComplete) {
      Alert.alert("Acción Requerida", "Debe completar todos los datos del médico.");
      return;
    }

    if (!esFechaValida(birthDate)) {
      setFechaError(true);
      Alert.alert("Fecha Inválida", "La fecha de nacimiento no es real o es incorrecta.");
      return;
    }

    if (!esMayorDe18(birthDate)) {
      setFechaMayor18Error(true);
      Alert.alert("Edad no permitida", "El médico debe ser mayor de 18 años.");
      return;
    }

    // Validación cédula RD (solo si RD)
    if (selectedCountryCode.name === "República Dominicana") {
      setIsLoading(true);
      await new Promise((r) => setTimeout(r, 250));
      const ok = validarCedulaDominicana(cedula);
      setIsLoading(false);

      if (!ok) {
        setCedulaError(true);
        Alert.alert("Cédula Inválida", "El número de cédula no es válido.");
        return;
      }
    }

    // ✅ Validación teléfono
    setIsLoading(true);
    const tel = await validarTelefonoBackend(selectedCountryCode.code, phone);
    setIsLoading(false);

    if (tel.ok === false) {
      setTelefonoError(tel.reason);
      Alert.alert("Teléfono inválido", tel.reason);
      return;
    }

    // ✅ NUEVO: Validación Exequátur (SNS)
    setIsLoading(true);
    const exq = await validarExequaturBackend({
      cedula,
      nombres: names,
      apellidos: lastNames,
    });
    setIsLoading(false);

    if (exq.ok === false) {
      setExequaturError(exq.reason);
      Alert.alert("Médico no verificado", exq.reason);
      return;
    }

    navigation.navigate("RegistroCredenciales", {
      datosPersonales: {
        nombres: names,
        apellidos: lastNames,
        fechanacimiento: birthDate,
        genero: gender,
        especialidad,
        cedula,
        telefono: `${selectedCountryCode.code} ${phone}`,
      },
    });
  };

  const handleCancel = () => navigation.navigate("SeleccionPerfil");

  return (
    <View style={styles.mainWrapper}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.logoGroup}>
            <Image source={ViremLogo} style={styles.logoImage} />
            <View>
              <Text style={styles.logoText}>VIREM</Text>
              <Text style={styles.logoSubtitle}>Gestión Médica</Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.mainContent} keyboardShouldPersistTaps="handled">
        <View style={styles.contentWrapper}>
          <View style={styles.breadcrumbs}>
            <Text style={styles.breadcrumbLink}>Médicos</Text>
            <MaterialIcons name="chevron-right" size={16} style={styles.breadcrumbSeparator} />
            <Text style={styles.breadcrumbCurrent}>Registro de Médico</Text>
          </View>

          <View style={{ gap: 8, alignItems: "center" }}>
            <Text style={styles.pageTitle}>Nuevo Médico</Text>
          </View>

          <View style={styles.formCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressTitle}>Información del Médico</Text>
              <Text style={styles.progressPercent}>{progressPercent}% Completado</Text>
            </View>

            <View style={styles.progressBarOuter}>
              <View style={[styles.progressBarInner, { width: `${progressPercent}%` } as any]} />
            </View>

            {/* FOTO */}
            <View style={styles.photoWrap}>
              <View style={styles.photoCircle}>
                {fotoUri ? (
                  <Image source={{ uri: fotoUri }} style={styles.photoImg} />
                ) : (
                  <MaterialIcons name="account-circle" size={78} color={colors.blueGray} />
                )}
              </View>

              <TouchableOpacity
                style={[styles.photoBtn, showErrors && !fotoUri && styles.inputError]}
                onPress={pickImage}
                activeOpacity={0.85}
              >
                <MaterialIcons name="add-a-photo" size={18} color={colors.blueGray} />
                <Text style={styles.photoBtnText}>{fotoUri ? "Cambiar foto" : "Subir foto"}</Text>
              </TouchableOpacity>

              {(showErrors && !fotoUri) || fotoError ? (
                <Text style={styles.errorText}>Debe ser una foto de una persona (rostro visible).</Text>
              ) : null}
            </View>

            {/* FORM */}
            <View style={{ gap: 24 }}>
              <View style={styles.formRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Nombres</Text>
                  <TextInput
                    style={[styles.inputField, showErrors && !names && styles.inputError]}
                    placeholder="Ej. Juan Alberto"
                    value={names}
                    onChangeText={(t) => setNames(filterOnlyLetters(t))}
                  />
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Apellidos</Text>
                  <TextInput
                    style={[styles.inputField, showErrors && !lastNames && styles.inputError]}
                    placeholder="Ej. Pérez Gomez"
                    value={lastNames}
                    onChangeText={(t) => setLastNames(filterOnlyLetters(t))}
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Cédula (Identificación)</Text>
                  <TextInput
                    style={[
                      styles.inputField,
                      ((showErrors && !cedula) || cedulaError || !!exequaturError) && styles.inputError,
                    ]}
                    placeholder="XXX-XXXXXXX-X"
                    keyboardType="numeric"
                    value={cedula}
                    onChangeText={(t) => {
                      setCedula(formatCedulaRD(t));
                      setCedulaError(false);
                      setExequaturError("");
                    }}
                    maxLength={13}
                  />
                  {cedulaError && <Text style={styles.errorText}>Cédula no válida</Text>}
                  {!!exequaturError && <Text style={styles.errorText}>{exequaturError}</Text>}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Género</Text>
                  <TouchableOpacity
                    style={[styles.selectInput, showErrors && !gender && styles.inputError]}
                    onPress={() => setShowGenderModal(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: gender ? colors.navyDark : colors.blueGray }}>
                      {gender || "Seleccionar"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Teléfono</Text>
                  <View style={[styles.phoneInputGroup, showErrors && !phone && styles.inputError]}>
                    <TouchableOpacity style={styles.prefixButton} onPress={() => setShowPrefixModal(true)}>
                      <Text style={styles.prefixText}>{selectedCountryCode.code}</Text>
                    </TouchableOpacity>

                    <TextInput
                      style={styles.numberInput}
                      placeholder={selectedCountryCode.mask}
                      keyboardType="phone-pad"
                      value={phone}
                      maxLength={selectedCountryCode.mask.length}
                      onChangeText={(text) => {
                        setPhone(applyPhoneMask(text, selectedCountryCode.mask));
                        setTelefonoError("");
                      }}
                    />
                  </View>
                  {!!telefonoError && <Text style={styles.errorText}>{telefonoError}</Text>}
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Fecha de Nacimiento</Text>
                  <TextInput
                    style={[
                      styles.inputField,
                      ((showErrors && !birthDate) || fechaError || fechaMayor18Error) && styles.inputError,
                    ]}
                    placeholder="DD/MM/YYYY"
                    value={birthDate}
                    onChangeText={(t) => {
                      formatAndSetDate(t, setBirthDate);
                      setFechaError(false);
                      setFechaMayor18Error(false);
                    }}
                    keyboardType="numeric"
                    maxLength={10}
                  />
                  {fechaError && <Text style={styles.errorText}>Fecha inexistente o futura</Text>}
                  {fechaMayor18Error && <Text style={styles.errorText}>Debe ser mayor de 18 años</Text>}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>Especialidad</Text>
                  <TouchableOpacity
                    style={[
                      styles.selectInput,
                      ((showErrors && !especialidad) || especialidadError) && styles.inputError,
                    ]}
                    onPress={() => setShowEspModal(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: especialidad ? colors.navyDark : colors.blueGray }}>
                      {especialidad || "Seleccionar"}
                    </Text>
                  </TouchableOpacity>

                  {((showErrors && !especialidad) || especialidadError) && (
                    <Text style={styles.errorText}>Debe seleccionar una especialidad</Text>
                  )}
                </View>

                <View style={styles.inputWrapper} />
              </View>
            </View>

            <View style={styles.footerActions}>
              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: "transparent" }]}
                onPress={handleCancel}
                activeOpacity={0.85}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.continueButton, { backgroundColor: isFormComplete ? colors.primary : colors.disabled }]}
                onPress={handleContinue}
                disabled={isLoading}
                activeOpacity={0.85}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={{ color: "white", fontWeight: "bold" }}>Guardar y Continuar</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* MODAL GÉNERO */}
      <Modal visible={showGenderModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowGenderModal(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            {["Hombre", "Mujer", "Otro"].map((g) => (
              <TouchableOpacity
                key={g}
                style={styles.modalOption}
                onPress={() => {
                  setGender(g);
                  setShowGenderModal(false);
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.modalOptionText}>{g}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL PREFIJO */}
      <Modal visible={showPrefixModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setShowPrefixModal(false)} activeOpacity={1}>
          <View style={styles.modalContent}>
            <ScrollView>
              {countryCodes.map((c, i) => (
                <TouchableOpacity
                  key={i}
                  style={styles.modalOption}
                  onPress={() => {
                    setSelectedCountryCode(c);
                    setPhone("");
                    setTelefonoError("");
                    setShowPrefixModal(false);
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalOptionText}>
                    {c.code} ({c.name})
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* MODAL ESPECIALIDADES */}
      <Modal visible={showEspModal} transparent animationType="fade">
        <Pressable
          style={styles.modalOverlay}
          onPress={() => {
            setShowEspModal(false);
            setEspQuery("");
          }}
        >
          <Pressable style={styles.modalContent} onPress={() => {}}>
            <Text style={[styles.modalOptionText, { marginBottom: 12, fontWeight: "700" }]}>
              Selecciona especialidad
            </Text>

            <TextInput
              style={styles.inputField}
              placeholder="Buscar..."
              value={espQuery}
              onChangeText={setEspQuery}
              autoFocus
            />

            <View style={{ height: 12 }} />

            <ScrollView style={{ maxHeight: 280 }} keyboardShouldPersistTaps="handled">
              {especialidadesFiltradas.map((esp) => (
                <TouchableOpacity
                  key={esp}
                  style={styles.modalOption}
                  onPress={() => {
                    setEspecialidad(esp);
                    setEspecialidadError(false);
                    setShowEspModal(false);
                    setEspQuery("");
                  }}
                  activeOpacity={0.85}
                >
                  <Text style={styles.modalOptionText}>{esp}</Text>
                </TouchableOpacity>
              ))}

              {especialidadesFiltradas.length === 0 ? (
                <Text style={{ textAlign: "center", color: colors.blueGray, marginTop: 10 }}>
                  No hay resultados
                </Text>
              ) : null}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
};

export default RegistroMedicoScreen;
