import React, { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONFeature } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Menu, X, Home, DollarSign, Filter } from 'lucide-react';
import FiltersSidebar from './components/FiltersSidebar';

mapboxgl.accessToken = 'pk.eyJ1IjoibHVrYWNlcmEiLCJhIjoiY201anFhNXhtMTJsbzJrc2JyaTE2emgyOCJ9.Rh-_iWOpDcLcNtYpX7JB5Q';

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: Array.from({ length: 3500 }, (_, index) => ({
        type: 'Feature',
        properties: {
          price: index < 20 
            ? Math.floor(Math.random() * 5000000) + 1000000
            : Math.floor(Math.random() * 500000) + 1000
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat((Math.random() * (40 - (-25)) + (-25)).toFixed(6)),
            parseFloat((Math.random() * (72 - 34) + 34).toFixed(6))
          ]
        }
      }))
    };

    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20.4568, 44.8125],
      zoom: 4,
    });

    map.current.on('load', () => {
      map.current?.addSource('realEstate', { type: 'geojson', data });

      map.current?.addLayer({
        id: 'realEstate-heat',
        type: 'heatmap',
        source: 'realEstate',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'price'], 10000, 0, 1500000, 1],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(33,102,172,0)',
            0.25, 'rgb(103,169,207)',
            0.5, 'rgb(209,229,240)',
            0.75, 'rgb(253,219,199)',
            1, 'rgb(178,24,43)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 20, 60, 150, 450],
        },
      });

      map.current?.addLayer({
        id: 'realEstate-points',
        type: 'circle',
        source: 'realEstate',
        paint: {
          'circle-radius': 6,
          'circle-color': '#FF5722',
          'circle-stroke-width': 1,
          'circle-stroke-color': '#FFFFFF',
        },
      });

      map.current?.on('click', 'realEstate-points', (e) => {
        const features = e.features as GeoJSONFeature[];
        const coordinates = features[0].geometry.coordinates.slice();
        const { price } = features[0].properties as { price: number };

        new mapboxgl.Popup()
          .setLngLat(coordinates as [number, number])
          .setHTML(`<strong>Cena:</strong> ${price.toLocaleString('sr-RS')} €`)
          .addTo(map.current!);
      });

      map.current?.on('mouseenter', 'realEstate-points', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
      });

      map.current?.on('mouseleave', 'realEstate-points', () => {
        map.current!.getCanvas().style.cursor = '';
      });
    });

    return () => map.current?.remove();
  }, []);

  return (
    <div className="h-screen w-full bg-gray-900 relative">
      {/* Search Bar */}
      <div className="absolute top-4 left-4 z-10">
        <div className="relative">
          <input
            type="text"
            placeholder="Enter a city name"
            className="w-64 px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:outline-none focus:border-blue-500 pl-10"
          />
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>

      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="absolute top-4 right-4 z-20 bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700"
      >
        {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <FiltersSidebar  />
      {/* Map Container */}
      <div ref={mapContainer} className="w-full h-full" />
    </div>
  );
}

export default App;