import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/colors";

type IconProps = {
  size?: number;
  color?: string;
  filled?: boolean;
};

export function ThumbIcon({ size = 22, color = colors.muted, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8.2 21H5.4C4.1 21 3 19.9 3 18.6v-6.2C3 11.1 4.1 10 5.4 10h2.8v11Z"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <Path
        d="M8.2 10.2 11.5 4c.4-.8 1.2-1.2 2-1 .9.2 1.5 1 1.4 1.9l-.4 3.6h3.8c1.6 0 2.8 1.5 2.4 3.1l-1.4 6.2c-.4 1.9-2.1 3.2-4 3.2H8.2V10.2Z"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export function CommentIcon({ size = 22, color = colors.muted, filled = false }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.6 18.2C3.9 16.8 3 14.9 3 12.8 3 8.5 7 5 12 5s9 3.5 9 7.8-4 7.8-9 7.8c-1.1 0-2.1-.2-3-.5L5.2 21c-.6.2-1.1-.4-.8-1l1.2-1.8Z"
        fill={filled ? color : "transparent"}
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle cx={8.5} cy={12.6} r={0.9} fill={filled ? colors.background : color} />
      <Circle cx={12} cy={12.6} r={0.9} fill={filled ? colors.background : color} />
      <Circle cx={15.5} cy={12.6} r={0.9} fill={filled ? colors.background : color} />
    </Svg>
  );
}

export function ReactionThumbIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill={colors.blue} />
      <Path
        d="M9 18H7.8c-.6 0-1.1-.5-1.1-1.1v-4.1c0-.6.5-1.1 1.1-1.1H9V18Z"
        fill={colors.text}
      />
      <Path
        d="m9 11.8 2.1-4c.2-.4.7-.7 1.2-.6.5.1.9.6.8 1.1l-.2 2.3h2.7c.9 0 1.6.9 1.4 1.8l-.9 3.5c-.2 1.2-1.3 2.1-2.5 2.1H9v-6.2Z"
        fill={colors.text}
      />
    </Svg>
  );
}

export function ReactionFlameIcon({ size = 22 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Circle cx={12} cy={12} r={11} fill={colors.accent} />
      <Path
        d="M12.2 19c-2.8 0-4.9-1.9-4.9-4.7 0-1.7.9-3 2.2-4.3.8-.8 1.5-1.8 1.7-3.1 0-.4.5-.6.8-.3 1.5 1.2 2.3 2.5 2.4 4.3.5-.4.9-.9 1.2-1.5.2-.4.8-.4 1 .1.5.9.8 1.9.8 3.1 0 3.8-2.4 6.4-5.2 6.4Z"
        fill={colors.text}
      />
    </Svg>
  );
}

export function PencilIcon({ size = 18, color = colors.background }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="m4.5 16.9-.9 3.5 3.5-.9L18.8 7.8c.7-.7.7-1.7 0-2.4l-.2-.2c-.7-.7-1.7-.7-2.4 0L4.5 16.9Z"
        fill={color}
      />
      <Path
        d="m14.8 6.6 2.6 2.6"
        stroke={colors.background}
        strokeWidth={1.8}
        strokeLinecap="round"
      />
    </Svg>
  );
}
