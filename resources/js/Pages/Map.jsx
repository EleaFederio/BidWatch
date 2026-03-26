import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from "@inertiajs/react"
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React, { useEffect } from 'react'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';



const Map = ({ auth }) => {

    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: "YOUR_API_KEY"
    });

    const [map, setMap] = React.useState(null)

    const onLoad = React.useCallback(function callback(map) {
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);

        setMap(map)
    }, [])

    const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
    }, [])

    useEffect(() => {
        if (!map) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            map.invalidateSize();
        }, 100);

        return () => window.clearTimeout(timeoutId);
    }, [map]);

    return(
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Infrastructure Map</h2>}
        >
            <Head>
                <title>Bid-Watch - Calendar</title>
            </Head>

            <div className="w-full px-0" style={{ height: 'calc(100vh - 7rem)', minHeight: 400 }}>
                <div style={{ height: '100%', width: '100%' }}>
                    <MapContainer
                        center={[12.9739, 124.0113]}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                        whenCreated={setMap}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[12.9739, 124.0113]}>
                            <Popup>
                                Sorsogon, Philippines
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>
            </div>

            

        </AuthenticatedLayout>
    )
}

export default Map
