import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from "@inertiajs/react"
import { Container } from "react-bootstrap"
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import React from 'react'



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
            <Container>

            </Container>

            <h1>Map here...</h1>

        </AuthenticatedLayout>
    )
}

export default Map
