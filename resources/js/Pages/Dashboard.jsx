import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import DateObject from 'react-date-object';

export default function Dashboard({ auth }) {

    const [contracts, setContracts] = useState();
    const [apiUrl, setApiUrl] = useState('');

    const getContracts = () => {
        axios.get('http://oxufa.localtonet.com/api/contracts')
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

            <div className="container mx-auto mt-8 grid grid-cols-3 gap-8">

                {

                    !contracts ?
                    (
                        <div>
                            <div class="px-7 py-1 text-lg font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">loading...</div>
                        </div>
                    )
                    :
                    // console.log(contracts.data)
                    contracts.map((contract) => {
                        return (
                            <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{contract.contract_id}</h5>
                                </a>
                                <p className="mb-1 text-2xm font-bold text-gray-700 dark:text-gray-400">{contract.title}</p>
                                {/* <h2 class=" text-lg font-bold text-gray-900 dark:text-white">BID Schedule</h2> */}
                                <p><small>Pre-Bid Conference: <b>{new DateObject(contract.pre_bid_schedule).format("MMMM DD, YYYY @ hh:mm a")}</b></small></p>
                                <p><small>Opening of Bids: <b>{new DateObject(contract.opening_of_bids_schedule).format("MMMM DD, YYYY @ hh:mm a")}</b></small></p>
                                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Posting: {contract.bulletinboard_posting} to {contract.bulletinboard_removal}</p>
                                <a href={'http://127.0.0.1:8000/contract/certification/' + contract.contract_id} target='_blank' class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Certification</a>
                            </div>
                        )
                    })
                }

            </div>

            <div className='mx-auto'>
                <nav aria-label="Page navigation example">
                    <ul class="inline-flex -space-x-px">
                        <li>
                        <a href="#" class="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</a>
                        </li>
                        <li>
                        <a href="#" class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">5</a>
                        </li>
                        <li>
                        <a href="#" class="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>




        </AuthenticatedLayout>
    );
}
