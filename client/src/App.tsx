import { ReactElement, useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONFeature, MapMouseEvent, PointLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Menu, Move, MousePointer, CheckCircle } from 'lucide-react';
import { FiltersSidebar } from './components/FiltersSidebar';
import ReviewModal from './components/NewPropModal';
import { CustomProperty } from './types/Property';
import NewPropBtn from './components/NewPropBtn';
import { createRoot } from 'react-dom/client';
import PropertyPopup from './components/PopupContent';
import SearchBar from './components/SearchBar';
import LoginPopup from './components/LoginPopup';
import AuthButton from './components/AuthBtn';
import { AuthProvider } from './contexts/AuthContext';
import Notification from './components/UI/Notifcation';
import { fetchProperties } from './utils/fetchProperties';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddPropModalOpen, setIsAddPropModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  
  // Map states
  const [properties, setProperties] = useState<GeoJSON.FeatureCollection>({
    type: 'FeatureCollection',
    features: []
  });
  const [coordinates, setCoordinates] = useState<number[]>([]);
  const [isDraggable, setIsDraggable] = useState(true);

  const [minPrice, setMinPrice] = useState<number | null>(null);
  const [maxPrice, setMaxPrice] = useState<number | null>(null);

  const [notification, setNotification] = useState<{ 
    message: string; isVisible: boolean; color: string, icon: ReactElement 
  }>({
    message: '',
    isVisible: false,
    color: 'bg-green-500',
    icon: <CheckCircle />
  });
  
  // Notification timeout
  const TIMEOUT = 2000;
  const showNotification = (
    message: string, 
    type: 'success' | 'error' | 'warning' = 'success',
    icon: ReactElement
  ) => {
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      warning: 'bg-yellow-500'
    };
  
    setNotification({ 
      message, 
      isVisible: true, 
      color: colors[type],
      icon
    });
    
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, TIMEOUT);
  };
  
  useEffect(() => {
    const fetchData = async () => {
      const {geoJsonData, maxPrice, minPrice} = await fetchProperties();

      setProperties(geoJsonData);
      setMinPrice(minPrice);
      setMaxPrice(maxPrice);

      if (map.current?.getSource('realEstate')) {
        (map.current.getSource('realEstate') as mapboxgl.GeoJSONSource).setData(geoJsonData);
      }
    };

    fetchData();
  }, []);

  console.log(minPrice)
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
        
        const prices = visibleFeatures
          .map((f) => f.properties?.pricePerSquareMeter)
          .filter(Boolean);
        
        if (prices.length === 0) return; // No valid prices
        
        let minPrice = Math.min(...prices);
        let maxPrice = Math.max(...prices);
        const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;

        // Handle single price case
        if (minPrice === maxPrice) {
          const offset = minPrice * 0.1; // 10% offset
          minPrice -= offset;
          maxPrice += offset;
        }
            
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
          avgPrice, '#E53935',
          maxPrice, '#B71C1C'
        ]);

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
          8, 0.2,
          12, 0.1,
          16, 0
        ]);
      });

      let hoveredPointId: string | null = null;

      map.current?.on('mouseenter', 'realEstate-points', (e) => {
        if (e.features && e.features.length > 0) {
          const featureId = e.features[0].properties?.id as string;
      
          hoveredPointId = featureId;
      
          map.current?.setPaintProperty('realEstate-points', 'circle-stroke-width', [
            'case',
            ['==', ['id'], featureId],
            2,
            1,
          ]);
      
          // Change the cursor style
          map.current!.getCanvas().style.cursor = 'pointer';
        }
      });
      
      map.current?.on('mouseleave', 'realEstate-points', () => {
        if (hoveredPointId) {
          map.current?.setPaintProperty('realEstate-points', 'circle-stroke-width', 1);
      
          hoveredPointId = null;
        }
      
        map.current!.getCanvas().style.cursor = '';
      });

      map.current?.on('click', 'realEstate-points', (e) => {
        const features = e.features as GeoJSONFeature[];
        let coordinates: number[] = [0, 0];
        if (features[0].geometry.type === 'Point') {
          coordinates = (features[0].geometry as GeoJSON.Point).coordinates.slice();
        }
        const props = features[0].properties as CustomProperty;
      
        const popupContainer = document.createElement('div');
      
        const popup = new mapboxgl.Popup({
          maxWidth: '500px', // Set fixed width for the popup
          className: 'property-popup' // Add custom class for additional styling if needed
        })
          .setLngLat(coordinates as [number, number])
          .setDOMContent(popupContainer) 
          .addTo(map.current!);
      
        createRoot(popupContainer).render(
          <AuthProvider>
            <PropertyPopup
              property={props}
              onClose={() => popup.remove()}
              setIsLoginModalOpen={setIsLoginModalOpen}
              showNotification={showNotification}
              TIMEOUT={TIMEOUT}
            />
          </AuthProvider>
        );
      });
      
    });
  
    return () => map.current?.remove();
  }, [properties]);
  

  const toggleDragMode = () => {
    if (isDraggable && map.current) {
      map.current.dragPan.disable(); 
      map.current.getCanvas().style.cursor = 'drag'; 
    } else if (map.current) {
      map.current.dragPan.enable(); 
      map.current.getCanvas().style.cursor = 'pointer'; 
    }
    map.current!.getCanvas().style.cursor = isDraggable ? 'drag' : "pointer";
    setIsDraggable(!isDraggable); 
  };

  useEffect(() => {
    if (!map.current) return;
  
  
    if (isDraggable) {
      map.current.dragPan.enable();
      map.current.getCanvas().style.cursor = 'grab';
    } else {
      map.current.dragPan.disable();
      map.current.getCanvas().style.cursor = 'pointer';
    }
  
    // Define the click event handler
    const handleClick = (e: MapMouseEvent) => {
      const bbox = [
        [e.point.x - 5, e.point.y - 5],
        [e.point.x + 5, e.point.y + 5]
      ];
  
      const existingFeatures = map.current?.queryRenderedFeatures(bbox as [PointLike, PointLike], {
        layers: ['realEstate-points']
      });
  
      if (existingFeatures && existingFeatures.length === 0) {
        const { lng, lat } = e.lngLat;
        setCoordinates([parseFloat(lng.toFixed(5)), parseFloat(lat.toFixed(5))]);
        if (!isDraggable) {
          setIsAddPropModalOpen(true);
        }
      }
    };
  
    // Add the click event listener
    map.current?.on('click', handleClick);
  
    // Cleanup function to unsubscribe from the listener
    return () => {
      map.current?.off('click', handleClick);
    };
  
  }, [isDraggable]);

  return (
    <>
      <div className="h-screen w-full relative font-poppins">
        <div className="absolute top-4 left-4 z-10 flex 
        gap-5 flex-col items-start justify-start
        sm:items-center sm:justify-start">
          <div className='flex gap-4 flex-col sm:flex-row'>
            <div className='max-w-[10rem]'>
              <AuthButton
                setIsLoginModalOpen={setIsLoginModalOpen}
              />
            </div>
            <div>
              <SearchBar map={map}/>
            </div>
          </div>
          <div className='flex flex-row gap-4 text-sm justify-start w-full'>
            <NewPropBtn setIsLoginModalOpen={setIsLoginModalOpen}
            setIsAddPropModalOpen={setIsAddPropModalOpen}
            />
            <button
              onClick={toggleDragMode}
              className="bg-mainWhite transition-all duration-200 border shadow-xl
              p-2 rounded-lg text-black hover:bg-mainWhite-muted flex justify-center 7
              items-center gap-2"
            >
              {!isDraggable ? <Move className="w-5 h-5" /> : <MousePointer className="w-5 h-5" />}
              {!isDraggable ? 'Drag' : 'Select'}
            </button>
          </div>
        </div>

        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="absolute top-4 right-4 z-20 
            bg-mainWhite p-2 rounded-lg text-black"
          >
            <Menu size={24} />
          </button>
        )}
        <FiltersSidebar 
        isSidebarOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)}
        setProperties={setProperties}
        maxPrice={maxPrice}
        minPrice={minPrice}
        />
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      {isAddPropModalOpen && <ReviewModal mapRef={map} coordinates={coordinates} onClose={() => setIsAddPropModalOpen(false)} />}
      {isLoginModalOpen && <LoginPopup onClose={() => setIsLoginModalOpen(false)} />}
      {notification.isVisible && (
        <Notification notification={notification}
        onClose={() => setNotification(prev => ({
          ...prev,
          isVisible: false
        }))} 
        timeout={TIMEOUT}
        />
      )}
    </>
  );
}

export default App;