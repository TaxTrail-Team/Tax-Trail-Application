import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { useAuth } from "../store/useAuth";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons, Feather } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function Profile() {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "kusalya");
  const [email, setEmail] = useState(user?.email || "johndoe@email.com");
  const [avatar, setAvatar] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    Alert.alert("✅ Profile Updated", "Your profile details have been updated successfully.");
    setIsEditing(false);
  };

  const handleDelete = () => {
    Alert.alert("⚠️ Delete Account", "Are you sure you want to permanently delete your account?", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: logout },
    ]);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      {/* Header with gradient */}
      <LinearGradient
        colors={["#2563eb", "#1e3a8a"]}
        style={{
          height: 220,
          borderBottomLeftRadius: 30,
          borderBottomRightRadius: 30,
          alignItems: "center",
          justifyContent: "center",
          paddingTop: 40,
        }}
      >
        <TouchableOpacity onPress={pickImage}>
          {avatar ? (
            <Image
              source={{ uri: avatar }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderWidth: 3,
                borderColor: "#fff",
              }}
            />
          ) : (
            <MaterialIcons name="account-circle" size={100} color="#fff" />
          )}
        </TouchableOpacity>
        <Text style={{ color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 8 }}>
          {name}
        </Text>
        <Text style={{ color: "#e0e7ff", fontSize: 14 }}>{email}</Text>
      </LinearGradient>

      {/* Content */}
      <View style={{ padding: 20, marginTop: -30 }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 16,
            padding: 20,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 10,
            elevation: 4,
          }}
        >
          {/* Editable Fields */}
          {isEditing ? (
            <View style={{ gap: 12 }}>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Enter your name"
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: "#f8fafc",
                }}
              />
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email"
                keyboardType="email-address"
                style={{
                  borderWidth: 1,
                  borderColor: "#ddd",
                  padding: 12,
                  borderRadius: 8,
                  backgroundColor: "#f8fafc",
                }}
              />
              <TouchableOpacity
                onPress={handleSave}
                style={{
                  backgroundColor: "#2563eb",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "600" }}>💾 Save Changes</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setIsEditing(false)}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  borderColor: "#ccc",
                  borderWidth: 1,
                }}
              >
                <Text style={{ color: "#555" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              {/* Info Section */}
              <View style={{ marginVertical: 12 }}>
                <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 8 }}>
                  Account Info
                </Text>
                <Text style={{ color: "#555", marginBottom: 4 }}>📅 Member Since: 2024</Text>
                <Text style={{ color: "#555", marginBottom: 4 }}>⚡ Plan: Free Tier</Text>
                <Text style={{ color: "#555" }}>🌍 Location: Sri Lanka</Text>
              </View>

              {/* Buttons */}
              <TouchableOpacity
                onPress={() => setIsEditing(true)}
                style={{
                  backgroundColor: "#2563eb",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Feather name="edit" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", marginTop: 4 }}>Edit Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={logout}
                style={{
                  backgroundColor: "#111827",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Feather name="log-out" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", marginTop: 4 }}>Logout</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleDelete}
                style={{
                  backgroundColor: "#dc2626",
                  padding: 12,
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Feather name="trash-2" size={18} color="#fff" />
                <Text style={{ color: "#fff", fontWeight: "600", marginTop: 4 }}>
                  Delete Account
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </ScrollView>
  );
}
