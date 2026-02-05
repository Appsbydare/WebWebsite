"use client";

import { useState } from "react";
import ResponsiveHeroBanner from "@/components/ui/responsive-hero-banner";
import ServicesSection from "@/components/ui/services-section";
import { Testimonial } from "@/components/ui/design-testimonial";

export default function Home() {
    // Shared state to store current neon trail colors
    const [neonTrailColors, setNeonTrailColors] = useState<string[]>([]);

    // Handler to receive color changes from neon trail
    const handleNeonTrailColorChange = (colors: string[]) => {
        setNeonTrailColors(colors);
    };

    return (
        <main className="min-h-screen bg-black">
            <ResponsiveHeroBanner
                onColorsChange={handleNeonTrailColorChange}
                rawColors={neonTrailColors}
            />
            <ServicesSection targetColors={neonTrailColors} />
            <Testimonial targetColors={neonTrailColors} />
        </main>
    );
}
