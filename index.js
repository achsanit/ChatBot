/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import ChatScreen from './src/chat';

AppRegistry.registerComponent(appName, () => ChatScreen);
