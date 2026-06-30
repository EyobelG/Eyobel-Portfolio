import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Clock, Cloud, Sun, CloudRain, CloudSun, 
  UploadCloud, Trash2, MapPin, Wind, Droplets, 
  Lock, ShieldCheck, RefreshCw, Zap
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
  // Profile Photo State with local persistence
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem("eyobel_profile_photo") || null;
  });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Owner Authentication State
  const [isOwnerVerified, setIsOwnerVerified] = useState<boolean>(() => {
    return sessionStorage.getItem("eyobel_owner_verified") === "true";
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [verifyPasscode, setVerifyPasscode] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  // Hover & 3D Parallax position
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

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
      console.error("Error fetching live weather for Medford:", err);
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
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setIsHovered(false);
  };

  // Owner Passcode Verification
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = verifyEmail.trim().toLowerCase();
    const cleanPass = verifyPasscode.trim();

    const isEmailValid = cleanEmail === "eyobelassefa@gmail.com" || cleanEmail === "eyobel" || cleanEmail === "eyobelassefa";
    const isPassValid = ["eyobel", "tufts2026", "williams", "williams2022"].includes(cleanPass.toLowerCase());

    if (!cleanEmail || !cleanPass) {
      setVerifyError("Please enter both email and passcode.");
      return;
    }

    if (isEmailValid && isPassValid) {
      sessionStorage.setItem("eyobel_owner_verified", "true");
      setIsOwnerVerified(true);
      setShowVerifyModal(false);
      setVerifyEmail("");
      setVerifyPasscode("");
      setVerifyError("");
      
      if (pendingFile) {
        processImage(pendingFile);
        setPendingFile(null);
      } else {
        setTimeout(() => {
          fileInputRef.current?.click();
        }, 150);
      }
    } else {
      if (!isEmailValid) {
        setVerifyError("Invalid owner email or username.");
      } else {
        setVerifyError("Incorrect passcode.");
      }
    }
  };

  // Image Upload Logic
  const processImage = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setProfileImage(base64String);
      localStorage.setItem("eyobel_profile_photo", base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (isOwnerVerified) {
        processImage(file);
      } else {
        setPendingFile(file);
        setShowVerifyModal(true);
        setVerifyError("");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (isOwnerVerified) {
        processImage(file);
      } else {
        setPendingFile(file);
        setShowVerifyModal(true);
        setVerifyError("");
      }
    }
  };

  const handleUploadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOwnerVerified) {
      fileInputRef.current?.click();
    } else {
      setPendingFile(null);
      setShowVerifyModal(true);
      setVerifyError("");
    }
  };

  const handleClearPhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isOwnerVerified) {
      setShowVerifyModal(true);
      setVerifyError("");
      return;
    }
    if (confirm("Reset profile photo to default vector illustration?")) {
      setProfileImage(null);
      localStorage.removeItem("eyobel_profile_photo");
    }
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
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative w-full aspect-[4/5] rounded-[32px] overflow-hidden shadow-2xl transition-all duration-300 bg-black/40 border-2 ${
          isDragging ? "border-[#00e5a3]" : "border-white/10"
        } cursor-default`}
        style={{
          transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
          transformStyle: "preserve-3d",
          boxShadow: isHovered 
            ? "0 30px 60px -15px rgba(96, 34, 134, 0.4)" 
            : "0 10px 30px -15px rgba(0,0,0,0.8)"
        }}
      >
        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Dynamic Background Gradients */}
        <div className="absolute inset-0 transition-opacity duration-700 bg-gradient-to-tr from-black via-[#0d0a14] to-[#12141f]" />

        {/* Ambient radial glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,#330066,transparent_60%)] opacity-35" />

        {/* 1. LAYER: TECHNICAL ACCENTS (GRID) */}
        <div 
          className="absolute inset-0 opacity-15 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none"
          style={{ transform: "translateZ(-40px)" }}
        />

        {/* 2. LAYER: PORTRAIT VIEWER */}
        <div 
          className="absolute inset-0 flex items-center justify-center select-none pointer-events-none"
          style={{ transform: "translateZ(10px)" }}
        >
          {profileImage ? (
            // Real User Face Image
            <div className="relative w-full h-full flex items-center justify-center">
              <img 
                src={profileImage} 
                alt="Eyobel profile" 
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-[30px]" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 rounded-[30px]" />
            </div>
          ) : (
            // Stylized SVG Face representation (original face vector)
            <div className="w-full h-full flex items-end justify-center pt-8">
              <svg
                viewBox="0 0 200 240"
                className="w-[88%] h-[88%] object-contain mt-auto"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background Halo */}
                <circle cx="100" cy="110" r="75" className="fill-white/5 stroke-white/5" strokeWidth="1" />
                <circle cx="100" cy="110" r="55" className="fill-white/5" />

                {/* SUIT JACKET (Navy Blue) */}
                <path
                  d="M35 240 C35 200, 60 185, 80 180 L120 180 C140 185, 165 200, 165 240 Z"
                  fill="#1e293b"
                />
                {/* Suit Lapels */}
                <path d="M55 240 L80 185 L90 205 L65 240 Z" fill="#0f172a" />
                <path d="M145 240 L120 185 L110 205 L135 240 Z" fill="#0f172a" />

                {/* WHITE SHIRT */}
                <path d="M80 180 L120 180 L100 220 Z" fill="#ffffff" />
                <path d="M80 180 L90 195 L100 180 Z" fill="#e2e8f0" />
                <path d="M120 180 L110 195 L100 180 Z" fill="#e2e8f0" />

                {/* STRIPED TIE (Williams Purple and Gold) */}
                <g id="striped-tie">
                  <path d="M96 182 L104 182 L108 240 L92 240 Z" fill="#330066" />
                  <path d="M96 190 L104 195 L104 200 L95 195 Z" fill="#ffcc00" />
                  <path d="M95 205 L105 212 L106 217 L94 210 Z" fill="#ffcc00" />
                  <path d="M93 222 L107 231 L108 236 L92 227 Z" fill="#ffcc00" />
                </g>

                {/* NECK */}
                <path d="M85 145 C85 145, 85 185, 100 185 C115 185, 115 145, 115 145 Z" fill="#a16244" />
                <path d="M85 170 C92 182, 108 182, 115 170 Z" fill="#78350f" opacity="0.3" />

                {/* HEAD & FACE */}
                <path
                  d="M68 115 C68 80, 80 75, 100 75 C120 75, 132 80, 132 115 C132 150, 120 155, 100 155 C80 155, 68 150, 68 115 Z"
                  fill="#b45309"
                />

                {/* CURLY HAIR */}
                <g id="curly-hair">
                  <path d="M64 110 C62 90, 70 65, 100 65 C130 65, 138 90, 136 110 C128 105, 115 95, 100 95 C85 95, 72 105, 64 110 Z" fill="#17110d" />
                  <circle cx="70" cy="95" r="10" fill="#110c0a" />
                  <circle cx="82" cy="80" r="12" fill="#17110d" />
                  <circle cx="100" cy="73" r="13" fill="#1c1512" />
                  <circle cx="118" cy="80" r="12" fill="#17110d" />
                  <circle cx="130" cy="95" r="10" fill="#110c0a" />
                  
                  <circle cx="78" cy="100" r="8" fill="#17110d" />
                  <circle cx="90" cy="85" r="10" fill="#1c1512" />
                  <circle cx="110" cy="85" r="10" fill="#17110d" />
                  <circle cx="122" cy="100" r="8" fill="#1c1512" />
                </g>

                {/* EARS */}
                <circle cx="67" cy="118" r="6" fill="#b45309" />
                <circle cx="133" cy="118" r="6" fill="#b45309" />

                {/* EYES & BROWS */}
                <g id="eyebrows">
                  <path d="M78 105 C83 102, 88 103, 91 106" stroke="#17110d" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M122 105 C117 102, 112 103, 109 106" stroke="#17110d" strokeWidth="2.5" strokeLinecap="round" />
                </g>
                <g id="eyes">
                  <ellipse cx="85" cy="111" rx="4.5" ry="3" fill="#ffffff" />
                  <circle cx="85" cy="111" r="2" fill="#451a03" />
                  <ellipse cx="115" cy="111" rx="4.5" ry="3" fill="#ffffff" />
                  <circle cx="115" cy="111" r="2" fill="#451a03" />
                </g>

                {/* NOSE */}
                <path d="M100 110 L97 125 L103 125 Z" fill="#92400e" opacity="0.4" />
                <path d="M96 125 C98 127, 102 127, 104 125" stroke="#78350f" strokeWidth="1.5" strokeLinecap="round" />

                {/* BEARD & GOATEE */}
                <g id="beard-goatee">
                  <path d="M88 131 C94 128, 106 128, 112 131 C109 133, 91 133, 88 131 Z" fill="#17110d" />
                  <path d="M68 122 C68 145, 80 157, 100 157 C120 157, 132 145, 132 122 C132 122, 127 150, 100 150 C73 150, 68 122, 68 122 Z" fill="#110c0a" opacity="0.8" />
                  <rect x="96" y="138" width="8" height="18" rx="2" fill="#17110d" />
                  <circle cx="100" cy="151" r="9" fill="#110c0a" />
                </g>

                {/* SMILE */}
                <path d="M88 134 C92 141, 108 141, 112 134" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
                <path d="M88 134 C92 141, 108 141, 112 134 Z" fill="#ffffff" />
                <path d="M86 134 C91 131, 109 131, 114 134" stroke="#78350f" strokeWidth="1" />
              </svg>
            </div>
          )}
        </div>

        {/* 3. LAYER: OVERLAYS AND CONTROLS */}
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 pointer-events-auto">
          
          {/* Top HUD Row: Time and Weather widgets */}
          <div className="flex justify-between items-start space-x-2">
            
            {/* TIME HUD WIDGET */}
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setActiveTimeZone(prev => prev === "local" ? "addis" : "local");
              }}
              className="bg-black/75 hover:bg-black/90 border border-white/10 hover:border-williams-gold/40 rounded-xl p-2.5 transition-all cursor-pointer shadow-md select-none w-[48%]"
              style={{ transform: "translateZ(30px)" }}
              title="Click to toggle Local vs. Addis Ababa time!"
            >
              <div className="flex items-center space-x-1.5 text-[8px] font-mono text-zinc-400 font-semibold mb-1">
                <Clock className="w-3 h-3 text-williams-gold animate-pulse" />
                <span>{activeTimeZone === "local" ? "MEDFORD (LOCAL)" : "ADDIS ABABA"}</span>
              </div>
              <div className="font-mono text-xs font-bold text-white tracking-tight leading-none tabular-nums mb-1">
                {getFormattedTime()}
              </div>
              <div className="flex justify-between items-center text-[7px] font-mono text-zinc-500">
                <span>{time.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                <span className="text-[6px] text-williams-gold bg-williams-purple/30 px-1 rounded">
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
                  <WeatherIcon className="w-3.5 h-3.5 text-williams-gold" />
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

          {/* Middle Drag & Drop Indicator / Replace controls */}
          <div className="flex flex-col items-center justify-center flex-1 my-4">
            {isDragging ? (
              <div className="bg-[#00e5a3]/90 border-2 border-dashed border-white text-black p-4 rounded-2xl flex flex-col items-center space-y-1 shadow-2xl animate-pulse">
                <UploadCloud className="w-10 h-10" />
                <span className="font-mono text-xs font-bold">Drop Photo here!</span>
              </div>
            ) : (
              <div 
                className={`group/btn flex flex-col items-center space-y-2 p-4 transition-all duration-300 rounded-2xl ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
              >
                <button
                  onClick={handleUploadClick}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-black/80 hover:bg-williams-purple border border-white/25 hover:border-williams-gold text-white hover:text-williams-gold rounded-full text-[9px] font-mono font-bold tracking-wider uppercase transition-all shadow-lg cursor-pointer animate-none"
                  title="Click or Drag & Drop to load your face photo!"
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>{profileImage ? "Replace Photo" : "Upload Face Photo"}</span>
                </button>

                {profileImage && (
                  <button
                    onClick={handleClearPhoto}
                    className="flex items-center space-x-1 px-2.5 py-1 bg-black/80 hover:bg-red-900 border border-red-500/20 text-red-400 hover:text-white rounded-full text-[8px] font-mono uppercase tracking-wider transition-all shadow-md cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Use Vector Fallback</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Floating Tag at the bottom of portrait */}
          <div
            className="bg-black/80 border border-white/10 px-4 py-2 rounded-2xl flex justify-between items-center backdrop-blur-sm hover:border-[#00e5a3]/30 transition-all"
            style={{ transform: "translateZ(40px)" }}
          >
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e5a3] animate-pulse" />
              <span className="font-mono text-[9px] font-bold text-white uppercase tracking-widest">
                {profileImage ? "Interactive Photo Module" : "Vector Avatar fallback"}
              </span>
            </div>
            <span className="font-mono text-[8px] text-[#00e5a3] font-bold">
              {profileImage ? "LOCAL_PERSIST" : "SVG_CORE"}
            </span>
          </div>

        </div>

      </div>

      {/* Owner Verification Modal */}
      <AnimatePresence>
        {showVerifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => {
              setShowVerifyModal(false);
              setPendingFile(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-zinc-950 border border-white/10 rounded-3xl p-6 w-full max-w-sm shadow-2xl relative overflow-hidden font-sans text-left"
            >
              {/* Top ambient glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-williams-purple/25 rounded-full blur-[40px] pointer-events-none" />

              <div className="flex items-center space-x-3 mb-4 relative z-10">
                <div className="p-2.5 bg-williams-purple/20 border border-williams-purple/30 rounded-2xl text-williams-gold">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-base tracking-tight">Owner Verification</h3>
                  <p className="text-[10px] text-williams-gold font-mono uppercase tracking-wider font-bold">Security Portal</p>
                </div>
              </div>

              <p className="text-zinc-400 text-xs leading-relaxed mb-5 relative z-10">
                To prevent unauthorized profile changes, photo uploading is restricted to the portfolio owner (<span className="text-white font-semibold">Eyobel Assefa</span>).
              </p>

              <form onSubmit={handleVerify} className="space-y-4 relative z-10">
                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">
                    Owner Email / Username
                  </label>
                  <input
                    type="text"
                    value={verifyEmail}
                    onChange={(e) => setVerifyEmail(e.target.value)}
                    placeholder="e.g. eyobelassefa@gmail.com"
                    autoFocus
                    className="w-full bg-black/60 border border-white/10 focus:border-williams-gold focus:ring-1 focus:ring-williams-gold rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all font-mono"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[9px] uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">
                    Security Passcode
                  </label>
                  <input
                    type="password"
                    value={verifyPasscode}
                    onChange={(e) => setVerifyPasscode(e.target.value)}
                    placeholder="Enter owner passcode"
                    className="w-full bg-black/60 border border-white/10 focus:border-williams-gold focus:ring-1 focus:ring-williams-gold rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 outline-none transition-all font-mono"
                  />
                  <p className="text-[9px] text-zinc-500 mt-1.5 font-mono leading-normal">
                    Hint: Williams/Tufts related word or standard nickname (e.g., <span className="text-zinc-400 font-bold">eyobel</span>)
                  </p>
                </div>

                {verifyError && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-[10px] font-mono leading-relaxed bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-xl"
                  >
                    {verifyError}
                  </motion.div>
                )}

                <div className="flex space-x-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowVerifyModal(false);
                      setPendingFile(null);
                    }}
                    className="flex-1 py-2 bg-white/5 hover:bg-white/10 text-zinc-300 font-semibold rounded-xl text-xs transition-all border border-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-williams-purple hover:bg-[#430080] text-williams-gold font-bold rounded-xl text-xs transition-all border border-williams-gold/20 shadow-md flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verify
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
