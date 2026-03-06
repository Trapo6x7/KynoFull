import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "@/src/constants/colors";
import { ProfileMode } from "@/src/types";

interface ProfileAboutProps {
  name: string;
  keywords: string[];
  description?: string;
  mode: ProfileMode;
  members?: { id: number; name: string }[];
  onAddMember?: () => void;
  onEdit?: () => void;
}

export const ProfileAbout: React.FC<ProfileAboutProps> = ({ name, keywords, description, mode, members = [], onAddMember, onEdit }) => {
  if (mode === "group") {
    return (
      <View style={styles.container}>
        <Text style={styles.section}>Nom</Text>
        <Text style={styles.name}>{name}</Text>
        <Text style={[styles.section, { marginTop: 18 }]}>Membre</Text>
        <View style={styles.chips}>
          {members.map((m) => (
            <View key={m.id} style={styles.chip}>
              <Text style={styles.chipText}>{m.name}</Text>
            </View>
          ))}
          {onAddMember && (
            <TouchableOpacity style={[styles.chip, styles.chipAdd]} onPress={onAddMember} activeOpacity={0.8}>
              <Ionicons name="add" size={16} color={Colors.primaryDark} />
            </TouchableOpacity>
          )}
        </View>
        {description && (
          <>
            <Text style={[styles.section, { marginTop: 18 }]}>Description</Text>
            <Text style={styles.desc}>{description}</Text>
          </>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.section}>Nom</Text>
      <View style={styles.nameRow}>
        <Text style={styles.name}>{name}</Text>
        {mode === "me" && onEdit && (
          <TouchableOpacity style={styles.editBtn} onPress={onEdit} activeOpacity={0.7}>
            <Ionicons name="pencil-outline" size={16} color={Colors.white} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.section, { marginTop: 18 }]}>À propos</Text>
      <View style={styles.chips}>
        {keywords.length > 0 ? keywords.map((kw, i) => (
          <View key={i} style={styles.chip}>
            <Text style={styles.chipText}>{kw}</Text>
          </View>
        )) : <Text style={styles.emptyText}>Aucun mot-clé</Text>}
      </View>
      <Text style={[styles.section, { marginTop: 18 }]}>Description</Text>
      <Text style={styles.desc}>{description || "Aucune description renseignée."}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 10 },
  section: { fontSize: 12, fontWeight: "600", color: Colors.gray, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8 },
  nameRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  name: { fontSize: 20, fontWeight: "700", color: Colors.grayDark },
  editBtn: { padding: 8, backgroundColor: Colors.primary, borderRadius: 32 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { backgroundColor: Colors.primaryLight, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6 },
  chipAdd: { paddingHorizontal: 10, justifyContent: "center", alignItems: "center", borderWidth: 1.5, borderColor: Colors.primaryDark, backgroundColor: "transparent" },
  chipText: { fontSize: 13, color: Colors.primaryDark, fontWeight: "500" },
  desc: { fontSize: 14, color: Colors.grayDark, lineHeight: 22 },
  emptyText: { fontSize: 14, color: Colors.gray },
});
