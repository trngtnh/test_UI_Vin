'use client';

import React from 'react';
import { ModelId } from '@/types';
import { CAR_CATALOG } from '@/lib/catalog';

interface CarVisualSilhouetteProps {
  modelId: string;
  colorHex?: string;
  className?: string;
}

// Geometric specs for each VinFast EV model to guarantee distinct, recognizable vehicle shapes
const MODEL_GEOMETRIES: Record<ModelId, {
  bodyPath: string;
  glassPath: string;
  frontWheelX: number;
  rearWheelX: number;
  wheelR: number;
  groundShadowRx: number;
  ledWingPath: string;
  taillightPath: string;
}> = {
  VF3: {
    // Mini-eSUV: Boxy cabin, upright windshield, flat roof, vertical rear hatch, high ground clearance
    bodyPath: 'M 70 128 C 70 110, 72 90, 80 82 C 90 74, 120 72, 140 72 L 280 72 C 310 72, 330 84, 345 102 L 380 112 C 390 116, 395 125, 395 132 C 395 138, 385 142, 360 142 C 350 122, 310 122, 300 142 L 170 142 C 160 122, 120 122, 110 142 L 75 142 C 70 142, 70 134, 70 128 Z',
    glassPath: 'M 145 76 L 275 76 C 295 76, 315 88, 328 100 L 140 100 Z',
    frontWheelX: 330,
    rearWheelX: 140,
    wheelR: 22,
    groundShadowRx: 155,
    ledWingPath: 'M 368 116 L 390 122 L 368 126',
    taillightPath: 'M 72 100 L 80 100',
  },
  VF5: {
    // A-SUV: Compact urban crossover, sloped front hood, energetic curved hatch
    bodyPath: 'M 55 130 C 58 105, 78 92, 115 84 C 150 76, 180 56, 245 56 C 290 56, 320 74, 350 94 C 375 102, 390 114, 392 130 C 392 142, 380 144, 355 144 C 345 125, 315 125, 305 144 L 145 144 C 135 125, 105 125, 95 144 L 60 144 C 55 144, 55 136, 55 130 Z',
    glassPath: 'M 125 84 C 152 74, 185 62, 238 62 C 275 62, 305 74, 324 88 L 138 88 Z',
    frontWheelX: 330,
    rearWheelX: 120,
    wheelR: 21,
    groundShadowRx: 160,
    ledWingPath: 'M 368 108 L 390 115 L 368 119',
    taillightPath: 'M 58 114 L 68 112',
  },
  VF6: {
    // B-SUV: Aerodynamic dynamic crossover, sleek curving roofline, modern C-pillar glass
    bodyPath: 'M 45 130 C 50 100, 75 90, 110 82 C 145 74, 180 50, 240 50 C 295 50, 325 72, 355 92 C 380 98, 395 110, 395 130 C 395 142, 385 146, 360 146 C 350 126, 320 126, 310 146 L 140 146 C 130 126, 100 126, 90 146 L 50 146 C 45 146, 45 138, 45 130 Z',
    glassPath: 'M 125 82 C 150 72, 185 55, 235 55 C 275 55, 305 70, 325 84 L 138 84 Z',
    frontWheelX: 335,
    rearWheelX: 115,
    wheelR: 22,
    groundShadowRx: 165,
    ledWingPath: 'M 370 105 L 392 112 L 368 116',
    taillightPath: 'M 48 112 L 60 110',
  },
  VF7: {
    // C-SUV: Aggressive sporty coupe crossover, sharply raked coupe back, futuristic stance
    bodyPath: 'M 38 132 C 45 98, 70 86, 110 78 C 155 70, 195 46, 255 46 C 305 46, 335 68, 365 88 C 390 94, 405 106, 405 128 C 405 142, 390 146, 365 146 C 355 124, 320 124, 310 146 L 135 146 C 125 124, 90 124, 80 146 L 42 146 C 38 146, 38 138, 38 132 Z',
    glassPath: 'M 122 78 C 155 66, 195 50, 250 50 C 290 50, 320 66, 338 82 L 135 82 Z',
    frontWheelX: 338,
    rearWheelX: 108,
    wheelR: 23,
    groundShadowRx: 172,
    ledWingPath: 'M 378 102 L 402 108 L 376 114',
    taillightPath: 'M 42 108 L 56 106',
  },
  VF8: {
    // D-SUV: Long athletic luxury SUV, balanced commanding proportions
    bodyPath: 'M 35 132 C 42 98, 75 84, 120 76 C 170 68, 210 46, 275 46 C 325 46, 355 68, 380 88 C 400 96, 412 108, 412 128 C 412 142, 395 146, 370 146 C 360 124, 325 124, 315 146 L 140 146 C 130 124, 95 124, 85 146 L 40 146 C 35 146, 35 138, 35 132 Z',
    glassPath: 'M 132 76 C 170 65, 210 50, 270 50 C 310 50, 340 66, 358 82 L 142 82 Z',
    frontWheelX: 342,
    rearWheelX: 112,
    wheelR: 23,
    groundShadowRx: 178,
    ledWingPath: 'M 385 102 L 410 108 L 385 114',
    taillightPath: 'M 38 108 L 52 106',
  },
  VF9: {
    // E-SUV: Full-size 3-row flagship luxury SUV, imposing stature, elongated executive roofline
    bodyPath: 'M 30 134 C 36 96, 68 80, 115 72 C 160 64, 205 44, 290 44 C 345 44, 375 64, 395 84 C 415 92, 420 104, 420 126 C 420 142, 400 146, 375 146 C 365 124, 330 124, 320 146 L 145 146 C 135 124, 100 124, 90 146 L 35 146 C 30 146, 30 138, 30 134 Z',
    glassPath: 'M 125 72 C 165 60, 205 48, 285 48 C 330 48, 360 62, 375 78 L 135 78 Z',
    frontWheelX: 348,
    rearWheelX: 118,
    wheelR: 24,
    groundShadowRx: 185,
    ledWingPath: 'M 395 98 L 418 105 L 392 112',
    taillightPath: 'M 32 104 L 48 102',
  },
};

