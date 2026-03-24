import React from "react"
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from "@inertiajs/react";
import { Container } from "react-bootstrap";

const Kanban = ({auth}) => {
    return(
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kanban - Manage Infra Report</h2>}
        >
            <Head>
                <title>PIO Kanban Manager</title>
            </Head>
            <Container>

            </Container>

        </AuthenticatedLayout>
    )
}

export default Kanban