import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import AuthProvider from "@/components/AuthProvider";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { ReviewsProvider } from "@/context/ReviewsContext";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Tech E-commerce",
  description: "Computer parts and tech accessories",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css" />
      </head>
      <body
        className={`${inter.variable} ${poppins.variable} antialiased bg-[#f7f9fa] text-gray-900 flex flex-col min-h-screen`}
      >
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <ReviewsProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </ReviewsProvider>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
