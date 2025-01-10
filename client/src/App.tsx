import { useEffect, useRef, useState } from 'react';
import mapboxgl, { GeoJSONFeature } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Search, Menu } from 'lucide-react';
import { FiltersSidebar } from './components/FiltersSidebar';
import ReviewModal from './components/ReviewModal';

mapboxgl.accessToken = 'pk.eyJ1IjoibHVrYWNlcmEiLCJhIjoiY201anFhNXhtMTJsbzJrc2JyaTE2emgyOCJ9.Rh-_iWOpDcLcNtYpX7JB5Q';

interface RealEstateProperties {
 id: string;
 price: number;
 size: number;
 pricePerSquare: number;
 rooms: number;
 yearBuilt: number;
 propertyType: 'apartment' | 'house' | 'office' | 'retail';
 floor?: number;
 totalFloors?: number;
 heating: 'central' | 'electric' | 'gas' | 'none';
 parking: boolean;
 elevator?: boolean;
 condition: 'new' | 'excellent' | 'good' | 'renovationNeeded';
 furnished: boolean;
 balcony: boolean;
 lastUpdated: string;
 reliability: number;
 reviewCount: number;
}

function App() {
 const mapContainer = useRef<HTMLDivElement>(null);
 const map = useRef<mapboxgl.Map | null>(null);
 const [isSidebarOpen, setIsSidebarOpen] = useState(true);
 const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

 useEffect(() => {
   const data: GeoJSON.FeatureCollection = {
     type: 'FeatureCollection',
     features: Array.from({ length: 3500 }, (_, index) => {
       const size = Math.floor(Math.random() * 150) + 30;
       const price = index < 20 
         ? Math.floor(Math.random() * 5000000) + 1000000
         : Math.floor(Math.random() * 500000) + 1000;
       
       return {
         type: 'Feature',
         properties: {
           id: `prop-${index}`,
           price,
           size,
           pricePerSquare: Math.round(price / size),
           rooms: Math.floor(Math.random() * 4) + 1,
           yearBuilt: Math.floor(Math.random() * 50) + 1970,
           propertyType: ['apartment', 'house', 'office', 'retail'][Math.floor(Math.random() * 4)],
           floor: Math.floor(Math.random() * 12) + 1,
           totalFloors: Math.floor(Math.random() * 20) + 1,
           heating: ['central', 'electric', 'gas', 'none'][Math.floor(Math.random() * 4)],
           parking: Math.random() > 0.5,
           elevator: Math.random() > 0.3,
           condition: ['new', 'excellent', 'good', 'renovationNeeded'][Math.floor(Math.random() * 4)],
           furnished: Math.random() > 0.5,
           balcony: Math.random() > 0.6,
           lastUpdated: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
           reliability: Math.floor(Math.random() * 100),
           reviewCount: Math.floor(Math.random() * 50),
         },
         geometry: {
           type: 'Point',
           coordinates: [
             parseFloat((Math.random() * (40 - (-25)) + (-25)).toFixed(6)),
             parseFloat((Math.random() * (72 - 34) + 34).toFixed(6))
           ]
         }
       };
     })
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
             0, 'rgba(255, 255, 0, 0)',
             0.2, 'rgba(255, 255, 0, 0.6)',
             0.4, 'rgba(255, 200, 0, 0.7)',
             0.6, 'rgba(255, 140, 0, 0.8)',
             0.8, 'rgba(255, 69, 0, 0.9)',
             1, 'rgba(255, 0, 0, 1)'
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
 
     map.current?.on('zoomstart', () => {
       map.current?.setLayoutProperty('realEstate-heat', 'visibility', 'none');
       if (hideTimeout) {
         clearTimeout(hideTimeout);
       }
     });
 
     map.current?.on('zoomend', () => {
       hideTimeout = setTimeout(() => {
         map.current?.setLayoutProperty('realEstate-heat', 'visibility', 'visible');
       }, 500);
     });
 
     map.current?.on('click', 'realEstate-points', (e) => {
       const features = e.features as GeoJSONFeature[];
       const coordinates = features[0].geometry.coordinates.slice();
       const props = features[0].properties as RealEstateProperties;
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
           width: 200px;
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
         <!-- Header with price -->
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
               ${props.price.toLocaleString('en-US')} €
             </h2>
             <p class="text-gray-300 text-sm">${props.pricePerSquare.toLocaleString('en-US')} €/m²</p>
           </div>
         </div>
     
         <!-- Main content -->
         <div class="p-4 space-y-4">
           <!-- Property details grid -->
           <div class="grid grid-cols-4 gap-3">
             <div class="p-2 bg-gray-50 rounded">
               <p class="text-xs text-gray-500">Type</p>
               <p class="text-sm font-medium text-gray-900">${props.propertyType}</p>
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
               <p class="text-sm font-medium text-gray-900">${props.floor}/${props.totalFloors}</p>
             </div>
           </div>
     
           <!-- Reliability meter and vote buttons in two columns -->
           <div class="grid grid-cols-2 gap-4">
             <!-- Reliability meter -->
             <div class="space-y-1">
               <div class="flex justify-between items-center">
                 <p class="text-xs font-medium text-gray-700">Data Reliability</p>
                 <span class="text-xs text-gray-500">${props.reviewCount} reviews</span>
               </div>
               <div class="w-full bg-gray-100 rounded-full h-1.5">
                 <div class="bg-blue-500 h-1.5 rounded-full transition-all duration-300" style="width: ${props.reliability}%"></div>
               </div>
             </div>
     
             <!-- Vote buttons with tooltip -->
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
                   onclick="window.handlePriceVote('${props.id}', 'lower')"
                   class="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-red-200 text-red-600 rounded
                         hover:bg-red-50 hover:border-red-300 transition-all duration-200 text-xs font-medium group"
                 >
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                   </svg>
                   Lower
                 </button>
     
                 <button 
                   onclick="window.handlePriceVote('${props.id}', 'accurate')"
                   class="flex-1 flex items-center justify-center gap-1 p-1.5 bg-white border border-green-200 text-green-600 rounded
                         hover:bg-green-50 hover:border-green-300 transition-all duration-200 text-xs font-medium group"
                 >
                   <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                   </svg>
                   OK
                 </button>
     
                 <button 
                   onclick="window.handlePriceVote('${props.id}', 'higher')"
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
     
           <!-- Last review -->
           <p class="text-xs text-gray-400 text-right">
             Last review: ${new Date(props.lastUpdated).toLocaleDateString('en-US')}
           </p>
         </div>
       </div>
     `;
      new mapboxgl.Popup()
         .setLngLat(coordinates as [number, number])
         .setHTML(popupContent)
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
           onClick={() => setIsReviewModalOpen(true)}
           className="px-4 py-2 bg-accent text-white shadow-lg
           rounded-lg hover:bg-accent-hover transition-colors duration-200 
           flex items-center space-x-2 font-medium"
         >
           Add review
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
       isOpen={isReviewModalOpen}
       onClose={() => setIsReviewModalOpen(false)}
     />
   </>
 );
}

export default App;