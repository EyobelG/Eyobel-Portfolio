import React, { useState, useEffect, useRef } from "react";
import { 
  Clock, Sun, Cloud, CloudRain, CloudSun, 
  MapPin, Wind, Droplets, RefreshCw, Zap
} from "lucide-react";

// Weather info structure
interface WeatherInfo {
  city: string;
  region: string;
  tempF: number;
  tempC: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: React.ComponentType<{ className?: string }>;
  isLive?: boolean;
}

const STATIC_STATIONS: WeatherInfo[] = [
  {
    city: "Medford",
    region: "Tufts University (MA)",
    tempF: 72,
    tempC: 22,
    condition: "Partly Cloudy",
    humidity: 45,
    windSpeed: 8,
    icon: CloudSun,
    isLive: true
  },
  {
    city: "Williamstown",
    region: "Williams College (MA)",
    tempF: 68,
    tempC: 20,
    condition: "Clear Sky",
    humidity: 40,
    windSpeed: 6,
    icon: Sun
  },
  {
    city: "Addis Ababa",
    region: "Ethiopia (Home)",
    tempF: 64,
    tempC: 18,
    condition: "Scattered Showers",
    humidity: 82,
    windSpeed: 11,
    icon: CloudRain
  },
  {
    city: "Pasadena",
    region: "EF Academy (CA)",
    tempF: 81,
    tempC: 27,
    condition: "Sunny",
    humidity: 32,
    windSpeed: 5,
    icon: Sun
  }
];

