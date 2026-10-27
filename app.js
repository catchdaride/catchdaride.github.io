/**
 * BusMap - Interactive Cartographic & Spatial Intelligence Web Application
 * Client-Side Application Engine (app.js)
 * Adheres strictly to Rule 1 (Namespaced IDs) and Rule 2 (Decoupled Geometries)
 */


// Calculate YIQ contrast to dynamically select white or dark text
function getYIQContrast(hexColor) {
  if (!hexColor || hexColor.length < 7) return "#ffffff";
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 165 ? "#ffffff" : "#0f172a";
}

// Resolve Headless REST API Base endpoint according to hosting environment
function getApiBase() {
  if (typeof window === 'undefined') return '';
  if (window.CATCHDARIDE_API_BASE) {
    return window.CATCHDARIDE_API_BASE.replace(/\/+$/, '');
  }
  const metaApi = typeof document !== 'undefined' ? document.querySelector('meta[name="api-base"]') : null;
  if (metaApi && metaApi.content) {
    return metaApi.content.replace(/\/+$/, '');
  }
  const host = (window.location && window.location.hostname) || '';
  const port = (window.location && window.location.port) || '';
  if (host === 'catchdaride.github.io' || host.endsWith('.github.io')) {
    return 'https://geohoo.pythonanywhere.com';
  }
  if (port === '8080') {
    return `${window.location.protocol}//${host}:3000`;
  }
  if (port === '8180') {
    return `${window.location.protocol}//${host}:3100`;
  }
  return '';
}

// Safely dispatch custom events to Google Analytics (GA4)
function trackAnalyticsEvent(eventName, params = {}) {
  if (window['ga-disable-G-PXS9EB0K7K']) return;
  if (typeof window.gtag === 'function') {
    try {
      window.gtag('event', eventName, params);
    } catch (_) {}
  }
}

// Generic default modal filters (fallback before dynamic metadata is loaded from API)
const DEFAULT_MODAL_FILTERS = [
  { key: 'metro', icon: 'Ⓜ️', name: 'Metro / Subway', title: 'Rapid Transit' },
  { key: 'train', icon: '🚆', name: 'Trains', title: 'Rail Transit' },
  { key: 'tram', icon: '🚊', name: 'Trams', title: 'Light Rail & Trams' },
  { key: 'ferry', icon: '⛴️', name: 'Ferries', title: 'Water Transit' },
  { key: 'smartbus', icon: '⚡', name: 'Rapid / Smart', title: 'High Frequency Transit' },
  { key: 'express', icon: '🚀', name: 'Express', title: 'Express Services' },
  { key: 'local', icon: '🚌', name: 'Buses', title: 'Local Bus Network' },
  { key: 'minibus', icon: '🚐', name: 'Minibuses', title: 'Community Transit' }
];

