import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState, useRef } from 'react';

function InvalidateMapSize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500);
  }, [map]);
  return null;
}

interface WalkMarker {
  location: string;
  name?: string;
  startAt?: string;
}

interface LeafletMapProps {
  coordinates?: [number, number] | string | WalkMarker | null;
  value?: string | [number, number] | WalkMarker | null;
  onChange?: (latlng: string) => void;
  height?: number | string;
  walks?: WalkMarker[];
}

export default function LeafletMap({ coordinates, value, onChange, height, walks }: LeafletMapProps) {
  console.log('LeafletMap walks:', walks);
  function isWalkMarker(obj: any): obj is WalkMarker {
    return obj && typeof obj === 'object' && typeof obj.location === 'string';
  }

  // Mode interactif si onChange fourni
  const isPicker = typeof onChange === 'function';
 
  const parseValue = (val?: string | [number, number] | WalkMarker | null): [number, number] => {
    if (Array.isArray(val) && val.length === 2) return val;
    if (typeof val === 'string' && val.split(',').length === 2) {
      return [parseFloat(val.split(',')[0]), parseFloat(val.split(',')[1])];
    }
    if (val && typeof val === 'object' && 'location' in val && typeof val.location === 'string') {
      const loc = val.location.split(',');
      if (loc.length === 2) {
        return [parseFloat(loc[0]), parseFloat(loc[1])];
      }
    }
    return [48.8584, 2.2945];
  };
  const [marker, setMarker] = useState<[number, number]>(parseValue(value ?? coordinates));

  // Synchronise marker avec value/coordinates
  useEffect(() => {
    const coords = parseValue(value ?? coordinates);
    if (coords[0] !== marker[0] || coords[1] !== marker[1]) {
      setMarker(coords);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, coordinates]);

  // Géolocalisation automatique si picker et pas de valeur
  useEffect(() => {
    if (isPicker && (!value || value === '') && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          setMarker(coords);
          onChange && onChange(`${coords[0].toFixed(5)},${coords[1].toFixed(5)}`);
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  function LocationMarker() {
    const markerRef = useRef(null);
    useMapEvents({
      click(e) {
        setMarker([e.latlng.lat, e.latlng.lng]);
        onChange && onChange(`${e.latlng.lat.toFixed(5)},${e.latlng.lng.toFixed(5)}`);
        // Ouvre le popup après sélection
        setTimeout(() => {
          if (markerRef.current) {
            // @ts-ignore
            markerRef.current.openPopup();
          }
        }, 100);
      },
    });
    return marker ? (
      <Marker position={marker} ref={markerRef}>
        <Popup autoPan={true}>
          <div>
            <div className="font-bold text-primary-brown text-sm mb-1">Lieu sélectionné</div>
            <div className="text-xs text-secondary-brown">{marker[0].toFixed(5)}, {marker[1].toFixed(5)}</div>
          </div>
        </Popup>
      </Marker>
    ) : null;
  }

  if (!marker || marker.length !== 2 || marker.some(isNaN)) {
    return <span className="text-[0.9rem] text-secondary-brown" role="alert" aria-live="polite">Coordonnées invalides</span>;
  }
  const isMobile = window.innerWidth <= 600;
  const mapHeight = height ?? (isMobile ? '200px' : '300px');
  return (
    <section
      role="region"
      aria-label={`Carte interactive centrée sur les coordonnées ${marker[0]}, ${marker[1]}`}
      tabIndex={0}
      className={`w-full rounded-lg overflow-hidden`}
      style={{ width: '100%', height: mapHeight }}
    >
      <article aria-label="Carte Leaflet interactive" className="w-full h-full">
        <MapContainer
          key={marker ? marker.join(',') : 'empty'}
          center={marker}
          zoom={13}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        >
          <InvalidateMapSize />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; OpenStreetMap &copy; CartoDB"
          />
          {/* Marqueurs des balades existantes */}
          {walks && walks.map((walk, i) => {
            if (!walk.location || walk.location.split(',').length !== 2) return null;
            const [lat, lng] = walk.location.split(',').map(Number);
            if (isNaN(lat) || isNaN(lng)) return null;
            return (
              <Marker key={i} position={[lat, lng]}>
                <Popup>
                  <div>
                    <div className="font-bold text-primary-brown text-sm mb-1">{walk.name || 'Balade'}</div>
                    {walk.startAt && <div className="text-xs text-secondary-brown">{new Date(walk.startAt).toLocaleString()}</div>}
                  </div>
                </Popup>
              </Marker>
            );
          })}
          {/* Marqueur interactif (picker) ou simple */}
          {isPicker ? <LocationMarker /> : (!walks || walks.length === 0) ? (
            <Marker position={marker}>
              <Popup autoPan={true}>
                <div>
                  {/* Si coordinates ou value sont un objet balade, affiche les infos */}
                  {isWalkMarker(coordinates) && (coordinates as WalkMarker).name ? (
                    <>
                      <div className="font-bold text-primary-brown text-sm mb-1">{(coordinates as WalkMarker).name}</div>
                      {(coordinates as WalkMarker).startAt && (
                        <div className="text-xs text-secondary-brown">{new Date((coordinates as WalkMarker).startAt!).toLocaleString()}</div>
                      )}
                      <div className="text-xs text-secondary-brown mt-1">{marker[0].toFixed(5)}, {marker[1].toFixed(5)}</div>
                    </>
                  ) : isWalkMarker(value) && (value as WalkMarker).name ? (
                    <>
                      <div className="font-bold text-primary-brown text-sm mb-1">{(value as WalkMarker).name}</div>
                      {(value as WalkMarker).startAt && (
                        <div className="text-xs text-secondary-brown">{new Date((value as WalkMarker).startAt!).toLocaleString()}</div>
                      )}
                      <div className="text-xs text-secondary-brown mt-1">{marker[0].toFixed(5)}, {marker[1].toFixed(5)}</div>
                    </>
                  ) : (
                    <>
                      <div className="font-bold text-primary-brown text-sm mb-1">Lieu sélectionné</div>
                      <div className="text-xs text-secondary-brown mt-1">{marker[0].toFixed(5)}, {marker[1].toFixed(5)}</div>
                    </>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : null}
        </MapContainer>
      </article>
    </section>
  );
}
