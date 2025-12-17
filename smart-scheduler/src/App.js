import React, { useState, useMemo, useEffect } from 'react';
import { MapPin, Clock, AlertCircle, ChevronDown, Zap, Route } from 'lucide-react';

// Load Leaflet library
const loadLeaflet = () => {
  if (window.L) return Promise.resolve();
  
  return Promise.all([
    new Promise(resolve => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css';
      document.head.appendChild(link);
      resolve();
    }),
    new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js';
      script.onload = resolve;
      document.head.appendChild(script);
    })
  ]);
};

// Virginia Tech Campus locations with real coordinates (latitude, longitude)
const LOCATIONS = {
  'Torgersen Hall': { lat: 37.2289, lng: -80.4232, color: '#3b82f6' },
  'Blacksburg Building': { lat: 37.2295, lng: -80.4190, color: '#ef4444' },
  'Newman Library': { lat: 37.2268, lng: -80.4238, color: '#10b981' },
  'Squires Student Center': { lat: 37.2275, lng: -80.4145, color: '#f59e0b' },
  'Burruss Hall': { lat: 37.2252, lng: -80.4215, color: '#8b5cf6' },
  'McBryde Hall': { lat: 37.2310, lng: -80.4168, color: '#06b6d4' },
  'Derring Hall': { lat: 37.2240, lng: -80.4195, color: '#ec4899' },
  'War Memorial Hall': { lat: 37.2275, lng: -80.4280, color: '#14b8a6' }
};

// Mock API data
const CLASS_DATABASE = {
  'CS 1010': { title: 'Introduction to Computer Science', sections: [
    { crn: 10001, location: 'McBryde Hall', startTime: '09:00', endTime: '10:30', days: 'MWF' },
    { crn: 10002, location: 'McBryde Hall', startTime: '11:00', endTime: '12:30', days: 'MWF' }
  ]},
  'CS 1110': { title: 'Python Programming', sections: [
    { crn: 10003, location: 'Blacksburg Building', startTime: '10:45', endTime: '12:00', days: 'TTh' },
    { crn: 10004, location: 'McBryde Hall', startTime: '13:00', endTime: '14:30', days: 'MWF' }
  ]},
  'MATH 1010': { title: 'College Algebra', sections: [
    { crn: 20001, location: 'Torgersen Hall', startTime: '08:00', endTime: '09:15', days: 'TTh' },
    { crn: 20002, location: 'Torgersen Hall', startTime: '09:30', endTime: '10:45', days: 'MWF' }
  ]},
  'MATH 2110': { title: 'Calculus II', sections: [
    { crn: 20005, location: 'Torgersen Hall', startTime: '14:45', endTime: '16:00', days: 'MWF' },
    { crn: 20006, location: 'Torgersen Hall', startTime: '13:00', endTime: '14:30', days: 'TTh' }
  ]},
  'PHYS 1010': { title: 'Physics I: Mechanics', sections: [
    { crn: 30001, location: 'Blacksburg Building', startTime: '09:00', endTime: '10:30', days: 'MWF' },
    { crn: 30002, location: 'Blacksburg Building', startTime: '13:00', endTime: '14:30', days: 'TTh' }
  ]},
  'ENG 1010': { title: 'English Composition', sections: [
    { crn: 40001, location: 'Derring Hall', startTime: '09:00', endTime: '10:30', days: 'MWF' },
    { crn: 40002, location: 'Derring Hall', startTime: '11:00', endTime: '12:30', days: 'MWF' }
  ]},
  'CHEM 1010': { title: 'Chemistry I: General Chemistry', sections: [
    { crn: 50001, location: 'Blacksburg Building', startTime: '09:00', endTime: '10:30', days: 'MWF' },
    { crn: 50002, location: 'Blacksburg Building', startTime: '13:00', endTime: '14:30', days: 'MWF' }
  ]},
};

// Helper functions
const timeToMinutes = (timeStr) => {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
};

