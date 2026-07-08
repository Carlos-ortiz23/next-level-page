/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Truck, ShieldCheck, Headphones, Instagram, Facebook, ArrowUp } from 'lucide-react';

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-black border-t border-neutral-800 pt-10 pb-6 px-4 md:px-8 select-none text-white">
      <div className="max-w-7xl mx-auto">
        
        {/* Brand identity & sitemap column grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-10 md:py-16">
          
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/lyon-wear-logo.png"
                alt="Lyon Wear"
                className="w-9 h-9 object-contain"
              />
              <span className="text-xl font-black uppercase italic tracking-tighter text-white">
                LYON WEAR
              </span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-sans max-w-sm">
              Lyon Wear es una firma de moda urbana premium enfocada en democratizar diseños exclusivos de alta costura, calzado de alto rendimiento y gorras de colección.
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-neutral-900 hover:bg-white border border-neutral-800 rounded-none text-neutral-400 hover:text-black transition-all" aria-label="Síguenos en Instagram">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="p-2.5 bg-neutral-900 hover:bg-white border border-neutral-800 rounded-none text-neutral-400 hover:text-black transition-all" aria-label="Síguenos en Facebook">
                <Facebook className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Catalog Links */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Colección
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-sans font-medium">
              <li><a href="#" className="hover:text-white transition-colors">Calzado Hombre / Mujer</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Camisas Urbanas</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Gorras de Colección</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pantalones Premium</a></li>
            </ul>
          </div>

          {/* Contact / Help */}
          <div className="space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-white">
              Soporte & Contacto
            </h4>
            <ul className="space-y-2.5 text-xs text-neutral-400 font-sans font-medium">
              <li><span className="text-white block font-black uppercase tracking-widest text-[9px] mb-0.5">Línea de Ventas:</span> +57 300 800 0029</li>
              <li><span className="text-white block font-black uppercase tracking-widest text-[9px] mb-0.5">Ubicación principal:</span> Colombia</li>
              <li><a href="#" className="hover:text-white transition-colors">Preguntas Frecuentes</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Políticas de Devolución</a></li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright credits */}
        <div className="pt-6 border-t border-neutral-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-sans text-neutral-500 text-center sm:text-left">
          <div>
            &copy; 2026 LYON WEAR. Todos los derechos reservados. Diseñado bajo el Manual de Identidad de Marca Oficial.
          </div>
          <button
            onClick={scrollToTop}
            className="group flex items-center gap-1.5 text-xs text-white hover:text-neutral-400 uppercase tracking-widest font-black transition-colors"
          >
            Volver Arriba
            <ArrowUp className="w-3.5 h-3.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>

      </div>
    </footer>
  );
}
