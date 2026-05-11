import { Cloud, Droplets, Thermometer, Wind } from 'lucide-react-native';
import { Text, View } from 'react-native';

import { ThermalCard } from '@/components/ui/ThermalCard';
import { DottedDivider } from '@/components/ui/DottedDivider';
import { useThemeTokens } from '@/components/theme/ThemeTokensProvider';
import { useThemedTw } from '@/hooks/useThemedTw';
import type { WeatherAtmosphere } from '@/types';

const WEATHER_DATA: Record<WeatherAtmosphere, {
  label: string;
  temp: string;
  humidity: string;
  wind: string;
  feel: string;
  advice: string;
}> = {
  DRIZZLE: {
    label: 'DRIZZLE',
    temp: '24°C',
    humidity: '88%',
    wind: '12 KPH NE',
    feel: 'FEELS 23°C',
    advice: 'Light rain expected. Bring a cap and water-resistant layer.',
  },
  HUMID: {
    label: 'HUMID',
    temp: '29°C',
    humidity: '82%',
    wind: '6 KPH SW',
    feel: 'FEELS 33°C',
    advice: 'High humidity tonight. Hydrate well before the run.',
  },
  'CLEAR NIGHT': {
    label: 'CLEAR NIGHT',
    temp: '26°C',
    humidity: '65%',
    wind: '8 KPH NW',
    feel: 'FEELS 25°C',
    advice: 'Good conditions. Wear reflective gear for visibility.',
  },
  WINDY: {
    label: 'WINDY',
    temp: '22°C',
    humidity: '58%',
    wind: '28 KPH NE',
    feel: 'FEELS 19°C',
    advice: 'Strong winds on exposed sections. Adjust pace on headwinds.',
  },
};

type LobbyWeatherProps = {
  atmosphere: WeatherAtmosphere;
  startLabel?: string;
};

export function LobbyWeather({ atmosphere, startLabel }: LobbyWeatherProps) {
  const t = useThemeTokens();
  const tw = useThemedTw();
  const data = WEATHER_DATA[atmosphere];

  return (
    <View className="flex-1 px-4 pt-4 pb-6" style={{ gap: 12 }}>
      {/* Header card */}
      <ThermalCard className="p-4">
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9, letterSpacing: 4, textTransform: 'uppercase' }}>
          WEATHER SNAPSHOT{startLabel ? ` · ${startLabel}` : ''}
        </Text>
        <View className="flex-row items-end justify-between mt-3">
          <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.text, fontSize: 36 }}>
            {data.temp}
          </Text>
          <View className="items-end">
            <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: 2 }}>
              {data.label}
            </Text>
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 10, marginTop: 2 }}>
              {data.feel}
            </Text>
          </View>
        </View>
        <DottedDivider className="my-3" />
        <View className="flex-row gap-4">
          <View className="flex-row items-center gap-1.5">
            <Droplets color={t.faint} size={13} strokeWidth={1.4} />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 10 }}>
              {data.humidity}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Wind color={t.faint} size={13} strokeWidth={1.4} />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 10 }}>
              {data.wind}
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <Thermometer color={t.faint} size={13} strokeWidth={1.4} />
            <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.muted, fontSize: 10 }}>
              {data.feel}
            </Text>
          </View>
        </View>
      </ThermalCard>

      {/* Run advice */}
      <ThermalCard className="p-4">
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase' }}>
          RUN ADVISORY
        </Text>
        <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.text, fontSize: 12, lineHeight: 20, marginTop: 10 }}>
          {data.advice}
        </Text>
      </ThermalCard>

      {/* Hour blocks — decorative mock */}
      <ThermalCard className="p-4">
        <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>
          NEXT 3 HOURS
        </Text>
        <View className="flex-row justify-between">
          {['+1H', '+2H', '+3H'].map((label, i) => (
            <View key={label} className="items-center gap-1" style={{ flex: 1 }}>
              <Text style={{ fontFamily: 'IBMPlexMono_400Regular', color: t.faint, fontSize: 9 }}>{label}</Text>
              <Cloud color={t.border} size={18} strokeWidth={1.2} />
              <Text style={{ fontFamily: 'IBMPlexMono_600SemiBold', color: t.muted, fontSize: 10 }}>
                {String(parseInt(data.temp) + (i === 1 ? -1 : i === 2 ? -2 : 0))}°C
              </Text>
            </View>
          ))}
        </View>
      </ThermalCard>
    </View>
  );
}
