import React from "react"
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from "@inertiajs/react";
import { Container } from "react-bootstrap";

const PhotoManager = ({auth}) => {
    return(
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Photo Manager</h2>}
        >
            <Head>
                <title>Bid-Watch - Photos</title>
            </Head>
            <Container>

            </Container>

            <h1>Photo Manager here...</h1>

        </AuthenticatedLayout>
    )
}

export default PhotoManager
