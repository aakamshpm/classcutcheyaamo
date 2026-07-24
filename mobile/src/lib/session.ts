import * as SecureStore from "expo-secure-store";

// the bearer token is the app's whole session. keep it in the device's
// secure keystore rather than plain async storage.
const TOKEN_KEY = "auth_token";
const USERNAME_KEY = "auth_username";

export async function saveSession(token: string, username: string) {
  await SecureStore.setItemAsync(TOKEN_KEY, token);
  await SecureStore.setItemAsync(USERNAME_KEY, username);
}

export async function loadSession(): Promise<{
  token: string;
  username: string;
} | null> {
  const token = await SecureStore.getItemAsync(TOKEN_KEY);
  if (!token) return null;
  const username = (await SecureStore.getItemAsync(USERNAME_KEY)) ?? "";
  return { token, username };
}

export async function clearSession() {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
  await SecureStore.deleteItemAsync(USERNAME_KEY);
}
