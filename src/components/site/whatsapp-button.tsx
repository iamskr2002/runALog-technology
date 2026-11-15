'use client';

import { MessageCircle, X } from 'lucide-react';
import { siteConfig } from '@/lib/site-config';
import { useState, useEffect, useRef } from 'react';

export function WhatsAppButton() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShownOnce, setHasShownOnce] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const phoneNumber = siteConfig.contact.phone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=Hi%20RunA%20Log%20Technologies`;

  useEffect(() => {
    // Check if text has already been shown in this session
    const shownInSession = sessionStorage.getItem('whatsappTextShown');

    if (shownInSession) {
      setHasShownOnce(true);
      return;
    }

    // Show text after 3.5 seconds regardless of scroll activity
    if (!isClosed) {
      scrollTimeoutRef.current = setTimeout(() => {
        setIsVisible(true);
        setHasShownOnce(true);
        sessionStorage.setItem('whatsappTextShown', 'true');
      }, 3500);
    }

    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [isClosed]);

  const handleClose = () => {
    setIsVisible(false);
    setIsClosed(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-end gap-3">
      {/* Text bubble with close button */}
      <div
        className={`bg-green-500 text-white rounded-lg px-4 py-2 shadow-lg transition-all duration-300 origin-bottom-right flex items-center gap-3 whitespace-nowrap ${
          isVisible && !isClosed ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <p className="font-medium text-sm">Let's talk and plan</p>
        <button
          onClick={handleClose}
          aria-label="Close message"
          className="flex items-center justify-center text-white hover:bg-green-600 rounded transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contact us on WhatsApp - Let's talk and plan"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500 text-white shadow-lg transition-all duration-300 hover:bg-green-600 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
