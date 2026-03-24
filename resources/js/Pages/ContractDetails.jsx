import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ContractDetails from '@/components/contracts/ContractDetails';
import { Head } from '@inertiajs/react';

export default function ContractDetailsPage({ auth, contract }) {
    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Contract Details</h2>}
        >
            <Head title={`Contract ${contract.contract_id}`} />

            <div className="py-8">
                <ContractDetails contract={contract} />
            </div>
        </AuthenticatedLayout>
    );
}
