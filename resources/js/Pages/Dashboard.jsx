import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/components/Modal';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import DateObject from 'react-date-object';

export default function Dashboard({ auth }) {

    const [contracts, setContracts] = useState();
    const [apiUrl, setApiUrl] = useState('/api/contracts');
    const [step, setStep] = useState(1);
    const [modalDisplay, setModalDisplay] = useState(false);

    const getContracts = () => {
        axios.get(apiUrl)
            .then(res => {
                setContracts(res.data)
                // setContracts(res.data);
            })
            .catch(error => {
                console.log(error)
            })
    }

    useEffect(() => {
        getContracts();
    }, [apiUrl]);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="container static mx-auto mt-8 grid grid-cols-3 gap-8">

                {

                    !contracts ?
                    (
                        <div>
                            <div className="px-7 py-1 text-lg font-medium leading-none text-center text-blue-800 bg-blue-200 rounded-full animate-pulse dark:bg-blue-900 dark:text-blue-200">loading...</div>
                        </div>
                    )
                    :
                    // console.log(contracts.data)
                    contracts.data.map((contract) => {
                        return (
                            <div className="max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                                <a href="#">
                                    <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{contract.contract_id}</h5>
                                </a>
                                <p className="mb-1 text-2xm font-bold text-gray-700 dark:text-gray-400">{contract.title}</p>
                                {/* <h2 class=" text-lg font-bold text-gray-900 dark:text-white">BID Schedule</h2> */}
                                <p><small>Pre-Bid Conference: <b>{contract.pre_bid_schedule === null ? '---' : new DateObject(contract.pre_bid_schedule).format("MMMM DD, YYYY @ hh:mm a")}</b></small></p>
                                <p><small>Opening of Bids: <b>{new DateObject(contract.opening_of_bids_schedule).format("MMMM DD, YYYY @ hh:mm a")}</b></small></p>
                                <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">Posting: {contract.bulletinboard_posting} to {contract.bulletinboard_removal}</p>
                                <a href={'http://127.0.0.1:8000/contract/certification/' + contract.contract_id} target='_blank' className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Certification</a>
                            </div>
                        )
                    })
                }

            </div>

            <div className='absolute bottom-5 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mx-auto'>
                <nav aria-label="Page navigation example">

                        {
                            !contracts ? '' :
                            (
                                <div>
                                    <span class="text-sm text-gray-700 dark:text-gray-400">
                                        Showing <span class="font-semibold text-gray-900 dark:text-white">{contracts.meta.from}</span> to <span class="font-semibold text-gray-900 dark:text-white">{contracts.meta.to}</span> of <span class="font-semibold text-gray-900 dark:text-white">{contracts.meta.total}</span> Entries
                                    </span>
                                    <div>
                                        <ul className="inline-flex -space-x-px">
                                            <li>
                                                <button onClick={() => (setApiUrl(contracts.links.prev))} disabled={contracts.links.prev === null ? true : false} className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</button>
                                            </li>
                                            <li>
                                                <button onClick={() => (setApiUrl(contracts.links.next))} disabled={contracts.links.next === null ? true : false} className="px-6 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</button>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )
                        }



                </nav>
            </div>

            <label onClick={() => setModalDisplay(true)} className="text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700 absolute bottom-10 right-10">
                <svg viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="w-6 h-6 inline-block">
                    <path fill="#FFFFFF" d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601
                                    C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399
                                    C15.952,9,16,9.447,16,10z" />
                </svg>
            </label>

            <Modal show={modalDisplay}>
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button type="button" onClick={() => setModalDisplay(false)} class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                    <span class="sr-only">Close modal</span>
                </button>
                <div class="px-6 py-6 lg:px-8">
                    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Add New Contract</h3>

                    <ol class="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base mb-5">
                        <li class="flex md:w-full items-center text-blue-600 dark:text-blue-500 sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
                            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                                <svg aria-hidden="true" class="w-4 h-4 mr-2 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                Contract <span class="hidden sm:inline-flex sm:ml-2">Details</span>
                            </span>
                        </li>
                        {/* <li class="flex md:w-full items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700">
                            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                                <span class="mr-2">2</span>
                                Contract <span class="hidden sm:inline-flex sm:ml-2">Schedules</span>
                            </span>
                        </li> */}
                        <li class="flex items-center">
                            <span class="mr-2">3</span>
                            Contract <span class="hidden sm:inline-flex sm:ml-2">Schedules</span>
                        </li>
                    </ol>

                    <form class="space-y-6" action="#">
                        <div>
                            <label for="contract_id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contract ID</label>
                            <input type="contract_id" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="23FL0000" required />
                        </div>
                        <div className='mb-1'>
                            <label for="contract_title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                            <textarea id="contract_title" placeholder="Construction of Infra...." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div className='mb-1'>
                            <label for="contract_title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Details</label>
                            <textarea id="contract_title" placeholder="...." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label for="contract_location" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location</label>
                            <input type="contract_location" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Brgy. Balud Norte, Gubat, Sorsogon...." required />
                        </div>
                        <div>
                            <label for="contract_approved_budget" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Approved Budget</label>
                            <input type="contract_approved_budget" name="email" id="email" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="P 99,000,000.00" required />
                        </div>

                        {/* <label className='mt-3'>Bulletinboard Posting Schedule</label>
                        <div date-rangepicker class="flex items-center" style={{marginTop: '0px'}}>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>
                            </div>
                            <input name="start" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date start"/>
                        </div>
                        <span class="mx-4 text-gray-500">to</span>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <svg aria-hidden="true" class="w-5 h-5 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clip-rule="evenodd"></path></svg>
                            </div>
                            <input name="end" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Select date end" />
                        </div>
                        </div> */}

                        <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit Contract</button>

                    </form>
                </div>
            </div>
            </Modal>


        </AuthenticatedLayout>
    );
}
