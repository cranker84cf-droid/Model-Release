import type { Metadata } from "next";
import { Geist, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
const sans=Geist({variable:"--font-sans",subsets:["latin"]});
const display=Cormorant_Garamond({variable:"--font-display",subsets:["latin"],weight:["500","600"]});
export const metadata:Metadata={title:"Model-Release | Chris Franz Design",description:"Mobile Model-Release-Vereinbarung zum digitalen Ausfüllen, Unterschreiben und Speichern als PDF."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="de"><body className={`${sans.variable} ${display.variable}`}>{children}</body></html>}
