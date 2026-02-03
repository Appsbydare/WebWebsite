"use client";

import React from 'react';
import { ArrowRight, Code, Layout, Smartphone, Globe, Database, Server } from 'lucide-react';
import TextBlockAnimation from './text-block-animation';

const services = [
    {
        title: "Web Development",
        description: "Custom websites built with modern frameworks like Next.js and React for potential scalability.",
        icon: <Code className="w-8 h-8 text-purple-400" />
    },
    {
        title: "Web Apps",
        description: "Complex, high-performance web applications tailored to streamline your business operations.",
        icon: <Server className="w-8 h-8 text-pink-400" />
    },
    {
        title: "E-commerce",
        description: "Scalable online stores with secure payment integration and intuitive product management.",
        icon: <Database className="w-8 h-8 text-blue-400" />
    },
    {
        title: "Portfolios",
        description: "Stunning creative showcases designed to highlight your work and attract high-value clients.",
        icon: <Layout className="w-8 h-8 text-green-400" />
    }
];

export default function ServicesSection() {
    return (
        <section id="services" className="relative w-full min-h-screen py-24 px-6 z-10 bg-transparent text-white mix-blend-normal">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="mb-20 flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="max-w-2xl">
                        <TextBlockAnimation blockColor="#ffffff" delay={0.2}>
                            <h2 className="text-sm font-bold tracking-widest uppercase text-purple-400 mb-4">
                                What We Offer
                            </h2>
                        </TextBlockAnimation>

                        <div className="overflow-hidden">
                            <h3 className="text-4xl md:text-6xl font-display font-bold leading-none mb-6">
                                Full-Spectrum <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                                    Digital Solutions.
                                </span>
                            </h3>
                        </div>
                        <p className="text-xl text-white/60 max-w-xl">
                            We are a web development company committed to transforming your ideas into powerful digital products.
                        </p>
                    </div>

                    <a href="#contact" className="hidden md:flex items-center gap-2 pb-2 border-b border-white/20 hover:border-white transition-colors group">
                        <span>View All Services</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </a>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {services.map((service, index) => (
                        <div
                            key={index}
                            className="group p-8 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm hover:bg-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-2"
                        >
                            <div className="mb-6 p-4 rounded-2xl bg-white/5 w-fit group-hover:scale-110 transition-transform duration-300">
                                {service.icon}
                            </div>
                            <h4 className="text-2xl font-bold mb-3">{service.title}</h4>
                            <p className="text-white/50 leading-relaxed">
                                {service.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
