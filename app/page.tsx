"use client";

import { useState } from "react";
import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import ServicesSection from "@/components/ui/services-section";

import PricingSection from "@/components/ui/pricing-section";
import AddonsSection from "@/components/ui/addons-section";
import ColorHint from "@/components/ui/color-hint";
import WorkSection from "@/components/ui/work-section";
import Footer from "@/components/ui/footer";
import Preloader from "@/components/ui/preloader";

export default function Home() {
    // Shared state to store current neon trail colors
    const [neonTrailColors, setNeonTrailColors] = useState<string[]>([]);

    // Handler to receive color changes from neon trail
    const handleNeonTrailColorChange = (colors: string[]) => {
        setNeonTrailColors(colors);
    };

    return (
        <main className="min-h-screen bg-black">
            <Preloader />
            <ColorHint colors={neonTrailColors} />
            <ResponsiveHeroBanner
                onColorsChange={handleNeonTrailColorChange}
                rawColors={neonTrailColors}
            />
            <ServicesSection targetColors={neonTrailColors} />
            <PricingSection targetColors={neonTrailColors} />
            <AddonsSection targetColors={neonTrailColors} />
            <WorkSection targetColors={neonTrailColors} />
            <Footer targetColors={neonTrailColors} />
        </main>
    );
}
