import { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONFeature } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Menu } from 'lucide-react';
import { FiltersSidebar } from './components/FiltersSidebar';
import ReviewModal from './components/ReviewModal';

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
            : Math.floor(Math.random() * 500000) + 1000,
          size: Math.floor(Math.random() * 150) + 30,
          rooms: Math.floor(Math.random() * 4) + 1,
          yearBuilt: Math.floor(Math.random() * 50) + 1970,
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

    map.current.on('moveend', () => {
      const visibleFeatures = map.current?.querySourceFeatures('realEstate');
      if (!visibleFeatures?.length) return;
      
      const prices = visibleFeatures.map(f => f.properties.price);
      console.log(visibleFeatures)
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      map.current?.setPaintProperty('realEstate-heat', 'heatmap-weight', [
        'interpolate',
        ['linear'],
        ['get', 'price'],
        minPrice, 0.3,
        maxPrice * 0.25, 0.4,
        maxPrice * 0.5, 0.6,
        maxPrice * 0.75, 0.8,
        maxPrice, 1
      ]);
    });
    
    map.current.on('load', () => {
      map.current?.addSource('realEstate', { type: 'geojson', data });
  
      map.current?.addLayer({
        id: 'realEstate-heat',
        type: 'heatmap',
        source: 'realEstate',
        paint: {
          'heatmap-weight': [
            'interpolate',
            ['linear'],
            ['get', 'price'],
            1000, 0.3,
            100000, 0.4,
            500000, 0.6,
            1000000, 0.8,
            5000000, 1
          ],
          'heatmap-color': [
              'interpolate',
              ['linear'],
              ['heatmap-density'],
              0, 'rgba(255, 255, 0, 0)', // Žuta (transparentna)
              0.2, 'rgba(255, 255, 0, 0.6)', // Svetlo žuta
              0.4, 'rgba(255, 200, 0, 0.7)', // Zlatno žuta
              0.6, 'rgba(255, 140, 0, 0.8)', // Narandžasta
              0.8, 'rgba(255, 69, 0, 0.9)', // Tamna narandžasta
              1, 'rgba(255, 0, 0, 1)' // Crvena
          ],
          'heatmap-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 5,
            8, 150,
            12, 300,
            16, 600
          ],
          'heatmap-opacity': [
            'interpolate',
            ['linear'],
            ['zoom'],
            0, 0.7,
            10, 0.4
          ],
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
  
      let hideTimeout: number | null = null;
  
      // Listen to zoom events
      map.current?.on('zoomstart', () => {
        map.current?.setLayoutProperty('realEstate-heat', 'visibility', 'none');
        if (hideTimeout) {
          clearTimeout(hideTimeout);
        }
      });
  
      map.current?.on('zoomend', () => {
        hideTimeout = setTimeout(() => {
          map.current?.setLayoutProperty('realEstate-heat', 'visibility', 'visible');
        }, 500); // 1-second delay
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
    <>
      <div className="h-screen w-full relative font-poppins">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 z-10 flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter a city name"
              className="w-64 px-4 py-2 bg-background-lighter text-white rounded-lg border 
              border-background focus:outline-none focus:border-blue-500 pl-10 shadow-lg"
              />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <button
            className="px-4 py-2 bg-accent text-white shadow-lg
            rounded-lg hover:bg-accent-hover transition-colors duration-200 
            flex items-center space-x-2 font-medium"
            >
            Add review
          </button>
        </div>

        {/* Sidebar Toggle Button */}
        {!isSidebarOpen && (
          <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute top-4 right-4 z-20 
          bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700"
        >
          <Menu size={24} />
        </button>
        )}
        {/* Sidebar */}
        <FiltersSidebar isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>
        {/* Map Container */}
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      <ReviewModal 
      isOpen={true}
      onClose={() => {}}
      />
    </>
  );
}

export default App;