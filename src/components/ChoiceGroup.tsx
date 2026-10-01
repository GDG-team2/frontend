import { View } from "react-native";
import { AppText, Chip } from "./ui";
import { spacing } from "@/constants/theme";

export function ChoiceGroup<T extends string>({
  title,
  options,
  value,
  onChange,
  disabled,
}: {
  title: string;
  options: Record<T, string>;
  value?: T | T[];
  onChange: (value: T) => void;
  disabled?: boolean;
}) {
  return (
    <View style={{ gap: spacing.sm }}>
      <AppText variant="label">{title}</AppText>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: spacing.xs }}>
        {(Object.entries(options) as [T, string][]).map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            selected={
              Array.isArray(value) ? value.includes(key) : value === key
            }
            disabled={disabled}
            onPress={() => onChange(key)}
          />
        ))}
      </View>
    </View>
  );
}