// Declarative regional modal filter configurations
const CITY_MODAL_FILTERS = {
  'au-vic-ptv': [
    { key: 'train', icon: '🚆', name: 'Trains', title: 'Metro Trains & V/Line' },
    { key: 'tram', icon: '🚊', name: 'Trams', title: 'Yarra Trams' },
    { key: 'smartbus', icon: '⚡', name: 'SmartBus', title: 'SmartBus DART & Orbital' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'Peak Express & SkyBus' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Regular Bus Network' }
  ],
  'au-nsw-tfnsw': [
    { key: 'metro', icon: 'Ⓜ️', name: 'Metro', title: 'Sydney Metro M1' },
    { key: 'train', icon: '🚆', name: 'Trains', title: 'Sydney Trains & Regional Rail' },
    { key: 'tram', icon: '🚊', name: 'Light Rail', title: 'Sydney & Newcastle Light Rail' },
    { key: 'ferry', icon: '⛴️', name: 'Ferries', title: 'Sydney Ferries' },
    { key: 'smartbus', icon: '⚡', name: 'B-Line & Rapid', title: 'B-Line & Turn Up and Go' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'Peak Express & NightRide' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Regular Bus Network' }
  ],
  'au-nt-darwinbus': [
    { key: 'smartbus', icon: '⚡', name: 'Orbital', title: 'Orbital 1 & 2 Limited Stops' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'Peak Express Routes' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Darwinbus Local Network' }
  ],
  'au-nt-asbus': [
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Alice Springs ASBus Network' }
  ],
  'au-sa-adelaidemetro': [
    { key: 'train', icon: '🚆', name: 'Trains', title: 'Adelaide Metro Trains' },
    { key: 'tram', icon: '🚊', name: 'Trams', title: 'Glenelg Tram Network' },
    { key: 'smartbus', icon: '⚡', name: 'O-Bahn', title: 'O-Bahn Guided Busway' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'Peak Express & Limited Stops' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Adelaide Metro Bus Network' },
    { key: 'ferry', icon: '⛴️', name: 'Ferry', title: 'SeaLink Kangaroo Island Ferry' }
  ],
  'au-wa-transperth': [
    { key: 'train', icon: '🚆', name: 'Trains', title: 'Transperth Trains & Transwa' },
    { key: 'smartbus', icon: '⚡', name: 'CAT Buses', title: 'Perth, Fremantle & Joondalup CATs' },
    { key: 'ferry', icon: '⛴️', name: 'Ferries', title: 'Elizabeth Quay to South Perth Ferry' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'Peak Express & Limited Stops' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Transperth Bus Network' }
  ],
  'au-act-transportcanberra': [
    { key: 'smartbus', icon: '⚡', name: 'Rapid', title: 'Transport Canberra Rapid Network (R2-R10)' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'Peak Express Buses' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Transport Canberra Local Bus Network' }
  ],
  'au-tas-metrotas': [
    { key: 'express', icon: '🚀', name: 'Express Buses', title: 'Hobart Express Bus Corridors (X-Series)' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Metro Tasmania Bus Network' },
    { key: 'ferry', icon: '⛴️', name: 'Ferries', title: 'Derwent River Ferry' }
  ],
  'au-qld-translink': [
    { key: 'train', icon: '🚆', name: 'Trains', title: 'Queensland Rail Suburban & Interurban' },
    { key: 'tram', icon: '🚊', name: 'G:link', title: 'Gold Coast Light Rail (G:link)' },
    { key: 'ferry', icon: '⛴️', name: 'Ferries', title: 'Brisbane CityCat & Cross River Ferries' },
    { key: 'smartbus', icon: '⚡', name: 'Glider', title: 'CityGlider High Frequency Transit' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'Rocket & Busway Express Services' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Translink Bus Network' }
  ],
  'hk-td': [
    { key: 'metro', icon: 'Ⓜ️', name: 'MTR', title: 'MTR Heavy Rail Network' },
    { key: 'tram', icon: '🚊', name: 'Trams', title: 'HK Tramways, Light Rail & Peak Tram' },
    { key: 'ferry', icon: '⛴️', name: 'Ferries', title: 'Star Ferry & Outlying Islands Ferries' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Franchised & Cross-Harbour Buses' },
    { key: 'minibus', icon: '🚐', name: 'Minibuses', title: 'Green Minibuses (GMB)' }
  ],
  'gb-tfl': [
    { key: 'metro', icon: 'Ⓜ️', name: 'Tube', title: 'London Underground (Tube)' },
    { key: 'train', icon: '🚆', name: 'Rail', title: 'Elizabeth line, Overground & National Rail' },
    { key: 'tram', icon: '🚊', name: 'DLR & Trams', title: 'Docklands Light Railway & London Trams (Wimbledon)' },
    { key: 'ferry', icon: '⛴️', name: 'River Bus', title: 'Uber Boat by Thames Clippers & Woolwich Ferry' },
    { key: 'smartbus', icon: '⚡', name: 'Superloop', title: 'Outer-London Express Orbital Corridors (SL1–SL10)' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'London Buses & Night Buses (including Wimbledon)' }
  ],
  'gb-wm-tfwm': [
    { key: 'tram', icon: '🚊', name: 'Metro', title: 'West Midlands Metro (Birmingham - Wolverhampton)' },
    { key: 'train', icon: '🚆', name: 'Trains', title: 'West Midlands Railway (Cross-City & Coventry Lines)' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'Express Buses (X1 Birmingham-Airport-Coventry, 12X)' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Birmingham & Coventry Bus Networks' }
  ],
  'ca-bc-translink': [
    { key: 'metro', icon: 'Ⓜ️', name: 'SkyTrain', title: 'SkyTrain Automated Rapid Transit (Expo, Millennium, Canada)' },
    { key: 'train', icon: '🚆', name: 'West Coast Express', title: 'West Coast Express Commuter Rail' },
    { key: 'ferry', icon: '⛴️', name: 'SeaBus', title: 'SeaBus Passenger Ferry (Waterfront - Lonsdale Quay)' },
    { key: 'smartbus', icon: '⚡', name: 'RapidBus', title: 'RapidBus & B-Line Express Corridors' },
    { key: 'express', icon: '🚀', name: 'Express & NightBus', title: 'Highway Express & NightBus Corridors' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'TransLink Bus Network' }
  ],
  'ca-on-ttc': [
    { key: 'metro', icon: 'Ⓜ️', name: 'Subway', title: 'TTC Subway (Lines 1, 2, 4)' },
    { key: 'tram', icon: '🚊', name: 'Streetcar', title: 'TTC Streetcar Network' },
    { key: 'express', icon: '🚀', name: 'Express', title: '900-series Express Bus Network' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'TTC Local Bus Network' }
  ],
  'ca-on-metrolinx': [
    { key: 'train', icon: '🚆', name: 'GO Train', title: 'GO Transit Commuter Rail Corridors' },
    { key: 'local', icon: '🚌', name: 'GO Bus', title: 'GO Transit Regional Express Buses' }
  ],
  'us-ca-bayarea': [
    { key: 'train', icon: '🚆', name: 'Trains', title: 'BART & Caltrain Regional Rail' },
    { key: 'metro', icon: 'Ⓜ️', name: 'Muni Metro', title: 'Muni Metro Light Rail (J, K, L, M, N, T)' },
    { key: 'tram', icon: '🚊', name: 'Streetcars', title: 'Historic Streetcars & Cable Cars' },
    { key: 'ferry', icon: '⛴️', name: 'Ferries', title: 'San Francisco Bay Ferry' },
    { key: 'express', icon: '🚀', name: 'Express & Rapid', title: 'Muni Rapid, AC Transit Transbay & Golden Gate Express' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'Muni, VTA & Regional Buses' }
  ],
  'us-ny-mta': [
    { key: 'metro', icon: 'Ⓜ️', name: 'Subway', title: 'MTA New York City Subway & PATH' },
    { key: 'train', icon: '🚆', name: 'Rail', title: 'Long Island Rail Road, Metro-North & NJ Transit' },
    { key: 'tram', icon: '🚊', name: 'Light Rail', title: 'Hudson-Bergen & Newark Light Rail' },
    { key: 'express', icon: '🚀', name: 'Express', title: 'MTA Express & NJ Transit Interstate Buses' },
    { key: 'local', icon: '🚌', name: 'Buses', title: 'MTA & NJ Transit Regional Buses' }
  ]
};

// Canonical Category Key Resolution
function getCanonicalCategoryKey(category) {
  if (!category) return 'local';
  const c = String(category).trim().toLowerCase();
  if (['metro', 'train', 'tram', 'ferry', 'smartbus', 'express', 'minibus', 'local'].includes(c)) return c;
  if (c.includes('metro') || c.includes('subway') || c.includes('tube') || c.includes('skytrain') || c.includes('mtr')) return 'metro';
  if (c.includes('train') || c.includes('rail') || c.includes('elizabeth') || c.includes('overground') || c.includes('commuter')) return 'train';
  if (c.includes('tram') || c.includes('light rail') || c.includes('streetcar') || c.includes('dlr') || c.includes('cable car')) return 'tram';
  if (c.includes('ferry') || c.includes('seabus') || c.includes('river bus') || c.includes('citycat') || c.includes('water taxi')) return 'ferry';
  if (c.includes('smartbus') || c.includes('superloop') || c.includes('rapidbus') || c.includes('rapid bus') || c.includes('glider') || c.includes('o-bahn') || c.includes('cat') || c.includes('orbital') || c.includes('b-line')) return 'smartbus';
  if (c.includes('express') || c.includes('rocket') || c.includes('nightride') || c.includes('coach') || c.includes('freeway')) return 'express';
  if (c.includes('minibus') || c.includes('gmb')) return 'minibus';
  return 'local';
}

// Modal icon mapping based on route category and short name
function getModalIcon(category, shortName) {
  const key = getCanonicalCategoryKey(category);
  switch (key) {
    case 'metro': return 'Ⓜ️';
    case 'train': return '🚆';
    case 'tram': return '🚊';
    case 'ferry': return '⛴️';
    case 'smartbus': return '⚡';
    case 'express': return '🚀';
    case 'minibus': return '🚐';
    case 'local':
    default:
      return '🚌';
  }
}

function getTransitModeGroup(category, shortName) {
  const key = getCanonicalCategoryKey(category);
  if (key === 'metro') return 'tube';
  if (key === 'train') return 'train';
  if (key === 'tram') return 'tram';
  if (key === 'ferry') return 'ferry';
  return 'bus';
}

function getTransitModeLabel(mode, category) {
  switch (mode) {
    case 'train':
      return { mode: 'train', label: 'Heavy Rail', icon: '🚆', chipClass: 'route-chip-train' };
    case 'tube':
      return { mode: 'tube', label: 'Metro / Tube', icon: 'Ⓜ️', chipClass: 'route-chip-tube' };
    case 'tram':
      return { mode: 'tram', label: 'Tram / Light Rail', icon: '🚊', chipClass: 'route-chip-tram' };
    case 'ferry':
      return { mode: 'ferry', label: 'Ferry', icon: '⛴️', chipClass: 'route-chip-ferry' };
    case 'bus':
    default:
      return { mode: 'bus', label: 'Bus', icon: '🚌', chipClass: 'route-chip-bus' };
  }
}

function formatRouteBadge(route) {
  if (!route || !route.shortName) return '';
  const icon = getModalIcon(route.category, route.shortName);
  return `${icon} ${route.shortName}`;
}

// Sub-Pixel Polyline Offset calculation formula
function calcPolylineOffset(index, totalRoutes) {
  if (totalRoutes <= 1) return 0;
  const factor = Math.min(1.4, 8.5 / Math.max(1, totalRoutes - 1));
  return (index - (totalRoutes - 1) / 2) * factor;
}

// Deterministic 2-Axis Visual Stroke Hierarchy (Service Availability vs. Mode Capacity & Headway)
function getRouteStrokeStyle(route) {
  if (!route) return { weight: 3.2, opacity: 0.92, dashArray: null, mode: 'bus', hasCasing: false };

  const cat = (route.category || '').toLowerCase();
  const freq = (route.frequency || '').toLowerCase();
  const span = (route.span || '').toLowerCase();
  const mode = getTransitModeGroup(route.category, route.shortName || route.short_name);

  // 1. DETERMINE STROKE PATTERN (Solid vs. Dashed)
  // A route is strictly DASHED only if it is a peak-only commuter tripper without all-day service.
  let isPeakOnly = false;
  if (
    freq.includes('peak only') ||
    freq.includes('weekday peak only') ||
    freq.includes('am inbound / pm outbound') ||
    freq.includes('peak hours only') ||
    span.includes('peak hours') ||
    span.includes('am inbound / pm outbound') ||
    freq.includes('limited daily trips')
  ) {
    // If it has off-peak service (e.g. "Peak express / Off-peak 30 mins"), it runs all day -> NOT peak only!
    if (!freq.includes('off-peak')) {
      isPeakOnly = true;
    }
  }

  // 2. DETERMINE HEADWAY & TIER (Thick vs. Standard vs. Thin)
  // High-capacity rail & BRT modes are ALWAYS Tier 1 (Turn-Up-And-Go)
  const isRapidMode =
    cat.includes('metro') ||
    cat.includes('subway') ||
    cat.includes('tube') ||
    cat.includes('skytrain') ||
    cat.includes('mtr') ||
    cat.includes('elizabeth') ||
    cat.includes('train') ||
    cat.includes('overground') ||
    (cat.includes('rail') && !cat.includes('light rail')) ||
    cat.includes('commuter') ||
    cat.includes('tram') ||
    cat.includes('light rail') ||
    cat.includes('streetcar') ||
    cat.includes('dlr') ||
    cat.includes('seabus') ||
    cat.includes('smartbus') ||
    cat.includes('rapidbus') ||
    cat.includes('b-line') ||
    cat.includes('superloop') ||
    cat.includes('glider') ||
    cat.includes('o-bahn');

  // Headway extraction from strings like "Every 10-15 mins", "Every 2-4 mins", "Every 15-20 mins"
  let parsedMinMinutes = 999;
  const match = freq.match(/every\s+(\d+)(?:-(\d+))?\s*mins?/i);
  if (match) {
    parsedMinMinutes = parseInt(match[1], 10);
  }

  const isExpressSpine = !isPeakOnly && (cat.includes('express') || freq.includes('express')) && parsedMinMinutes <= 20;
  const isHighFrequency = isRapidMode || isExpressSpine || parsedMinMinutes <= 15 || freq.includes('24/7') || cat === 'cat';
  const isInfrequent = parsedMinMinutes > 30 || freq.includes('coach') || freq.includes('regional timetable');

  // 3. COMBINE INTO BASELINE PROPERTIES
  let weight = 3.2;
  let opacity = 0.92;
  let dashArray = null;

  if (isHighFrequency) {
    // Tier 1: Bold spine corridor (4.8px)
    weight = 4.8;
    opacity = 0.98;
    if (isPeakOnly) {
      dashArray = '8, 5';
      opacity = 0.88;
    }
  } else if (isInfrequent) {
    // Tier 3: Low frequency coverage (2.2px)
    weight = 2.2;
    opacity = 0.82;
    if (isPeakOnly) {
      dashArray = '6, 5';
      opacity = 0.75;
    }
  } else {
    // Tier 2: Standard baseline network (15–30 min) (3.2px)
    weight = 3.2;
    opacity = 0.92;
    if (isPeakOnly) {
      dashArray = '7, 5';
      opacity = 0.85;
    }
  }

  // 4. MULTI-LAYER CARTOGRAPHIC SPECIFICATION (Mode & Track Distinction)
  let hasCasing = false;
  let casingColor = '#090d16';
  let casingWeight = weight + 2.4;
  let casingOpacity = 0.95;
  let casingDashArray = null;
  let casingLineCap = 'round';
  let coreColor = route.color || '#3b82f6';
  let coreWeight = weight;
  let coreOpacity = opacity;
  let coreDashArray = dashArray;
  let coreLineCap = 'round';

  if (mode === 'train') {
    // Heavy Rail / Train: Ballasted railroad track with alternating track ties
    hasCasing = true;
    casingColor = '#090d16'; // Deep ballast casing
    casingWeight = 6.4;
    casingOpacity = 0.96;
    casingDashArray = null;
    casingLineCap = 'butt';
    coreWeight = 3.6;
    coreOpacity = 0.98;
    coreDashArray = '8, 6'; // Track ties pattern
    coreLineCap = 'square';
    weight = 6.4;
  } else if (mode === 'tube') {
    // Metro / Underground: Double-cased high-contrast rapid transit ribbon
    hasCasing = true;
    casingColor = '#ffffff'; // Crisp white halo casing
    casingWeight = 6.8;
    casingOpacity = 0.95;
    casingDashArray = null;
    casingLineCap = 'round';
    coreWeight = 4.4;
    coreOpacity = 1.0;
    coreDashArray = isPeakOnly ? '10, 6' : null;
    coreLineCap = 'round';
    weight = 6.8;
  } else if (mode === 'tram') {
    // Tram / Light Rail: Surface rail dash track with dark slate casing
    hasCasing = true;
    casingColor = '#1e293b';
    casingWeight = 4.8;
    casingOpacity = 0.85;
    casingDashArray = null;
    casingLineCap = 'round';
    coreWeight = 2.8;
    coreOpacity = 0.96;
    coreDashArray = '5, 4'; // Light rail track dash
    coreLineCap = 'round';
    weight = 4.8;
  } else if (mode === 'ferry') {
    // Ferry: Nautical fairway dash
    hasCasing = false;
    coreWeight = 3.0;
    coreDashArray = '12, 6';
    coreLineCap = 'round';
    dashArray = '12, 6';
    weight = 3.0;
  } else {
    // Bus: Clean, smooth road corridor without rail ballast
    hasCasing = false;
    coreLineCap = 'round';
  }

  return {
    weight,
    opacity,
    dashArray,
    mode,
    hasCasing,
    casingColor,
    casingWeight,
    casingOpacity,
    casingDashArray,
    casingLineCap,
    coreColor,
    coreWeight,
    coreOpacity,
    coreDashArray,
    coreLineCap
  };
}

// Helper to extract primary coordinate array from either GeoJSON array or composite variation object
function getRouteCoordinates(geomData) {
  if (!geomData) return [];
  if (Array.isArray(geomData)) return geomData;
  if (geomData.composite && geomData.composite.coordinates) return geomData.composite.coordinates;
  if (geomData.trunk && geomData.trunk.coordinates) return geomData.trunk.coordinates;
  const values = Object.values(geomData);
  if (values.length > 0 && values[0].coordinates) return values[0].coordinates;
  return [];
}

// Build single or multi-layer polyline for a route segment according to transit mode
function createStyledRouteSegment(latlngs, route, strokeStyle, offset, partDashArray = null) {
  // Support MultiLineString / multi-branch geometries natively
  if (Array.isArray(latlngs) && latlngs.length > 0 && Array.isArray(latlngs[0]) && latlngs[0].length > 0 && Array.isArray(latlngs[0][0])) {
    const multiGroup = L.featureGroup();
    for (const branchLatLngs of latlngs) {
      if (branchLatLngs.length >= 2) {
        const branchLayer = createStyledRouteSegment(branchLatLngs, route, strokeStyle, offset, partDashArray);
        multiGroup.addLayer(branchLayer);
      }
    }
    multiGroup._baseOpacity = strokeStyle.opacity;
    return multiGroup;
  }

  if (strokeStyle.hasCasing) {
    const group = L.featureGroup();
    // Underlayer: Casing / Ballast / Halo
    const casing = L.polyline(latlngs, {
      color: strokeStyle.casingColor,
      weight: strokeStyle.casingWeight,
      opacity: strokeStyle.casingOpacity,
      dashArray: strokeStyle.casingDashArray,
      lineCap: strokeStyle.casingLineCap,
      offset: offset,
      className: `route-casing-${strokeStyle.mode}`
    });
    casing._baseOpacity = strokeStyle.casingOpacity;

    // Overlayer: Core Track / Ribbon
    const core = L.polyline(latlngs, {
      color: route.color || strokeStyle.coreColor,
      weight: strokeStyle.coreWeight,
      opacity: strokeStyle.coreOpacity,
      dashArray: partDashArray || strokeStyle.coreDashArray,
      lineCap: strokeStyle.coreLineCap,
      offset: offset,
      className: `route-core-${strokeStyle.mode}`
    });
    core._baseOpacity = strokeStyle.coreOpacity;

    group.addLayer(casing);
    group.addLayer(core);
    group._baseOpacity = strokeStyle.opacity;
    return group;
  } else {
    // Wheel-based road transit: Clean single road corridor
    const line = L.polyline(latlngs, {
      color: route.color || strokeStyle.coreColor,
      weight: strokeStyle.coreWeight || strokeStyle.weight,
      opacity: strokeStyle.coreOpacity || strokeStyle.opacity,
      dashArray: partDashArray || strokeStyle.coreDashArray || strokeStyle.dashArray,
      lineCap: strokeStyle.coreLineCap || 'round',
      offset: offset,
      className: `route-line-${strokeStyle.mode}`
    });
    line._baseOpacity = strokeStyle.opacity;
    return line;
  }
}

// Calculate Haversine distance in meters
function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLon = (lon2 - lon1) * rad;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * rad) * Math.cos(lat2 * rad) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate initial navigation bearing from (lat1, lon1) to (lat2, lon2) in radians (-PI to PI)
function calculateBearing(lat1, lon1, lat2, lon2) {
  const rad = Math.PI / 180;
  const phi1 = lat1 * rad;
  const phi2 = lat2 * rad;
  const deltaLambda = (lon2 - lon1) * rad;
  const y = Math.sin(deltaLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);
  return Math.atan2(y, x);
}

// Find nearest vertex or stop of a route relative to queryPoint
function findRouteNearestVertex(route, queryPoint, geomData) {
  if (!queryPoint || typeof queryPoint.lat !== 'number' || typeof queryPoint.lon !== 'number') {
    return { distMeters: 0, bearing: 0 };
  }
  const qLat = queryPoint.lat;
  const qLon = queryPoint.lon;
  const cosLat = Math.cos(qLat * (Math.PI / 180));

  let bestDistSq = Infinity;
  let bestLat = qLat;
  let bestLon = qLon;

  const checkPoint = (lat, lon) => {
    if (typeof lat !== 'number' || typeof lon !== 'number') return;
    const dLat = lat - qLat;
    const dLon = (lon - qLon) * cosLat;
    const dSq = dLat * dLat + dLon * dLon;
    if (dSq < bestDistSq) {
      bestDistSq = dSq;
      bestLat = lat;
      bestLon = lon;
    }
  };

  if (geomData) {
    if (Array.isArray(geomData)) {
      if (geomData.length > 0 && Array.isArray(geomData[0]) && Array.isArray(geomData[0][0])) {
        for (const branch of geomData) {
          for (const pt of branch) checkPoint(pt[1], pt[0]);
        }
      } else {
        for (const pt of geomData) checkPoint(pt[1], pt[0]);
      }
    } else if (typeof geomData === 'object') {
      for (const key of Object.keys(geomData)) {
        const part = geomData[key];
        if (part && Array.isArray(part.coordinates)) {
          if (part.coordinates.length > 0 && Array.isArray(part.coordinates[0]) && Array.isArray(part.coordinates[0][0])) {
            for (const branch of part.coordinates) {
              for (const pt of branch) checkPoint(pt[1], pt[0]);
            }
          } else {
            for (const pt of part.coordinates) checkPoint(pt[1], pt[0]);
          }
        }
      }
    }
  }

  // Fallback to route stops if no geometry points found
  if (bestDistSq === Infinity && Array.isArray(route.stops)) {
    for (const stop of route.stops) {
      const sLat = typeof stop.lat === 'number' ? stop.lat : (Array.isArray(stop) ? stop[1] : null);
      const sLon = typeof stop.lon === 'number' ? stop.lon : (typeof stop.lng === 'number' ? stop.lng : (Array.isArray(stop) ? stop[0] : null));
      if (sLat !== null && sLon !== null) {
        checkPoint(sLat, sLon);
      }
    }
  }

  if (bestDistSq === Infinity) {
    return { distMeters: 0, bearing: 0 };
  }

  const distMeters = haversineMeters(qLat, qLon, bestLat, bestLon);
  const bearing = calculateBearing(qLat, qLon, bestLat, bestLon);
  return { distMeters, bearing };
}

// Compute irregular dendritic wavefront delays (Issue #11)
function computeRouteWavefrontDelays(routes, queryPoint, geometryCache) {
  if (!routes || routes.length === 0) return new Map();

  const routeMetrics = [];
  for (const route of routes) {
    const geomData = geometryCache ? geometryCache.get(route.id) : null;
    const { distMeters, bearing } = findRouteNearestVertex(route, queryPoint, geomData);
    const angleJitter = Math.sin(bearing * 3) * 60 + Math.cos(bearing * 2) * 40;
    const routeIdStr = String(route.id || '');
    const hashJitter = ((routeIdStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 70) - 35);
    const rawDelay = Math.max(0, (distMeters * 0.45) + angleJitter + hashJitter);
    routeMetrics.push({ routeId: route.id, rawDelay, distMeters, bearing });
  }

  const delayMap = new Map();
  if (routeMetrics.length <= 1) {
    if (routeMetrics.length === 1) {
      delayMap.set(routeMetrics[0].routeId, 0);
    }
    return delayMap;
  }

  let minRaw = Infinity;
  let maxRaw = -Infinity;
  for (const m of routeMetrics) {
    if (m.rawDelay < minRaw) minRaw = m.rawDelay;
    if (m.rawDelay > maxRaw) maxRaw = m.rawDelay;
  }

  const cascadeSpan = maxRaw - minRaw;
  // Scale delays so the entire cascade finishes within 400ms – 650ms total
  const targetDuration = cascadeSpan > 0 ? Math.min(650, Math.max(400, cascadeSpan)) : 0;

  for (const m of routeMetrics) {
    const delay = cascadeSpan > 0
      ? Math.round(((m.rawDelay - minRaw) / cascadeSpan) * targetDuration)
      : 0;
    delayMap.set(m.routeId, delay);
  }
  return delayMap;
}

// Recursively retrieve all SVG <path> elements from Leaflet polyline / featureGroup layer
function getLayerSvgPaths(layer) {
  const paths = [];
  if (!layer) return paths;
  if (layer._path) {
    paths.push(layer._path);
  }
  if (typeof layer.eachLayer === 'function') {
    layer.eachLayer(child => {
      paths.push(...getLayerSvgPaths(child));
    });
  }
  return paths;
}

// Precompute harmonic directional offsets for locked 60 FPS wavefront animation (Issue #11)
function precomputeWavefrontOffsets(numVertices) {
  const offsets = [];
  for (let i = 0; i < numVertices; i++) {
    const theta = (i / numVertices) * 2 * Math.PI;
    const harmonic = 1 + 0.25 * Math.sin(theta * 3) + 0.15 * Math.cos(theta * 5) + 0.06 * Math.sin(theta * 7);
    offsets.push({
      dx: harmonic * Math.cos(theta),
      dy: harmonic * Math.sin(theta)
    });
  }
  return offsets;
}

// Adaptive LOD based on visible route density
function getAdaptiveLODVertices(routeCount) {
  if (routeCount >= 35) return 18;
  if (routeCount >= 18) return 24;
  return 32;
}

// Build irregular animated polygon points for organic dendritic wavefront (Issue #11)
function buildWavefrontPolygonPoints(center, radius, offsetsOrVertices = 32) {
  if (!center || typeof center.x !== 'number' || typeof center.y !== 'number') return '';
  const offsets = Array.isArray(offsetsOrVertices)
    ? offsetsOrVertices
    : precomputeWavefrontOffsets(typeof offsetsOrVertices === 'number' ? offsetsOrVertices : 32);

  const pts = [];
  const len = offsets.length;
  for (let i = 0; i < len; i++) {
    const u = offsets[i];
    const x = Number((center.x + radius * u.dx).toFixed(1));
    const y = Number((center.y + radius * u.dy).toFixed(1));
    pts.push(`${x},${y}`);
  }
  return pts.join(' ');
}

// Client-side Stop Corridor Spatial Safeguard (75m threshold)
function filterStopsWithinCorridor(stops, polylineCoords, maxDistMeters = 75.0) {
  if (!stops || !polylineCoords) return [];
  if (polylineCoords.coordinates) polylineCoords = polylineCoords.coordinates;
  if (!polylineCoords || polylineCoords.length === 0) return [];
  const isMulti = Array.isArray(polylineCoords[0]) && Array.isArray(polylineCoords[0][0]);
  const branches = isMulti ? polylineCoords : [polylineCoords];

  return stops.filter(stop => {
    let minDistance = Infinity;
    for (const branch of branches) {
      for (let i = 0; i < branch.length - 1; i++) {
        const p1 = branch[i];
        const p2 = branch[i + 1];
        // Point-to-segment distance in meters
        const dist = pointToSegmentMeters(stop.lat, stop.lon, p1[1], p1[0], p2[1], p2[0]);
        if (dist < minDistance) minDistance = dist;
      }
    }
    return minDistance <= maxDistMeters;
  });
}

function pointToSegmentMeters(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx === 0 && dy === 0) return haversineMeters(px, py, x1, y1);
  let t = ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  const projX = x1 + t * dx;
  const projY = y1 + t * dy;
  return haversineMeters(px, py, projX, projY);
}

// Lightweight Native Geohash Encoding & Decoding (Zero Dependencies, Base32)
const GEOHASH_BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz";

function encodeGeohash(lat, lon, precision = 7) {
  if (typeof lat !== 'number' || typeof lon !== 'number' || isNaN(lat) || isNaN(lon)) {
    return null;
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return null;
  }
  let minLat = -90.0, maxLat = 90.0;
  let minLon = -180.0, maxLon = 180.0;
  let geohash = '';
  let isEven = true;
  let bit = 0;
  let ch = 0;

  while (geohash.length < precision) {
    if (isEven) {
      const mid = (minLon + maxLon) / 2;
      if (lon >= mid) {
        ch |= (1 << (4 - bit));
        minLon = mid;
      } else {
        maxLon = mid;
      }
    } else {
      const mid = (minLat + maxLat) / 2;
      if (lat >= mid) {
        ch |= (1 << (4 - bit));
        minLat = mid;
      } else {
        maxLat = mid;
      }
    }
    isEven = !isEven;

    if (bit < 4) {
      bit++;
    } else {
      geohash += GEOHASH_BASE32[ch];
      bit = 0;
      ch = 0;
    }
  }

  return geohash;
}

function decodeGeohash(hash) {
  if (!hash || typeof hash !== 'string') return null;
  const cleanHash = hash.trim().toLowerCase();
  if (cleanHash.length === 0) return null;

  let minLat = -90.0, maxLat = 90.0;
  let minLon = -180.0, maxLon = 180.0;
  let isEven = true;

  for (let i = 0; i < cleanHash.length; i++) {
    const char = cleanHash[i];
    const cd = GEOHASH_BASE32.indexOf(char);
    if (cd === -1) return null;

    for (let mask = 16; mask > 0; mask >>= 1) {
      if (isEven) {
        const mid = (minLon + maxLon) / 2;
        if (cd & mask) {
          minLon = mid;
        } else {
          maxLon = mid;
        }
      } else {
        const mid = (minLat + maxLat) / 2;
        if (cd & mask) {
          minLat = mid;
        } else {
          maxLat = mid;
        }
      }
      isEven = !isEven;
    }
  }

  return {
    lat: (minLat + maxLat) / 2,
    lon: (minLon + maxLon) / 2,
    latError: (maxLat - minLat) / 2,
    lonError: (maxLon - minLon) / 2
  };
}

if (typeof window !== 'undefined') {
  window.encodeGeohash = encodeGeohash;
  window.decodeGeohash = decodeGeohash;
  window.GEOHASH_BASE32 = GEOHASH_BASE32;
}

// Main Application State
class BusMapApp {
  constructor() {
    this.defaultRadius = 400;
    this.currentRadius = 400; // Default: 400m
    this.parseUrlFilterParameters();
    const initialLoc = this.resolveInitialLocation();
    this.queryPoint = { lat: initialLoc.lat, lon: initialLoc.lon };
    this.currentAgencyId = initialLoc.agencyId;
    this.lastSelectedLocationName = initialLoc.name;
    this.currentRadius = this.currentRadius || 400;

    // Initial modality filters (None in URL defaults to select all)
    const ALL_KNOWN_MODES = ['metro', 'train', 'tram', 'ferry', 'smartbus', 'express', 'local', 'minibus'];
    this.activeFilters = {};
    if (this.hasExplicitModesParam && this.specifiedModes instanceof Set) {
      ALL_KNOWN_MODES.forEach(key => {
        this.activeFilters[key] = this.specifiedModes.has(key);
      });
    } else {
      ALL_KNOWN_MODES.forEach(key => {
        this.activeFilters[key] = true;
      });
    }

    this.renderedCategoryKeys = new Set(['train', 'tram', 'smartbus', 'express', 'local']);
    this._renderedFilterAgency = null;
    this.selectedRouteId = null;
    this.activeVariation = 'all';

    // Caches (Rule 2 Decoupled Geometries)
    this.geometryCache = new Map();
    this.routeStopsCache = new Map();
    this.activeRoutes = [];
    this.catchmentStops = [];
    this.routeLayers = new Map();
    this.hitTargetLayers = new Map();
    this.stopPinLayers = [];
    this.stopPinsMap = new Map();
    this.routeAnimationTimers = [];
    this.routeAnimationFrameId = null;
    this.currentSearchSuggestions = [];
    this.selectedSuggestionIndex = -1;
    this.agencyCategoriesMap = new Map();

    // Client-side Caches (OPT-4)
    this.catchmentCache = new Map();
    this.searchCache = new Map();
    this.activeCatchmentAbort = null;
    this.activeSearchAbort = null;

    this.initMap();
    this.initEventListeners();
    this.initResizeObserver();
    this.updateStatusBadges();
    this.loadCatchment();
    this.initGeolocationDefault();
  }

  encodeGeohash(lat, lon, precision = 7) {
    return encodeGeohash(lat, lon, precision);
  }

  decodeGeohash(hash) {
    return decodeGeohash(hash);
  }

  parseUrlFilterParameters() {
    try {
      if (typeof window === 'undefined' || !window.location) {
        this.hasExplicitModesParam = false;
        this.specifiedModes = null;
        return;
      }
      let rawModes = null;
      if (window.location.search) {
        const urlParams = new URLSearchParams(window.location.search);
        rawModes = urlParams.get('modes') || urlParams.get('mode');
      }

      // Check compact hash geohash segments for modal filter overrides (/#geohash/radius/modes or /#geohash//modes)
      if ((rawModes === null || rawModes === undefined || rawModes.trim() === '') && window.location.hash) {
        const geohashMatch = window.location.hash.match(/^#?([0-9bcdefghjkmnpqrstuvwxyz]{7})(?:\/(\d*))?(?:\/([a-zA-Z0-9_,*]+))?\/?$/i);
        if (geohashMatch && geohashMatch[3]) {
          rawModes = geohashMatch[3];
        }
      }

      if (rawModes === null || rawModes === undefined || rawModes.trim() === '') {
        // "with none defaulted to select all" - omitted or empty parameter defaults to select all
        this.hasExplicitModesParam = false;
        this.specifiedModes = null;
        return;
      }

      const trimmed = rawModes.trim().toLowerCase();
      this.hasExplicitModesParam = true;
      if (trimmed === 'none' || trimmed === 'empty') {
        this.specifiedModes = new Set();
      } else if (trimmed === 'all' || trimmed === '*') {
        this.hasExplicitModesParam = false;
        this.specifiedModes = null;
      } else {
        const list = trimmed.split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        this.specifiedModes = new Set(list);
      }
    } catch (e) {
      console.warn("Error parsing URL filter parameters:", e);
      this.hasExplicitModesParam = false;
      this.specifiedModes = null;
    }
  }

  resolveInitialLocation() {
    // Check URL parameters for explicit deep-linked coordinates or hub/city targets (e.g. from SEO landing pages)
    try {
      const urlParams = (typeof window !== 'undefined' && window.location && window.location.search)
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
      let paramLat = parseFloat(urlParams.get('lat'));
      let paramLon = parseFloat(urlParams.get('lon'));
      const paramName = urlParams.get('name') || urlParams.get('hub') || urlParams.get('location');
      let paramRadius = parseInt(urlParams.get('radius'), 10);

      // Support compact geohash hash (#<geohash>) and legacy hash coordinates (#lat,lon) as fallback
      if (typeof window !== 'undefined' && window.location && window.location.hash) {
        const hash = window.location.hash;
        const geohashMatch = hash.match(/^#?([0-9bcdefghjkmnpqrstuvwxyz]{7})(?:\/(\d*))?(?:\/([a-zA-Z0-9_,*]+))?\/?$/i);
        if (geohashMatch) {
          const decoded = decodeGeohash(geohashMatch[1]);
          if (decoded && !isNaN(decoded.lat) && !isNaN(decoded.lon)) {
            paramLat = decoded.lat;
            paramLon = decoded.lon;
            if (geohashMatch[2] && geohashMatch[2].length > 0) {
              const hashRadius = parseInt(geohashMatch[2], 10);
              if (!isNaN(hashRadius) && hashRadius > 0) {
                paramRadius = hashRadius;
              }
            }
          }
        } else if (isNaN(paramLat) || isNaN(paramLon)) {
          const hashMatch = hash.match(/^#?(-?\d+\.?\d*),(-?\d+\.?\d*)/);
          if (hashMatch) {
            paramLat = parseFloat(hashMatch[1]);
            paramLon = parseFloat(hashMatch[2]);
          }
        }
      }

      if (!isNaN(paramRadius) && [200, 400, 800, 1200].includes(paramRadius)) {
        this.currentRadius = paramRadius;
      }

      if (!isNaN(paramLat) && !isNaN(paramLon)) {
        this.isDeepLinked = true;
        return {
          lat: paramLat,
          lon: paramLon,
          name: paramName || `Lat: ${paramLat.toFixed(4)}, Lon: ${paramLon.toFixed(4)}`,
          agencyId: null
        };
      }
    } catch (e) {
      console.warn("URL parameter resolution failed:", e);
    }

    // Check for inline default location (e.g. from SEO landing pages)
    if (typeof window !== 'undefined' && window.INITIAL_LOCATION && typeof window.INITIAL_LOCATION.lat === 'number' && typeof window.INITIAL_LOCATION.lon === 'number') {
      this.isDeepLinked = true;
      if (window.INITIAL_LOCATION.radius && [200, 400, 800, 1200].includes(window.INITIAL_LOCATION.radius)) {
        this.currentRadius = window.INITIAL_LOCATION.radius;
      }
      return {
        lat: window.INITIAL_LOCATION.lat,
        lon: window.INITIAL_LOCATION.lon,
        name: window.INITIAL_LOCATION.name || `Lat: ${window.INITIAL_LOCATION.lat.toFixed(4)}, Lon: ${window.INITIAL_LOCATION.lon.toFixed(4)}`,
        agencyId: window.INITIAL_LOCATION.agencyId || null
      };
    }

    let tz = '';
    try {
      tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    } catch (e) {
      console.warn("Timezone resolution failed:", e);
    }

    if (tz === 'Europe/London' || tz === 'Europe/Belfast' || tz === 'Europe/Jersey' || tz === 'Europe/Guernsey' || tz === 'Europe/Isle_of_Man' || tz.startsWith('Europe/')) {
      return { lat: 51.5074, lon: -0.1278, name: 'Central London (Charing Cross)', agencyId: 'gb-tfl' };
    }
    if (tz === 'America/Los_Angeles') {
      return { lat: 37.7844, lon: -122.4080, name: 'Powell Street / Market St', agencyId: 'us-ca-bayarea' };
    }
    if (tz === 'America/New_York') {
      return { lat: 40.7527, lon: -73.9772, name: 'Grand Central Terminal / Times Sq', agencyId: 'us-ny-mta' };
    }
    if (tz === 'America/Toronto' || tz === 'America/Montreal') {
      return { lat: 43.6453, lon: -79.3806, name: 'Toronto Union Station', agencyId: 'ca-on-ttc' };
    }
    if (tz === 'America/Vancouver') {
      return { lat: 49.2859, lon: -123.1118, name: 'Vancouver Waterfront Station', agencyId: 'ca-bc-translink' };
    }
    if (tz === 'Asia/Hong_Kong') {
      return { lat: 22.2820, lon: 114.1582, name: 'Central Station, Hong Kong', agencyId: 'hk-td' };
    }
    if (tz === 'Australia/Sydney') {
      return { lat: -33.8830, lon: 151.2065, name: 'Sydney Central Station', agencyId: 'au-nsw-tfnsw' };
    }
    if (tz === 'Australia/Brisbane') {
      return { lat: -27.4660, lon: 153.0280, name: 'Brisbane Central Station', agencyId: 'au-qld-translink' };
    }
    if (tz === 'Australia/Adelaide' || tz === 'Australia/Broken_Hill') {
      return { lat: -34.9213, lon: 138.5954, name: 'Adelaide Railway Station', agencyId: 'au-sa-adelaidemetro' };
    }
    if (tz === 'Australia/Perth') {
      return { lat: -31.9515, lon: 115.8575, name: 'Perth Station', agencyId: 'au-wa-transperth' };
    }
    if (tz === 'Australia/Canberra' || tz === 'Australia/ACT') {
      return { lat: -35.2813, lon: 149.1298, name: 'City Interchange, Canberra', agencyId: 'au-act-transportcanberra' };
    }
    if (tz === 'Australia/Hobart' || tz === 'Australia/Tasmania' || tz === 'Australia/Currie') {
      return { lat: -42.8821, lon: 147.3272, name: 'Hobart Bus Interchange', agencyId: 'au-tas-metrotas' };
    }
    if (tz === 'Australia/Darwin') {
      return { lat: -12.4634, lon: 130.8444, name: 'Darwin City Interchange', agencyId: 'au-nt-darwinbus' };
    }
    if (tz === 'Australia/Melbourne') {
      return { lat: -37.8180, lon: 144.9671, name: 'Flinders Street Station', agencyId: 'au-vic-ptv' };
    }

    // Default fallback (if unrecognized): neutral Melbourne CBD
    return { lat: -37.8180, lon: 144.9671, name: 'Flinders Street Station', agencyId: 'au-vic-ptv' };
  }

  initMap() {
    // 5 Cartographic Base Layers
    const osmStandard = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    });

    const esriStreet = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Tiles © Esri'
    });

    const esriGray = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 16,
      attribution: 'Tiles © Esri, HERE, DeLorme'
    });

    const osmHot = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors, HOT'
    });

    const esriSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      maxZoom: 19,
      attribution: 'Source: Esri, Maxar, Earthstar Geographics'
    });

    this.map = L.map('map', {
      center: [this.queryPoint.lat, this.queryPoint.lon],
      zoom: 14,
      layers: [osmStandard],
      zoomControl: false,
      tap: true
    });

    // Base Layer Control (Positioned bottomright next to frequency legend)
    this.layerControl = L.control.layers({
      "OpenStreetMap (Default)": osmStandard,
      "Esri Clean Gray Canvas": esriGray,
      "Esri World Street": esriStreet,
      "Humanitarian (HOT)": osmHot,
      "Esri Satellite": esriSatellite
    }, null, { position: 'bottomright' }).addTo(this.map);

    const layerMount = document.getElementById('layer-control-mount');
    if (layerMount) {
      const layerContainer = this.layerControl.getContainer();
      if (layerContainer) {
        // Issue #9: Strictly disable mouse-hover expansion so selector only opens on click
        this.layerControl._expandSafely = function() {};
        L.DomEvent.off(layerContainer, 'mouseenter');
        L.DomEvent.off(layerContainer, 'mouseleave');
        L.DomEvent.off(layerContainer, 'mouseover');
        L.DomEvent.off(layerContainer, 'mouseout');

        layerContainer.addEventListener('mouseenter', (e) => {
          e.stopImmediatePropagation();
        }, true);
        layerContainer.addEventListener('mouseover', (e) => {
          e.stopImmediatePropagation();
        }, true);
        layerContainer.addEventListener('mouseleave', (e) => {
          e.stopImmediatePropagation();
        }, true);

        layerMount.appendChild(layerContainer);
      }
    }

    // Disable map propagation for corner legend & layer controls bar
    const cornerLegendControl = document.getElementById('corner-legend-control');
    if (cornerLegendControl) {
      L.DomEvent.disableClickPropagation(cornerLegendControl);
      L.DomEvent.disableScrollPropagation(cornerLegendControl);
    }

    // Catchment Radius Control (Positioned bottomleft)
    const CatchmentControl = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: () => {
        const container = document.getElementById('catchment-control');
        if (container) {
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);
        }
        return container;
      }
    });
    new CatchmentControl().addTo(this.map);

    // Modal Filters Control (Square button on bottomleft of map)
    const ModalFilterControl = L.Control.extend({
      options: { position: 'bottomleft' },
      onAdd: () => {
        const container = document.getElementById('modal-filter-control');
        if (container) {
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);
        }
        return container;
      }
    });
    new ModalFilterControl().addTo(this.map);

    // Help Control (Positioned topright on the map)
    const HelpControl = L.Control.extend({
      options: { position: 'topright' },
      onAdd: () => {
        const container = document.getElementById('map-help-control');
        if (container) {
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.disableScrollPropagation(container);
        }
        return container;
      }
    });
    new HelpControl().addTo(this.map);

    // Draggable Red Query Marker Pin (UX-4: 44x44px touch target with 18px visual center)
    const redPinIcon = L.divIcon({
      className: 'query-pin-marker',
      html: `<div class="query-pin-inner" style="background:#ef4444; width:18px; height:18px; border-radius:50%; border:3px solid #ffffff; box-shadow:0 0 12px rgba(239,68,68,0.8); cursor:grab;"></div>`,
      iconSize: [44, 44],
      iconAnchor: [22, 22]
    });

    this.queryMarker = L.marker([this.queryPoint.lat, this.queryPoint.lon], {
      draggable: true,
      icon: redPinIcon
    }).addTo(this.map);

    // Catchment Circle
    this.catchmentCircle = L.circle([this.queryPoint.lat, this.queryPoint.lon], {
      radius: this.currentRadius,
      color: '#ef4444',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#ef4444',
      fillOpacity: 0.08,
      interactive: false
    }).addTo(this.map);

    // Query Marker Drag Events
    this.queryMarker.on('dragstart', () => {
      this.closeDrawer();
      this.closeRouteBottomBox();
      this.clearStopPins();
      this.selectedRouteId = null;
      const el = this.queryMarker.getElement();
      if (el) el.classList.add('red-pin-dragging');
    });

    this.queryMarker.on('drag', (e) => {
      const pos = e.target.getLatLng();
      this.catchmentCircle.setLatLng(pos);
      this.updateUrlCoordinates(pos.lat, pos.lng);
    });

    this.queryMarker.on('dragend', (e) => {
      const el = this.queryMarker.getElement();
      if (el) el.classList.remove('red-pin-dragging');
      const pos = e.target.getLatLng();
      this.setQueryLocation(pos.lat, pos.lng);
    });

    // Map Interactions
    // 1. Right Click on desktop
    this.map.on('contextmenu', (e) => {
      this.setQueryLocation(e.latlng.lat, e.latlng.lng);
    });

    // 2. Long Press (immediate trigger after 450ms while press is held down)
    const mapContainer = this.map.getContainer();
    let pressTimer = null;
    let pressStartX = 0;
    let pressStartY = 0;
    let targetLatLng = null;
    let longPressTriggered = false;
    this.suppressNextClick = false;

    const startLongPress = (clientX, clientY, latlng) => {
      if (pressTimer) clearTimeout(pressTimer);
      pressStartX = clientX;
      pressStartY = clientY;
      targetLatLng = latlng;
      longPressTriggered = false;

      pressTimer = setTimeout(() => {
        pressTimer = null;
        longPressTriggered = true;
        this.suppressNextClick = true;
        if (navigator.vibrate) {
          try { navigator.vibrate(50); } catch (_) {}
        }
        if (targetLatLng) {
          this.setQueryLocation(targetLatLng.lat, targetLatLng.lng);
        }
      }, 450);
    };

    const cancelLongPress = (clientX, clientY, maxMovement = 12) => {
      if (!pressTimer) return;
      const dx = clientX - pressStartX;
      const dy = clientY - pressStartY;
      if (Math.hypot(dx, dy) > maxMovement) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
    };

    const endLongPress = () => {
      if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
      }
      if (longPressTriggered) {
        setTimeout(() => {
          this.suppressNextClick = false;
          longPressTriggered = false;
        }, 300);
      }
    };

    // Touch events for mobile/tablet (native DOM touchstart fires immediately on finger touch)
    mapContainer.addEventListener('touchstart', (e) => {
      if (e.touches && e.touches.length === 1) {
        const t = e.touches[0];
        const latlng = this.map.mouseEventToLatLng(t);
        startLongPress(t.clientX, t.clientY, latlng);
      } else {
        endLongPress();
      }
    }, { passive: true });

    mapContainer.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches.length === 1) {
        const t = e.touches[0];
        cancelLongPress(t.clientX, t.clientY, 12);
      } else {
        endLongPress();
      }
    }, { passive: true });

    mapContainer.addEventListener('touchend', endLongPress, { passive: true });
    mapContainer.addEventListener('touchcancel', endLongPress, { passive: true });

    // Mouse events for desktop left-click long press (UX-4)
    mapContainer.addEventListener('mousedown', (e) => {
      if (e.button === 0) { // Primary (left) button
        if (e.target && (e.target.closest('.leaflet-control') || e.target.closest('.leaflet-interactive') || e.target.closest('button'))) {
          return;
        }
        const latlng = this.map.mouseEventToLatLng(e);
        startLongPress(e.clientX, e.clientY, latlng);
      }
    });

    mapContainer.addEventListener('mousemove', (e) => {
      if (e.buttons === 1) {
        cancelLongPress(e.clientX, e.clientY, 6);
      }
    });

    mapContainer.addEventListener('mouseup', endLongPress);

    // Leaflet dragstart fallback
    this.map.on('dragstart movestart zoomstart', () => {
      this.clearRouteLoadingAnimations();
      endLongPress();
    });

    // 3. Click detection for road corridors
    this.map.on('click', (e) => {
      if (this.suppressNextClick || longPressTriggered) {
        this.suppressNextClick = false;
        longPressTriggered = false;
        return;
      }
      this.handleMapClickForCorridors(e);
    });

    // 4. Update visible routes chips & viewport catchment pill on moveend
    this.map.on('moveend zoomend', () => {
      this.updateVisibleRoutesChips();
      this.updateViewportCatchmentPill();
    });
  }

  initEventListeners() {
    // Sidebar Toggle
    const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggleBtn && sidebar) {
      sidebarToggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        this.triggerSmoothMapResize();
      });
    }

    // Location Search & Autocomplete
    this.initLocationSearch();

    // Modal Transit Filter Control Toggle & Dropdown
    const modalFilterControl = document.getElementById('modal-filter-control');
    const modalFilterToggleBtn = document.getElementById('modal-filter-toggle-btn');

    // Catchment Control Toggle & Dropdown
    const catchmentControl = document.getElementById('catchment-control');
    const catchmentToggleBtn = document.getElementById('catchment-toggle-btn');
    const catchmentBadge = document.getElementById('catchment-toggle-badge');

    if (catchmentToggleBtn && catchmentControl) {
      catchmentToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (modalFilterControl && modalFilterControl.classList.contains('open')) {
          modalFilterControl.classList.remove('open');
          if (modalFilterToggleBtn) modalFilterToggleBtn.classList.remove('active');
        }
        if (this.layerControl) {
          this.layerControl.collapse();
        }
        catchmentControl.classList.toggle('open');
        catchmentToggleBtn.classList.toggle('active', catchmentControl.classList.contains('open'));
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!catchmentControl.contains(e.target)) {
          catchmentControl.classList.remove('open');
          catchmentToggleBtn.classList.remove('active');
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && catchmentControl.classList.contains('open')) {
          catchmentControl.classList.remove('open');
          catchmentToggleBtn.classList.remove('active');
        }
      });
    }

    if (modalFilterToggleBtn && modalFilterControl) {
      modalFilterToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (catchmentControl && catchmentControl.classList.contains('open')) {
          catchmentControl.classList.remove('open');
          if (catchmentToggleBtn) catchmentToggleBtn.classList.remove('active');
        }
        if (this.layerControl) {
          this.layerControl.collapse();
        }
        modalFilterControl.classList.toggle('open');
        modalFilterToggleBtn.classList.toggle('active', modalFilterControl.classList.contains('open'));
      });

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!modalFilterControl.contains(e.target)) {
          modalFilterControl.classList.remove('open');
          modalFilterToggleBtn.classList.remove('active');
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modalFilterControl.classList.contains('open')) {
          modalFilterControl.classList.remove('open');
          modalFilterToggleBtn.classList.remove('active');
        }
      });
    }

    // Base Layer Control Toggle & Dismissal (Issue #9: First-click responsiveness & click-only expansion)
    const layerContainer = this.layerControl?.getContainer();
    const layerToggleBtn = layerContainer?.querySelector('.leaflet-control-layers-toggle');
    if (layerToggleBtn && layerContainer) {
      layerToggleBtn.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        e.preventDefault();
        const isExpanded = layerContainer.classList.contains('leaflet-control-layers-expanded');
        if (isExpanded) {
          this.layerControl.collapse();
        } else {
          if (catchmentControl && catchmentControl.classList.contains('open')) {
            catchmentControl.classList.remove('open');
            if (catchmentToggleBtn) catchmentToggleBtn.classList.remove('active');
          }
          if (modalFilterControl && modalFilterControl.classList.contains('open')) {
            modalFilterControl.classList.remove('open');
            if (modalFilterToggleBtn) modalFilterToggleBtn.classList.remove('active');
          }
          this.layerControl.expand();
        }
      }, true);

      // Close layer control on outside click
      document.addEventListener('click', (e) => {
        if (!layerContainer.contains(e.target)) {
          this.layerControl.collapse();
        }
      });

      // Close layer control on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && layerContainer.classList.contains('leaflet-control-layers-expanded')) {
          this.layerControl.collapse();
        }
      });
    }

    // Map Help Control Toggle & Popover
    const helpControl = document.getElementById('map-help-control');
    const helpBtn = document.getElementById('map-help-btn');
    const closeHelpBtn = document.getElementById('close-map-help-btn');

    if (helpBtn && helpControl) {
      helpBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        helpControl.classList.toggle('open');
        helpBtn.classList.toggle('active', helpControl.classList.contains('open'));
      });

      if (closeHelpBtn) {
        closeHelpBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          helpControl.classList.remove('open');
          helpBtn.classList.remove('active');
        });
      }

      const helpBackdrop = document.getElementById('map-help-backdrop');
      if (helpBackdrop) {
        helpBackdrop.addEventListener('click', (e) => {
          e.stopPropagation();
          helpControl.classList.remove('open');
          helpBtn.classList.remove('active');
        });
      }

      // Close on outside click
      document.addEventListener('click', (e) => {
        if (!helpControl.contains(e.target)) {
          helpControl.classList.remove('open');
          helpBtn.classList.remove('active');
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && helpControl.classList.contains('open')) {
          helpControl.classList.remove('open');
          helpBtn.classList.remove('active');
        }
      });
    }

    // Radius Selector Buttons
    const radiusBtns = document.querySelectorAll('.radius-btn');
    radiusBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.radius, 10) === this.currentRadius);
      btn.addEventListener('click', (e) => {
        radiusBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentRadius = parseInt(btn.dataset.radius, 10);
        trackAnalyticsEvent('change_radius', { radius: this.currentRadius, agency_id: this.currentAgencyId || '' });
        this.catchmentCircle.setRadius(this.currentRadius);
        this.updateStatusBadges();
        const activeBadge = document.getElementById('catchment-toggle-badge');
        if (activeBadge) {
          activeBadge.textContent = `${this.currentRadius}m`;
        }
        if (catchmentToggleBtn) {
          catchmentToggleBtn.title = `Walking Catchment Radius: ${this.currentRadius}m`;
          catchmentToggleBtn.setAttribute('aria-label', `Walking Catchment Radius: ${this.currentRadius}m`);
          catchmentToggleBtn.classList.remove('active');
        }
        if (catchmentControl) {
          catchmentControl.classList.remove('open');
        }
        this.closeDrawer();
        this.closeRouteBottomBox();
        this.clearStopPins();
        this.selectedRouteId = null;
        this.updateUrlCoordinates(this.queryPoint.lat, this.queryPoint.lon, this.currentRadius);
        this.loadCatchment();
      });
    });


    // Modal Filters (Trains, Trams, SmartBus, Express, Local)
    const filters = ['train', 'tram', 'smartbus', 'express', 'local'];
    filters.forEach(f => {
      const checkbox = document.getElementById(`filter-${f}`);
      if (checkbox) {
        if (this.hasExplicitModesParam && this.specifiedModes instanceof Set) {
          checkbox.checked = this.specifiedModes.has(f);
        }
        checkbox.addEventListener('change', (e) => {
          this.activeFilters[f] = e.target.checked;
          this.syncFilterLayers();
          this.updateUrlCoordinates();
        });
      }
    });

    // GPS "My Location" Button
    const locateBtn = document.getElementById('locate-me-btn');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => {
        trackAnalyticsEvent('locate_me');
        if (!navigator.geolocation) {
          this.showToast("⚠️ Geolocation is not supported by your browser.");
          return;
        }
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            this.setQueryLocation(lat, lon);
            this.map.flyTo([lat, lon], 15);
          },
          (err) => {
            this.showToast("⚠️ Unable to retrieve your GPS location.");
          },
          { enableHighAccuracy: true }
        );
      });
    }

    // Share Location Button (Issue #7)
    const shareBtn = document.getElementById('share-location-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.shareLocation();
      });
    }

    // Route Details Drawer Dismiss Buttons & Events
    const closeDrawerBtn = document.getElementById('close-drawer-btn');
    if (closeDrawerBtn) {
      closeDrawerBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDrawer();
      });
    }

    const dismissFooterBtn = document.getElementById('drawer-dismiss-footer-btn');
    if (dismissFooterBtn) {
      dismissFooterBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeDrawer();
      });
    }

    const drawerBackdrop = document.getElementById('drawer-backdrop');
    if (drawerBackdrop) {
      drawerBackdrop.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    const dragHandle = document.querySelector('.drawer-drag-handle');
    if (dragHandle) {
      dragHandle.addEventListener('click', () => {
        this.closeDrawer();
      });
    }

    // Mobile Touch Drag Gesture to Dismiss Route Drawer
    const drawer = document.getElementById('route-drawer');
    if (drawer) {
      let startY = 0;
      let currentY = 0;
      let isDragging = false;

      const onTouchStart = (e) => {
        if (!drawer.classList.contains('open')) return;
        startY = e.touches[0].clientY;
        currentY = startY;
        isDragging = true;
        drawer.style.transition = 'none';
      };

      const onTouchMove = (e) => {
        if (!isDragging) return;
        currentY = e.touches[0].clientY;
        const deltaY = currentY - startY;
        if (deltaY > 0) {
          drawer.style.transform = `translateY(${deltaY}px)`;
        }
      };

      const onTouchEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        drawer.style.transition = '';
        const deltaY = currentY - startY;
        if (deltaY > 65) {
          this.closeDrawer();
        } else {
          drawer.style.transform = '';
        }
      };

      if (dragHandle) {
        dragHandle.addEventListener('touchstart', onTouchStart, { passive: true });
        dragHandle.addEventListener('touchmove', onTouchMove, { passive: true });
        dragHandle.addEventListener('touchend', onTouchEnd);
      }

      const drawerHeader = drawer.querySelector('.drawer-header');
      if (drawerHeader) {
        drawerHeader.addEventListener('touchstart', (e) => {
          if (!e.target.closest('button') && !e.target.closest('input')) {
            onTouchStart(e);
          }
        }, { passive: true });
        drawerHeader.addEventListener('touchmove', onTouchMove, { passive: true });
        drawerHeader.addEventListener('touchend', onTouchEnd);
      }
    }

    // Mobile Toggle for Corner Visible Routes listing
    const visibleRoutesLabel = document.getElementById('corner-visible-routes-label');
    const cornerVisibleRoutes = document.getElementById('corner-visible-routes');
    if (visibleRoutesLabel && cornerVisibleRoutes) {
      const toggleCollapse = (e) => {
        e.stopPropagation();
        cornerVisibleRoutes.classList.toggle('collapsed');
      };
      visibleRoutesLabel.addEventListener('click', toggleCollapse);
      visibleRoutesLabel.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggleCollapse(e);
        }
      });
    }

    const closeBottomCardBtn = document.getElementById('close-bottom-card-btn');
    if (closeBottomCardBtn) {
      closeBottomCardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.closeRouteBottomBox();
      });
    }

    // UX-6: Fit Route Buttons
    const bottomCardFitBtn = document.getElementById('bottom-card-fit-btn');
    if (bottomCardFitBtn) {
      bottomCardFitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.fitRouteToView();
      });
    }

    const drawerFitBtn = document.getElementById('drawer-fit-btn');
    if (drawerFitBtn) {
      drawerFitBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.fitRouteToView();
      });
    }

    // UX-6: Bottom Card Body Tap & Upward Swipe to Expand Drawer
    const bottomCardMain = document.getElementById('bottom-card-main');
    if (bottomCardMain) {
      bottomCardMain.addEventListener('click', (e) => {
        if (e.target.closest('button')) return;
        if (this.selectedRouteId) {
          const route = this.activeRoutes.find(r => r.id === this.selectedRouteId);
          if (route) this.openDrawer(route);
        }
      });
    }

    const bottomCard = document.getElementById('route-bottom-card');
    if (bottomCard) {
      let bTouchStartY = 0;
      bottomCard.addEventListener('touchstart', (e) => {
        if (e.touches && e.touches.length > 0) {
          bTouchStartY = e.touches[0].clientY;
        }
      }, { passive: true });

      bottomCard.addEventListener('touchend', (e) => {
        if (e.target.closest('button')) return;
        if (e.changedTouches && e.changedTouches.length > 0) {
          const deltaY = bTouchStartY - e.changedTouches[0].clientY;
          if (deltaY > 35 && this.selectedRouteId) {
            const route = this.activeRoutes.find(r => r.id === this.selectedRouteId);
            if (route) this.openDrawer(route);
          }
        }
      }, { passive: true });
    }

    // UX-1: Empty Catchment Card Actions
    const emptyExpandBtn = document.getElementById('empty-expand-radius-btn');
    if (emptyExpandBtn) {
      emptyExpandBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextRadius = this.currentRadius < 800 ? 800 : (this.currentRadius < 1200 ? 1200 : 1200);
        this.setCatchmentRadius(nextRadius);
      });
    }

    const emptySnapBtn = document.getElementById('empty-snap-stop-btn');
    if (emptySnapBtn) {
      emptySnapBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (this.lastEmptyNearestStop) {
          this.setQueryLocation(this.lastEmptyNearestStop.lat, this.lastEmptyNearestStop.lon);
          this.map.flyTo([this.lastEmptyNearestStop.lat, this.lastEmptyNearestStop.lon], 15);
        }
      });
    }

    const closeEmptyCardBtn = document.getElementById('close-empty-card-btn');
    if (closeEmptyCardBtn) {
      closeEmptyCardBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideEmptyCatchmentBanner();
      });
    }

    const closeUnsupportedModalBtn = document.getElementById('close-unsupported-modal-btn');
    if (closeUnsupportedModalBtn) {
      closeUnsupportedModalBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.hideUnsupportedLocationModal();
      });
    }

    const unsupportedBackdrop = document.getElementById('unsupported-modal-backdrop');
    if (unsupportedBackdrop) {
      unsupportedBackdrop.addEventListener('click', () => {
        this.hideUnsupportedLocationModal();
      });
    }

    // UX-2: Viewport Catchment Pill Click
    const viewportPill = document.getElementById('viewport-catchment-pill');
    if (viewportPill) {
      viewportPill.addEventListener('click', (e) => {
        e.stopPropagation();
        const center = this.map.getCenter();
        this.setQueryLocation(center.lat, center.lng);
        this.hideViewportCatchmentPill();
      });
    }

    // Issue #5: Filter Empty Floating Pill Action
    const filterEmptyEnableBtn = document.getElementById('filter-empty-enable-btn');
    if (filterEmptyEnableBtn) {
      filterEmptyEnableBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.resetModalFilters();
      });
    }

    // Escape Key Listener to dismiss drawer, bottom box, and open modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.selectedRouteId) {
          this.closeDrawer();
          this.closeRouteBottomBox();
        }
        this.hideUnsupportedLocationModal();
        const corridorModal = document.getElementById('corridor-popup-modal');
        if (corridorModal) corridorModal.classList.remove('open');
        const legendCard = document.getElementById('legend-card');
        if (legendCard) legendCard.classList.remove('open');
        const helpControl = document.getElementById('map-help-control');
        if (helpControl) {
          helpControl.classList.remove('open');
          document.getElementById('map-help-btn')?.classList.remove('active');
        }
      }
    });


    // Frequency Legend Controls
    const openLegendBtn = document.getElementById('open-legend-btn');
    const closeLegendBtn = document.getElementById('close-legend-btn');
    const legendCard = document.getElementById('legend-card');
    if (openLegendBtn && legendCard) {
      openLegendBtn.addEventListener('click', () => {
        legendCard.classList.toggle('open');
      });
    }
    if (closeLegendBtn && legendCard) {
      closeLegendBtn.addEventListener('click', () => {
        legendCard.classList.remove('open');
      });
    }

    // Corridor Modal Close Button
    const closeCorridorBtn = document.getElementById('close-corridor-btn');
    const corridorModal = document.getElementById('corridor-popup-modal');
    if (closeCorridorBtn && corridorModal) {
      closeCorridorBtn.addEventListener('click', () => {
        corridorModal.classList.remove('open');
      });
    }

    // Tester Opt-Out / Opt-In Visual Feedback
    try {
      const optoutParam = new URLSearchParams(window.location.search).get('optout');
      if (optoutParam === '1') {
        this.showToast('🚫 Tester Opt-Out: Google Analytics tracking disabled for this browser.');
      } else if (optoutParam === '0') {
        this.showToast('✅ Google Analytics tracking re-enabled for this browser.');
      }
    } catch (_) {}
  }

  initResizeObserver() {
    const sidebar = document.getElementById('sidebar');
    if (window.ResizeObserver && sidebar) {
      const ro = new ResizeObserver(() => {
        this.triggerSmoothMapResize();
      });
      ro.observe(sidebar);
    }

    const mapCanvas = document.getElementById('map');
    if (window.ResizeObserver && mapCanvas) {
      const mapRo = new ResizeObserver(() => {
        if (this.map) this.map.invalidateSize();
      });
      mapRo.observe(mapCanvas);
    }

    window.addEventListener('resize', () => {
      if (this.map) this.map.invalidateSize();
    });

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', () => {
        if (this.map) this.map.invalidateSize();
      });
    }
  }

  triggerSmoothMapResize() {
    let start = performance.now();
    const duration = 360; // ms
    const step = (timestamp) => {
      this.map.invalidateSize();
      if (timestamp - start < duration) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }

  showToast(message) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.remove();
    }, 4000);
  }

  buildShareUrl() {
    try {
      const origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '';
      let pathname = (typeof window !== 'undefined' && window.location && window.location.pathname) ? window.location.pathname : '/';

      // Path normalization: if pathname ends with /index.html, trim it to / (preserve hub subpaths like /melbourne/flinders-street/)
      if (pathname.endsWith('/index.html')) {
        pathname = pathname.slice(0, -10) || '/';
      } else if (pathname === 'index.html') {
        pathname = '/';
      }

      // Eliminate coordinate and mode redundancy from search query parameters
      let search = '';
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const searchParams = new URLSearchParams(window.location.search);
        searchParams.delete('lat');
        searchParams.delete('lon');
        searchParams.delete('radius');
        searchParams.delete('modes');
        searchParams.delete('mode');
        const remaining = searchParams.toString();
        search = remaining ? `?${remaining}` : '';
      }

      let hash = '';
      if (this.queryPoint && typeof this.queryPoint.lat === 'number' && typeof this.queryPoint.lon === 'number') {
        const geohash = encodeGeohash(this.queryPoint.lat, this.queryPoint.lon, 7);
        if (geohash) {
          // Radius handling: If currentRadius is non-default (standard default is 400), append /${radius}. If default, omit it.
          const defaultRadius = this.defaultRadius || 400;
          const currentRadius = this.currentRadius || defaultRadius;
          const radiusSegment = (currentRadius !== defaultRadius) ? String(currentRadius) : '';

          // Mode filters handling ("none defaulted to select all")
          const availableKeys = (this.renderedCategoryKeys && this.renderedCategoryKeys.size > 0)
            ? Array.from(this.renderedCategoryKeys)
            : ['train', 'tram', 'smartbus', 'express', 'local'];

          const selectedKeys = availableKeys.filter(k => this.activeFilters && this.activeFilters[k] !== false);

          let modesSegment = '';
          if (availableKeys.length > 0 && selectedKeys.length === availableKeys.length) {
            // All available modes selected -> omit modes entirely
            modesSegment = '';
          } else if (availableKeys.length > 0 && selectedKeys.length === 0) {
            // No modes selected -> append /none
            modesSegment = 'none';
          } else if (availableKeys.length > 0) {
            // Subset selected -> append comma-separated list
            modesSegment = selectedKeys.join(',');
          }

          if (modesSegment) {
            hash = `#${geohash}/${radiusSegment}/${modesSegment}`;
          } else if (radiusSegment) {
            hash = `#${geohash}/${radiusSegment}`;
          } else {
            hash = `#${geohash}`;
          }
        }
      }

      if (!hash && typeof window !== 'undefined' && window.location && window.location.hash) {
        hash = window.location.hash;
      }

      return `${origin}${pathname}${search}${hash}`;
    } catch (e) {
      return (typeof window !== 'undefined' && window.location) ? window.location.href : '';
    }
  }

  async shareLocation() {
    if (typeof trackAnalyticsEvent === 'function') {
      trackAnalyticsEvent('share_location');
    }

    // Brief button active pulse / visual effect
    const shareBtn = document.getElementById('share-location-btn');
    if (shareBtn) {
      shareBtn.classList.remove('btn-share-pulse');
      void shareBtn.offsetWidth;
      shareBtn.classList.add('btn-share-pulse');
      setTimeout(() => shareBtn.classList.remove('btn-share-pulse'), 1000);
    }

    const url = this.buildShareUrl();
    let locationName = '';
    const locSearchInput = document.getElementById('location-search-input');
    const locNameElem = document.getElementById('query-location-name');

    if (this.lastSelectedLocationName && this.lastSelectedLocationName.trim()) {
      locationName = this.lastSelectedLocationName.trim();
    } else if (locSearchInput && locSearchInput.value && locSearchInput.value.trim()) {
      locationName = locSearchInput.value.trim();
    } else if (locNameElem && locNameElem.textContent && locNameElem.textContent.trim()) {
      locationName = locNameElem.textContent.trim();
    } else if (this.queryPoint) {
      locationName = `Lat: ${Number(this.queryPoint.lat).toFixed(4)}, Lon: ${Number(this.queryPoint.lon).toFixed(4)}`;
    } else {
      locationName = 'this location';
    }

    const title = 'Catch Da Ride! - Walk & Ride';
    const text = `Explore public transit within walking distance of ${locationName}`;

    let shared = false;
    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title, text, url });
        shared = true;
      } catch (err) {
        console.info('navigator.share rejected or not completed, falling back to clipboard:', err);
      }
    }

    if (!shared) {
      await this.copyToClipboard(url);
      this.showShareToast('Link copied to clipboard! 📋');
    }
  }

  async copyToClipboard(text) {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {
      console.warn("navigator.clipboard.writeText failed, trying execCommand fallback:", e);
    }
    try {
      if (typeof document !== 'undefined') {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
        return true;
      }
    } catch (e) {
      console.warn("execCommand copy fallback failed:", e);
    }
    return false;
  }

  showShareToast(message = 'Link copied to clipboard! 📋') {
    const toast = document.getElementById('share-feedback-toast');
    if (!toast) return;
    const msgElem = document.getElementById('share-toast-message');
    if (msgElem) {
      msgElem.textContent = message;
    } else {
      toast.textContent = message;
    }
    toast.classList.remove('hidden');
    toast.classList.remove('toast-show');
    void toast.offsetWidth;
    toast.classList.add('toast-show');

    if (this._shareToastTimer) clearTimeout(this._shareToastTimer);
    this._shareToastTimer = setTimeout(() => {
      toast.classList.remove('toast-show');
      setTimeout(() => {
        if (!toast.classList.contains('toast-show')) {
          toast.classList.add('hidden');
        }
      }, 350);
    }, 2800);
  }

  updateUrlCoordinates(lat, lon, radius) {
    try {
      if (typeof window === 'undefined' || !window.history || !window.history.replaceState) return;
      const targetLat = (lat !== undefined && lat !== null) ? Number(lat) : (this.queryPoint ? Number(this.queryPoint.lat) : null);
      const targetLon = (lon !== undefined && lon !== null) ? Number(lon) : (this.queryPoint ? Number(this.queryPoint.lon) : null);
      const targetRadius = (radius !== undefined && radius !== null) ? Number(radius) : this.currentRadius;
      if (targetLat === null || targetLon === null || isNaN(targetLat) || isNaN(targetLon)) return;

      const params = new URLSearchParams(window.location.search);
      params.set('lat', targetLat.toFixed(6));
      params.set('lon', targetLon.toFixed(6));
      params.set('radius', String(targetRadius));

      // Synchronize modal filters into URL ("none defaulted to select all")
      const availableKeys = (this.renderedCategoryKeys && this.renderedCategoryKeys.size > 0)
        ? Array.from(this.renderedCategoryKeys)
        : ['train', 'tram', 'smartbus', 'express', 'local'];

      const selectedKeys = availableKeys.filter(k => this.activeFilters && this.activeFilters[k] !== false);

      if (availableKeys.length > 0 && selectedKeys.length === availableKeys.length) {
        // "none defaulted to select all": omit 'modes' param when all modes are selected
        params.delete('modes');
        params.delete('mode');
      } else if (availableKeys.length > 0 && selectedKeys.length === 0) {
        params.set('modes', 'none');
        params.delete('mode');
      } else if (availableKeys.length > 0) {
        params.set('modes', selectedKeys.join(','));
        params.delete('mode');
      }

      const newSearch = params.toString() ? `?${params.toString()}` : '';
      const newUrl = `${window.location.pathname}${newSearch}${window.location.hash || ''}`;
      window.history.replaceState({}, '', newUrl);
    } catch (e) {
      console.warn("Unable to update URL coordinates:", e);
    }
  }

  setQueryLocation(lat, lon) {
    this.clearRouteLoadingAnimations();
    this.closeDrawer();
    this.closeRouteBottomBox();
    this.clearStopPins();
    this.selectedRouteId = null;
    this.queryPoint = { lat, lon };
    this.queryMarker.setLatLng([lat, lon]);
    this.catchmentCircle.setLatLng([lat, lon]);
    this.triggerPinDropRipple(lat, lon);
    this.updateViewportCatchmentPill();
    this.updateUrlCoordinates(lat, lon);
    this.loadCatchment();
  }

  initGeolocationDefault() {
    // If arriving via an explicit deep-link (e.g. from an SEO hub landing page),
    // preserve the deep-linked location and do NOT overwrite it with device GPS.
    if (this.isDeepLinked) {
      console.info("Preserving deep-linked location; skipping auto-geolocation.");
      return;
    }
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        // Declarative coverage checks (or dynamic /api/resolve_location lookup)
        const inLondon = (lat >= 51.25 && lat <= 51.75 && lon >= -0.60 && lon <= 0.35);
        const inWestMidlands = (lat >= 52.25 && lat <= 52.70 && lon >= -2.25 && lon <= -1.35);
        const inToronto = (lat >= 43.30 && lat <= 44.20 && lon >= -80.20 && lon <= -79.00);
        const inVancouver = (lat >= 49.00 && lat <= 49.50 && lon >= -123.40 && lon <= -122.40);
        const inSfBay = (lat >= 36.80 && lat <= 38.90 && lon >= -123.60 && lon <= -121.20);
        const inNyc = (lat >= 40.40 && lat <= 41.70 && lon >= -74.50 && lon <= -71.80);
        const inHk = (lat >= 22.15 && lat <= 22.60 && lon >= 113.80 && lon <= 114.45);
        const inVic = (lat >= -39.2000 && lat <= -34.0000 && lon >= 140.5000 && lon <= 150.5000);
        const inSydney = (lat >= -35.5000 && lat <= -32.5000 && lon >= 149.0000 && lon <= 153.0000);
        const inQld = (lat >= -29.0000 && lat <= -25.5000 && lon >= 151.5000 && lon <= 154.0000);
        const inAdelaide = (lat >= -36.0000 && lat <= -34.0000 && lon >= 138.0000 && lon <= 140.0000);
        const inPerth = (lat >= -33.5000 && lat <= -31.0000 && lon >= 115.0000 && lon <= 117.0000);
        const inAct = (lat >= -36.0000 && lat <= -35.0000 && lon >= 148.8000 && lon <= 149.5000);
        const inTas = (lat >= -44.0000 && lat <= -40.0000 && lon >= 144.0000 && lon <= 149.0000);
        const inDarwin = (lat >= -14.5000 && lat <= -11.0000 && lon >= 130.0000 && lon <= 132.5000);
        const inAliceSprings = (lat >= -24.5000 && lat <= -23.0000 && lon >= 133.0000 && lon <= 134.5000);

        let inCoverage = (
          inLondon || inWestMidlands || inToronto || inVancouver || inSfBay || inNyc || inHk ||
          inVic || inSydney || inQld || inAdelaide || inPerth || inAct ||
          inTas || inDarwin || inAliceSprings
        );

        if (inCoverage) {
          this.setQueryLocation(lat, lon);
          if (this.map) {
            this.map.flyTo([lat, lon], 15);
          }
        } else {
          console.info(`Device location is outside transit coverage. Keeping regional hub (${this.lastSelectedLocationName}).`);
        }
      },
      (err) => {
        console.info(`Initial device geolocation not available; keeping regional hub (${this.lastSelectedLocationName}):`, err?.message || err);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 300000 }
    );
  }

  async loadCatchment() {
    this.updateUrlCoordinates();
    const cacheKey = `${this.queryPoint.lat.toFixed(4)}_${this.queryPoint.lon.toFixed(4)}_${this.currentRadius}`;
    if (this.catchmentCache && this.catchmentCache.has(cacheKey)) {
      const cached = this.catchmentCache.get(cacheKey);
      await this.applyCatchmentData(cached);
      return;
    }

    if (this.activeCatchmentAbort) {
      try { this.activeCatchmentAbort.abort(); } catch (_) {}
    }
    this.activeCatchmentAbort = new AbortController();

    const url = `${getApiBase()}/api/routes?lat=${this.queryPoint.lat.toFixed(6)}&lon=${this.queryPoint.lon.toFixed(6)}&radius=${this.currentRadius}`;
    try {
      const res = await fetch(url, { signal: this.activeCatchmentAbort.signal });
      if (!res.ok) {
        const err = await res.json();
        this.showToast(err.error || "Failed to query transit catchment.");
        return;
      }
      const data = await res.json();
      if (this.catchmentCache) {
        if (this.catchmentCache.size >= 50) {
          const firstKey = this.catchmentCache.keys().next().value;
          this.catchmentCache.delete(firstKey);
        }
        this.catchmentCache.set(cacheKey, data);
      }
      await this.applyCatchmentData(data);
    } catch (e) {
      if (e.name === 'AbortError') return;
      console.error("Catchment query failed:", e);
    }
  }

  async applyCatchmentData(data) {
    // Check if queried coordinate is completely outside transit coverage (2-Tier Check)
    if (data && data.supported === false) {
      this.hideEmptyCatchmentBanner();
      this.showUnsupportedLocationModal(data);
      this.activeRoutes = [];
      this.catchmentStops = [];
      this.clearStopPins();
      this.renderSidebarRoutes([]);
      this.renderMapRoutes();
      this.updateVisibleRoutesChips();
      this.hideFilterEmptyIndicators();

      const locNameElem = document.getElementById('query-location-name');
      const locSearchInput = document.getElementById('location-search-input');
      const locClearBtn = document.getElementById('location-clear-btn');
      const locDisplayName = this.lastSelectedLocationName || `Lat: ${this.queryPoint.lat.toFixed(4)}, Lon: ${this.queryPoint.lon.toFixed(4)}`;

      if (locNameElem) locNameElem.textContent = locDisplayName;
      if (locSearchInput && document.activeElement !== locSearchInput) {
        locSearchInput.value = locDisplayName;
        if (locClearBtn) locClearBtn.style.display = 'flex';
      }
      return;
    } else {
      this.hideUnsupportedLocationModal();
    }

    if (data.agencyId) {
      this.renderModalFilters(data.agencyId, data.agencyCategories);
    }
    // Deep clone route objects so styling and state don't mutate cached originals
    this.activeRoutes = (data.routes || []).map(r => ({ ...r }));
    this.catchmentStops = (data.catchmentStops || []).map(s => ({ ...s }));

    // Auto-Coloring Logic: Ensure diverse, contrasting colors across active catchment routes
    this.applyCatchmentAutoColoring(this.activeRoutes);

    const locNameElem = document.getElementById('query-location-name');
    const locSearchInput = document.getElementById('location-search-input');
    const locClearBtn = document.getElementById('location-clear-btn');
    const locDisplayName = data.nearestStop 
      ? `${data.nearestStop.name}` 
      : `Lat: ${this.queryPoint.lat.toFixed(4)}, Lon: ${this.queryPoint.lon.toFixed(4)}`;

    if (locNameElem) {
      locNameElem.textContent = data.nearestStop 
        ? `${data.nearestStop.name} (${data.nearestStop.distance}m)` 
        : locDisplayName;
    }
    if (locSearchInput && document.activeElement !== locSearchInput) {
      locSearchInput.value = locDisplayName;
      this.lastSelectedLocationName = locDisplayName;
      if (locClearBtn) locClearBtn.style.display = 'flex';
    }

    // Dispatch GA4 City / Catchment Browsing Analytics
    const cityName = (data.agency && (data.agency.city_name || data.agency.cityName)) || data.agencyId || 'Unknown';
    const agencyId = data.agencyId || (data.agency && data.agency.agency_id) || '';

    if (typeof window.gtag === 'function' && !window['ga-disable-G-PXS9EB0K7K']) {
      try {
        window.gtag('set', {
          agency_id: agencyId,
          city: cityName
        });
      } catch (_) {}
    }

    trackAnalyticsEvent('view_catchment', {
      agency_id: agencyId,
      city: cityName,
      location_name: this.lastSelectedLocationName || '',
      routes_count: data.routesCount || 0,
      stops_count: data.stopsCount || 0,
      radius: this.currentRadius
    });

    // UX-1 Empty Catchment Banner
    if (this.activeRoutes.length === 0) {
      this.showEmptyCatchmentBanner(data);
    } else {
      this.hideEmptyCatchmentBanner();
    }

    // Render Routes in Sidebar
    this.renderSidebarRoutes(this.activeRoutes.filter(r => this.isRouteCategoryAllowed(r.category)));

    // Decoupled Geometry Fetching (Rule 2)
    await this.ensureGeometriesLoaded(data.matchedRouteIds);

    // Render Polylines on Map with organic dendritic bloom animation (Issue #11)
    this.renderMapRoutes({ animate: true });
    this.updateVisibleRoutesChips();
    this.updateFilterEmptyIndicators();
  }

  applyCatchmentAutoColoring(routes) {
    if (!routes || routes.length === 0) return;

    // High-contrast transit palette (24 accessible, distinctive hues)
    const AUTO_PALETTE = [
      "#0284c7", // Ocean Sky Blue
      "#059669", // Emerald Green
      "#d97706", // Warm Amber
      "#dc2626", // Crimson Red
      "#7c3aed", // Deep Violet
      "#db2777", // Vivid Pink
      "#2563eb", // Royal Blue
      "#0d9488", // Dark Teal
      "#ea580c", // Vibrant Orange
      "#4f46e5", // Electric Indigo
      "#0891b2", // Cyan
      "#16a34a", // Fresh Green
      "#9333ea", // Purple
      "#ca8a04", // Goldenrod
      "#e11d48", // Rose Red
      "#0369a1", // Dark Sky Blue
      "#b45309", // Cinnamon Amber
      "#be123c", // Ruby
      "#6d28d9", // Purple Violet
      "#0f766e", // Deep Cyan
      "#15803d", // Forest Green
      "#c026d3", // Fuchsia
      "#047857", // Jungle Emerald
      "#4338ca", // Deep Indigo
    ];

    const usedColors = new Set();
    let paletteCursor = 0;

    routes.forEach(route => {
      const col = (route.color || '').toUpperCase();
      const isGeneric = !col || col === '#FF8200' || col === '#FE5000' || col === '#000000';

      // If color is generic orange or already taken by another route in this catchment, assign distinct color
      if (isGeneric || usedColors.has(col)) {
        let assigned = null;
        for (let i = 0; i < AUTO_PALETTE.length; i++) {
          const candidate = AUTO_PALETTE[(paletteCursor + i) % AUTO_PALETTE.length];
          if (!usedColors.has(candidate.toUpperCase())) {
            assigned = candidate;
            paletteCursor = (paletteCursor + i + 1) % AUTO_PALETTE.length;
            break;
          }
        }
        if (!assigned) {
          assigned = AUTO_PALETTE[paletteCursor % AUTO_PALETTE.length];
          paletteCursor++;
        }
        route.color = assigned;
      }
      usedColors.add(route.color.toUpperCase());
    });
  }

  async ensureGeometriesLoaded(routeIds) {
    const uncached = routeIds.filter(id => !this.geometryCache.has(id));
    if (uncached.length === 0) return;

    const url = `${getApiBase()}/api/geometry?route_ids=${encodeURIComponent(uncached.join(','))}&include_variations=1`;
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        for (const [rId, geom] of Object.entries(data.geometries)) {
          this.geometryCache.set(rId, geom);
        }
        for (const [rId, stops] of Object.entries(data.stops)) {
          this.routeStopsCache.set(rId, stops);
        }
      }
    } catch (e) {
      console.error("Geometry fetch failed:", e);
    }
  }

  renderSidebarRoutes(routes) {
    const list = document.getElementById('routes-list');
    list.innerHTML = '';

    if (routes.length === 0) {
      if (this.activeRoutes.length > 0) {
        list.innerHTML = `
          <div class="sidebar-filter-hidden-box">
            <div style="font-size:24px; margin-bottom:8px;">🚦</div>
            <div style="font-weight:600; color:#f1f5f9; margin-bottom:4px; font-size:14px;">All ${this.activeRoutes.length} routes hidden by active filters</div>
            <div style="color:#94a3b8; margin-bottom:12px; font-size:12px;">Transit modes are currently deselected in the filter.</div>
            <button id="reset-filters-btn" class="reset-filters-btn" type="button">Reset Filters</button>
          </div>
        `;
        const resetBtn = document.getElementById('reset-filters-btn');
        if (resetBtn) {
          resetBtn.addEventListener('click', () => {
            this.resetModalFilters();
          });
        }
      } else {
        list.innerHTML = `<div style="padding:16px; text-align:center; color:#94a3b8; font-size:13px;">No bus routes found within ${this.currentRadius}m radius. Try expanding the catchment radius above.</div>`;
      }
      return;
    }

    routes.forEach(route => {
      const mode = getTransitModeGroup(route.category, route.shortName || route.short_name);
      const modeLabel = getTransitModeLabel(mode, route.category);
      const card = document.createElement('div');
      card.className = `route-card route-card-${mode} ${this.selectedRouteId === route.id ? 'active' : ''}`;
      card.dataset.routeId = route.id;

      const textColor = getYIQContrast(route.color);

      card.innerHTML = `
        <div class="route-card-header">
          <span class="route-chip route-chip-${mode}" style="background:${route.color}; color:${textColor};">${formatRouteBadge(route)}</span>
          <span class="route-mode-pill mode-pill-${mode}">${modeLabel.icon} ${route.category}</span>
        </div>
        <div class="route-card-title">${route.title || route.name}</div>
        <div class="route-card-via">${route.via || ''}</div>
        <div class="route-card-meta">
          <span>⏱️ ${route.frequency}</span>
          <span>📏 ${route.distanceKm ? route.distanceKm + ' km' : 'Direct'}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        this.selectRoute(route.id);
      });

      list.appendChild(card);
    });
  }

  setLayerOpacity(layer, opacity) {
    if (!layer) return;
    if (layer.eachLayer) {
      layer.eachLayer(l => this.setLayerOpacity(l, opacity));
    } else if (layer.setStyle) {
      if (layer._baseOpacity !== undefined && opacity >= 0.5) {
        layer.setStyle({ opacity: layer._baseOpacity });
      } else {
        layer.setStyle({ opacity });
      }
    }
  }

  clearStopPins() {
    this.stopPinLayers.forEach(p => this.map.removeLayer(p));
    this.stopPinLayers = [];
    this.stopPinsMap.clear();
  }

  // Issue #11: Clear all pending route wavefront animation frames, timers, and reset path clip-paths & styles
  clearRouteLoadingAnimations() {
    if (this.routeAnimationFrameId) {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.routeAnimationFrameId);
      } else {
        clearTimeout(this.routeAnimationFrameId);
      }
      this.routeAnimationFrameId = null;
    }
    if (this.routeAnimationTimers && this.routeAnimationTimers.length > 0) {
      this.routeAnimationTimers.forEach(id => clearTimeout(id));
      this.routeAnimationTimers = [];
    }
    if (this.map && typeof this.map.getPanes === 'function') {
      try {
        const overlayPane = this.map.getPanes().overlayPane;
        const svg = overlayPane ? overlayPane.querySelector('svg') : null;
        if (svg) {
          const wrapper = svg.querySelector('#route-bloom-wrapper');
          if (wrapper) {
            const parent = wrapper.parentNode;
            while (wrapper.firstChild) {
              parent.insertBefore(wrapper.firstChild, wrapper);
            }
            wrapper.remove();
          }
          const defs = svg.querySelector('#route-bloom-defs');
          if (defs) defs.remove();
        }
      } catch (_) {}
    }
    if (this.routeLayers) {
      this.routeLayers.forEach(layer => {
        const paths = getLayerSvgPaths(layer);
        paths.forEach(p => {
          p.removeAttribute('clip-path');
          p.classList.remove('route-path-hidden', 'route-path-enter');
          p.style.opacity = '';
          p.style.transition = '';
        });
      });
    }
    if (this.hitTargetLayers) {
      this.hitTargetLayers.forEach(layer => {
        const paths = getLayerSvgPaths(layer);
        paths.forEach(p => {
          p.removeAttribute('clip-path');
        });
      });
    }
  }

  // Issue #11: Irregular Spatial Wavefront Bloom (Progressive radial expansion from query center)
  triggerRouteBloomAnimation(visibleRoutes) {
    this.clearRouteLoadingAnimations();

    if (!this.map || !this.queryPoint || !visibleRoutes || visibleRoutes.length === 0) return;
    const overlayPane = (typeof this.map.getPanes === 'function') ? this.map.getPanes().overlayPane : null;
    if (!overlayPane) return;
    const svg = overlayPane.querySelector('svg');
    if (!svg) return;

    // 1. Create or get SVG defs and clipPath
    let defs = svg.querySelector('#route-bloom-defs');
    if (!defs) {
      defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
      defs.id = 'route-bloom-defs';
      svg.insertBefore(defs, svg.firstChild);
    }

    let clip = defs.querySelector('#route-wavefront-clip');
    if (!clip) {
      clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
      clip.id = 'route-wavefront-clip';
      clip.setAttribute('clipPathUnits', 'userSpaceOnUse');
      defs.appendChild(clip);
    }

    let polygon = clip.querySelector('#route-wavefront-poly');
    if (!polygon) {
      polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.id = 'route-wavefront-poly';
      clip.appendChild(polygon);
    }

    // 2. Wrap visible route paths in #route-bloom-wrapper for single-pass GPU compositing
    // Invisible interaction hit-targets (hitTargetLayers) are strictly excluded from clipping
    const rootG = svg.querySelector('g') || svg;
    let wrapper = svg.querySelector('#route-bloom-wrapper');
    if (!wrapper) {
      wrapper = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      wrapper.id = 'route-bloom-wrapper';
      rootG.appendChild(wrapper);
    }
    wrapper.setAttribute('clip-path', 'url(#route-wavefront-clip)');

    let pathCount = 0;
    visibleRoutes.forEach(route => {
      const layer = this.routeLayers.get(route.id);
      if (layer) {
        const paths = getLayerSvgPaths(layer);
        paths.forEach(p => {
          wrapper.appendChild(p);
          pathCount++;
        });
      }
    });

    if (pathCount === 0) {
      this.clearRouteLoadingAnimations();
      return;
    }

    // 3. Adaptive LOD based on route density & pre-computed harmonic directional offsets
    const numVertices = getAdaptiveLODVertices(visibleRoutes.length);
    const offsets = precomputeWavefrontOffsets(numVertices);

    // 4. Setup expanding wavefront parameters
    const center = this.map.latLngToLayerPoint([this.queryPoint.lat, this.queryPoint.lon]);
    const size = (typeof this.map.getSize === 'function') ? this.map.getSize() : { x: 1200, y: 800 };
    // Maximum distance from center to any viewport corner
    const maxDistToCorner = Math.sqrt(
      Math.max(center.x, size.x - center.x) ** 2 +
      Math.max(center.y, size.y - center.y) ** 2
    );
    const targetMaxRadius = Math.max(750, maxDistToCorner * 1.05);
    const duration = 1400; // ms
    const startTime = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();

    // Initial 0px polygon (routes start hidden at center point)
    polygon.setAttribute('points', buildWavefrontPolygonPoints(center, 0, offsets));

    const reqAnim = (typeof requestAnimationFrame === 'function')
      ? requestAnimationFrame
      : (cb) => setTimeout(() => cb((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now()), 16);

    const step = (now) => {
      const currentTime = now || ((typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now());
      const elapsed = currentTime - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Smooth sine ease-in-out: starts gently from center, blooms steadily, and settles smoothly
      const ease = 0.5 * (1 - Math.cos(Math.PI * progress));
      const currentRadius = targetMaxRadius * ease;

      polygon.setAttribute('points', buildWavefrontPolygonPoints(center, currentRadius, offsets));

      if (progress < 1.0) {
        this.routeAnimationFrameId = reqAnim(step);
      } else {
        // Animation finished: clean up clip-path and defs completely so Leaflet layers return to normal
        this.clearRouteLoadingAnimations();
      }
    };

    this.routeAnimationFrameId = reqAnim(step);
  }

  renderMapRoutes(options = {}) {
    const { animate = false } = options;
    this.clearRouteLoadingAnimations();

    // Clear old layers
    this.routeLayers.forEach(l => this.map.removeLayer(l));
    this.hitTargetLayers.forEach(l => this.map.removeLayer(l));
    this.routeLayers.clear();
    this.hitTargetLayers.clear();

    if (!this.selectedRouteId) {
      this.clearStopPins();
    }

    const visibleRoutes = this.activeRoutes.filter(r => this.isRouteCategoryAllowed(r.category));
    const totalCount = visibleRoutes.length;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const shouldAnimate = Boolean(animate && !prefersReducedMotion && this.queryPoint && totalCount > 1 && !this.selectedRouteId);
    const delayMap = shouldAnimate
      ? computeRouteWavefrontDelays(visibleRoutes, this.queryPoint, this.geometryCache)
      : new Map();

    const onRouteLineClick = (e) => {
      if (e && e.originalEvent) {
        L.DomEvent.stopPropagation(e.originalEvent);
        if (e.originalEvent.target && typeof e.originalEvent.target.blur === 'function') {
          try { e.originalEvent.target.blur(); } catch (_) {}
        }
      }
      if (e) L.DomEvent.stopPropagation(e);
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        try { document.activeElement.blur(); } catch (_) {}
      }
      this.handleMapClickForCorridors(e);
    };

    visibleRoutes.forEach((route, idx) => {
      const geomData = this.geometryCache.get(route.id);
      if (!geomData) return;

      // Calculate Sub-Pixel Lateral Offset
      const offset = calcPolylineOffset(idx, totalCount);

      // Determine Visual Frequency Weight & Dash via 2-Axis Cartographic Engine
      const strokeStyle = getRouteStrokeStyle(route);
      const weight = strokeStyle.weight;
      const opacity = strokeStyle.opacity;
      const dashArray = strokeStyle.dashArray;

      // Handle Route Variations (Option A Composite Model) and MultiLineString geometries
      const coords = getRouteCoordinates(geomData);
      const isMulti = Array.isArray(coords) && coords.length > 0 && Array.isArray(coords[0]) && Array.isArray(coords[0][0]);
      const latlngs = isMulti
        ? coords.map(branch => branch.map(c => [c[1], c[0]]))
        : coords.map(c => [c[1], c[0]]);

      // UX-8 Route Tooltip Builder
      const getRouteTooltipHtml = () => {
        const badgeText = formatRouteBadge(route);
        const titleText = route.title || route.name || route.long_name || '';
        const headwayText = route.headway_display || route.frequency || '';
        const textColor = getYIQContrast(route.color || '#3b82f6');
        const modeLabel = getTransitModeLabel(strokeStyle.mode, route.category);
        return `
          <div class="route-tooltip-title">
            <span class="route-chip route-chip-${strokeStyle.mode}" style="background:${route.color || '#3b82f6'};color:${textColor};padding:2px 7px;border-radius:4px;font-size:11px;font-weight:700;">${badgeText}</span>
            <span class="route-mode-pill mode-pill-${strokeStyle.mode}" style="font-size:10px;padding:1px 5px;">${modeLabel.icon} ${modeLabel.label}</span>
            <strong style="color:#ffffff;">${this.escapeHtml(titleText)}</strong>
          </div>
          ${headwayText ? `<div class="route-tooltip-meta">⏱️ ${this.escapeHtml(headwayText)}</div>` : ''}
        `;
      };

      const isMobileView = () => {
        return window.innerWidth <= 860 ||
          (window.matchMedia && window.matchMedia('(hover: none), (pointer: coarse)').matches);
      };

      const bindRouteTooltip = (layer) => {
        if (!layer || isMobileView()) return;
        layer.bindTooltip(getRouteTooltipHtml(), {
          sticky: true,
          className: 'route-hover-tooltip',
          direction: 'top',
          offset: [0, -10],
          opacity: 1
        });
      };

      if (typeof geomData === 'object' && !Array.isArray(geomData)) {
        // Render composite segments
        const featureGroup = L.featureGroup();
        for (const [key, part] of Object.entries(geomData)) {
          const partLatLngs = part.coordinates.map(c => [c[1], c[0]]);
          const segmentLayer = createStyledRouteSegment(
            partLatLngs,
            route,
            strokeStyle,
            offset,
            part.dashArray
          );
          bindRouteTooltip(segmentLayer);
          featureGroup.addLayer(segmentLayer);
        }
        bindRouteTooltip(featureGroup);
        featureGroup.on('click', onRouteLineClick);
        this.routeLayers.set(route.id, featureGroup);
        featureGroup.addTo(this.map);
      } else if (latlngs.length > 0) {
        const polyline = createStyledRouteSegment(
          latlngs,
          route,
          strokeStyle,
          offset,
          dashArray
        );
        bindRouteTooltip(polyline);
        polyline.on('click', onRouteLineClick);
        this.routeLayers.set(route.id, polyline);
        polyline.addTo(this.map);
      }

      // Invisible Hit-Target Polyline for Touch and Precision Clicking
      if (latlngs.length > 0) {
        let hitTarget;
        if (isMulti) {
          hitTarget = L.featureGroup();
          for (const branchLatLngs of latlngs) {
            if (branchLatLngs.length >= 2) {
              const bHit = L.polyline(branchLatLngs, {
                color: '#000000',
                weight: L.Browser.touch ? 16 : 14,
                opacity: 0.001,
                className: 'route-hit-target'
              });
              hitTarget.addLayer(bHit);
            }
          }
          hitTarget.addTo(this.map);
        } else {
          hitTarget = L.polyline(latlngs, {
            color: '#000000',
            weight: L.Browser.touch ? 16 : 14,
            opacity: 0.001,
            className: 'route-hit-target'
          }).addTo(this.map);
        }

        bindRouteTooltip(hitTarget);
        hitTarget.on('click', onRouteLineClick);
        this.hitTargetLayers.set(route.id, hitTarget);
      }
    });

    // Animated Effect when loading routes (Issue #11 - Organic Dendritic Wavefront Bloom)
    if (shouldAnimate) {
      this.triggerRouteBloomAnimation(visibleRoutes);
    }

    // Render stops based on selection state
    if (this.selectedRouteId) {
      const selectedRoute = this.activeRoutes.find(r => r.id === this.selectedRouteId);
      if (selectedRoute) {
        this.renderRouteStops(selectedRoute);
      } else {
        this.renderCatchmentStops();
      }
    } else {
      this.renderCatchmentStops();
    }
  }

  isRouteCategoryAllowed(category) {
    if (!category) return true;
    const catKey = getCanonicalCategoryKey(category);
    if (this.renderedCategoryKeys && this.renderedCategoryKeys.size > 0 && !this.renderedCategoryKeys.has(catKey)) {
      return this.activeFilters.local !== false;
    }
    return this.activeFilters[catKey] !== false;
  }

  renderModalFilters(agencyId, agencyCategories = null) {
    const targetAgency = agencyId || this.currentAgencyId || 'au-vic-ptv';
    const isAgencyChange = (this.currentAgencyId !== null && this.currentAgencyId !== targetAgency);
    if (isAgencyChange) {
      this.activeFilters = {};
      this.currentAgencyId = targetAgency;
      this.hasExplicitModesParam = false;
      this.specifiedModes = null;
    } else if (this.currentAgencyId === null) {
      this.currentAgencyId = targetAgency;
    }

    if (agencyCategories && agencyCategories.length > 0) {
      this.agencyCategoriesMap.set(targetAgency, agencyCategories);
    }

    if (this._renderedFilterAgency === targetAgency && !agencyCategories) return;
    this._renderedFilterAgency = targetAgency;

    const group = document.getElementById('modal-filters-group');
    if (!group) return;

    const filterList = agencyCategories || this.agencyCategoriesMap.get(targetAgency) || CITY_MODAL_FILTERS[targetAgency] || CITY_MODAL_FILTERS['au-vic-ptv'] || DEFAULT_MODAL_FILTERS;
    this.renderedCategoryKeys = new Set(filterList.map(item => item.key));
    group.innerHTML = '';

    filterList.forEach(item => {
      let isChecked = true;
      if (this.hasExplicitModesParam && this.specifiedModes instanceof Set) {
        isChecked = this.specifiedModes.has(item.key);
        this.activeFilters[item.key] = isChecked;
      } else {
        isChecked = this.activeFilters[item.key] !== false;
      }

      const label = document.createElement('label');
      label.className = 'modal-filter-row';
      label.title = item.title;
      label.innerHTML = `
        <input type="checkbox" id="filter-${item.key}" ${isChecked ? 'checked' : ''}>
        <span class="modal-filter-icon">${item.icon}</span>
        <span class="modal-filter-name">${item.name}</span>
        <span class="modal-filter-check">✓</span>
      `;
      const input = label.querySelector('input');
      input.addEventListener('change', (e) => {
        this.activeFilters[item.key] = e.target.checked;
        this.syncFilterLayers();
        this.updateUrlCoordinates();
      });
      group.appendChild(label);
    });

    if (this.hasExplicitModesParam && this.specifiedModes instanceof Set) {
      this.hasExplicitModesParam = false;
      this.specifiedModes = null;
    }

    this.updateStatusBadges();
  }

  syncFilterLayers() {
    this.clearRouteLoadingAnimations();
    if (this.selectedRouteId) {
      const selectedRoute = this.activeRoutes.find(r => r.id === this.selectedRouteId);
      if (selectedRoute && !this.isRouteCategoryAllowed(selectedRoute.category)) {
        this.closeDrawer();
        this.closeRouteBottomBox();
        this.clearStopPins();
        this.selectedRouteId = null;
        this.renderCatchmentStops();
      }
    } else {
      this.renderCatchmentStops();
    }
    this.renderMapRoutes({ animate: false });
    this.renderSidebarRoutes(this.activeRoutes.filter(r => this.isRouteCategoryAllowed(r.category)));
    this.updateVisibleRoutesChips();
    this.updateStatusBadges();
    this.updateFilterEmptyIndicators();
  }

  // Issue #5: Filter Empty Indicators & Action Handlers
  updateFilterEmptyIndicators() {
    const pill = document.getElementById('filter-empty-pill');
    if (!pill) return;
    const filteredRoutes = this.activeRoutes.filter(r => this.isRouteCategoryAllowed(r.category));
    if (this.activeRoutes.length > 0 && filteredRoutes.length === 0) {
      const textSpan = document.getElementById('filter-empty-text');
      if (textSpan) {
        textSpan.textContent = `All ${this.activeRoutes.length} routes hidden by active filters`;
      }
      pill.classList.remove('hidden');
    } else {
      pill.classList.add('hidden');
    }
  }

  hideFilterEmptyIndicators() {
    const pill = document.getElementById('filter-empty-pill');
    if (pill) {
      pill.classList.add('hidden');
    }
  }

  resetModalFilters() {
    this.activeFilters = {};
    const group = document.getElementById('modal-filters-group');
    if (group) {
      const inputs = group.querySelectorAll('input[type="checkbox"]');
      inputs.forEach(input => {
        input.checked = true;
      });
    }
    if (this.renderedCategoryKeys) {
      this.renderedCategoryKeys.forEach(k => {
        this.activeFilters[k] = true;
      });
    }
    this.syncFilterLayers();
    this.updateUrlCoordinates();
    this.hideFilterEmptyIndicators();
    this.triggerFilterResetSuccessAnimation();
  }

  // Issue #5: Visual feedback animation on modal filter button indicating all routes enabled
  triggerFilterResetSuccessAnimation() {
    const toggleBtn = document.getElementById('modal-filter-toggle-btn');
    const successBadge = document.getElementById('filter-success-badge');
    const toast = document.getElementById('filter-feedback-toast');

    if (toggleBtn) {
      toggleBtn.classList.remove('btn-reset-success');
      void toggleBtn.offsetWidth; // trigger reflow
      toggleBtn.classList.add('btn-reset-success');
      if (this._filterResetPulseTimer) clearTimeout(this._filterResetPulseTimer);
      this._filterResetPulseTimer = setTimeout(() => {
        toggleBtn.classList.remove('btn-reset-success');
      }, 1800);
    }

    if (successBadge) {
      successBadge.classList.remove('hidden');
      successBadge.classList.remove('badge-pop-animate');
      void successBadge.offsetWidth;
      successBadge.classList.add('badge-pop-animate');
      if (this._filterBadgeTimer) clearTimeout(this._filterBadgeTimer);
      this._filterBadgeTimer = setTimeout(() => {
        successBadge.classList.add('hidden');
        successBadge.classList.remove('badge-pop-animate');
      }, 1900);
    }

    if (toast) {
      toast.classList.remove('hidden');
      toast.classList.remove('toast-pop-animate');
      void toast.offsetWidth;
      toast.classList.add('toast-pop-animate');
      if (this._filterToastTimer) clearTimeout(this._filterToastTimer);
      this._filterToastTimer = setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('toast-pop-animate');
      }, 2200);
    }
  }

  selectRoute(routeId) {
    this.clearRouteLoadingAnimations();
    if (this.selectedRouteId === routeId) {
      const route = this.activeRoutes.find(r => r.id === routeId);
      if (route) this.showRouteBottomBox(route);
      return;
    }

    this.selectedRouteId = routeId;
    const route = this.activeRoutes.find(r => r.id === routeId);
    if (!route) return;

    const agencyId = route.agencyId || route.agency_id || this.currentAgencyId || '';
    const cityName = (route.agency && (route.agency.city_name || route.agency.cityName)) || this.lastSelectedLocationName || '';

    trackAnalyticsEvent('select_route', {
      route_id: route.id,
      route_short_name: route.shortName || route.short_name || route.id,
      route_long_name: route.title || route.name || '',
      route_category: route.category || '',
      agency_id: agencyId,
      city: cityName
    });

    // Safely dismiss any lingering hover tooltip
    try {
      this.map.eachLayer(l => {
        if (typeof l.closeTooltip === 'function') l.closeTooltip();
      });
    } catch (_) {}

    // Dim all other routes to opacity 0.15
    this.routeLayers.forEach((layer, rId) => {
      this.setLayerOpacity(layer, rId === routeId ? 1.0 : 0.15);
      if (rId === routeId && typeof layer.bringToFront === 'function') {
        layer.bringToFront();
      }
    });

    // Update Sidebar route cards active state
    document.querySelectorAll('.route-card').forEach(card => {
      card.classList.toggle('active', card.dataset.routeId === routeId);
    });

    // Update Visible Routes chips active state
    document.querySelectorAll('.mini-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.routeId === routeId);
    });

    // Render Route Stops using 75m corridor safeguard
    this.renderRouteStops(route);

    // Display small info box at the bottom
    this.showRouteBottomBox(route);
  }

  showRouteBottomBox(route) {
    const box = document.getElementById('route-bottom-card');
    if (!box) return;

    // Dim corner floating widgets on mobile while card is open
    document.getElementById('corner-visible-routes')?.classList.add('dimmed-by-card');
    document.getElementById('corner-legend-control')?.classList.add('dimmed-by-card');
    document.querySelector('.leaflet-bottom.leaflet-left')?.classList.add('dimmed-by-card');

    const mode = getTransitModeGroup(route.category, route.shortName || route.short_name);
    const modeLabel = getTransitModeLabel(mode, route.category);

    const chip = document.getElementById('bottom-route-chip');
    if (chip) {
      chip.textContent = formatRouteBadge(route);
      chip.style.background = route.color;
      chip.style.color = getYIQContrast(route.color);
      chip.className = `route-chip bottom-route-chip route-chip-${mode}`;
    }

    const cat = document.getElementById('bottom-route-category');
    if (cat) {
      cat.textContent = `${modeLabel.icon} ${route.category}`;
      cat.className = `route-category-tag mode-tag-${mode}`;
    }

    const modePill = document.getElementById('bottom-route-mode');
    if (modePill) {
      modePill.textContent = `${modeLabel.icon} ${modeLabel.label}`;
      modePill.className = `route-mode-pill mode-pill-${mode}`;
    }

    const title = document.getElementById('bottom-route-title');
    if (title) {
      title.textContent = route.title || route.name;
      title.title = route.title || route.name;
    }

    const freq = document.getElementById('bottom-route-freq');
    if (freq) freq.textContent = route.frequency || 'Regular';

    const dist = document.getElementById('bottom-route-dist');
    if (dist) dist.textContent = `${route.distanceKm || '0'} km`;

    const span = document.getElementById('bottom-route-span');
    if (span) span.textContent = route.span || 'Standard Operating Hours';

    const stopsElem = document.getElementById('bottom-route-stops');
    if (stopsElem) {
      const stopCount = route.stops ? route.stops.length : 0;
      stopsElem.textContent = stopCount > 0 ? `${stopCount} stops` : 'Stops on route';
    }

    const via = document.getElementById('bottom-route-via');
    if (via) {
      via.textContent = route.via || '';
      via.style.display = route.via ? 'block' : 'none';
    }

    const detailBtn = document.getElementById('bottom-card-detail-btn');
    if (detailBtn) {
      detailBtn.onclick = (e) => {
        if (e) e.stopPropagation();
        box.classList.remove('open');
        this.openDrawer(route);
      };
    }

    box.classList.add('open');
  }

  closeRouteBottomBox() {
    const box = document.getElementById('route-bottom-card');
    if (box) box.classList.remove('open');

    document.getElementById('corner-visible-routes')?.classList.remove('dimmed-by-card');
    document.getElementById('corner-legend-control')?.classList.remove('dimmed-by-card');
    document.querySelector('.leaflet-bottom.leaflet-left')?.classList.remove('dimmed-by-card');

    const drawer = document.getElementById('route-drawer');
    if (!drawer || !drawer.classList.contains('open')) {
      this.selectedRouteId = null;
      this.routeLayers.forEach(layer => this.setLayerOpacity(layer, 0.92));
      this.clearStopPins();
      document.querySelectorAll('.mini-chip').forEach(chip => {
        chip.classList.remove('active');
      });
      document.querySelectorAll('.route-card').forEach(card => {
        card.classList.remove('active');
      });
      this.renderCatchmentStops();
    }
  }

  renderCatchmentStops() {
    this.clearStopPins();
    if (!this.catchmentStops || this.catchmentStops.length === 0) return;

    // Filter catchment stops by active modal category filters
    const visibleCatchmentStops = this.catchmentStops.filter(stop => {
      if (!stop.routes || stop.routes.length === 0) return true;
      return stop.routes.some(r => this.isRouteCategoryAllowed(r.category));
    });

    visibleCatchmentStops.forEach(stop => {
      const allowedRoutes = (stop.routes || []).filter(r => this.isRouteCategoryAllowed(r.category));
      if (stop.routes && stop.routes.length > 0 && allowedRoutes.length === 0) {
        return;
      }

      // Determine dominant mode for visual styling
      let primaryMode = 'bus';
      let primaryIcon = '🚏';
      let primaryLabel = 'Bus Stop';
      let pinRadius = 5.2;
      let pinFill = '#3b82f6';
      let pinBorder = '#ffffff';
      let pinWeight = 2.0;

      const modes = (allowedRoutes.length > 0 ? allowedRoutes : (stop.routes || [])).map(r => getTransitModeGroup(r.category, r.shortName || r.short_name));
      const hasTrain = modes.includes('train');
      const hasMetro = modes.includes('tube');
      const hasTram = modes.includes('tram');
      const hasFerry = modes.includes('ferry');

      if (hasTrain) {
        primaryMode = 'train';
        primaryIcon = '🚉';
        primaryLabel = 'Railway Station';
        pinRadius = 7.2;
        pinFill = '#090d16';
        pinBorder = '#38bdf8';
        pinWeight = 3.0;
      } else if (hasMetro) {
        primaryMode = 'tube';
        primaryIcon = 'Ⓜ️';
        primaryLabel = 'Metro Station';
        pinRadius = 6.8;
        pinFill = '#ffffff';
        pinBorder = '#e11d48';
        pinWeight = 3.0;
      } else if (hasTram) {
        primaryMode = 'tram';
        primaryIcon = '🚊';
        primaryLabel = 'Tram Stop';
        pinRadius = 5.8;
        pinFill = '#10b981';
        pinBorder = '#1e293b';
        pinWeight = 2.4;
      } else if (hasFerry) {
        primaryMode = 'ferry';
        primaryIcon = '⛴️';
        primaryLabel = 'Ferry Wharf';
        pinRadius = 6.0;
        pinFill = '#0284c7';
        pinBorder = '#ffffff';
        pinWeight = 2.4;
      } else {
        const routesToInspect = allowedRoutes.length > 0 ? allowedRoutes : (stop.routes || []);
        const firstRoute = routesToInspect[0];
        if (firstRoute && firstRoute.color) {
          pinFill = firstRoute.color;
        }
      }

      const pin = L.circleMarker([stop.lat, stop.lon], {
        radius: pinRadius,
        fillColor: pinFill,
        color: pinBorder,
        weight: pinWeight,
        opacity: 0.95,
        fillOpacity: 0.95,
        className: `catchment-stop-pin catchment-stop-${primaryMode}`
      }).addTo(this.map);

      // Desktop tooltip
      const displayRoutes = allowedRoutes.length > 0 ? allowedRoutes : (stop.routes || []);
      if (window.innerWidth > 860 && (!window.matchMedia || !window.matchMedia('(hover: none)').matches)) {
        pin.bindTooltip(`<b>${this.escapeHtml(stop.name)}</b><br><span style="color:#94a3b8;font-size:11px;">~${Math.round(stop.distance)}m walk • ${displayRoutes.length} route${displayRoutes.length === 1 ? '' : 's'}</span>`, {
          direction: 'top',
          offset: [0, -6],
          opacity: 0.95
        });
      }

      // Popup with routes
      const routeChipsHtml = displayRoutes.map(r => {
        const textColor = getYIQContrast(r.color || '#3b82f6');
        const badge = formatRouteBadge(r) || r.shortName || r.id;
        return `<button type="button" class="stop-popup-route-btn" data-route-id="${r.id}" style="background:${r.color || '#3b82f6'}; color:${textColor};">${badge}</button>`;
      }).join('');

      const popupHtml = `
        <div class="popup-mini catchment-stop-popup">
          <div class="popup-title">${primaryIcon} ${this.escapeHtml(stop.name)}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">${primaryLabel} • ~${Math.round(stop.distance)}m walk from pin</div>
          ${routeChipsHtml ? `<div style="font-size:10px;text-transform:uppercase;color:#cbd5e1;font-weight:600;margin-bottom:3px;">Serving Routes:</div><div class="catchment-stop-routes">${routeChipsHtml}</div>` : ''}
        </div>
      `;

      pin.bindPopup(popupHtml);
      pin.on('popupopen', (e) => {
        const popupElem = e.popup.getElement();
        if (popupElem) {
          popupElem.querySelectorAll('.stop-popup-route-btn').forEach(btn => {
            btn.onclick = (ev) => {
              ev.stopPropagation();
              const rId = btn.dataset.routeId;
              if (rId) {
                this.map.closePopup();
                this.selectRoute(rId);
              }
            };
          });
        }
      });

      this.stopPinLayers.push(pin);
      if (stop.id) {
        this.stopPinsMap.set(stop.id, pin);
      }
    });
  }

  renderRouteStops(route) {
    this.clearStopPins();

    const stops = this.routeStopsCache.get(route.id) || [];
    const geomData = this.geometryCache.get(route.id);
    const coords = getRouteCoordinates(geomData);

    // Apply 75m corridor safeguard
    const safeStops = filterStopsWithinCorridor(stops, coords, 75.0);
    const mode = getTransitModeGroup(route.category, route.shortName || route.short_name);

    const renderedStopIds = new Set();

    safeStops.forEach(stop => {
      renderedStopIds.add(String(stop.id));
      let pinRadius = 5.5;
      let pinFill = route.color || '#3b82f6';
      let pinBorder = '#ffffff';
      let pinWeight = 2.0;
      let stopTypeLabel = 'Bus Stop';
      let stopIcon = '🚏';

      if (mode === 'train') {
        pinRadius = 7.5;
        pinFill = '#090d16'; // Deep ballast station center
        pinBorder = route.color || '#38bdf8'; // Route line colored border
        pinWeight = 3.2;
        stopTypeLabel = 'Railway Station';
        stopIcon = '🚉';
      } else if (mode === 'tube') {
        pinRadius = 7.0;
        pinFill = '#ffffff'; // White roundel center
        pinBorder = route.color || '#e11d48'; // Bold route colored ring
        pinWeight = 3.4;
        stopTypeLabel = 'Metro Station';
        stopIcon = 'Ⓜ️';
      } else if (mode === 'tram') {
        pinRadius = 6.0;
        pinFill = route.color || '#10b981';
        pinBorder = '#1e293b';
        pinWeight = 2.4;
        stopTypeLabel = 'Tram Stop';
        stopIcon = '🚊';
      } else if (mode === 'ferry') {
        pinRadius = 6.5;
        pinFill = '#0284c7';
        pinBorder = '#ffffff';
        pinWeight = 2.5;
        stopTypeLabel = 'Ferry Wharf / Terminal';
        stopIcon = '⛴️';
      }

      const pin = L.circleMarker([stop.lat, stop.lon], {
        radius: pinRadius,
        fillColor: pinFill,
        color: pinBorder,
        weight: pinWeight,
        opacity: 1,
        fillOpacity: 0.95,
        className: `stop-pin stop-pin-${mode}`
      }).addTo(this.map);

      pin.bindPopup(`
        <div class="popup-mini">
          <div class="popup-title">${stopIcon} ${this.escapeHtml(stop.name)}</div>
          <div style="font-size:11px;color:#94a3b8;margin-bottom:4px;">${stopTypeLabel}</div>
          <div><span class="popup-badge" style="background:${route.color}; color:#fff;">${formatRouteBadge(route)}</span> Sequence #${stop.sequence}</div>
        </div>
      `);

      this.stopPinLayers.push(pin);
      this.stopPinsMap.set(stop.sequence, pin);
    });

    // Render all other catchment stops not belonging to this route within the catchment area
    if (this.catchmentStops && this.catchmentStops.length > 0) {
      const otherStops = this.catchmentStops.filter(s => {
        if (renderedStopIds.has(String(s.id))) return false;
        const isNearRouteStop = safeStops.some(rs => haversineMeters(s.lat, s.lon, rs.lat, rs.lon) <= 20);
        if (isNearRouteStop) return false;
        if (!s.routes || s.routes.length === 0) return true;
        return s.routes.some(r => this.isRouteCategoryAllowed(r.category));
      });

      otherStops.forEach(stop => {
        const otherPin = L.circleMarker([stop.lat, stop.lon], {
          radius: 4.8,
          fillColor: '#ffffff',
          color: '#64748b',
          weight: 2.0,
          opacity: 0.9,
          fillOpacity: 0.85,
          className: 'catchment-stop-other'
        }).addTo(this.map);

        const allowedRoutes = (stop.routes || []).filter(r => this.isRouteCategoryAllowed(r.category));
        const displayRoutes = allowedRoutes.length > 0 ? allowedRoutes : (stop.routes || []);

        if (window.innerWidth > 860 && (!window.matchMedia || !window.matchMedia('(hover: none)').matches)) {
          otherPin.bindTooltip(`<b>${this.escapeHtml(stop.name)}</b><br><span style="color:#94a3b8;font-size:11px;">~${Math.round(stop.distance)}m walk • ${displayRoutes.length} route${displayRoutes.length === 1 ? '' : 's'}</span>`, {
            direction: 'top',
            offset: [0, -5],
            opacity: 0.95
          });
        }

        const routeChipsHtml = displayRoutes.map(r => {
          const textColor = getYIQContrast(r.color || '#3b82f6');
          const badge = formatRouteBadge(r) || r.shortName || r.id;
          return `<button type="button" class="stop-popup-route-btn" data-route-id="${r.id}" style="background:${r.color || '#3b82f6'}; color:${textColor};">${badge}</button>`;
        }).join('');

        const popupHtml = `
          <div class="popup-mini catchment-stop-popup">
            <div class="popup-title">🚏 ${this.escapeHtml(stop.name)}</div>
            <div style="font-size:11px;color:#94a3b8;margin-bottom:6px;">Catchment Stop • ~${Math.round(stop.distance)}m walk from pin</div>
            ${routeChipsHtml ? `<div style="font-size:10px;text-transform:uppercase;color:#cbd5e1;font-weight:600;margin-bottom:3px;">Serving Routes:</div><div class="catchment-stop-routes">${routeChipsHtml}</div>` : ''}
          </div>
        `;

        otherPin.bindPopup(popupHtml);
        otherPin.on('popupopen', (e) => {
          const popupElem = e.popup.getElement();
          if (popupElem) {
            popupElem.querySelectorAll('.stop-popup-route-btn').forEach(btn => {
              btn.onclick = (ev) => {
                ev.stopPropagation();
                const rId = btn.dataset.routeId;
                if (rId) {
                  this.map.closePopup();
                  this.selectRoute(rId);
                }
              };
            });
          }
        });

        this.stopPinLayers.push(otherPin);
      });
    }
  }

  openDrawer(route) {
    const drawer = document.getElementById('route-drawer');
    if (!drawer) return;

    const container = document.getElementById('app-container');
    if (container) container.classList.add('drawer-open');
    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) backdrop.classList.add('open');

    const mode = getTransitModeGroup(route.category, route.shortName || route.short_name);
    const modeLabel = getTransitModeLabel(mode, route.category);

    const drawerBadge = document.getElementById('drawer-route-badge');
    if (drawerBadge) {
      drawerBadge.textContent = formatRouteBadge(route);
      drawerBadge.style.background = route.color;
      drawerBadge.className = `route-badge-large route-chip-${mode}`;
    }

    const drawerMode = document.getElementById('drawer-route-mode');
    if (drawerMode) {
      drawerMode.textContent = `${modeLabel.icon} ${modeLabel.label}`;
      drawerMode.className = `route-mode-pill mode-pill-${mode}`;
    }

    document.getElementById('drawer-route-name').textContent = route.title || route.name;
    document.getElementById('drawer-route-via').textContent = route.via || '';
    document.getElementById('drawer-frequency').textContent = route.frequency || 'N/A';
    document.getElementById('drawer-span').textContent = route.span || 'Standard Span';
    document.getElementById('drawer-distance').textContent = `${route.distanceKm || '0'} km`;

    // Dynamic Service Variations Selector Container
    const varContainer = document.getElementById('variations-selector-container');
    const varPillsContainer = document.getElementById('variation-pills');
    if (route.hasVariations && route.variations && route.variations.length > 0) {
      varContainer.classList.add('visible');
      if (varPillsContainer) {
        varPillsContainer.innerHTML = '';

        // "All Variations" button
        const allBtn = document.createElement('button');
        allBtn.className = `var-pill ${this.activeVariation === 'all' ? 'active' : ''}`;
        allBtn.dataset.var = 'all';
        allBtn.textContent = '⚡ All Variations';
        allBtn.addEventListener('click', () => {
          varPillsContainer.querySelectorAll('.var-pill').forEach(p => p.classList.remove('active'));
          allBtn.classList.add('active');
          this.activeVariation = 'all';
          this.applyRouteVariation(this.selectedRouteId, 'all');
        });
        varPillsContainer.appendChild(allBtn);

        // Dynamic buttons for each variation returned by the database
        route.variations.forEach(vr => {
          const pill = document.createElement('button');
          pill.className = `var-pill ${this.activeVariation === vr.id ? 'active' : ''}`;
          pill.dataset.var = vr.id;
          const icon = vr.type && vr.type.includes('peak') ? '🌅' : '🔄';
          pill.textContent = `${icon} ${vr.name}`;
          pill.title = vr.badge ? `${vr.name} (${vr.badge})` : vr.name;
          pill.addEventListener('click', () => {
            varPillsContainer.querySelectorAll('.var-pill').forEach(p => p.classList.remove('active'));
            pill.classList.add('active');
            this.activeVariation = vr.id;
            this.applyRouteVariation(this.selectedRouteId, vr.id);
          });
          varPillsContainer.appendChild(pill);
        });
      }
    } else {
      varContainer.classList.remove('visible');
    }

    // Render Timeline Stops
    this.renderDrawerTimeline(route);

    drawer.classList.add('open');
  }

  closeDrawer(stepBack = true) {
    const drawer = document.getElementById('route-drawer');
    if (drawer) {
      drawer.classList.remove('open');
      drawer.style.transform = '';
    }
    const container = document.getElementById('app-container');
    if (container) container.classList.remove('drawer-open');
    const backdrop = document.getElementById('drawer-backdrop');
    if (backdrop) backdrop.classList.remove('open');

    // UX-6 Step-Back: Return to Stage 1 Selected State (bottom card + route stops)
    if (stepBack && this.selectedRouteId) {
      const box = document.getElementById('route-bottom-card');
      if (box) box.classList.add('open');
      return;
    }

    const box = document.getElementById('route-bottom-card');
    if (box) box.classList.remove('open');

    document.getElementById('corner-visible-routes')?.classList.remove('dimmed-by-card');
    document.getElementById('corner-legend-control')?.classList.remove('dimmed-by-card');
    document.querySelector('.leaflet-bottom.leaflet-left')?.classList.remove('dimmed-by-card');

    this.selectedRouteId = null;

    // Un-highlight active state from all sidebar cards
    document.querySelectorAll('.route-card').forEach(card => {
      card.classList.remove('active');
    });

    document.querySelectorAll('.mini-chip').forEach(chip => {
      chip.classList.remove('active');
    });

    // Restore full opacity to all lines
    this.routeLayers.forEach(layer => this.setLayerOpacity(layer, 0.92));

    // Remove stop pins
    this.clearStopPins();
    this.renderCatchmentStops();
  }

  renderDrawerTimeline(route) {
    const timeline = document.getElementById('stops-timeline');
    const stopCountElem = document.getElementById('timeline-stop-count');
    timeline.innerHTML = '';

    if (!route.geometry && this.geometryCache.has(route.id)) {
      route.geometry = getRouteCoordinates(this.geometryCache.get(route.id));
    }
    const rawStops = this.routeStopsCache.get(route.id) || [];
    const stops = filterStopsWithinCorridor(rawStops, route.geometry, 75);
    stopCountElem.textContent = stops.length;

    let nearestStopElem = null;
    let minDistance = Infinity;

    stops.forEach(stop => {
      const node = document.createElement('div');
      node.className = 'timeline-stop-node';

      let isCatchment = false;
      let dist = Infinity;

      if (this.queryPoint && stop.lat != null && stop.lon != null) {
        dist = this.map.distance([this.queryPoint.lat, this.queryPoint.lon], [stop.lat, stop.lon]);
        if (dist <= this.currentRadius) {
          isCatchment = true;
          if (dist < minDistance) {
            minDistance = dist;
            nearestStopElem = node;
          }
        }
      }

      if (isCatchment) {
        node.classList.add('catchment-stop');
      }

      node.innerHTML = `
        <div class="node-bullet" style="border-color:${route.color};"></div>
        <div class="node-content">
          <span class="node-name">${stop.name}</span>
          <span class="node-sequence">Stop Sequence #${stop.sequence}</span>
        </div>
      `;

      node.addEventListener('click', () => {
        this.map.flyTo([stop.lat, stop.lon], 16);
        const pin = this.stopPinsMap.get(stop.sequence);
        if (pin) pin.openPopup();
      });

      timeline.appendChild(node);
    });

    if (nearestStopElem) {
      const content = nearestStopElem.querySelector('.node-content');
      if (content) {
        const badge = document.createElement('div');
        badge.className = 'timeline-nearest-badge';
        badge.innerHTML = `<span>🎯 Catchment stop • ~${Math.round(minDistance)}m walk</span>`;
        content.appendChild(badge);
      }
      setTimeout(() => {
        try {
          nearestStopElem.scrollIntoView({ block: 'center', behavior: 'smooth' });
        } catch (e) {}
      }, 150);
    }
  }

  applyRouteVariation(routeId, variationKey) {
    console.log(`Applied variation ${variationKey} to route ${routeId}`);
    const stopCountElem = document.getElementById('timeline-stop-count');
    const stops = this.routeStopsCache.get(routeId) || [];
    stopCountElem.textContent = stops.length;
  }

  handleMapClickForCorridors(e) {
    this.clearRouteLoadingAnimations();
    if (!e || !e.latlng) return;
    const clickLatLng = e.latlng;
    const clickPoint = this.map.latLngToLayerPoint(clickLatLng);
    const matched = [];

    // Bounding Box Fast Rejection (margin 0.006 deg ~ 600m)
    const margin = 0.006;
    const clickLat = clickLatLng.lat;
    const clickLon = clickLatLng.lng;

    // Filter allowed routes by active category filters
    const visibleRoutes = this.activeRoutes.filter(r => this.isRouteCategoryAllowed(r.category));

    visibleRoutes.forEach(route => {
      const geomData = this.geometryCache.get(route.id);
      if (!geomData) return;

      const coords = getRouteCoordinates(geomData);
      if (!coords || coords.length === 0) return;
      const isMulti = Array.isArray(coords[0]) && Array.isArray(coords[0][0]);
      const branches = isMulti ? coords : [coords];
      const flatCoords = isMulti ? coords.flat(1) : coords;

      // Check route bbox
      let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
      for (const c of flatCoords) {
        if (c[1] < minLat) minLat = c[1];
        if (c[1] > maxLat) maxLat = c[1];
        if (c[0] < minLon) minLon = c[0];
        if (c[0] > maxLon) maxLon = c[0];
      }

      if (clickLat < minLat - margin || clickLat > maxLat + margin ||
          clickLon < minLon - margin || clickLon > maxLon + margin) {
        return; // Skip non-relevant routes
      }

      // Point-to-segment distance check across all branches
      let minPixelDist = Infinity;
      for (const branch of branches) {
        for (let i = 0; i < branch.length - 1; i++) {
          const pt1 = this.map.latLngToLayerPoint([branch[i][1], branch[i][0]]);
          const pt2 = this.map.latLngToLayerPoint([branch[i+1][1], branch[i+1][0]]);
          const d = L.LineUtil.pointToSegmentDistance(clickPoint, pt1, pt2);
          if (d < minPixelDist) minPixelDist = d;
        }
      }

      // 28px road corridor buffer to detect shared multi-route road segments reliably
      if (minPixelDist <= 28) {
        matched.push({ route, dist: minPixelDist });
      }
    });

    if (matched.length > 1) {
      matched.sort((a, b) => a.dist - b.dist);
      // UX-5: Smart Corridor Disambiguation (direct clicks <= 6px with gap >= 10px select directly)
      if (matched[0].dist <= 6 && (matched[1].dist - matched[0].dist >= 10)) {
        const corridorModal = document.getElementById('corridor-popup-modal');
        if (corridorModal && corridorModal.classList.contains('open')) {
          corridorModal.classList.remove('open');
        }
        this.selectRoute(matched[0].route.id);
      } else {
        // Road has multi-route: close any existing small box and show multi-route selector first
        this.closeRouteBottomBox();
        this.openCorridorSelectionPopup(matched.map(m => m.route));
      }
    } else if (matched.length === 1) {
      // Road without multi-route: dismiss corridor popup if open, show small box directly
      const corridorModal = document.getElementById('corridor-popup-modal');
      if (corridorModal && corridorModal.classList.contains('open')) {
        corridorModal.classList.remove('open');
      }
      this.selectRoute(matched[0].route.id);
    } else {
      this.closeRouteBottomBox();
      // Dismiss corridor selection popup if open
      const corridorModal = document.getElementById('corridor-popup-modal');
      if (corridorModal && corridorModal.classList.contains('open')) {
        corridorModal.classList.remove('open');
      }
    }
  }

  openCorridorSelectionPopup(routes) {
    const modal = document.getElementById('corridor-popup-modal');
    const list = document.getElementById('corridor-routes-list');
    if (!modal || !list) return;

    try {
      this.map.eachLayer(l => {
        if (typeof l.closeTooltip === 'function') l.closeTooltip();
      });
    } catch (_) {}

    list.innerHTML = '';
    routes.forEach(route => {
      const mode = getTransitModeGroup(route.category, route.shortName || route.short_name);
      const modeLabel = getTransitModeLabel(mode, route.category);
      const row = document.createElement('div');
      row.className = 'corridor-route-row';
      const textColor = getYIQContrast(route.color);

      row.innerHTML = `
        <div class="corridor-route-left">
          <span class="route-chip route-chip-${mode}" style="background:${route.color}; color:${textColor};">${formatRouteBadge(route)}</span>
          <div class="corridor-route-info">
            <span class="corridor-route-title">${route.title || route.name}</span>
            <span class="corridor-route-via">${route.via || ''}</span>
          </div>
        </div>
        <div style="display:flex; flex-direction:column; align-items:flex-end; gap:2px;">
          <span class="route-mode-pill mode-pill-${mode}" style="font-size:10px; padding:1px 5px;">${modeLabel.icon} ${route.category}</span>
          <span style="font-size:11px; color:#94a3b8;">${route.frequency}</span>
        </div>
      `;

      // Live Preview on Hover
      row.addEventListener('mouseenter', () => {
        this.previewCorridorRoute(route.id);
      });
      row.addEventListener('mouseleave', () => {
        if (!this.selectedRouteId) {
          this.routeLayers.forEach(l => this.setLayerOpacity(l, 0.92));
        }
      });

      // Tapping on a route from the multi-route selector closes the selector, then shows the small box
      row.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        modal.classList.remove('open');
        this.selectRoute(route.id);
      });

      list.appendChild(row);
    });

    modal.classList.add('open');
  }

  previewCorridorRoute(routeId) {
    this.routeLayers.forEach((layer, rId) => {
      this.setLayerOpacity(layer, rId === routeId ? 1.0 : 0.2);
    });
  }

  updateVisibleRoutesChips() {
    const container = document.getElementById('visible-chips-container');
    if (!container) return;

    const bounds = this.map.getBounds();
    const visible = this.activeRoutes.filter(route => {
      // Filter out if category is disabled in top bar modal filters
      if (!this.isRouteCategoryAllowed(route.category)) return false;

      const geomData = this.geometryCache.get(route.id);
      if (!geomData) return false;
      const coords = getRouteCoordinates(geomData);
      const flatCoords = (Array.isArray(coords[0]) && Array.isArray(coords[0][0])) ? coords.flat(1) : coords;
      return flatCoords.some(c => bounds.contains([c[1], c[0]]));
    });

    container.innerHTML = '';
    if (visible.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'visible-chips-empty';
      const filteredRoutes = this.activeRoutes.filter(r => this.isRouteCategoryAllowed(r.category));
      if (this.activeRoutes.length > 0 && filteredRoutes.length === 0) {
        empty.textContent = 'All routes hidden by filters';
      } else {
        empty.textContent = 'No routes in view';
      }
      container.appendChild(empty);
      return;
    }

    visible.forEach(route => {
      const mode = getTransitModeGroup(route.category, route.shortName || route.short_name);
      const chip = document.createElement('button');
      chip.className = `mini-chip mini-chip-${mode}`;
      chip.dataset.routeId = route.id;
      if (this.selectedRouteId === route.id) {
        chip.classList.add('active');
      }
      chip.title = route.name || route.title || route.shortName;

      const textColor = getYIQContrast(route.color);
      const badge = document.createElement('span');
      badge.className = `mini-chip-badge route-chip-${mode}`;
      badge.style.background = route.color;
      badge.style.color = textColor;
      badge.textContent = formatRouteBadge(route);

      const title = document.createElement('span');
      title.className = 'mini-chip-title';
      title.textContent = route.name || route.title || '';

      chip.appendChild(badge);
      chip.appendChild(title);

      chip.addEventListener('click', () => {
        this.selectRoute(route.id);
      });

      container.appendChild(chip);
    });
  }

  // ==========================================================================
  // Location Search & Autocomplete
  // ==========================================================================
  initLocationSearch() {
    const searchInput = document.getElementById('location-search-input');
    const clearBtn = document.getElementById('location-clear-btn');
    const dropdown = document.getElementById('location-suggestions-dropdown');
    const card = document.getElementById('query-location-card');

    if (!searchInput || !dropdown) return;

    let searchDebounceTimer = null;

    // Show clear button initially if value exists
    if (searchInput.value.trim().length > 0 && clearBtn) {
      clearBtn.style.display = 'flex';
    }

    // Input typing with debounce
    searchInput.addEventListener('input', () => {
      const query = searchInput.value.trim();
      if (clearBtn) {
        clearBtn.style.display = query.length > 0 ? 'flex' : 'none';
      }

      if (searchDebounceTimer) {
        clearTimeout(searchDebounceTimer);
      }

      if (query.length < 2) {
        dropdown.classList.remove('open');
        dropdown.innerHTML = '';
        this.currentSearchSuggestions = [];
        this.selectedSuggestionIndex = -1;
        return;
      }

      searchDebounceTimer = setTimeout(() => {
        this.fetchLocationSuggestions(query);
      }, 300);
    });

    // Clear input on focus/click for easy typing, displaying placeholder "Search Catch Da Ride!"
    const topBar = document.getElementById('top-bar');
    const clearOnInputClick = () => {
      if (topBar) topBar.classList.add('search-focused');
      if (searchInput.value.trim().length > 0) {
        this.lastSelectedLocationName = searchInput.value.trim();
        searchInput.value = '';
        if (clearBtn) clearBtn.style.display = 'none';
        dropdown.classList.remove('open');
        dropdown.innerHTML = '';
        this.currentSearchSuggestions = [];
        this.selectedSuggestionIndex = -1;
      }
    };

    searchInput.addEventListener('focus', clearOnInputClick);
    searchInput.addEventListener('click', clearOnInputClick);

    // If blurred without typing, restore previous location name
    searchInput.addEventListener('blur', () => {
      if (topBar) topBar.classList.remove('search-focused');
      setTimeout(() => {
        if (!searchInput.value.trim() && this.lastSelectedLocationName) {
          searchInput.value = this.lastSelectedLocationName;
          if (clearBtn) clearBtn.style.display = 'flex';
        }
      }, 200);
    });

    // Clear button action
    if (clearBtn) {
      clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        searchInput.value = '';
        clearBtn.style.display = 'none';
        dropdown.classList.remove('open');
        dropdown.innerHTML = '';
        this.currentSearchSuggestions = [];
        this.selectedSuggestionIndex = -1;
        searchInput.focus();
      });
    }

    // Keyboard navigation (ArrowDown, ArrowUp, Enter, Escape)
    searchInput.addEventListener('keydown', (e) => {
      const items = dropdown.querySelectorAll('.location-suggestion-item');
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (items.length === 0) return;
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % items.length;
        this.updateActiveSuggestion(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (items.length === 0) return;
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex - 1 + items.length) % items.length;
        this.updateActiveSuggestion(items);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (this.selectedSuggestionIndex >= 0 && items[this.selectedSuggestionIndex]) {
          items[this.selectedSuggestionIndex].click();
        } else if (items.length > 0) {
          items[0].click();
        } else if (searchInput.value.trim().length >= 2) {
          this.fetchAndSelectFirstResult(searchInput.value.trim());
        }
      } else if (e.key === 'Escape') {
        dropdown.classList.remove('open');
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (card && !card.contains(e.target)) {
        dropdown.classList.remove('open');
      }
    });
  }

  updateActiveSuggestion(items) {
    items.forEach((item, idx) => {
      if (idx === this.selectedSuggestionIndex) {
        item.classList.add('active');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active');
      }
    });
  }

  renderSuggestionsList(features, dropdown, center) {
    if (features.length === 0) {
      dropdown.innerHTML = '<div class="location-suggestion-empty">No matching locations found</div>';
      this.currentSearchSuggestions = [];
      return;
    }

    this.currentSearchSuggestions = features;
    this.selectedSuggestionIndex = -1;
    dropdown.innerHTML = '';

    features.forEach((feature, idx) => {
      const props = feature.properties || {};
      const coords = feature.geometry?.coordinates || [];
      const lon = coords[0];
      const lat = coords[1];
      if (lat == null || lon == null) return;

      const icon = this.getLocationIcon(props);
      const title = props.name || [props.housenumber, props.street].filter(Boolean).join(' ') || props.street || 'Location';
      const subParts = [props.street && props.street !== title ? props.street : null, props.district || props.city, props.state, props.postcode].filter(Boolean);
      const subtitle = subParts.join(', ');

      const distMeters = haversineMeters(center.lat, center.lng, lat, lon);
      const distBadge = distMeters < 1000 ? `${Math.round(distMeters)}m` : `${(distMeters / 1000).toFixed(1)}km`;

      const item = document.createElement('div');
      item.className = 'location-suggestion-item';
      item.setAttribute('role', 'option');
      item.dataset.index = idx;

      item.innerHTML = `
        <span class="suggestion-icon">${icon}</span>
        <div class="suggestion-info">
          <span class="suggestion-title">${this.escapeHtml(title)}</span>
          ${subtitle ? `<span class="suggestion-sub">${this.escapeHtml(subtitle)}</span>` : ''}
        </div>
        <span class="suggestion-distance">${distBadge}</span>
      `;

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        this.selectSearchResult({ lat, lon, name: title });
      });

      dropdown.appendChild(item);
    });
  }

  async fetchLocationSuggestions(query) {
    const dropdown = document.getElementById('location-suggestions-dropdown');
    if (!dropdown) return;

    const normalizedQ = query.trim().toLowerCase();
    const center = this.map ? this.map.getCenter() : { lat: this.queryPoint.lat, lng: this.queryPoint.lon };

    // Check client-side search cache (OPT-4)
    if (this.searchCache && this.searchCache.has(normalizedQ)) {
      dropdown.classList.add('open');
      this.renderSuggestionsList(this.searchCache.get(normalizedQ), dropdown, center);
      return;
    }

    dropdown.innerHTML = '<div class="location-suggestion-loading">Searching places...</div>';
    dropdown.classList.add('open');

    if (this.activeSearchAbort) {
      try { this.activeSearchAbort.abort(); } catch (_) {}
    }
    this.activeSearchAbort = new AbortController();

    try {
      // 1. Fetch internal transit hub suggestions (/api/search)
      let localHubs = [];
      try {
        const hubRes = await fetch(`${getApiBase()}/api/search?q=${encodeURIComponent(query)}`, { signal: this.activeSearchAbort.signal });
        if (hubRes.ok) {
          const rawHubs = await hubRes.json();
          localHubs = rawHubs.map(h => ({
            properties: {
              name: h.label,
              street: h.name !== h.label ? h.name : null,
              osm_key: h.type === 'station' || h.type === 'interchange' || h.type === 'multimodal' ? 'railway' : (h.type === 'ferry' ? 'ferry' : (h.type === 'airport' ? 'airport' : 'place')),
              osm_value: h.type,
              type: h.type
            },
            geometry: { coordinates: [h.lon, h.lat] },
            isHub: true
          }));
        }
      } catch (_) {}

      // 2. Fetch Photon geocoding with natural proximity bias (Universal - works anywhere in the world)
      let photonFeatures = [];
      try {
        const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${center.lat}&lon=${center.lng}&limit=8`;
        const res = await fetch(url, { signal: this.activeSearchAbort.signal });
        if (res.ok) {
          const data = await res.json();
          photonFeatures = data.features || [];
        }
      } catch (_) {}

      // Combine local transit hubs + photon features, deduplicating nearby points (<150m)
      const combined = [...localHubs];
      photonFeatures.forEach(pf => {
        const pcoords = pf.geometry?.coordinates || [];
        const isDuplicate = combined.some(h => {
          const hcoords = h.geometry?.coordinates || [];
          return haversineMeters(pcoords[1], pcoords[0], hcoords[1], hcoords[0]) < 150;
        });
        if (!isDuplicate) {
          combined.push(pf);
        }
      });

      const features = combined.slice(0, 8);
      if (this.searchCache) {
        if (this.searchCache.size >= 100) {
          const firstKey = this.searchCache.keys().next().value;
          this.searchCache.delete(firstKey);
        }
        this.searchCache.set(normalizedQ, features);
      }

      this.renderSuggestionsList(features, dropdown, center);

    } catch (err) {
      if (err.name === 'AbortError') return;
      console.warn("Location search error:", err);
      dropdown.innerHTML = '<div class="location-suggestion-empty">Location search temporarily unavailable</div>';
      this.currentSearchSuggestions = [];
    }
  }

  async fetchAndSelectFirstResult(query) {
    const normalizedQ = query.trim().toLowerCase();
    // Check client-side cache first to avoid re-querying backend (OPT-4)
    if (this.searchCache && this.searchCache.has(normalizedQ)) {
      const cached = this.searchCache.get(normalizedQ);
      if (cached && cached.length > 0) {
        const first = cached[0];
        if (first && first.geometry?.coordinates) {
          const lon = first.geometry.coordinates[0];
          const lat = first.geometry.coordinates[1];
          const props = first.properties || {};
          const title = props.name || [props.housenumber, props.street].filter(Boolean).join(' ') || props.street || query;
          this.selectSearchResult({ lat, lon, name: title });
          return;
        }
      }
    }

    const center = this.map ? this.map.getCenter() : { lat: this.queryPoint.lat, lng: this.queryPoint.lon };
    // 1. Check local curated hubs first
    try {
      const hubRes = await fetch(`${getApiBase()}/api/search?q=${encodeURIComponent(query)}`);
      if (hubRes.ok) {
        const hubs = await hubRes.json();
        if (hubs.length > 0) {
          this.selectSearchResult({ lat: hubs[0].lat, lon: hubs[0].lon, name: hubs[0].label });
          return;
        }
      }
    } catch (_) {}

    // 2. Query Photon with natural proximity bias
    const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lat=${center.lat}&lon=${center.lng}&limit=1`;
    try {
      const res = await fetch(url);
      if (!res.ok) return;
      const data = await res.json();
      const first = (data.features || [])[0];
      if (first && first.geometry?.coordinates) {
        const lon = first.geometry.coordinates[0];
        const lat = first.geometry.coordinates[1];
        const props = first.properties || {};
        const title = props.name || [props.housenumber, props.street].filter(Boolean).join(' ') || props.street || query;
        this.selectSearchResult({ lat, lon, name: title });
      }
    } catch (e) {
      console.warn("Auto-select search error:", e);
    }
  }

  selectSearchResult({ lat, lon, name }) {
    const searchInput = document.getElementById('location-search-input');
    const locNameElem = document.getElementById('query-location-name');
    const dropdown = document.getElementById('location-suggestions-dropdown');
    const clearBtn = document.getElementById('location-clear-btn');

    this.lastSelectedLocationName = name;
    trackAnalyticsEvent('search_location', { query: name, agency_id: this.currentAgencyId || '' });

    if (searchInput) {
      searchInput.value = name;
      if (clearBtn) clearBtn.style.display = 'flex';
      searchInput.blur();
    }
    if (locNameElem) {
      locNameElem.textContent = name;
    }
    if (dropdown) {
      dropdown.classList.remove('open');
      dropdown.innerHTML = '';
      this.currentSearchSuggestions = [];
      this.selectedSuggestionIndex = -1;
    }

    this.setQueryLocation(lat, lon);
    this.map.flyTo([lat, lon], 15);
  }

  getLocationIcon(props) {
    if (!props) return '📍';
    const osmKey = props.osm_key;
    const osmVal = props.osm_value;
    const type = props.type;

    if (osmVal === 'ferry' || type === 'ferry') return '⛴️';
    if (osmVal === 'airport' || type === 'airport') return '✈️';
    if (osmVal === 'interchange' || type === 'interchange' || type === 'multimodal') return '🔄';
    if (osmKey === 'railway' && (osmVal === 'station' || osmVal === 'halt')) return '🚆';
    if (osmKey === 'railway' && osmVal === 'tram_stop') return '🚊';
    if (osmKey === 'highway' && (osmVal === 'bus_stop' || osmVal === 'platform')) return '🚌';
    if (osmKey === 'shop' || osmVal === 'mall' || osmVal === 'supermarket') return '🛍️';
    if (osmKey === 'amenity' && (osmVal === 'hospital' || osmVal === 'clinic')) return '🏥';
    if (osmKey === 'amenity' && (osmVal === 'university' || osmVal === 'college' || osmVal === 'school')) return '🏫';
    if (osmKey === 'amenity' && (osmVal === 'restaurant' || osmVal === 'cafe' || osmVal === 'food_court')) return '🍽️';
    if (osmKey === 'leisure' && (osmVal === 'park' || osmVal === 'garden')) return '🌳';
    if (osmKey === 'place' || type === 'city' || type === 'district' || type === 'suburb') return '📍';
    if (type === 'house' || type === 'street') return '🏠';
    return '📍';
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  setCatchmentRadius(radius) {
    this.currentRadius = radius;
    const radiusBtns = document.querySelectorAll('.radius-btn');
    radiusBtns.forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.radius, 10) === radius);
    });
    if (this.catchmentCircle) {
      this.catchmentCircle.setRadius(radius);
    }
    const catchmentToggleBtn = document.getElementById('catchment-toggle-btn');
    if (catchmentToggleBtn) {
      catchmentToggleBtn.title = `Walking Catchment Radius: ${this.currentRadius}m`;
      catchmentToggleBtn.setAttribute('aria-label', `Walking Catchment Radius: ${this.currentRadius}m`);
    }
    this.updateStatusBadges();
    this.closeDrawer();
    this.closeRouteBottomBox();
    this.clearStopPins();
    this.selectedRouteId = null;
    this.updateUrlCoordinates(this.queryPoint.lat, this.queryPoint.lon, this.currentRadius);
    this.loadCatchment();
  }

  fitRouteToView() {
    if (!this.selectedRouteId) return;
    const layer = this.routeLayers.get(this.selectedRouteId);
    if (layer && typeof layer.getBounds === 'function') {
      const bounds = layer.getBounds();
      if (bounds && bounds.isValid()) {
        this.map.fitBounds(bounds, {
          paddingTopLeft: [24, 24],
          paddingBottomRight: [24, 130],
          maxZoom: 16
        });
      }
    }
  }

  updateViewportCatchmentPill() {
    const pill = document.getElementById('viewport-catchment-pill');
    if (!pill || !this.map || !this.queryPoint) return;
    try {
      const bounds = this.map.getBounds();
      const isInside = bounds.contains([this.queryPoint.lat, this.queryPoint.lon]);
      if (!isInside) {
        pill.classList.remove('hidden');
      } else {
        pill.classList.add('hidden');
      }
    } catch (e) {
      pill.classList.add('hidden');
    }
  }

  hideViewportCatchmentPill() {
    const pill = document.getElementById('viewport-catchment-pill');
    if (pill) pill.classList.add('hidden');
  }

  showEmptyCatchmentBanner(data) {
    const card = document.getElementById('empty-catchment-card');
    if (!card) return;

    const titleElem = document.getElementById('empty-card-title');
    const subElem = document.getElementById('empty-card-sub');
    const expandBtn = document.getElementById('empty-expand-radius-btn');
    const snapBtn = document.getElementById('empty-snap-stop-btn');

    if (titleElem) {
      titleElem.textContent = `No transit routes within ${this.currentRadius}m`;
    }

    if (data && data.nearestStop) {
      this.lastEmptyNearestStop = data.nearestStop;
      const dist = Math.round(data.nearestStop.distance);
      if (subElem) {
        subElem.innerHTML = `Nearest stop: <strong>${this.escapeHtml(data.nearestStop.name)}</strong> (~${dist}m away)`;
      }
      if (snapBtn) {
        snapBtn.style.display = 'inline-flex';
        snapBtn.innerHTML = `<span>🎯 Snap to Stop (~${dist}m)</span>`;
      }
    } else {
      this.lastEmptyNearestStop = null;
      if (subElem) {
        subElem.textContent = "Outside active transit coverage area.";
      }
      if (snapBtn) {
        snapBtn.style.display = 'none';
      }
    }

    if (expandBtn) {
      const nextRadius = this.currentRadius < 800 ? 800 : (this.currentRadius < 1200 ? 1200 : 1200);
      if (this.currentRadius >= 1200) {
        expandBtn.style.display = 'none';
      } else {
        expandBtn.style.display = 'inline-flex';
        expandBtn.innerHTML = `<span>Expand to ${nextRadius}m</span>`;
      }
    }

    card.classList.remove('hidden');
  }

  hideEmptyCatchmentBanner() {
    const card = document.getElementById('empty-catchment-card');
    if (card) card.classList.add('hidden');
  }

  showUnsupportedLocationModal(data, customTitle = null) {
    const modal = document.getElementById('unsupported-location-modal');
    if (!modal) return;

    const titleEl = document.getElementById('unsupported-modal-title');
    if (titleEl) {
      titleEl.textContent = customTitle || "Location Not Supported Yet";
    }

    const container = document.getElementById('unsupported-regions-container');

    if (container) {
      const regions = (data && data.supportedRegions && data.supportedRegions.length > 0)
        ? data.supportedRegions
        : [
            { cityName: "Melbourne & Victoria", countryCode: "AU", hubName: "Flinders Street Station", lat: -37.8180, lon: 144.9671 },
            { cityName: "Sydney & NSW", countryCode: "AU", hubName: "Sydney Central Station", lat: -33.8830, lon: 151.2065 },
            { cityName: "Brisbane & QLD", countryCode: "AU", hubName: "Brisbane Central Station", lat: -27.4660, lon: 153.0270 },
            { cityName: "Adelaide & SA", countryCode: "AU", hubName: "Adelaide Railway Station", lat: -34.9212, lon: 138.5954 },
            { cityName: "Perth & WA", countryCode: "AU", hubName: "Perth Station", lat: -31.9515, lon: 115.8600 },
            { cityName: "Canberra & ACT", countryCode: "AU", hubName: "City Interchange Canberra", lat: -35.2809, lon: 149.1300 },
            { cityName: "Hobart & TAS", countryCode: "AU", hubName: "Hobart Interchange", lat: -42.8826, lon: 147.3302 },
            { cityName: "Darwin & NT", countryCode: "AU", hubName: "Darwin Bus Terminus", lat: -12.4634, lon: 130.8444 },
            { cityName: "Alice Springs", countryCode: "AU", hubName: "Alice Springs Interchange", lat: -23.7002, lon: 133.8807 },
            { cityName: "London", countryCode: "GB", hubName: "Central London (Charing Cross)", lat: 51.5074, lon: -0.1278 },
            { cityName: "Birmingham & Coventry", countryCode: "GB", hubName: "Birmingham New Street Station", lat: 52.4777, lon: -1.8988 },
            { cityName: "Toronto & GTHA", countryCode: "CA", hubName: "Union Station Toronto", lat: 43.6453, lon: -79.3806 },
            { cityName: "Vancouver", countryCode: "CA", hubName: "Vancouver Waterfront Station", lat: 49.2859, lon: -123.1119 },
            { cityName: "Hong Kong", countryCode: "HK", hubName: "Central MTR Station", lat: 22.2818, lon: 114.1583 },
            { cityName: "San Francisco & Bay Area", countryCode: "US", hubName: "Powell Street / Market St", lat: 37.7844, lon: -122.4080 },
            { cityName: "New York & New Jersey Metro", countryCode: "US", hubName: "Grand Central / Times Sq", lat: 40.7527, lon: -73.9772 }
          ];

      const countryNames = {
        "AU": "🇦🇺 Australia",
        "GB": "🇬🇧 United Kingdom",
        "CA": "🇨🇦 Canada",
        "HK": "🇭🇰 Hong Kong",
        "US": "🇺🇸 United States"
      };

      const grouped = {};
      regions.forEach(r => {
        const c = r.countryCode || "AU";
        if (!grouped[c]) grouped[c] = [];
        grouped[c].push(r);
      });

      let html = '';
      for (const [countryCode, list] of Object.entries(grouped)) {
        const countryLabel = countryNames[countryCode] || countryCode;
        html += `<div class="unsupported-country-group">`;
        html += `  <div class="unsupported-country-title">${this.escapeHtml(countryLabel)}</div>`;
        html += `  <div class="unsupported-cities-grid">`;
        list.forEach(r => {
          html += `    <button type="button" class="unsupported-city-btn" data-lat="${r.lat}" data-lon="${r.lon}" data-name="${this.escapeHtml(r.cityName)}" data-hub="${this.escapeHtml(r.hubName)}">`;
          html += `      <span>${this.escapeHtml(r.cityName)}</span>`;
          html += `      <span class="city-arrow">➔</span>`;
          html += `    </button>`;
        });
        html += `  </div>`;
        html += `</div>`;
      }

      container.innerHTML = html;

      // Attach click listeners to city buttons
      container.querySelectorAll('.unsupported-city-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const lat = parseFloat(btn.dataset.lat);
          const lon = parseFloat(btn.dataset.lon);
          const name = btn.dataset.name;
          const hub = btn.dataset.hub;
          if (isNaN(lat) || isNaN(lon)) return;

          this.hideUnsupportedLocationModal();
          const targetName = `${name} (${hub})`;
          this.lastSelectedLocationName = targetName;

          const searchInput = document.getElementById('location-search-input');
          const locNameElem = document.getElementById('query-location-name');
          const locClearBtn = document.getElementById('location-clear-btn');
          if (searchInput) {
            searchInput.value = targetName;
            if (locClearBtn) locClearBtn.style.display = 'flex';
          }
          if (locNameElem) {
            locNameElem.textContent = targetName;
          }

          this.setQueryLocation(lat, lon);
          if (this.map) {
            this.map.flyTo([lat, lon], 14, { duration: 1.2 });
          }
        });
      });
    }

    modal.classList.remove('hidden');
    const backdrop = document.getElementById('unsupported-modal-backdrop');
    if (backdrop) backdrop.classList.remove('hidden');
  }

  hideUnsupportedLocationModal() {
    const modal = document.getElementById('unsupported-location-modal');
    if (modal) modal.classList.add('hidden');
    const backdrop = document.getElementById('unsupported-modal-backdrop');
    if (backdrop) backdrop.classList.add('hidden');
    const titleEl = document.getElementById('unsupported-modal-title');
    if (titleEl) titleEl.textContent = "Location Not Supported Yet";
  }

  triggerPinDropRipple(lat, lon) {
    if (!this.map) return;
    try {
      const rippleIcon = L.divIcon({
        className: 'pin-drop-ripple-container',
        html: '<div class="pin-drop-ripple"></div>',
        iconSize: [60, 60],
        iconAnchor: [30, 30]
      });
      const rippleMarker = L.marker([lat, lon], { icon: rippleIcon, interactive: false }).addTo(this.map);
      setTimeout(() => {
        try {
          this.map.removeLayer(rippleMarker);
        } catch (_) {}
      }, 950);
    } catch (e) {
      console.warn("Ripple animation failed:", e);
    }
  }

  updateStatusBadges() {
    // UX-7: Catchment Radius Badge
    let catchmentBadge = document.getElementById('catchment-toggle-badge');
    const catchmentToggleBtn = document.getElementById('catchment-toggle-btn');
    if (!catchmentBadge && catchmentToggleBtn) {
      catchmentBadge = document.createElement('span');
      catchmentBadge.id = 'catchment-toggle-badge';
      catchmentBadge.className = 'catchment-toggle-badge';
      catchmentToggleBtn.appendChild(catchmentBadge);
    }
    if (catchmentBadge) {
      catchmentBadge.textContent = `${this.currentRadius}m`;
      catchmentBadge.style.display = 'inline-block';
    }

    // UX-7: Active Filter Indicator Dot
    const filterDot = document.getElementById('filter-active-dot');
    if (filterDot) {
      let anyFilterDisabled = false;
      if (this.renderedCategoryKeys && this.renderedCategoryKeys.size > 0) {
        anyFilterDisabled = [...this.renderedCategoryKeys].some(k => this.activeFilters[k] === false);
      } else {
        anyFilterDisabled = Object.values(this.activeFilters).some(v => v === false);
      }
      if (anyFilterDisabled) {
        filterDot.classList.remove('hidden');
      } else {
        filterDot.classList.add('hidden');
      }
    }
  }
}

// Global initialization
window.addEventListener('DOMContentLoaded', () => {
  window.busMapApp = new BusMapApp();
});

// Expose animation helpers for testability
if (typeof window !== 'undefined') {
  window.calculateBearing = calculateBearing;
  window.findRouteNearestVertex = findRouteNearestVertex;
  window.computeRouteWavefrontDelays = computeRouteWavefrontDelays;
  window.getLayerSvgPaths = getLayerSvgPaths;
  window.buildWavefrontPolygonPoints = buildWavefrontPolygonPoints;
  window.precomputeWavefrontOffsets = precomputeWavefrontOffsets;
  window.getAdaptiveLODVertices = getAdaptiveLODVertices;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateBearing,
    findRouteNearestVertex,
    computeRouteWavefrontDelays,
    getLayerSvgPaths,
    buildWavefrontPolygonPoints,
    precomputeWavefrontOffsets,
    getAdaptiveLODVertices,
    haversineMeters
  };
}
