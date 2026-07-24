import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from "react-native";

import { Button } from "@/components/button";
import { Input } from "@/components/input";
import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { todayISO } from "@/lib/date";
import { ApiError } from "@/lib/api";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

type OpenSheet = null | "start" | "required" | "end";

// settings links on the semester screen. tapping one opens a bottom sheet
// modal (slides up over the content) instead of expanding inline, so the
// user never has to scroll to reach the editor.
export function SemesterSettings({
  startDate,
  requiredPercentage,
  active,
  onEditStart,
  onEditRequired,
  onEnd,
}: {
  startDate: string;
  requiredPercentage: number;
  active: boolean;
  onEditStart: (startDate: string) => Promise<void>;
  onEditRequired: (requiredPercentage: number) => Promise<void>;
  onEnd: (endDate: string) => Promise<void>;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState<OpenSheet>(null);
  const close = () => setOpen(null);

  return (
    <View style={styles.wrap}>
      <View
        style={{ height: 1, backgroundColor: theme.cardBorder }}
      />
      <View style={styles.links}>
        <SettingLink label="edit start date" onPress={() => setOpen("start")} />
        <SettingLink
          label="edit required %"
          onPress={() => setOpen("required")}
        />
        {active && (
          <SettingLink label="end semester" onPress={() => setOpen("end")} />
        )}
      </View>

      <BottomSheet visible={open === "start"} title="edit start date" onClose={close}>
        <EditField
          initial={startDate}
          placeholder="2026-06-01"
          keyboardType="numbers-and-punctuation"
          validate={(v) =>
            DATE_RE.test(v) ? null : "date must look like 2026-06-01"
          }
          onSave={async (v) => onEditStart(v)}
          onDone={close}
        />
      </BottomSheet>

      <BottomSheet
        visible={open === "required"}
        title="edit required %"
        onClose={close}
      >
        <EditField
          initial={String(requiredPercentage)}
          placeholder="75"
          keyboardType="number-pad"
          validate={(v) => {
            const n = Number(v);
            return Number.isInteger(n) && n >= 1 && n <= 100
              ? null
              : "must be a whole number 1–100";
          }}
          onSave={async (v) => onEditRequired(Number(v))}
          onDone={close}
        />
      </BottomSheet>

      <BottomSheet visible={open === "end"} title="end semester" onClose={close}>
        <EditField
          initial={todayISO()}
          placeholder="2026-10-31"
          keyboardType="numbers-and-punctuation"
          saveLabel="end semester"
          destructive
          validate={(v) => {
            if (!DATE_RE.test(v)) return "date must look like 2026-10-31";
            if (v < startDate) return "end date can't be before the start";
            return null;
          }}
          onSave={async (v) => onEnd(v)}
          onDone={close}
        />
      </BottomSheet>
    </View>
  );
}

function SettingLink({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} hitSlop={6}>
      <ThemedText type="link" color="muted" style={styles.link}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function BottomSheet({
  visible,
  title,
  onClose,
  children,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {/* tap the dimmed backdrop to dismiss */}
      <Pressable style={styles.backdrop} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.sheetAnchor}
        pointerEvents="box-none"
      >
        <View
          style={[
            styles.sheet,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: theme.cardBorder }]} />
          <ThemedText type="subtitle" style={styles.sheetTitle}>
            {title}
          </ThemedText>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditField({
  initial,
  placeholder,
  keyboardType,
  validate,
  onSave,
  onDone,
  saveLabel = "save",
  destructive = false,
}: {
  initial: string;
  placeholder: string;
  keyboardType?: "number-pad" | "numbers-and-punctuation";
  validate: (v: string) => string | null;
  onSave: (v: string) => Promise<void>;
  onDone: () => void;
  saveLabel?: string;
  destructive?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    const problem = validate(value.trim());
    if (problem) return setError(problem);
    setError(null);
    setSaving(true);
    try {
      await onSave(value.trim());
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "couldn't save, try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.editBox}>
      <Input
        value={value}
        onChangeText={setValue}
        placeholder={placeholder}
        keyboardType={keyboardType}
        autoCapitalize="none"
        autoFocus
      />
      {error && (
        <ThemedText type="small" color="statusAbsent">
          {error}
        </ThemedText>
      )}
      <View style={styles.editButtons}>
        <Button
          title="cancel"
          variant="secondary"
          onPress={onDone}
          style={styles.flexBtn}
        />
        <Button
          title={saveLabel}
          onPress={destructive ? () => confirmEnd(save) : save}
          loading={saving}
          style={styles.flexBtn}
        />
      </View>
    </View>
  );
}

// a small guard for the destructive "end semester" action
function confirmEnd(proceed: () => void) {
  Alert.alert(
    "end this semester?",
    "you can still view it afterwards, it just won't be active.",
    [
      { text: "cancel", style: "cancel" },
      { text: "end it", style: "destructive", onPress: proceed },
    ],
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.md },
  links: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.lg,
  },
  link: { textDecorationLine: "underline" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  sheetAnchor: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: Radius * 1.4,
    borderTopRightRadius: Radius * 1.4,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    gap: Spacing.md,
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: Spacing.xs,
  },
  sheetTitle: { marginBottom: Spacing.xs },
  editBox: { gap: Spacing.sm },
  editButtons: { flexDirection: "row", gap: Spacing.sm },
  flexBtn: { flex: 1 },
});
