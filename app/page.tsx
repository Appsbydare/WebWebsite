"use client";

import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import ServicesSection from "@/components/ui/services-section";

export default function Home() {
    return (
        <main className="min-h-screen bg-black">
            <ResponsiveHeroBanner />
            <ServicesSection />
        </main>
    );
}
