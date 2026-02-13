export type DatosPersonalesPaciente = {
  nombres: string;
  apellidos: string;
  fechanacimiento: string;
  genero: string;
  cedula: string;
  telefono: string;
};

export type DatosPersonalesMedico = {
  nombreCompleto: string;
  fechanacimiento: string;
  genero: string;
  especialidad: string;
  cedula: string;
  telefono: string;
};

export type RootStackParamList = {
  SeleccionPerfil: undefined;
  Login: undefined;

  RecuperarContrasena: undefined;
  VerificarIdentidad: { email: string };
  EstablecerNuevaContrasena: { email: string };

  RegistroPaciente: undefined;
  RegistroMedico: undefined;

  RegistroCredenciales: {
    datosPersonales: DatosPersonalesPaciente | DatosPersonalesMedico;
  };

  Home: undefined;

  // ✅ NUEVA PANTALLA
  DashboardPaciente: undefined;
};
