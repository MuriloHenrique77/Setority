/**
 * Registra App como ponto de entrada do Expo ao abrir o aplicativo.
 * Depende de App.tsx; após o registro, o React monta os componentes da aplicação.
 */

import { registerRootComponent } from 'expo';

import App from './App';

// Os módulos Firebase exigem uma build com código nativo; Expo Go não os carrega.
registerRootComponent(App);
