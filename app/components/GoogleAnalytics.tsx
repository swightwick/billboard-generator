'use client';

import { GoogleAnalytics as GA } from '@next/third-parties/google';
import { useEffect, useState } from 'react';

export default function GoogleAnalytics() {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    setHasConsent(consent === 'accepted');
  }, []);

  if (!hasConsent) return null;

  return <GA gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />;
}
