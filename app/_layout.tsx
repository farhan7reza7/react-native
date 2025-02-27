import App from "@/App";
import { Slot } from "expo-router";

export default function RootLayout() {
  return (
    <App>
      <Slot />
    </App>
  );
}
