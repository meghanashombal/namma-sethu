import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import {
  Filter,
  MapPin,
  Flame,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  ChevronRight,
  Eye,
  ThumbsUp,
  X,
} from 'lucide-react';
import { Complaint, CivicHotspot } from '../types';
import { StorageService } from '../services/storage';
import { getHaversineDistance } from '../services/routingEngine';
import { Language, translations } from '../data/translations';

interface ProblemsNearMeViewProps {
  complaints: Complaint[];
  language: Language;
  onNavigateToDetail: (id: string) => void;
  onRefreshComplaints: () => void;
}

export const ProblemsNearMeView: React.FC<ProblemsNearMeViewProps> = ({
  complaints,
  language,
  onNavigateToDetail,
  onRefreshComplaints,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedDistance, setSelectedDistance] = useState<string>('All');
  const [selectedPriority, setSelectedPriority] = useState<string>('All');
  const [showHotspots, setShowHotspots] = useState<boolean>(true);

  // Selected complaint preview card
  const [activeComplaint, setActiveComplaint] = useState<Complaint | null>(null);

  const t = translations[language];
  const hotspots = StorageService.getHotspots();

  // Center of Mysuru
  const MYSURU_CENTER: [number, number] = [12.3051, 76.6551];

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: MYSURU_CENTER,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors | Namma Sethu Mysuru',
        maxZoom: 18,
      }).addTo(map);

      const markersLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      // Don't necessarily destroy on simple rerenders, but clean up markers
    };
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory !== 'All' && c.category !== selectedCategory) return false;
    if (selectedStatus !== 'All' && c.status !== selectedStatus) return false;
    if (selectedPriority !== 'All' && c.priority !== selectedPriority) return false;

    if (selectedDistance !== 'All') {
      const maxMeters = parseInt(selectedDistance) * 1000;
      const dist = getHaversineDistance(MYSURU_CENTER[0], MYSURU_CENTER[1], c.lat, c.lng);
      if (dist > maxMeters) return false;
    }

    return true;
  });

  // Render markers whenever filters or hotspots toggle
  useEffect(() => {
    if (!markersLayerRef.current || !mapInstanceRef.current) return;

    markersLayerRef.current.clearLayers();

    // 1. Render Hotspots if enabled
    if (showHotspots) {
      hotspots.forEach((spot) => {
        const circle = L.circle([spot.lat, spot.lng], {
          color: '#DC2626',
          fillColor: '#EF4444',
          fillOpacity: 0.2,
          radius: spot.radiusMeters,
          weight: 2,
        });

        circle.bindTooltip(
          `<div class="p-1 text-xs"><strong>🔥 Hotspot:</strong> ${spot.reason} (${spot.complaintCount} reports)</div>`,
          { permanent: false }
        );

        circle.addTo(markersLayerRef.current!);
      });
    }

    // 2. Render Complaint Pins using custom HTML divIcons
    filteredComplaints.forEach((c) => {
      let pinColor = '#2563EB'; // Blue (Routed/Acknowledged)
      if (c.status === 'Resolved' || c.status === 'Closed') {
        pinColor = '#16A34A'; // Green
      } else if (c.status === 'In Progress' || c.status === 'Assigned') {
        pinColor = '#D97706'; // Amber/Orange
      } else if (
        c.status === 'SLA Breached' ||
        c.status === 'Escalated' ||
        c.priority === 'High' ||
        c.isUrgentSafety
      ) {
        pinColor = '#DC2626'; // Red
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-pin',
        html: `
          <div style="
            background-color: ${pinColor};
            width: 28px;
            height: 28px;
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 11px;
            font-weight: bold;
            cursor: pointer;
            transition: transform 0.15s ease;
          ">
            ${c.id.slice(-2)}
          </div>
        `,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker([c.lat, c.lng], { icon: customIcon });

      marker.on('click', () => {
        setActiveComplaint(c);
      });

      marker.addTo(markersLayerRef.current!);
    });
  }, [filteredComplaints, showHotspots, hotspots]);

  const handleConfirmProblem = (complaintId: string) => {
    StorageService.addCommunityConfirmation(complaintId, 'anon-citizen', true);
    onRefreshComplaints();
    const updated = StorageService.getComplaintById(complaintId);
    if (updated) setActiveComplaint(updated);
  };

  return (
    <div className="space-y-4 pb-24 max-w-6xl mx-auto">
      {/* Header & Hotspot Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#087F5B]" />
            <span>{t.problemsNearMe}</span>
          </h1>
          <p className="text-xs text-slate-500">
            Official geotagged complaint layer across Mysuru City Corporation & TMCs.
          </p>
        </div>

        {/* Hotspot Toggle Button */}
        <button
          id="toggle-hotspots-btn"
          onClick={() => setShowHotspots(!showHotspots)}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            showHotspots
              ? 'bg-rose-600 text-white shadow-md'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Flame className="w-4 h-4" />
          <span>{showHotspots ? '🔥 Hotspots Active (3+ nearby)' : 'Show Civic Hotspots'}</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-2 text-xs">
        {/* Category filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Pothole / Road Damage">Potholes & Roads</option>
            <option value="Garbage Overflow">Garbage Overflow</option>
            <option value="Blocked Drain">Blocked Drains</option>
            <option value="Streetlight Problem">Streetlights</option>
            <option value="Water Issue">Drinking Water</option>
            <option value="Construction Waste">Construction Waste</option>
          </select>
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="All">All Statuses</option>
            <option value="Routed">Routed</option>
            <option value="In Progress">In Progress</option>
            <option value="Awaiting Verification">Awaiting Verification</option>
            <option value="Resolved">Resolved</option>
            <option value="SLA Breached">SLA Breached</option>
            <option value="Escalated">Escalated</option>
          </select>
        </div>

        {/* Distance filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Distance:</span>
          <select
            value={selectedDistance}
            onChange={(e) => setSelectedDistance(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="All">All Mysore</option>
            <option value="1">Within 1 km</option>
            <option value="3">Within 3 km</option>
            <option value="5">Within 5 km</option>
          </select>
        </div>

        {/* Priority filter */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 font-semibold">Priority:</span>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="p-1.5 rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Normal">Normal</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Emergency">Emergency</option>
          </select>
        </div>

        <span className="ml-auto text-slate-400 text-[11px] font-bold">
          Showing {filteredComplaints.length} issues on map
        </span>
      </div>

      {/* Map Canvas Container */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-200 shadow-md h-[550px] bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Legend Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-2xl shadow-lg border border-slate-200 text-[11px] space-y-1.5">
          <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
            Map Legend
          </p>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-600" />
            <span className="text-slate-600 font-medium">SLA Breached / High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500" />
            <span className="text-slate-600 font-medium">In Progress / Assigned</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-slate-600 font-medium">Routed / Verified Desk</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-600" />
            <span className="text-slate-600 font-medium">Resolved / Closed</span>
          </div>
        </div>

        {/* Selected Complaint Floating Preview Card (Safe details only!) */}
        {activeComplaint && (
          <div className="absolute top-4 right-4 z-20 max-w-sm w-full bg-white rounded-2xl shadow-2xl border border-slate-200 p-4 animate-in fade-in slide-in-from-right-2 duration-150 space-y-2.5">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-[#087F5B] bg-emerald-50 px-2 py-0.5 rounded">
                  #{activeComplaint.id}
                </span>
                <span className="ml-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {activeComplaint.status}
                </span>
              </div>
              <button
                onClick={() => setActiveComplaint(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div>
              <h4 className="font-bold text-sm text-slate-900">{activeComplaint.category}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 mt-0.5">
                {activeComplaint.description}
              </p>
            </div>

            <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex justify-between">
                <span>Approx. Location:</span>
                <strong className="text-slate-800">{activeComplaint.locationName}</strong>
              </div>
              <div className="flex justify-between">
                <span>Responsible Dept:</span>
                <strong className="text-[#087F5B]">{activeComplaint.routingDecision.department}</strong>
              </div>
              <div className="flex justify-between">
                <span>Community Confirms:</span>
                <strong className="text-slate-800">{activeComplaint.confirmationsCount || 1}</strong>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic">
              🔒 Privacy Protected: Citizen personal identity is redacted from public maps.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => handleConfirmProblem(activeComplaint.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#087F5B] font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Confirm (+1)</span>
              </button>

              <button
                onClick={() => onNavigateToDetail(activeComplaint.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#087F5B] hover:bg-[#066347] text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
              >
                <span>View Safe Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
