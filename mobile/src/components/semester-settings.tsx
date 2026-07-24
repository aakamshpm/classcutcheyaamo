import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { Button } from "@/components/button";
import { DateField } from "@/components/date-field";
import { Input } from "@/components/input";
import { ThemedText } from "@/components/themed-text";
import { Radius, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { todayISO } from "@/lib/date";
import { ApiError } from "@/lib/api";

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
      <View style={{ height: 1, backgroundColor: theme.cardBorder }} />
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

      <BottomSheet
        visible={open === "start"}
        title="edit start date"
        onClose={close}
      >
        <DateEditor
          initial={startDate}
          onSave={onEditStart}
          onDone={close}
        />
      </BottomSheet>

      <BottomSheet
        visible={open === "required"}
        title="edit required %"
        onClose={close}
      >
        <PercentEditor
          initial={requiredPercentage}
          onSave={onEditRequired}
          onDone={close}
        />
      </BottomSheet>

      <BottomSheet visible={open === "end"} title="end semester" onClose={close}>
        <DateEditor
          initial={todayISO()}
          minimumDate={startDate}
          saveLabel="end semester"
          destructive
          onSave={onEnd}
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
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      {/* the ScrollView wrapper isn't for scrolling — it's the only thing
          that carries keyboardShouldPersistTaps, which lets the save button
          receive the FIRST tap while the keyboard is still up (otherwise
          android spends that tap dismissing the keyboard). no
          KeyboardAvoidingView here, so the centered dialog doesn't shift. */}
      <ScrollView
        style={styles.centerAnchor}
        contentContainerStyle={styles.centerContent}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.dialog,
            { backgroundColor: theme.card, borderColor: theme.cardBorder },
          ]}
        >
          <ThemedText type="subtitle" style={styles.sheetTitle}>
            {title}
          </ThemedText>
          {children}
        </View>
      </ScrollView>
    </Modal>
  );
}

// date editor: uses the native date picker, no keyboard, no double-tap
function DateEditor({
  initial,
  minimumDate,
  onSave,
  onDone,
  saveLabel = "save",
  destructive = false,
}: {
  initial: string;
  minimumDate?: string;
  onSave: (v: string) => Promise<void>;
  onDone: () => void;
  saveLabel?: string;
  destructive?: boolean;
}) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      await onSave(value);
      onDone();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "couldn't save, try again");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.editBox}>
      <DateField value={value} onChange={setValue} minimumDate={minimumDate} />
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

// numeric editor for required %
function PercentEditor({
  initial,
  onSave,
  onDone,
}: {
  initial: number;
  onSave: (v: number) => Promise<void>;
  onDone: () => void;
}) {
  const [value, setValue] = useState(String(initial));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function save() {
    const n = Number(value.trim());
    if (!Number.isInteger(n) || n < 1 || n > 100) {
      return setError("must be a whole number 1–100");
    }
    setError(null);
    setSaving(true);
    try {
      await onSave(n);
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
        placeholder="75"
        keyboardType="number-pad"
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
          title="save"
          onPress={save}
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
  centerAnchor: {
    flex: 1,
  },
  centerContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: Spacing.lg,
  },
  dialog: {
    borderRadius: Radius * 1.2,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  sheetTitle: { marginBottom: Spacing.xs },
  editBox: { gap: Spacing.sm },
  editButtons: { flexDirection: "row", gap: Spacing.sm },
  flexBtn: { flex: 1 },
});
