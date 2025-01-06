import { useEffect, useRef } from 'react';
import mapboxgl, { GeoJSONFeature } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = 'pk.eyJ1IjoibHVrYWNlcmEiLCJhIjoiY201anFhNXhtMTJsbzJrc2JyaTE2emgyOCJ9.Rh-_iWOpDcLcNtYpX7JB5Q';

function App() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const data: GeoJSON.FeatureCollection = {
      type: 'FeatureCollection',
      features: Array.from({ length: 3500 }, (_, index) => ({
        type: 'Feature',
        properties: {
          price: index < 20 
            ? Math.floor(Math.random() * 5000000) + 1000000 // Larger prices: 1,000,000 to 5,000,000
            : Math.floor(Math.random() * 500000) + 1000    // Regular prices: 1,000 to 500,000
        },
        geometry: {
          type: 'Point',
          coordinates: [
            parseFloat((Math.random() * (40 - (-25)) + (-25)).toFixed(6)), // Longitude between -25 and 40 (Europe)
            parseFloat((Math.random() * (72 - 34) + 34).toFixed(6))       // Latitude between 34 and 72 (Europe)
          ]
        }
        
      }))
    };
    map.current = new mapboxgl.Map({
      container: mapContainer.current!,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [20.4568, 44.8125],
      zoom: 12,
    });

    map.current.on('load', () => {
      // Dodavanje izvora podataka
      map.current?.addSource('realEstate', { type: 'geojson', data });

      // Heatmap sloj
      map.current?.addLayer({
        id: 'realEstate-heat',
        type: 'heatmap',
        source: 'realEstate',
        paint: {
          'heatmap-weight': ['interpolate', ['linear'], ['get', 'price'], 50000, 0, 300000, 1],
          'heatmap-color': [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0,
            'rgba(33,102,172,0)',
            1,
            'rgb(178,24,43)',
          ],
          'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 20, 20, 150, 250],
        },
      });

      // Sloj sa tačkama iznad heatmape
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

      // Interakcija sa tačkama
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
    <div className="h-screen w-full">
      <span className="text-3xl block p-4">Mapa Nekretnina</span>
      <div ref={mapContainer} className="w-full h-[calc(100%-4rem)]" />
    </div>
  );
}

export default App;
