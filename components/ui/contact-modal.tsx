"use client";

import React, { useState } from 'react';
import { X, Send, Mail, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ContactModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialNeed?: string;
    initialPackage?: string;
    initialAddons?: string[];
}

const NEEDS_OPTIONS = [
    "Information about a Package",
    "About Payment / Pricing",
    "Custom Development",
    "Other"
];

const PACKAGE_OPTIONS = [
    "1 Day Package ($110 USD)",
    "3 Day Package ($240 USD)",
    "Custom / Enterprise"
];

export default function ContactModal({ isOpen, onClose, initialNeed, initialPackage, initialAddons }: ContactModalProps) {
    const [name, setName] = useState('');
    const [selectedNeed, setSelectedNeed] = useState<string>('');
    const [selectedPackage, setSelectedPackage] = useState<string>('');
    const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
    const [customMessage, setCustomMessage] = useState('');

    // Reset or Initialize state when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setSelectedNeed(initialNeed || '');
            setSelectedPackage(initialPackage || '');
            setSelectedAddons(initialAddons || []);
        }
    }, [isOpen, initialNeed, initialPackage, initialAddons]);

    const handleWhatsApp = () => {
        let text = `Hi, I'm ${name}. I'm interested in: ${selectedNeed}.`;

        if (selectedNeed === "Information about a Package" && selectedPackage) {
            text += `\nPackage: ${selectedPackage}`;
        }

        if (selectedAddons.length > 0) {
            text += `\nAdd-ons: ${selectedAddons.join(', ')}`;
        }

        if (customMessage) {
            text += `\nDetails: ${customMessage}`;
        }

        window.open(`https://wa.me/94711161171?text=${encodeURIComponent(text)}`, '_blank');
    };

    const handleEmail = () => {
        const subject = `Inquiry: ${selectedNeed} ${selectedPackage ? `(${selectedPackage})` : ''}`;
        let body = `Hi,\n\nI'm ${name}.\nI'm interested in: ${selectedNeed}.`;

        if (selectedNeed === "Information about a Package" && selectedPackage) {
            body += `\nPackage: ${selectedPackage}`;
        }

        if (selectedAddons.length > 0) {
            body += `\nAdd-ons: ${selectedAddons.join(', ')}`;
        }

        if (customMessage) {
            body += `\n\nDetails: ${customMessage}`;
        }

        body += `\n\nThanks.`;

        window.location.href = `mailto:darshana@thedbot.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 pointer-events-auto">
                    {/* Backdrop Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-lg bg-black/40 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5 text-white/70" />
                        </button>

                        <h2 className="text-3xl font-bold text-white mb-2">Get in Touch</h2>
                        <p className="text-white/50 mb-8">Tell us about your project or inquiry.</p>

                        <div className="space-y-6">
                            {/* Name Input */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">Your Name</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors"
                                />
                            </div>

                            {/* Need Selection */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-white/70">What do you need help with?</label>
                                <div className="grid grid-cols-1 gap-2">
                                    {NEEDS_OPTIONS.map((option) => (
                                        <label
                                            key={option}
                                            className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-left text-sm transition-all border cursor-pointer ${selectedNeed === option
                                                ? 'bg-white text-black border-white font-bold'
                                                : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <input
                                                type="radio"
                                                name="need"
                                                value={option}
                                                checked={selectedNeed === option}
                                                onChange={() => setSelectedNeed(option)}
                                                className="w-4 h-4 accent-white"
                                            />
                                            <span>{option}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Package Selection if "Information about a Package" is selected */}
                            <AnimatePresence>
                                {selectedNeed === "Information about a Package" && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-2 space-y-2">
                                            <label className="text-sm font-medium text-white/70">Which package?</label>
                                            <div className="grid grid-cols-1 gap-2">
                                                {PACKAGE_OPTIONS.map((pkg) => (
                                                    <label
                                                        key={pkg}
                                                        className={`flex items-center gap-3 w-full px-4 py-2 rounded-lg text-left text-xs transition-all border cursor-pointer ${selectedPackage === pkg
                                                            ? 'bg-white/20 text-white border-white font-bold'
                                                            : 'bg-white/5 text-white/50 border-white/5 hover:bg-white/10'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name="package"
                                                            value={pkg}
                                                            checked={selectedPackage === pkg}
                                                            onChange={() => setSelectedPackage(pkg)}
                                                            className="w-3.5 h-3.5 accent-white"
                                                        />
                                                        <span>{pkg}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Display Selected Add-ons if any */}
                            {selectedAddons.length > 0 && selectedNeed === "Information about a Package" && (
                                <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60">
                                    <span className="font-bold text-white/80">Included Add-ons:</span> {selectedAddons.join(', ')}
                                </div>
                            )}

                            {/* Custom Message (Conditional) */}
                            <AnimatePresence>
                                {(selectedNeed === "Custom Development" || selectedNeed === "Other") && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="pt-2 space-y-2">
                                            <label className="text-sm font-medium text-white/70">Additional Details</label>
                                            <textarea
                                                value={customMessage}
                                                onChange={(e) => setCustomMessage(e.target.value)}
                                                placeholder="Tell us a bit more..."
                                                rows={3}
                                                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors resize-none"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Action Buttons */}
                            <div className="pt-4 grid grid-cols-2 gap-4">
                                <button
                                    onClick={handleWhatsApp}
                                    disabled={!name || !selectedNeed}
                                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    <span>WhatsApp</span>
                                </button>
                                <button
                                    onClick={handleEmail}
                                    disabled={!name || !selectedNeed}
                                    className="flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-white hover:bg-gray-100 text-black font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Mail className="w-5 h-5" />
                                    <span>Email</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
