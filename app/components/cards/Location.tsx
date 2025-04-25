'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import Script from 'next/script';
import { motion } from 'framer-motion';
import { BusIcon, CarIcon, MapPinIcon, PhoneIcon, MailIcon } from 'lucide-react';

import { YOUTUBE_URL } from '@/app/variables/constants';

interface LatLng {
  lat: number;
  lng: number;
  x: number;
  y: number;
}

interface MapOptions {
  center: LatLng;
  zoom: number;
}

interface MarkerOptions {
  position: LatLng;
  map: NaverMap;
}

interface InfoWindowOptions {
  content: string;
  map?: NaverMap;
  position?: LatLng;
}

interface NaverMap {
  setCenter(latLng: LatLng): void;
  setZoom(level: number): void;
  getCenter(): LatLng;
  getZoom(): number;
}

interface NaverMarker {
  setMap(map: NaverMap | null): void;
  getMap(): NaverMap | null;
  getPosition(): LatLng;
}

interface NaverMaps {
  maps: {
    Map: new (element: HTMLElement, options: MapOptions) => NaverMap;
    Marker: new (options: MarkerOptions) => NaverMarker;
    InfoWindow: new (options: InfoWindowOptions) => {
      open(map: NaverMap, marker?: NaverMarker): void;
      close(): void;
      getMap(): NaverMap | null;
    };
    Event: {
      addListener(target: unknown, event: string, handler: () => void): void;
    };
    LatLng: new (lat: number, lng: number) => LatLng;
  };
}

declare global {
  interface Window {
    naver: NaverMaps;
    initMap: () => void;
  }
}

export default function Location() {
  const t = useTranslations('Footer');
  const mapElement = useRef<HTMLDivElement | null>(null);

  const contentString = `
    <div style="padding: 15px; max-width: 320px; font-family: Arial, sans-serif; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-weight: bold; font-size: 16px;">${t('church')}</h3>
      <p style="margin: 8px 0; font-size: 14px; color: #34495e;">
        ${t('addressDesc')}<br />
        <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 12px;">
          <a href="https://naver.me/5XDOtpPO" target="_blank" style="color: #3498db; text-decoration: none; padding: 6px 12px; background: #f8f9fa; border-radius: 4px; font-size: 13px;">${t('detail')}</a>
          <a href="${YOUTUBE_URL.CHANNEL}" target="_blank" style="color: #3498db; text-decoration: none; padding: 6px 12px; background: #f8f9fa; border-radius: 4px; font-size: 13px;">${t('youtube')}</a>
        </div>
      </p>
    </div>
  `;

  useEffect(() => {
    const initMap = () => {
      if (mapElement.current && window.naver) {
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.3975783, 126.9873792),
          zoom: 17,
        };
        const map = new window.naver.maps.Map(mapElement.current, mapOptions);

        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(37.3975783, 126.9873792),
          map,
        });

        const infowindow = new window.naver.maps.InfoWindow({
          content: contentString,
        });

        window.naver.maps.Event.addListener(marker, 'click', function () {
          if (infowindow.getMap()) {
            infowindow.close();
          } else {
            infowindow.open(map, marker);
          }
        });

        infowindow.open(map, marker);
      }
    };

    if (window.naver && window.naver.maps) {
      initMap();
    } else {
      window.initMap = initMap;
    }
  }, [contentString]);

  return (
    <div className="space-y-12">
      <Script
        src={`https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID}&submodules=geocoder`}
        strategy="lazyOnload"
        onLoad={() => {
          if (window.initMap) {
            window.initMap();
          }
        }}
      />

      <div className="grid md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:col-span-2 space-y-4"
        >
          <div
            ref={mapElement}
            className="w-full h-[500px] border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden shadow-lg transition-all hover:shadow-xl"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          <div className="p-6 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-purple-100 dark:bg-purple-900">
                  <MapPinIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold">{t('address')}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('addressDesc')}</p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-rose-100 dark:bg-rose-900">
                  <PhoneIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <h3 className="text-xl font-semibold">{t('phone')}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('phoneDesc')}</p>
            </div>
          </div>

          <div className="p-6 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                  <MailIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-xl font-semibold">{t('email')}</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{t('emailDesc')}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="p-6 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 shadow-sm"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-blue-100 dark:bg-blue-900">
                <BusIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">{t('public')}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('location')}</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="p-6 rounded-xl bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-800 shadow-sm"
        >
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-green-100 dark:bg-green-900">
                <CarIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold">{t('car')}</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{t('carDesc')}</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
