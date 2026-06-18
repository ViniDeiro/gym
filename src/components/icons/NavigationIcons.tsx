import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";

type NavIconProps = {
  focused: boolean;
  size?: number;
};

function iconColor(focused: boolean) {
  return focused ? colors.primary : colors.muted;
}

export function HomeIcon({ focused, size = 24 }: NavIconProps) {
  const color = iconColor(focused);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M4 10.8 12 4l8 6.8v8.1c0 .9-.7 1.6-1.6 1.6h-3.3v-5.2H8.9v5.2H5.6c-.9 0-1.6-.7-1.6-1.6v-8.1Z"
        fill={focused ? color : "transparent"}
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function LeaguesIcon({ focused, size = 24 }: NavIconProps) {
  const color = iconColor(focused);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9.2 4.2 7.7 19.8" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Path d="M16.3 4.2 14.8 19.8" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Path d="M5 9h15" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
      <Path d="M4.2 15h15" stroke={color} strokeWidth={1.9} strokeLinecap="round" />
    </Svg>
  );
}

export function ProfileIcon({ focused, size = 24 }: NavIconProps) {
  const color = iconColor(focused);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={8.2} r={3.6} fill={focused ? color : "transparent"} stroke={color} strokeWidth={1.9} />
      <Path
        d="M5.2 20c.8-3.5 3.2-5.4 6.8-5.4s6 1.9 6.8 5.4"
        stroke={color}
        strokeWidth={1.9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function SettingsIcon({ focused, size = 24 }: NavIconProps) {
  const color = iconColor(focused);

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M10.5 4.2h3l.5 2.2c.5.2.9.4 1.3.7l2.1-.7 1.5 2.6-1.6 1.5c.1.5.1 1 .1 1.5s0 1-.1 1.5l1.6 1.5-1.5 2.6-2.1-.7c-.4.3-.8.5-1.3.7l-.5 2.2h-3l-.5-2.2c-.5-.2-.9-.4-1.3-.7l-2.1.7-1.5-2.6 1.6-1.5c-.1-.5-.1-1-.1-1.5s0-1 .1-1.5L5.1 9l1.5-2.6 2.1.7c.4-.3.8-.5 1.3-.7l.5-2.2Z"
        fill={focused ? color : "transparent"}
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={12} cy={12} r={2.8} fill={focused ? colors.background : "transparent"} stroke={color} strokeWidth={1.7} />
    </Svg>
  );
}
