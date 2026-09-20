import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title:"DataFlow — Data Processing Pipeline", description:"Clean, validate and transform CSV or JSON data in seconds." };
export default function RootLayout({children}:{children:React.ReactNode}) {
  return <html lang="en"><body>{children}</body></html>;
}