export const CarVisualSilhouette: React.FC<CarVisualSilhouetteProps> = ({
  modelId,
  colorHex,
  className = 'w-full max-h-32',
}) => {
  const car = (CAR_CATALOG as Record<string, any>)[modelId] || CAR_CATALOG.VF6;
  const primaryColor = colorHex || car.colors[0]?.hex || '#2563EB';
  const geo = (MODEL_GEOMETRIES as Record<string, any>)[modelId] || MODEL_GEOMETRIES.VF6;

  return (
    <svg
      viewBox="0 0 440 180"
      className={`${className} select-none pointer-events-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`carGrad-${modelId}`} x1="0%" y1="0%" x2="100%" y2="80%">
          <stop offset="0%" stopColor={primaryColor} stopOpacity="0.92" />
          <stop offset="55%" stopColor={primaryColor} stopOpacity="1" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`glassGrad-${modelId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#7dd3fc" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      {/* Ground Shadow */}
      <ellipse cx="220" cy="162" rx={geo.groundShadowRx} ry="8" fill="#020617" fillOpacity="0.45" />

      {/* Main Aerodynamic Body Silhouette */}
      <path
        d={geo.bodyPath}
        fill={`url(#carGrad-${modelId})`}
        stroke="#475569"
        strokeWidth="1.5"
      />

      {/* Cabin Windows & Tinted Glass */}
      <path
        d={geo.glassPath}
        fill={`url(#glassGrad-${modelId})`}
        stroke="#64748b"
        strokeWidth="1"
      />

      {/* Front VinFast Signature LED Light Wing */}
      <path
        d={geo.ledWingPath}
        stroke="#60A5FA"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Rear Taillight */}
      <path
        d={geo.taillightPath}
        stroke="#f43f5e"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Wheels & Metallic Rims (Front & Rear) */}
      <circle cx={geo.frontWheelX} cy="144" r={geo.wheelR} fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
      <circle cx={geo.frontWheelX} cy="144" r={geo.wheelR * 0.65} fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx={geo.frontWheelX} cy="144" r="4" fill="#f8fafc" />

      <circle cx={geo.rearWheelX} cy="144" r={geo.wheelR} fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
      <circle cx={geo.rearWheelX} cy="144" r={geo.wheelR * 0.65} fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
      <circle cx={geo.rearWheelX} cy="144" r="4" fill="#f8fafc" />
    </svg>
  );
};
