import { Montserrat } from "next/font/google";

/** Figma “Permit Site Overlay Card” uses Montserrat; scoped to that surface in the app. */
export const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-montserrat",
});
