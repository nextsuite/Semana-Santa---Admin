'use client';

import { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';

import 'leaflet/dist/leaflet.css';

// Fix Leaflet icons issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function FitAllBounds({ bounds }) {
    const map = useMap();
    
    // We stringify the bounds so the effect only runs if the actual coordinates change.
    // Otherwise, creating a new L.latLngBounds() on every render causes infinite re-fits.
    const boundsKey = bounds ? bounds.toBBoxString() : '';

    useEffect(() => {
        if (bounds && bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [map, boundsKey]);

    return null;
}

export default function MapMultiZonas({ zonas, hoveredZone }) {
    const center = [37.5415, -5.0783]; // Ecija by default
    const defaultZoom = 14;
    
    // Parse GeoJSONs and compute total bounds
    const parsedZonas = [];
    let _bounds = L.latLngBounds();
    let hasValidBounds = false;

    zonas.forEach(zona => {
        try {
            if (zona.geojson) {
                const parsed = typeof zona.geojson === 'string' ? JSON.parse(zona.geojson) : zona.geojson;
                
                let coords = [];
                if (parsed.type === 'FeatureCollection' && parsed.features.length > 0) {
                    coords = parsed.features[0].geometry.coordinates[0];
                } else if (parsed.type === 'Feature' && parsed.geometry.type === 'Polygon') {
                    coords = parsed.geometry.coordinates[0];
                }
                
                if (coords && coords.length > 0) {
                    const latLngs = coords.map(c => [c[1], c[0]]);
                    parsedZonas.push({ ...zona, latLngs });
                    
                    latLngs.forEach(latlng => {
                        _bounds.extend(latlng);
                        hasValidBounds = true;
                    });
                }
            }
        } catch (e) {
            console.error("Error parsing zone geojson:", zona.id, e);
        }
    });

    return (
        <div style={{ height: 'calc(100vh - 12rem)', minHeight: '500px', width: '100%', borderRadius: '0.5rem', overflow: 'hidden', border: '1px solid #e2e8f0', zIndex: 0 }}>
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
                
                {parsedZonas.map(zona => {
                    const isHovered = hoveredZone === zona.id;
                    const baseColor = zona.activo ? "#22c55e" : "#ef4444"; // green / red
                    const color = isHovered ? "#3b82f6" : baseColor; // blue if hovered
                    
                    return (
                        <Polygon 
                            key={`${zona.id}-${isHovered}`} 
                            positions={zona.latLngs} 
                            pathOptions={{
                                color: color,
                                fillColor: color,
                                fillOpacity: isHovered ? 0.6 : 0.4,
                                weight: isHovered ? 4 : 2
                            }}
                        >
                            <Popup>
                                <strong>{zona.nombre}</strong><br/>
                                {zona.activo ? 'Activo' : 'Inactiva'}
                            </Popup>
                        </Polygon>
                    );
                })}

                {hasValidBounds && <FitAllBounds bounds={_bounds} />}
            </MapContainer>
        </div>
    );
}
