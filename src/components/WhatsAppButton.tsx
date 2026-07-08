/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, HelpCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(true);

  // Auto-dismiss the tooltip so it never covers catalog content permanently on mobile
  useEffect(() => {
    const timer = setTimeout(() => setShowTooltip(false), 7000);
    return () => clearTimeout(timer);
  }, []);

  const handleSupportClick = () => {
    const phoneNumber = '573008000029';
    const message = encodeURIComponent('Hola Lyon Wear, tengo una duda general sobre sus productos o envíos. ¿Me pueden asesorar?');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    // z-30: must stay below the header (z-40) so the mobile drawer covers this button when open
    <div className="fixed bottom-5 right-4 xs:bottom-6 xs:right-6 z-30 flex flex-col items-end gap-2 select-none">
      
      {/* Tooltip banner */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white border border-neutral-200 text-neutral-900 p-3 rounded-none shadow-xl max-w-[240px] xs:max-w-xs flex items-start gap-2.5 backdrop-blur-md"
          >
            {/* Close tooltip button */}
            <button
              onClick={() => setShowTooltip(false)}
              className="absolute top-1.5 right-1.5 text-neutral-400 hover:text-black p-1"
              aria-label="Cerrar globo de diálogo"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            <div className="bg-neutral-100 p-1.5 rounded-none border border-neutral-200 shrink-0 mt-0.5">
              <HelpCircle className="w-4 h-4 text-black" />
            </div>

            <div className="space-y-1 pr-3">
              <h4 className="text-[10px] xs:text-xs font-black text-black uppercase tracking-widest">Asesor en Línea</h4>
              <p className="text-[10px] xs:text-[11px] font-bold text-neutral-500 leading-normal uppercase">
                ¿Tienes dudas con tu talla o envío? Escríbenos directamente por WhatsApp.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main floating button */}
      <motion.button
        id="floating-whatsapp-btn"
        onClick={handleSupportClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-14 h-14 bg-black text-white hover:bg-neutral-900 rounded-none shadow-2xl flex items-center justify-center transition-all duration-300 relative group cursor-pointer border border-neutral-800"
        aria-label="Asesoría personalizada por WhatsApp"
      >
        {/* Soft pulsing halo ring */}
        <span className="absolute inset-0 rounded-none bg-black/15 animate-ping opacity-75 -z-10" />

        <MessageCircle className="w-7 h-7 fill-white" />

        {/* Hover label for desktop */}
        <span className="absolute right-16 bg-black text-white text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none border border-neutral-800 whitespace-nowrap shadow-md">
          Chatear ahora
        </span>
      </motion.button>
    </div>
  );
}
