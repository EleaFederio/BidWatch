import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import DateObject from 'react-date-object';

export default function Dashboard({ auth }) {

    const [contracts, setContracts] = useState();
    const [apiUrl, setApiUrl] = useState('');
    const [step, setStep] = useState(1);

    const getContracts = () => {
        axios.get('/api/contracts')
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
                    contracts.map((contract) => {
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
                    <ul className="inline-flex -space-x-px">
                        <li>
                        <a href="#" className="px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Previous</a>
                        </li>
                        <li>
                        <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">5</a>
                        </li>
                        <li>
                        <a href="#" className="px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">Next</a>
                        </li>
                    </ul>
                </nav>
            </div>

            {/* <button type="button" class="absolute bottom-5 right-5 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2.5 text-center inline-flex items-center mr-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                <svg aria-hidden="true" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                <span class="sr-only">Icon description</span>
            </button> */}


            <label htmlFor="my-modal" className="btn btn-circle absolute bottom-10 right-10">
                <svg viewBox="0 0 20 20" enable-background="new 0 0 20 20" class="w-6 h-6 inline-block">
                    <path fill="#FFFFFF" d="M16,10c0,0.553-0.048,1-0.601,1H11v4.399C11,15.951,10.553,16,10,16c-0.553,0-1-0.049-1-0.601V11H4.601
                                            C4.049,11,4,10.553,4,10c0-0.553,0.049-1,0.601-1H9V4.601C9,4.048,9.447,4,10,4c0.553,0,1,0.048,1,0.601V9h4.399
                                            C15.952,9,16,9.447,16,10z" />
                </svg>
            </label>

            <input type="checkbox" id="my-modal" className="modal-toggle" />
            <div className="modal">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Add Contract</h3>

                {/* Steps */}
                <ul className="steps">
                    <li className="step step-primary">Contract Data</li>
                    <li className={ step === 2 ? "step step-primary" : "step"} >Contract Schedule</li>
                </ul>

                {/* Forms */}
                <div className="form-control w-full max-w-2xl">
                    <label className="label">
                        <span className="label-text-alt">Contract ID</span>
                    </label>
                    <input type="text" placeholder="Enter Contract ID..." className="input input-bordered input-sm w-full max-w-xs" />
                </div>

                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text-alt">Contract Title</span>
                    </label>
                    <textarea className="textarea textarea-bordered" placeholder="Enter Contract Title..."></textarea>
                </div>

                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text-alt">Contract Location</span>
                    </label>
                    <input type="text" placeholder="Enter Contract Location..." className="input input-bordered input-sm w-full max-w-xs" />
                </div>

                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text-alt">Contract Details</span>
                    </label>
                    <textarea className="textarea textarea-bordered" placeholder="Enter Contract Details..."></textarea>
                </div>

                <div className="form-control w-full max-w-xs">
                    <label className="label">
                        <span className="label-text-alt">Approved Budget</span>
                    </label>
                    <input type="text" placeholder="P 90,000,000.00..." className="input input-bordered input-sm w-full max-w-xs" />
                </div>

                <div className="modal-action">
                    <label htmlFor={step === 2 ? "" : "my-modal"} onClick={() => {step === 1 ? setStep(2) : setStep(1)}} className="btn">{step === 1 ? "Next Step" : "Submit"}</label>
                </div>
            </div>
            </div>
        </AuthenticatedLayout>
    );
}
