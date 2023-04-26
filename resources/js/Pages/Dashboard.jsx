import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Dashboard({ auth }) {

    const [contracts, setContracts] = useState([]);

    const getContracts = () => {
        axios.get('http://127.0.0.1:8000/api/contracts')
            .then(res => {
                setContracts(res.data.data)
                // setContracts(res.data);
            })
            .catch(error => {
                console.log(error)
            })
    }

    useEffect(() => {
        getContracts();
    }, []);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="container mx-auto mt-8">

                {

                    !contracts ?
                    <h1>Loading...</h1>
                    :
                    // console.log(contracts.data)
                    contracts.map((contract) => {
                        return (
                            <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{contract.contract_id}</h5>
                                </a>
                                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">{contract.title}</p>

                                <a href={'http://127.0.0.1:8000/contract/certification/' + contract.contract_id} class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Read more</a>

                            </div>
                        )
                    })
                }



            </div>




        </AuthenticatedLayout>
    );
}
