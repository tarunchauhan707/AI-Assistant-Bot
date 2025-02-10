'use client'
import { HeroUIProvider } from "@heroui/react"; // Ensure this package exists

export function Providers({ children }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}