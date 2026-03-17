import { useState, useEffect } from 'react';

export const useDeviceDetect = () => {
  const [deviceInfo, setDeviceInfo] = useState({ isMobile: false, os: 'Inconnu', browser: 'Inconnu' });

  useEffect(() => {
    const ua = navigator.userAgent;
    const isMobile = /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua);
    
    let os = "Inconnu";
    if (/Windows/.test(ua)) os = "Windows";
    else if (/Mac OS X/.test(ua)) os = "macOS";
    else if (/Android/.test(ua)) os = "Android";
    else if (/iPhone|iPad|iPod/.test(ua)) os = "iOS";
    else if (/Linux/.test(ua)) os = "Linux";

    let browser = "Inconnu";
    if (/Edg/.test(ua)) browser = "Edge";
    else if (/Chrome/.test(ua)) browser = "Chrome";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/Safari/.test(ua)) browser = "Safari";

    setDeviceInfo({ isMobile, os, browser });
  }, []);

  return deviceInfo;
};