const minutesToTime = (mins) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const calculateDistance = (loc1, loc2) => {
  if (!loc1 || !loc2) return 0;
  const R = 3959; // Earth's radius in miles
  const dLat = (loc2.lat - loc1.lat) * Math.PI / 180;
  const dLng = (loc2.lng - loc1.lng) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(loc1.lat * Math.PI / 180) * Math.cos(loc2.lat * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Returns miles
};

const classesOverlap = (class1, class2) => {
  // Only check overlap if classes are on the same days
  const days1 = class1.days.split('');
  const days2 = class2.days.split('');
  const commonDay = days1.some(d => days2.includes(d));
  if (!commonDay) return false;
  
  const start1 = timeToMinutes(class1.startTime);
  const end1 = timeToMinutes(class1.endTime);
  const start2 = timeToMinutes(class2.startTime);
  const end2 = timeToMinutes(class2.endTime);
  return start1 < end2 && start2 < end1;
};

const calculateMetrics = (schedule) => {
  if (schedule.length === 0) return { totalGap: 0, totalDistance: 0 };
  
  const sorted = [...schedule].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  let totalGap = 0;
  let totalDistance = 0;

  for (let i = 0; i < sorted.length - 1; i++) {
    const end1 = timeToMinutes(sorted[i].endTime);
    const start2 = timeToMinutes(sorted[i + 1].startTime);
    totalGap += Math.max(0, start2 - end1);
    
    const loc1 = LOCATIONS[sorted[i].location];
    const loc2 = LOCATIONS[sorted[i + 1].location];
    totalDistance += calculateDistance(loc1, loc2);
  }

  return { totalGap, totalDistance };
};

const findOptimalSchedule = (classes) => {
  if (classes.length === 0) return [];
  
  // Check for overlaps
  for (let i = 0; i < classes.length; i++) {
    for (let j = i + 1; j < classes.length; j++) {
      if (classesOverlap(classes[i], classes[j])) {
        return null; // Invalid schedule
      }
    }
  }
  
  return classes;
};

export default function App() {
  const [input, setInput] = useState('CS 1010 section 01\nMATH 1010 section 01\nPHYS 1010 section 02');
  const [selectedSchedule, setSelectedSchedule] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [error, setError] = useState('');
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    loadLeaflet().then(() => setMapReady(true));
  }, []);

  // Auto-parse on mount
  useEffect(() => {
    if (input) {
      setTimeout(() => {
        const lines = input.trim().split('\n').filter(line => line.trim());
        const parsed = [];
        let hasError = false;

        for (const line of lines) {
          const match = line.match(/^([A-Z]+)\s+(\d+)\s+section\s+(\d+)\s*$/i);
          if (!match) {
            hasError = true;
            break;
          }

          const [, code, number, section] = match;
          const courseKey = `${code.toUpperCase()} ${number}`;
          
          if (!CLASS_DATABASE[courseKey]) {
            hasError = true;
            break;
          }

          const courseData = CLASS_DATABASE[courseKey];
          const sectionNum = parseInt(section);
          
          if (sectionNum < 1 || sectionNum > courseData.sections.length) {
            hasError = true;
            break;
          }

          const classSection = courseData.sections[sectionNum - 1];
          parsed.push({
            code,
            number: parseInt(number),
            section,
            title: courseData.title,
            crn: classSection.crn,
            location: classSection.location,
            startTime: classSection.startTime,
            endTime: classSection.endTime,
            days: classSection.days
          });
        }

        if (!hasError && parsed.length > 0) {
          setSelectedSchedule(parsed);
        }
      }, 500);
    }
  }, []);

  // Initialize map - moved inside useEffect to fix dependency issue
  useEffect(() => {
    const initMap = () => {
      if (!window.L) return;
      
      const mapContainer = document.getElementById('map');
      if (!mapContainer) return;

      // Clean up existing map
      if (mapContainer._leaflet_id) {
        mapContainer._leaflet_id = undefined;
        mapContainer.innerHTML = '';
      }
      
      const map = window.L.map('map').setView([37.2275, -80.4225], 15);
      
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
      }).addTo(map);

      const sortedSchedule = [...selectedSchedule].sort((a, b) => 
        timeToMinutes(a.startTime) - timeToMinutes(b.startTime)
      );

      sortedSchedule.forEach((cls) => {
        const loc = LOCATIONS[cls.location];
        const marker = window.L.circleMarker([loc.lat, loc.lng], {
          radius: 10,
          fillColor: loc.color,
          color: '#fff',
          weight: 2,
          opacity: 0.8,
          fillOpacity: 0.7
        }).addTo(map);

        marker.bindPopup(`
          <div style="font-size: 12px;">
            <strong>${cls.code} ${cls.number}</strong><br/>
            ${cls.startTime} - ${cls.endTime}<br/>
            ${cls.location}
          </div>
        `);
      });

      if (sortedSchedule.length > 1) {
        const pathCoords = sortedSchedule.map(cls => {
          const loc = LOCATIONS[cls.location];
          return [loc.lat, loc.lng];
        });

        window.L.polyline(pathCoords, {
          color: '#10b981',
          weight: 3,
          opacity: 0.7,
          dashArray: '5, 5'
        }).addTo(map);
      }
    };

    if (mapReady && selectedSchedule.length > 0) {
      setTimeout(initMap, 100);
    }
  }, [mapReady, selectedSchedule]);

  const parseInput = () => {
    setError('');
    const lines = input.trim().split('\n').filter(line => line.trim());
    const parsed = [];

    for (const line of lines) {
      const match = line.match(/^([A-Z]+)\s+(\d+)\s+section\s+(\d+)\s*$/i);
      if (!match) {
        setError(`Invalid format: "${line}". Use "CS 1010 section 01"`);
        return;
      }

      const [, code, number, section] = match;
      const courseKey = `${code.toUpperCase()} ${number}`;
      
      if (!CLASS_DATABASE[courseKey]) {
        setError(`Course not found: ${courseKey}`);
        return;
      }

      const courseData = CLASS_DATABASE[courseKey];
      const sectionNum = parseInt(section);
      
      if (sectionNum < 1 || sectionNum > courseData.sections.length) {
        setError(`Section ${section} not available for ${courseKey}`);
        return;
      }

      const classSection = courseData.sections[sectionNum - 1];
      parsed.push({
        code,
        number: parseInt(number),
        section,
        title: courseData.title,
        crn: classSection.crn,
        location: classSection.location,
        startTime: classSection.startTime,
        endTime: classSection.endTime,
        days: classSection.days
      });
    }

    const validated = findOptimalSchedule(parsed);
    if (validated === null) {
      setError('Selected classes have overlapping times!');
      return;
    }

    setSelectedSchedule(parsed);
  };

  const { totalGap, totalDistance } = useMemo(() => calculateMetrics(selectedSchedule), [selectedSchedule]);
  const sortedSchedule = [...selectedSchedule].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-2">SmartScheduler</h1>
        <p className="text-slate-400 mb-8">Optimize your schedule with minimal walking and time gaps</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input and Results Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <div className="bg-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Enter Your Classes</h2>
              <p className="text-sm text-slate-300 mb-3">Format: CODE NUMBER section XX (one per line)</p>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="CS 1010 section 01&#10;MATH 2110 section 02&#10;ENG 1010 section 01"
                className="w-full h-24 bg-slate-600 text-white placeholder-slate-400 rounded p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={parseInput}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition"
              >
                Optimize Schedule
              </button>
              {error && (
                <div className="mt-3 p-3 bg-red-900 border border-red-700 rounded text-red-200 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            {selectedSchedule.length > 0 && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Total Gap Time
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">{totalGap} min</p>
                </div>
                <div className="bg-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm flex items-center gap-2">
                    <Route className="w-4 h-4" />
                    Total Distance
                  </p>
                  <p className="text-2xl font-bold text-white mt-1">{totalDistance.toFixed(2)} mi</p>
                </div>
              </div>
            )}

            {/* Schedule List */}
            {selectedSchedule.length > 0 && (
              <div className="bg-slate-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Your Optimized Schedule
                </h2>
                <div className="space-y-3">
                  {sortedSchedule.map((cls, idx) => {
                    const nextGap = idx < sortedSchedule.length - 1 
                      ? Math.max(0, timeToMinutes(sortedSchedule[idx + 1].startTime) - timeToMinutes(cls.endTime))
                      : 0;
                    const nextDist = idx < sortedSchedule.length - 1
                      ? calculateDistance(LOCATIONS[cls.location], LOCATIONS[sortedSchedule[idx + 1].location])
                      : 0;

                    return (
                      <div key={cls.crn} className="bg-slate-600 rounded p-4 border-l-4" style={{borderColor: LOCATIONS[cls.location].color}}>
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-semibold text-white">{cls.code} {cls.number}</h3>
                            <p className="text-sm text-slate-300">{cls.title}</p>
                          </div>
                          <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Sec {cls.section}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-300">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {cls.startTime} - {cls.endTime}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {cls.location}
                          </div>
                        </div>
                        {idx < sortedSchedule.length - 1 && (
                          <div className="mt-3 pt-3 border-t border-slate-500 text-xs text-slate-400">
                            <p>↓ Next class: {nextGap} min gap, {nextDist.toFixed(2)} mi walk</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Courses Reference */}
            <div className="bg-slate-700 rounded-lg p-6">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 w-full text-left font-semibold text-white hover:bg-slate-600 p-2 rounded mb-2"
              >
                <ChevronDown className={`w-4 h-4 transform transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                Available Courses & Sections
              </button>
              {showDropdown && (
                <div className="space-y-3 mt-4 border-t border-slate-600 pt-4">
                  {Object.entries(CLASS_DATABASE).map(([courseKey, course]) => (
                    <div key={courseKey} className="bg-slate-600 p-3 rounded">
                      <p className="font-medium text-white">{courseKey} - {course.title}</p>
                      <div className="mt-2 space-y-1">
                        {course.sections.map((section, idx) => (
                          <p key={idx} className="text-xs text-slate-300 ml-2">
                            Section {idx + 1}: {section.startTime}-{section.endTime} @ {section.location}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Campus Map */}
          <div className="bg-slate-700 rounded-lg p-6 h-fit">
            <h2 className="text-xl font-semibold text-white mb-4">Virginia Tech Campus Map</h2>
            <div id="map" className="w-full h-96 rounded border border-slate-600 overflow-hidden bg-slate-800"></div>
            <div className="mt-4 text-xs text-slate-400 space-y-1">
              <p>📍 Interactive map powered by OpenStreetMap</p>
              <p>🟢 Green dashed line = your walking route</p>
              <p>Click markers for class details</p>
              {selectedSchedule.length > 0 && (
                <p className="text-green-400 mt-2 pt-2 border-t border-slate-600">
                  {selectedSchedule.length} classes scheduled
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}