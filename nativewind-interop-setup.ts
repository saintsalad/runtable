/**
 * Third-party Expo components need explicit cssInterop.
 * Do NOT re-register core RN / SafeAreaView / ScrollView — react-native-css-interop
 * already applies specialized mappings (e.g. ScrollView + contentContainerClassName).
 * @see https://www.nativewind.dev/docs/api/css-interop
 */
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { cssInterop } from 'nativewind';

cssInterop(BlurView, { className: 'style' });
cssInterop(LinearGradient, { className: 'style' });
