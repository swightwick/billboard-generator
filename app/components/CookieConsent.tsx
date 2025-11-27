'use client';

import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setShowBanner(false);
    // Reload to initialize GA
    window.location.reload();
  };

  const rejectCookies = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setShowBanner(false);
  };

  const openInfoModal = () => {
    // Trigger click on info button if it exists
    const infoButton = document.querySelector('[title="Information"]') as HTMLButtonElement;
    if (infoButton) {
      infoButton.click();
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 shadow-lg z-50">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex-1 text-sm">
          <p>
            We use cookies to analyze site traffic and improve your experience.
            By clicking "Accept", you consent to our use of cookies.{' '}
            <button onClick={openInfoModal} className="underline hover:text-gray-300">
              Learn more
            </button>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={rejectCookies}
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors"
          >
            Reject
          </button>
          <button
            onClick={acceptCookies}
            className="px-4 py-2 text-sm font-medium bg-blue-600 hover:bg-blue-700 rounded transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
