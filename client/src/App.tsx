import { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONFeature, MapMouseEvent, PointLike } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Menu, Move, MousePointer } from 'lucide-react';
import { FiltersSidebar } from './components/FiltersSidebar';
import ReviewModal from './components/NewPropModal';
import { Property } from './types/Property';
import NewPropBtn from './components/NewPropBtn';
import { createRoot } from 'react-dom/client';
import PropertyPopup from './components/PopupContent';
import SearchBar from './components/SearchBar';
import LoginPopup from './components/LoginPopup';
import ProfileImg from "/JA.jpg"

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


  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL;

    const fetchProperties = async () => {
      try {
        const response = await fetch(`${apiUrl}/properties`);
        const data = await response.json();
        
        const geoJsonData: GeoJSON.FeatureCollection = {
          type: 'FeatureCollection',
          features: data.map((property: Property, index: number) => (
            {
            type: 'Feature',
            id: property._id || index,
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
        const props = features[0].properties as Property;
      
        const popupContainer = document.createElement('div');
      
        const popup = new mapboxgl.Popup()
          .setLngLat(coordinates as [number, number])
          .setDOMContent(popupContainer) 
          .addTo(map.current!);
      
        createRoot(popupContainer).render(
          <PropertyPopup
            property={props}
            onClose={() => popup.remove()}
            setIsLoginModalOpen={setIsLoginModalOpen} 
          />
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
        <div className="absolute top-4 left-4 z-10 flex w-[calc(100%-22rem)] 
        items-center justify-start gap-5">
          <img 
            src={ProfileImg} 
            alt="Profile" 
            className="w-10 h-10 rounded-full object-cover border-2 border-mainWhite shadow-lg"
          />
          <SearchBar map={map}/>
          <NewPropBtn onClick={() => {
              setCoordinates([]);
              setIsAddPropModalOpen(true)
            }}
          />
          <button
            onClick={toggleDragMode}
            className="bg-mainWhite transition-all duration-200 border shadow-xl
            p-2 rounded-lg text-black hover:bg-mainWhite-muted flex items-center gap-2"
          >
            {!isDraggable ? <Move className="w-5 h-5" /> : <MousePointer className="w-5 h-5" />}
            {!isDraggable ? 'Drag' : 'Select'}
          </button>
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
        <FiltersSidebar isSidebarOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)}/>
        <div ref={mapContainer} className="w-full h-full" />
      </div>
      <ReviewModal 
        isOpen={isAddPropModalOpen}
        onClose={() => setIsAddPropModalOpen(false)}
        coordinates={coordinates}
        mapRef={map}
      />
      <LoginPopup isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)}/>
    </>
  );
}

export default App;