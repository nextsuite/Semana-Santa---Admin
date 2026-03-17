'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMap } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { Maximize, Minimize } from 'lucide-react';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix Leaflet icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// A component to automatically fit bounds if there's an existing polygon
function FitBounds({ positions }) {
    const map = useMap();
    useEffect(() => {
        if (positions && positions.length > 0) {
            const bounds = L.latLngBounds(positions);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, positions]);
    return null;
}

// A component to notify Leaflet when the container size changes (fullscreen toggle)
function FullscreenHandler({ isFullscreen }) {
    const map = useMap();
    useEffect(() => {
        // Give the DOM a tiny fraction of a second to apply the new CSS absolute sizing
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [isFullscreen, map]);
    return null;
}

export default function MapDraw({ initialGeoJSON, onChange }) {
    const featureGroupRef = useRef(null);
    const containerRef = useRef(null);
    const [existingPositions, setExistingPositions] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
        };
        
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = (e) => {
        e.preventDefault();
        if (!isFullscreen && containerRef.current) {
            const elem = containerRef.current;
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    useEffect(() => {
        if (initialGeoJSON && !existingPositions) {
            try {
                const parsed = typeof initialGeoJSON === 'string' ? JSON.parse(initialGeoJSON) : initialGeoJSON;
                
                // Assuming FeatureCollection with 1 Polygon, or just a Polygon Feature
                let coords = [];
                if (parsed.type === 'FeatureCollection' && parsed.features.length > 0) {
                    coords = parsed.features[0].geometry.coordinates[0];
                } else if (parsed.type === 'Feature' && parsed.geometry.type === 'Polygon') {
                    coords = parsed.geometry.coordinates[0];
                }
                
                if (coords && coords.length > 0) {
                    // GeoJSON format is [lng, lat], Leaflet is [lat, lng]
                    const latLngs = coords.map(c => [c[1], c[0]]);
                    setExistingPositions(latLngs);
                }
            } catch (e) {
                console.error("Error parsing initialGeoJSON:", e);
            }
        }
    }, [initialGeoJSON, existingPositions]);

    const _onCreated = (e) => {
        const { layerType, layer } = e;
        
        // Remove existing layers to only allow one polygon
        const featureGroup = featureGroupRef.current;
        if (featureGroup) {
            featureGroup.eachLayer(l => {
                if (l !== layer) {
                    featureGroup.removeLayer(l);
                }
            });
        }

        if (layerType === 'polygon' || layerType === 'rectangle') {
            const geojson = layer.toGeoJSON();
            onChange(JSON.stringify({
                type: "FeatureCollection",
                features: [geojson]
            }));
        }
    };

    const _onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer(layer => {
            const geojson = layer.toGeoJSON();
            onChange(JSON.stringify({
                type: "FeatureCollection",
                features: [geojson]
            }));
        });
    };

    const _onDeleted = (e) => {
        const layers = e.layers;
        if (Object.keys(layers._layers).length > 0) {
            onChange("");
        }
    };

    const center = [37.5415, -5.0783]; // Ecija by default
    const defaultZoom = 15;

    return (
        <div 
            ref={containerRef}
            style={{ 
                height: isFullscreen ? '100dvh' : '400px', 
                width: '100%', 
                borderRadius: '0.5rem', 
                overflow: 'hidden', 
                border: isFullscreen ? 'none' : '1px solid #e2e8f0', 
                position: 'relative', 
                zIndex: isFullscreen ? 9999 : 0,
                backgroundColor: '#fff'
            }}
        >
            <button
                type="button"
                onClick={toggleFullscreen}
                style={{ 
                    position: 'absolute', 
                    bottom: '20px', 
                    left: '10px',
                    zIndex: 1000,
                    padding: '8px',
                    backgroundColor: 'white',
                    border: '2px solid rgba(0,0,0,0.2)',
                    backgroundClip: 'padding-box',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
                title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
            >
                {isFullscreen ? <Minimize size={20} color="black" /> : <Maximize size={20} color="black" />}
            </button>
            <MapContainer center={center} zoom={defaultZoom} maxZoom={22} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='Tiles &copy; Esri'
                    maxNativeZoom={19}
                    maxZoom={22}
                />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
                    zIndex={10}
                    maxNativeZoom={19}
                    maxZoom={22}
                />
                
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        position="topright"
                        onCreated={_onCreated}
                        onEdited={_onEdited}
                        onDeleted={_onDeleted}
                        draw={{
                            rectangle: true,
                            polygon: true,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                        }}
                    />
                    {existingPositions && (
                        <Polygon positions={existingPositions} color="#3b82f6" />
                    )}
                </FeatureGroup>

                {existingPositions && <FitBounds positions={existingPositions} />}
                <FullscreenHandler isFullscreen={isFullscreen} />
            </MapContainer>
        </div>
    );
}
