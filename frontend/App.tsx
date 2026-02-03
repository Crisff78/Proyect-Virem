import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import EstablecerNuevaContrasenaScreen from './EstablecerNuevaContrasenaScreen';
import HomeScreen from './HomeScreen';
import LoginScreen from './LoginScreen';
import RecuperarContrasenaScreen from './RecuperarContrasenaScreen';
import RegistroCredencialesScreen from './RegistroCredencialesScreen';
import RegistroMedicoScreen from './RegistroMedicoScreen';
import RegistroPacienteScreen from './RegistroPacienteScreen';
import SeleccionPerfil from './SeleccionPerfil';
import VerificarIdentidadScreen from './VerificarIdentidadScreen';
import { RootStackParamList } from './navigation/types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const App: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="SeleccionPerfil"
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="SeleccionPerfil" component={SeleccionPerfil} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="RegistroPaciente" component={RegistroPacienteScreen} />
        <Stack.Screen name="RegistroMedico" component={RegistroMedicoScreen} />
        <Stack.Screen name="RegistroCredenciales" component={RegistroCredencialesScreen} />
        <Stack.Screen name="RecuperarContrasena" component={RecuperarContrasenaScreen} />
        <Stack.Screen name="VerificarIdentidad" component={VerificarIdentidadScreen} />
        <Stack.Screen name="EstablecerNuevaContrasena" component={EstablecerNuevaContrasenaScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;