export default function InteractivePortrait() {
  // Time & Clock state
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);
  const [activeTimeZone, setActiveTimeZone] = useState<"local" | "addis">("local");

  // Weather state
  const [weatherIndex, setWeatherIndex] = useState(0);
  const [isFahrenheit, setIsFahrenheit] = useState(true);
  const [showWeatherDetails, setShowWeatherDetails] = useState(false);
  
  // Real-time fetched weather state for Medford, MA
  const [liveMedfordWeather, setLiveMedfordWeather] = useState<WeatherInfo | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState(false);

  // Hover & 3D Parallax position
  const cardRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 90 });

  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Photo auto-loader candidates
  const IMAGE_CANDIDATES = [
    "/eyobel.jpg",
    "/eyobel.png",
    "/eyobel.jpeg",
    "/eyobel_headshot.jpg",
    "/eyobel_headshot.png",
    "/eyobel_headshot.jpeg"
  ];
  const [candidateIndex, setCandidateIndex] = useState(0);
  const [hasImage, setHasImage] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = () => {
    setHasImage(true);
    setImageLoading(false);
  };

  const handleImageError = () => {
    if (candidateIndex < IMAGE_CANDIDATES.length - 1) {
      setCandidateIndex(prev => prev + 1);
    } else {
      setHasImage(false);
      setImageLoading(false);
    }
  };

  // Handle ticking clocks
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real Medford weather from Open-Meteo
  const fetchMedfordWeather = async () => {
    setIsWeatherLoading(true);
    setWeatherError(false);
    try {
      // Medford MA coordinates: 42.4184° N, 71.1062° W
      const response = await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=42.4184&longitude=-71.1062&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&temperature_unit=fahrenheit"
      );
      if (!response.ok) throw new Error("Weather request failed");
      const data = await response.json();
      
      if (data && data.current) {
        const tempF = Math.round(data.current.temperature_2m);
        const tempC = Math.round((tempF - 32) * 5 / 9);
        const code = data.current.weather_code;
        
        // Map WMO weather codes to lucide icons and text
        let condition = "Partly Cloudy";
        let icon = CloudSun;
        
        if (code === 0) {
          condition = "Clear Sky";
          icon = Sun;
        } else if (code === 1 || code === 2 || code === 3) {
          condition = "Partly Cloudy";
          icon = CloudSun;
        } else if (code === 45 || code === 48) {
          condition = "Foggy";
          icon = Cloud;
        } else if (code >= 51 && code <= 57) {
          condition = "Light Drizzle";
          icon = CloudRain;
        } else if (code >= 61 && code <= 67) {
          condition = "Rainy";
          icon = CloudRain;
        } else if (code >= 71 && code <= 77) {
          condition = "Snowy";
          icon = CloudRain;
        } else if (code >= 80 && code <= 82) {
          condition = "Showers";
          icon = CloudRain;
        } else if (code >= 95 && code <= 99) {
          condition = "Thunderstorm";
          icon = Zap;
        }

        setLiveMedfordWeather({
          city: "Medford",
          region: "Tufts University (Live)",
          tempF,
          tempC,
          condition,
          humidity: Math.round(data.current.relative_humidity_2m),
          windSpeed: Math.round(data.current.wind_speed_10m),
          icon,
          isLive: true
        });
      }
    } catch (err) {
      console.warn("Could not fetch live weather, using static fallback:", err);
      setWeatherError(true);
    } finally {
      setIsWeatherLoading(false);
    }
  };

  useEffect(() => {
    fetchMedfordWeather();
    // Refresh every 5 minutes
    const interval = setInterval(fetchMedfordWeather, 300000);
    return () => clearInterval(interval);
  }, []);

  // Canvas Vector Field Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let width = canvas.width = canvas.offsetWidth;
    let height = canvas.height = canvas.offsetHeight;

    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        width = canvas.width = canvas.offsetWidth;
        height = canvas.height = canvas.offsetHeight;
      }
    });
    resizeObserver.observe(canvas);

    const particleCount = 35;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      color: string;
    }> = [];

    const colors = [
      "rgba(139, 92, 246, 0.4)", // Williams Purple
      "rgba(65, 105, 225, 0.45)", // Tufts/Royal Blue
      "rgba(251, 191, 36, 0.35)"  // Williams Gold
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        color: colors[i % colors.length]
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle vector field background lines
      ctx.strokeStyle = "rgba(139, 92, 246, 0.04)";
      ctx.lineWidth = 0.8;
      const step = 32;
      for (let x = 0; x < width; x += step) {
        for (let y = 0; y < height; y += step) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + 2, y + 2);
          ctx.stroke();
        }
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 70) {
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.15 * (1 - dist / 70)})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      // Draw and update particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        // Mouse warping
        const mdx = mouseRef.current.x - p.x;
        const mdy = mouseRef.current.y - p.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

        if (mdist < mouseRef.current.radius) {
          const force = (mouseRef.current.radius - mdist) / mouseRef.current.radius;
          p.x -= (mdx / mdist) * force * 1.8;
          p.y -= (mdy / mdist) * force * 1.8;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);

  // Handle 3D Parallax Rotation on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    // Mouse relative coordinates from card center (-0.5 to 0.5)
    const mouseX = (e.clientX - rect.left) / width - 0.5;
    const mouseY = (e.clientY - rect.top) / height - 0.5;
    
    // Calculate tilt: max 15 degrees
    setRotateX(-mouseY * 15);
    setRotateY(mouseX * 15);

    // Update particles mouse coords
    mouseRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      radius: 90
    };
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);

    // Clear particles mouse
    mouseRef.current = {
      x: -1000,
      y: -1000,
      radius: 90
    };
  };

  // Time representation calculations
  const getFormattedTime = () => {
    let activeTime = new Date(time);
    if (activeTimeZone === "addis") {
      const utc = time.getTime() + (time.getTimezoneOffset() * 60000);
      activeTime = new Date(utc + (3600000 * 3));
    }
    
    let hours = activeTime.getHours();
    const minutes = activeTime.getMinutes().toString().padStart(2, "0");
    const seconds = activeTime.getSeconds().toString().padStart(2, "0");
    
    if (is24Hour) {
      return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds}`;
    }
    
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours.toString().padStart(2, "0")}:${minutes}:${seconds} ${ampm}`;
  };

  // Get current active weather station (prefer live fetched Medford weather when Medford is active)
  const activeWeather = (weatherIndex === 0 && liveMedfordWeather) 
    ? liveMedfordWeather 
    : STATIC_STATIONS[weatherIndex];
    
  const WeatherIcon = activeWeather.icon;

  return (
    <div className="flex flex-col items-center space-y-4 w-full max-w-[360px]">
      
      {/* 3D PARALLAX CARD WRAPPER */}
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={() => setIsHovered(true)}
        className="relative w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-300 bg-[#08070c] border-2 border-cream-border cursor-default"
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transformStyle: "preserve-3d",
          boxShadow: isHovered 
            ? "0 30px 60px -15px rgba(96, 34, 134, 0.4)" 
            : "0 10px 30px -15px rgba(0,0,0,0.8)"
        }}
      >
        {/* Dynamic Vector Particle Canvas Overlay */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-20 mix-blend-screen opacity-90"
        />
        {/* PORTRAIT VIEWER (REAL PHOTO WITH FALLBACK TO PORTRAIT SVG) */}
        <div 
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          style={{ transform: "translateZ(10px)" }}
        >
          {/* We always render this image in the background, trying to resolve.
              Once it loads successfully, it overlays the fallback SVG with a smooth fade-in. */}
          <img 
            src={IMAGE_CANDIDATES[candidateIndex]} 
            alt="Eyobel Gebre" 
            className="w-full h-full object-cover rounded-[30px] absolute inset-0 z-10 transition-opacity duration-500"
            style={{ opacity: hasImage ? 1 : 0 }}
            onLoad={handleImageLoad}
            onError={handleImageError}
            referrerPolicy="no-referrer"
          />

          <svg
            viewBox="0 0 320 400"
            className="w-full h-full object-cover rounded-[30px]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* Studio Background Gradient */}
              <radialGradient id="studio-bg" cx="50%" cy="40%" r="60%" fx="50%" fy="30%">
                <stop offset="0%" stopColor="#2c243a" />
                <stop offset="50%" stopColor="#12101a" />
                <stop offset="100%" stopColor="#08070c" />
              </radialGradient>

              {/* Skin Tones */}
              <linearGradient id="skin-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#b26d43" />
                <stop offset="60%" stopColor="#96542d" />
                <stop offset="100%" stopColor="#7a3f1d" />
              </linearGradient>
              <linearGradient id="neck-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#7a3f1d" />
                <stop offset="100%" stopColor="#4c220b" />
              </linearGradient>
              <linearGradient id="skin-highlight" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#cc885e" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#cc885e" stopOpacity="0" />
              </linearGradient>

              {/* Suit and Tie Colors */}
              <linearGradient id="suit-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#1b2942" />
                <stop offset="50%" stopColor="#111a2e" />
                <stop offset="100%" stopColor="#090e1a" />
              </linearGradient>
              <linearGradient id="tie-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#4c1d95" />
                <stop offset="100%" stopColor="#2e1065" />
              </linearGradient>

              {/* Drop Shadows */}
              <filter id="subtle-shadow" x="-10%" y="-10%" width="120%" height="120%">
                <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.5" />
              </filter>
            </defs>

            {/* 1. STUDIO BACKGROUND */}
            <rect width="320" height="400" fill="url(#studio-bg)" />

            {/* BOKEH EFFECT - BLURRED STUDIO LIGHTS */}
            <g opacity="0.12">
              <circle cx="60" cy="80" r="45" fill="#fef08a" filter="blur(20px)" />
              <circle cx="270" cy="120" r="55" fill="#a78bfa" filter="blur(25px)" />
              <circle cx="160" cy="280" r="60" fill="#38bdf8" filter="blur(30px)" />
            </g>

            {/* AMBIENT SHADOW BEHIND PORTRAIT */}
            <ellipse cx="160" cy="380" rx="90" ry="25" fill="#000000" opacity="0.6" filter="blur(15px)" />

            {/* 2. HAIR - BACK LAYER SILHOUETTE */}
            <g fill="#0b0a0f">
              {/* Outline curls representing dense afro-curly texture */}
              <circle cx="110" cy="115" r="32" />
              <circle cx="210" cy="115" r="32" />
              <circle cx="125" cy="95" r="35" />
              <circle cx="195" cy="95" r="35" />
              <circle cx="160" cy="85" r="40" />
              {/* Micro-curls on the edge */}
              <circle cx="95" cy="130" r="18" />
              <circle cx="225" cy="130" r="18" />
              <circle cx="90" cy="150" r="12" />
              <circle cx="230" cy="150" r="12" />
            </g>

            {/* 3. EARS */}
            <g fill="url(#skin-grad)">
              {/* Left Ear */}
              <path d="M96 145 c-8 0 -14 6 -14 15 s6 15 14 15 c2 0 4 -2 4 -5 v-20 c0 -3 -2 -5 -4 -5 z" />
              <path d="M94 151 c-4 0 -7 3 -7 8 s3 8 7 8 c1 0 2 -1 2 -3 v-10 c0 -2 -1 -3 -2 -3 z" fill="#7a3f1d" opacity="0.6" />
              {/* Right Ear */}
              <path d="M224 145 c8 0 14 6 14 15 s-6 15 -14 15 c-2 0 -4 -2 -4 -5 v-20 c0 -3 2 -5 4 -5 z" />
              <path d="M226 151 c4 0 7 3 7 8 s-3 8 -7 8 c-1 0 -2 -1 -2 -3 v-10 c0 -2 1 -3 2 -3 z" fill="#7a3f1d" opacity="0.6" />
            </g>

            {/* 4. NECK */}
            <path d="M135 180 v50 c0 15 10 25 25 25 s25 -10 25 -25 v-50 z" fill="url(#neck-grad)" />
            {/* Neck shadow under chin */}
            <path d="M135 180 c10 12 40 12 50 0 v15 c-5 12 -45 12 -50 0 z" fill="#4c220b" opacity="0.75" />

            {/* 5. FACE BASE */}
            <path d="M100 130 c0 -30 20 -45 60 -45 s60 15 60 45 c0 35 -12 60 -60 60 s-60 -25 -60 -60 z" fill="url(#skin-grad)" filter="url(#subtle-shadow)" />
            {/* Cheek highlights for 3D effect */}
            <path d="M108 135 c4 -10 18 -15 25 -10 c4 3 2 12 -4 15 c-8 4 -18 -1 -21 -5 z" fill="url(#skin-highlight)" />
            <path d="M212 135 c-4 -10 -18 -15 -25 -10 c-4 3 -2 12 4 15 c8 4 18 -1 21 -5 z" fill="url(#skin-highlight)" />

            {/* Forehead highlight */}
            <ellipse cx="160" cy="105" rx="30" ry="10" fill="#ffffff" opacity="0.12" />

            {/* 6. CURLY HAIR (FRONT OVERLAY FOR TEXTURE & VOLUME) */}
            <g fill="#0f0e15">
              {/* Forehead hairline curls */}
              <circle cx="110" cy="100" r="16" />
              <circle cx="125" cy="92" r="18" />
              <circle cx="145" cy="88" r="18" />
              <circle cx="160" cy="86" r="18" />
              <circle cx="175" cy="88" r="18" />
              <circle cx="195" cy="92" r="18" />
              <circle cx="210" cy="100" r="16" />
              {/* Inner curly texture curls */}
              <circle cx="115" cy="115" r="14" fill="#14131a" />
              <circle cx="135" cy="105" r="16" fill="#1b1a22" />
              <circle cx="160" cy="100" r="18" fill="#201f2b" />
              <circle cx="185" cy="105" r="16" fill="#1b1a22" />
              <circle cx="205" cy="115" r="14" fill="#14131a" />
              
              {/* Micro curls for detailed look */}
              <circle cx="102" cy="110" r="8" fill="#08080c" />
              <circle cx="110" cy="125" r="7" fill="#08080c" />
              <circle cx="210" cy="125" r="7" fill="#08080c" />
              <circle cx="218" cy="110" r="8" fill="#08080c" />
            </g>

            {/* 7. EYEBROWS */}
            <path d="M115 124 c5 -4 14 -4 18 -1 c2 2 -1 4 -3 3 c-4 -2 -11 -2 -14 1 c-2 2 -3 -1 -1 -3 z" fill="#120e0c" />
            <path d="M205 124 c-5 -4 -14 -4 -18 -1 c-2 2 1 4 3 3 c4 -2 11 -2 14 1 c2 2 3 -1 1 -3 z" fill="#120e0c" />

            {/* 8. EYES */}
            <g>
              {/* Left Eye Sclera */}
              <path d="M120 131 c4 -3 10 -3 14 0 c1 1 -1 3 -2 2 c-3 -2 -8 -2 -10 0 c-1 1 -3 -1 -2 -2 z" fill="#ffffff" />
              <ellipse cx="127" cy="131" rx="5.5" ry="4" fill="#ffffff" />
              <circle cx="127" cy="131" r="3.2" fill="#4d2916" /> {/* Brown Iris */}
              <circle cx="127" cy="131" r="1.8" fill="#08080a" /> {/* Pupil */}
              <circle cx="128.2" cy="129.8" r="0.8" fill="#ffffff" /> {/* Eye Catchlight */}

              {/* Right Eye Sclera */}
              <path d="M200 131 c-4 -3 -10 -3 -14 0 c-1 1 1 3 2 2 c3 -2 8 -2 10 0 c1 1 3 -1 2 -2 z" fill="#ffffff" />
              <ellipse cx="193" cy="131" rx="5.5" ry="4" fill="#ffffff" />
              <circle cx="193" cy="131" r="3.2" fill="#4d2916" /> {/* Brown Iris */}
              <circle cx="193" cy="131" r="1.8" fill="#08080a" /> {/* Pupil */}
              <circle cx="194.2" cy="129.8" r="0.8" fill="#ffffff" /> {/* Eye Catchlight */}
            </g>

            {/* 9. NOSE */}
            <path d="M157 122 h6 v18 c0 3 -2 5 -5 5 s-5 -2 -5 -5 z" fill="#7a3f1d" opacity="0.3" />
            <path d="M153 140 c1 -2 4 -3 7 -3 s6 1 7 3 c1 2 -1 3 -2 2 c-1 -1 -3 -2 -5 -2 s-4 1 -5 2 c-1 1 -3 -1 -2 -2 z" fill="#7a3f1d" />
            <ellipse cx="160" cy="138" rx="2" ry="1.2" fill="#cc885e" opacity="0.6" /> {/* Nose tip highlight */}

            {/* 10. MUSTACHE & GOATEE (FACIAL HAIR) */}
            <g fill="#141217">
              {/* Mustache */}
              <path d="M142 149 c5 -2 11 -1 18 -1 s13 -1 18 1 c2 1 -1 3 -3 2 c-4 -2 -10 -1 -15 -1 s-11 -1 -15 1 c-2 1 -5 -1 -3 -2 z" />
              {/* Stubble goatee on chin */}
              <path d="M136 172 c4 8 12 13 24 13 s20 -5 24 -13 c1 -1 -1 -2 -2 -1 c-4 5 -11 9 -22 9 s-18 -4 -22 -9 c-1 -1 -2 0 -2 1 z" opacity="0.85" />
              <path d="M157 156 h6 v15 h-6 z" opacity="0.85" /> {/* Soul patch */}
            </g>

            {/* 11. SMILE & TEETH */}
            <g>
              {/* Lip background */}
              <path d="M138 152 c6 8 38 8 44 0 c1 -1 -1 -3 -3 -2 c-5 4 -33 4 -38 0 c-2 -1 -4 1 -3 2 z" fill="#803d35" />
              {/* Open friendly mouth cavity */}
              <path d="M140 153 c4 12 36 12 40 0 z" fill="#45110d" />
              {/* Brilliant white teeth */}
              <path d="M142 153 c3 4 33 4 36 0 v3 c-3 1 -33 1 -36 0 z" fill="#ffffff" />
              {/* Lower Lip outline */}
              <path d="M140 154 c4 13 36 13 40 0 c1 2 -1 4 -3 4 c-5 3 -31 3 -34 0 c-2 0 -4 -2 -3 -4 z" fill="#994a40" />
            </g>

            {/* 12. CLOTHING: SHARP NAVY SUIT, WHITE SHIRT & STRIPED TIE */}
            <g>
              {/* White Shirt collar base */}
              <path d="M125 220 L195 220 L160 260 Z" fill="#ffffff" />
              
              {/* Crisp White Collars */}
              <path d="M125 210 L146 235 L142 210 Z" fill="#f1f5f9" />
              <path d="M195 210 L174 235 L178 210 Z" fill="#f1f5f9" />
              <path d="M130 210 L152 238 L147 210 Z" fill="#ffffff" />
              <path d="M190 210 L168 238 L173 210 Z" fill="#ffffff" />

              {/* Elegant Diagonal Striped Tie (Purple & Gold) */}
              <g id="silk-tie">
                {/* Tie Knot */}
                <path d="M151 216 L169 216 L164 234 L156 234 Z" fill="url(#tie-grad)" filter="url(#subtle-shadow)" />
                {/* Knot stripes */}
                <path d="M152 220 L162 224 L161 228 L152 224 Z" fill="#eab308" />
                <path d="M154 228 L164 232 L163 234 L155 231 Z" fill="#eab308" />

                {/* Main Tie Body */}
                <path d="M155 234 L165 234 L174 340 L160 355 L146 340 Z" fill="url(#tie-grad)" filter="url(#subtle-shadow)" />
                
                {/* Precision Diagonal Gold Stripes */}
                <path d="M155 244 L169 252 L168 257 L155 249 Z" fill="#eab308" />
                <path d="M154 260 L171 270 L170 275 L153 265 Z" fill="#eab308" />
                <path d="M152 277 L173 290 L171 295 L151 283 Z" fill="#eab308" />
                <path d="M150 295 L174 310 L172 315 L149 301 Z" fill="#eab308" />
                <path d="M148 314 L174 330 L171 335 L147 319 Z" fill="#eab308" />
                <path d="M147 332 L168 346 L165 350 L146 336 Z" fill="#eab308" />
              </g>

              {/* Navy Blue Suit Jacket shoulders */}
              <path d="M20 400 C20 310, 80 230, 125 215 L195 215 C240 230, 300 310, 300 400 Z" fill="url(#suit-grad)" filter="url(#subtle-shadow)" />
              
              {/* Suit Lapels & Stitches */}
              {/* Left Lapel */}
              <path d="M125 215 L100 290 L135 345 L146 400 L120 400 L70 310 Z" fill="#0f1624" />
              <path d="M125 215 L100 290 L135 345 L142 400 L144 400 L137 344 L102 289 Z" fill="#1b2942" />
              {/* Right Lapel */}
              <path d="M195 215 L220 290 L185 345 L174 400 L200 400 L250 310 Z" fill="#0f1624" />
              <path d="M195 215 L220 290 L185 345 L178 400 L176 400 L183 344 L218 289 Z" fill="#1b2942" />

              {/* Dark V-opening shadow */}
              <path d="M125 215 L160 265 L195 215 L180 215 L160 245 L140 215 Z" fill="#0b0f1a" opacity="0.4" />
            </g>
          </svg>
        </div>

        {/* 3. LAYER: OVERLAYS AND CONTROLS (HUD) */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 pointer-events-auto">
          
          {/* Top HUD Row: Time and Weather widgets */}
          <div className="flex justify-between items-start space-x-2">
            
            {/* TIME HUD WIDGET */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setActiveTimeZone(prev => prev === "local" ? "addis" : "local");
              }}
              className="bg-black/75 hover:bg-black/90 border border-white/10 hover:border-zinc-500/40 rounded-xl p-2.5 transition-all cursor-pointer shadow-md select-none w-[48%]"
              style={{ transform: "translateZ(30px)" }}
              title="Click to toggle Local vs. Addis Ababa time!"
            >
              <div className="flex items-center space-x-1.5 text-[8px] font-mono text-zinc-400 font-semibold mb-1">
                <Clock className="w-3 h-3 text-zinc-400 animate-pulse" />
                <span>{activeTimeZone === "local" ? "MEDFORD (LOCAL)" : "ADDIS ABABA"}</span>
              </div>
              <div className="font-mono text-xs font-bold text-white tracking-tight leading-none tabular-nums mb-1">
                {getFormattedTime()}
              </div>
              <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500">
                <span>{time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="text-[6px] text-zinc-300 bg-zinc-800/60 border border-zinc-700/50 px-1 rounded">
                  {activeTimeZone === "local" ? "EDT" : "EAT"}
                </span>
              </div>
            </div>

            {/* WEATHER HUD WIDGET */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                // Cycle weather stations
                setWeatherIndex(prev => (prev + 1) % STATIC_STATIONS.length);
              }}
              className="bg-black/75 hover:bg-black/90 border border-white/10 hover:border-[#00e5a3]/40 rounded-xl p-2.5 transition-all cursor-pointer shadow-md select-none w-[48%] relative overflow-hidden"
              style={{ transform: "translateZ(30px)" }}
              title="Click to switch weather stations!"
            >
              <div className="flex items-center justify-between text-[8px] font-mono text-zinc-400 font-semibold mb-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-2.5 h-2.5 text-[#00e5a3]" />
                  <span className="truncate max-w-[55px] uppercase">{activeWeather.city}</span>
                </div>
                {isWeatherLoading ? (
                  <RefreshCw className="w-3 h-3 text-[#00e5a3] animate-spin" />
                ) : (
                  <WeatherIcon className="w-3.5 h-3.5 text-zinc-400" />
                )}
              </div>
              
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-xs font-bold text-white leading-none">
                  {isFahrenheit ? `${activeWeather.tempF}°F` : `${activeWeather.tempC}°C`}
                </span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsFahrenheit(!isFahrenheit);
                  }}
                  className="text-[7px] font-mono font-bold text-zinc-400 hover:text-white px-1 py-0.25 bg-white/5 rounded cursor-pointer"
                  title="Toggle F/C"
                >
                  {isFahrenheit ? "°C" : "°F"}
                </span>
              </div>

              <div className="flex justify-between items-center text-[6px] font-mono text-zinc-500 mt-1">
                <span className="truncate max-w-[65px]">{activeWeather.condition}</span>
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowWeatherDetails(!showWeatherDetails);
                  }}
                  className="text-[#00e5a3] underline cursor-pointer"
                  >
                  {showWeatherDetails ? "hide" : "details"}
                </span>
              </div>

              {/* Collapsible Weather Details overlay inside widget */}
              {showWeatherDetails && (
                <div className="absolute inset-0 bg-black/95 flex flex-col justify-center p-2 text-[7px] font-mono text-zinc-300">
                  <div className="font-bold text-[#00e5a3] border-b border-white/10 pb-0.5 mb-1 text-center truncate">
                    {activeWeather.region}
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-0.5"><Droplets className="w-2.5 h-2.5 text-blue-400" /> Humid: {activeWeather.humidity}%</span>
                    <span className="flex items-center gap-0.5"><Wind className="w-2.5 h-2.5 text-emerald-400" /> Wind: {activeWeather.windSpeed} mph</span>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowWeatherDetails(false);
                    }}
                    className="mt-1 bg-[#00e5a3]/10 text-[#00e5a3] font-bold py-0.5 rounded text-center text-[6px]"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* Spacer for artwork focus */}
          <div className="flex-1 pointer-events-none" />

          {/* Floating Tag at the bottom of portrait */}
          <div
            className="bg-black/80 border border-white/10 px-4 py-2 rounded-2xl flex justify-between items-center backdrop-blur-sm hover:border-[#00e5a3]/30 transition-all"
            style={{ transform: "translateZ(40px)" }}
          >
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-pulse" />
              <span className="font-mono text-[9px] font-bold text-white uppercase tracking-widest">
                Eyobel Gebre
              </span>
            </div>
            <span className="font-mono text-[8px] text-zinc-400 font-bold">
              PORTFOLIO_CORE
            </span>
          </div>

        </div>

      </div>

      {/* Photo upload helper hint (only shown when the fallback SVG is active) */}
      {!hasImage && (
        <div className="bg-zinc-200/50 dark:bg-white/5 border border-zinc-300 dark:border-white/10 p-3 rounded-2xl text-center max-w-[340px]">
          <p className="text-[10px] font-mono text-zinc-600 dark:text-zinc-300 leading-relaxed">
            💡 <span className="font-semibold text-zinc-700 dark:text-zinc-200">Want your real photo here permanently?</span> Just upload your image (named <code className="bg-zinc-200 dark:bg-black/40 px-1.5 py-0.5 rounded text-zinc-800 dark:text-white font-bold">eyobel.jpg</code>) into the <code className="bg-zinc-200 dark:bg-black/40 px-1.5 py-0.5 rounded text-zinc-800 dark:text-white font-bold">public</code> folder. It will instantly replace this graphic!
          </p>
        </div>
      )}

    </div>
  );
}
