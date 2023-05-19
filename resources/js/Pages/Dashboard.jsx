import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/components/Modal';
import Stepper from '@/components/contracts/Stepper';
import StepperControl from '@/components/contracts/StepperControl';
import ContractDetailsForm from '@/components/contracts/steps/ContractDetailsForm';
import ContractScheduleForm from '@/components/contracts/steps/ContractScheduleForm';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import DateObject from 'react-date-object';

export default function Dashboard({ auth }) {

    const [contracts, setContracts] = useState();
    const [apiUrl, setApiUrl] = useState('/api/contracts');
    const [contractData, setContractData] = useState({
        contract_id : "23FL0000",
        contract_title : "",
        contract_location : "",
        contract_details : "",
        contract_approved_budget : 0.00,
        pre_bid : null,
        opening_of_bids : null,
        bulletin_posting : null,
        bulletin_removal: null,
        archieve : false
    })

    const [page, setPage] = useState(0);

    const formTitles = [
        "Contract Details",
        "Contract Schedule",
        "Submit"
    ];

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

    const handleChange = e => {
        const { name, value } = e.target;
        setContractData(contractData => ({
            ...contractData,
            [name]: value
        }));
        console.log(contractData)
    };

    const pageDisplay = () => {
        switch(page){
            case 0:
                return <ContractDetailsForm contractData={contractData} handleChange={handleChange} />
            case 1:
                return <ContractScheduleForm contractData={contractData} setContractData={setContractData} handleChange={handleChange} />
        }
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
                    <Stepper page={page} formTitles={formTitles} />
                    <div>
                        {pageDisplay()}
                    </div>
                    <StepperControl
                        page={page}
                        formTitles={formTitles}
                        setPage={setPage}
                    />
                </div>
            </div>
            </Modal>


        </AuthenticatedLayout>
    );
}
