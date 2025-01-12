import { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONFeature } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Menu, Move, MousePointer } from 'lucide-react';
import { FiltersSidebar } from './components/FiltersSidebar';
import ReviewModal from './components/NewPropModal';
import { API_URL } from './apiURL';
import { Property } from './types/Property';
import NewPropBtn from './components/NewPropBtn';

mapboxgl.accessToken = 'pk.eyJ1IjoibHVrYWNlcmEiLCJhIjoiY201anFhNXhtMTJsbzJrc2JyaTE2emgyOCJ9.Rh-_iWOpDcLcNtYpX7JB5Q';

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddPropModalOpen, setIsAddPropModalOpen] = useState(false);
  const [properties, setProperties] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });
  const [isDraggable, setIsDraggable] = useState(true);

  const fetchProperties = async () => {
    try {
      const response = await fetch(`${API_URL}/properties`);
      const data = await response.json();
      
      const geoJsonData: GeoJSON.FeatureCollection = {
        type: 'FeatureCollection',
        features: data.map((property: Property) => ({
          type: 'Feature',
          properties: {
            id: property._id,
            price: property.price,
            size: property.size,
            pricePerSquareMeter: property.pricePerSquareMeter,
            rooms: property.rooms,
            yearBuilt: property.yearBuilt,
            type: property.type.toLowerCase(),
            status: property.status,
            updatedAt: property.updatedAt,
            numberOfReviews: property.numberOfReviews,
            dataReliability: property.dataReliability
          },
          geometry: property.geometry
        }))
      };

      setProperties(geoJsonData);

      if (map.current?.getSource('realEstate')) {
        (map.current.getSource('realEstate') as mapboxgl.GeoJSONSource).setData(geoJsonData);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  useEffect(() => {
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20.4568, 44.8125],
      zoom: 4
    });

    map.current.on('load', () => {
      map.current?.addSource('realEstate', { 
        type: 'geojson', 
        data: properties 
      });
      map.current?.on('click', (e) => {
        if (!isDraggable) return;
        const { lng, lat } = e.lngLat;
        console.log('Coordinates:', lng, lat);
        setIsAddPropModalOpen(true);
      });
      map.current?.addLayer({
        id: 'realEstate-points',
        type: 'circle',
        source: 'realEstate',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],
            ['zoom'],
            8, 4,
            12, 8,
            16, 12
          ],
          'circle-color': [
            'interpolate',
            ['linear'],
            ['get', 'pricePerSquareMeter'],
            0, '#FFEB3B',
            2000, '#FFA726',
            4000, '#FF7043',
            6000, '#FF1744'
          ],
          'circle-opacity': 0.8,
          'circle-stroke-width': 1,
        }
      });

      map.current?.on('moveend', () => {
        const visibleFeatures = map.current?.querySourceFeatures('realEstate');
        if (!visibleFeatures?.length) return;
        
        const prices = visibleFeatures.map(f => f.properties?.pricePerSquareMeter).filter(Boolean);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      
        map.current?.setPaintProperty('realEstate-points', 'circle-radius', [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 4,
          12, 6,
          16, 12
        ]);
      
        map.current?.setPaintProperty('realEstate-points', 'circle-color', [
          'interpolate',
          ['linear'],
          ['get', 'pricePerSquareMeter'],
          minPrice, '#FFC107',
          avgPrice * 0.75, '#FF9800',
          avgPrice, '#FF5722',
          avgPrice * 1.25, '#E53935',
          maxPrice, '#B71C1C'
        ]);
        const currentZoom = map.current?.getZoom() || 0;
        const opacity = Math.min(0.8, Math.max(0.4, currentZoom / 20));
        
        map.current?.setPaintProperty('realEstate-points', 'circle-opacity', opacity);
        map.current?.setPaintProperty('realEstate-points', 'circle-stroke-width', [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 1.5,
          12, 2,
          16, 2.5
        ]);
        
        map.current?.setPaintProperty('realEstate-points', 'circle-blur', [
          'interpolate',
          ['linear'],
          ['zoom'],
          8, 0.5,
          12, 0.2,
          16, 0
        ]);
      });

      map.current?.on('mouseenter', 'realEstate-points', () => {
        map.current!.getCanvas().style.cursor = 'pointer';
        map.current?.setPaintProperty('realEstate-points', 'circle-stroke-width', 2);
      });

      map.current?.on('mouseleave', 'realEstate-points', () => {
        map.current!.getCanvas().style.cursor = '';
        map.current?.setPaintProperty('realEstate-points', 'circle-stroke-width', 1);
      });

      map.current?.on('click', 'realEstate-points', (e) => {
        const features = e.features as GeoJSONFeature[];
        const coordinates = features[0].geometry.coordinates.slice();
        const props = features[0].properties as Property;
        
        const popupContent = `
        <style>
          .mapboxgl-popup-close-button {
            display: none;
          }
          .mapboxgl-popup-content {
            width: 480px !important;
            padding: 0 !important;
            border-radius: 0.75rem !important;
            overflow: hidden;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
          }
          .tooltip {
            position: relative;
            display: inline-block;
          }
          .tooltip .tooltip-text {
            visibility: hidden;
            width: 300px;
            background-color: #1f2937;
            color: white;
            text-align: center;
            padding: 8px;
            border-radius: 6px;
            position: absolute;
            z-index: 1;
            bottom: 125%;
            left: 50%;
            transform: translateX(-50%);
            opacity: 0;
            transition: opacity 0.2s;
            font-size: 12px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .tooltip:hover .tooltip-text {
            visibility: visible;
            opacity: 1;
          }
        </style>
        <div class="overflow-hidden bg-white">
          <div class="relative px-5 py-3 bg-accent text-white">
            <button 
              class="absolute top-2 right-2 p-1 rounded-full bg-white/80 backdrop-blur-sm text-gray-500 hover:text-gray-700 hover:bg-white transition-all duration-200"
              onclick="this.closest('.mapboxgl-popup').remove()"
              aria-label="Close popup"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
      
            <div class="flex items-baseline gap-2">
              <h2 class="text-xl font-bold">
                ${props.price} €
              </h2>
              <p class="text-gray-300 text-sm">${props.pricePerSquareMeter} €/m²</p>
            </div>
          </div>
      
          <div class="p-4 space-y-4">
            <div class="grid grid-cols-4 gap-3">
              <div class="p-2 bg-gray-50 rounded">
                <p class="text-xs text-gray-500">Type</p>
                <p class="text-sm font-medium text-gray-900">${props.type}</p>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <p class="text-xs text-gray-500">Size</p>
                <p class="text-sm font-medium text-gray-900">${props.size}m²</p>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <p class="text-xs text-gray-500">Rooms</p>
                <p class="text-sm font-medium text-gray-900">${props.rooms}</p>
              </div>
              <div class="p-2 bg-gray-50 rounded">
                <p class="text-xs text-gray-500">Floor</p>
                <p class="text-sm font-medium text-gray-900">2/3</p>
              </div>
            </div>
      
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-1">
                <div class="flex justify-between items-center">
                  <p class="text-xs font-medium text-gray-700">Data Reliability</p>
                  <span class="text-xs text-gray-500">${props.numberOfReviews} reviews</span>
                </div>
                <div class="w-full bg-gray-100 rounded-full h-1.5">
                  <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style="width: ${props.dataReliability}%"></div>
                </div>
              </div>
      
              <div class="space-y-1">
                <div class="flex justify-between items-center mb-1">
                  <div class="tooltip">
                    <button class="text-xs text-gray-500 flex items-center gap-1">
                      Help
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M12 21a9 9 0 110-18 9 9 0 010 18z" />
                      </svg>
                    </button>
                    <span class="tooltip-text">
                      Help us improve price accuracy by voting:
                      <br>• Lower - if the price seems too high
                      <br>• OK - if the price seems accurate
                      <br>• Higher - if the price seems too low
                    </span>
                  </div>
                </div>
                
                <div class="flex gap-1">
                  <button 
                    onclick="window.handlePriceVote('${props._id}', 'lower')"
                    class="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-red-200 text-red-600 rounded
                          hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-xs font-medium group"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                    </svg>
                    Lower
                  </button>
      
                  <button 
                    onclick="window.handlePriceVote('${props._id}', 'accurate')"
                    class="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-green-200 text-green-600 rounded
                          hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-xs font-medium group"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                    OK
                  </button>
      
                  <button 
                    onclick="window.handlePriceVote('${props._id}', 'higher')"
                    class="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-blue-200 text-blue-600 rounded
                          hover:bg-blue-50 hover:border-blue-300 transition-all duration-200 text-xs font-medium group"
                  >
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                    </svg>
                    Higher
                  </button>
                </div>
              </div>
            </div>
      
            <p class="text-xs text-gray-400 text-right">
              Last review: ${new Date(props.updatedAt).toLocaleDateString('en-US')}
            </p>
          </div>
        </div>
      `;
        new mapboxgl.Popup()
          .setLngLat(coordinates as [number, number])
          .setHTML(popupContent)
          .addTo(map.current!);
      });
    });
  
    return () => map.current?.remove();
  }, [properties]);
  
  const toggleDragMode = () => {
    if (isDraggable && map.current) {
      map.current.dragPan.disable(); 
      map.current.getCanvas().style.cursor = 'pointer'; 
    } else if (map.current) {
      map.current.dragPan.enable(); 
      map.current.getCanvas().style.cursor = ''; 
    }
    setIsDraggable(!isDraggable); 
  };

  return (
    <>
      <div className="h-screen w-full relative font-poppins">
        <div className="absolute top-4 left-4 z-10 flex w-[calc(100%-22rem)] justify-start gap-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Enter a city name"
              className="w-64 px-4 py-2 bg-background-lighter text-white rounded-lg border
              border-background focus:outline-none focus:border-blue-500 pl-10 shadow-lg"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          </div>
          <NewPropBtn onClick={() => setIsAddPropModalOpen(true)}/>
          <button
            onClick={toggleDragMode}
            className="bg-mainWhite transition-all duration-200
            p-2 rounded-lg text-black hover:bg-mainWhite-muted flex items-center gap-2"
          >
            {isDraggable ? <Move className="w-5 h-5" /> : <MousePointer className="w-5 h-5" />}
            {isDraggable ? 'Drag' : 'Select'}
          </button>
        </div>

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 right-4 z-20 
            bg-gray-800 p-2 rounded-lg text-white hover:bg-gray-700"
          >
            <Menu size={24} />
          </button>
        )}
        <FiltersSidebar isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      <ReviewModal 
        isOpen={isAddPropModalOpen}
        onClose={() => setIsAddPropModalOpen(false)}
      />
    </>
  );
}

export default App;