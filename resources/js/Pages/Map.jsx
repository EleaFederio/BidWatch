import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from "@inertiajs/react"
import { Container } from "react-bootstrap"
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React from 'react'

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

    return(
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Infrastructure Map</h2>}
        >
            <Head>
                <title>Bid-Watch - Calendar</title>
            </Head>

            <Container fluid className="p-0" style={{height: 'calc(100vh - 80px)', minHeight: 400, display: 'flex', flexDirection: 'column'}}>
                {/* Leaflet Map fills the container */}
                <div style={{ flex: 1, minHeight: 0 }}>
                    <MapContainer center={[12.9739, 124.0113]} zoom={13} style={{ height: '100%', width: '100%' }}>
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
            </Container>

            

        </AuthenticatedLayout>
    )
}

export default Map
