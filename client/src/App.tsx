import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// Važno: Zamenite ovo sa svojim access token-om
mapboxgl.accessToken = 'vas-mapbox-access-token';

function App() {
  // Kreiramo ref za div element u koji će mapa biti ubačena
  const mapContainer = useRef<HTMLDivElement>(null);
  // Ref za čuvanje instance mape
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {

    mapboxgl.accessToken = 'pk.eyJ1IjoibHVrYWNlcmEiLCJhIjoiY201anFhNXhtMTJsbzJrc2JyaTE2emgyOCJ9.Rh-_iWOpDcLcNtYpX7JB5Q';
    // Ako mapa već postoji ili nema container-a, prekidamo
    if (map.current || !mapContainer.current) return;

    // Inicijalizujemo novu mapu
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      center: [20.4568, 44.8125], // Koordinate Beograda
      zoom: 9
    });
  }, []);

  return (
    <div className="h-screen w-full">
      {/* Naslov iznad mape */}
      <span className='text-3xl block p-4'>
        Mapa Nekretnina
      </span>
      
      {/* Container za mapu */}
      <div 
        ref={mapContainer} 
        className="w-full h-[calc(100%-4rem)]" 
      />
    </div>
  );
}

export default App;