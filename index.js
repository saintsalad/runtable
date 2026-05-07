// NativeWind: load Tailwind entry before expo-router so Metro processes classes reliably.
import './global.css';
import './nativewind-interop-setup';
import 'expo-router/entry';
