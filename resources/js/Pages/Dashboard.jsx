import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Modal from '@/components/Modal';
import Stepper from '@/components/contracts/Stepper';
import StepperControl from '@/components/contracts/StepperControl';
import ContractDetailsForm from '@/components/contracts/steps/ContractDetailsForm';
import ContractScheduleForm from '@/components/contracts/steps/ContractScheduleForm';
import { Head, Link } from '@inertiajs/react';
import { Card, CardBody, Typography } from '@material-tailwind/react';
import axios from 'axios';
import moment from 'moment/moment';
import { useEffect, useState } from 'react';
import DateObject from 'react-date-object';

const buildPaginationItems = (currentPage, lastPage) => {
    if (!currentPage || !lastPage) {
        return [];
    }

    const pages = new Set([1, lastPage, currentPage - 1, currentPage, currentPage + 1]);
    const filteredPages = [...pages]
        .filter((pageNumber) => pageNumber >= 1 && pageNumber <= lastPage)
        .sort((left, right) => left - right);

    return filteredPages.reduce((items, pageNumber, index) => {
        const previousPage = filteredPages[index - 1];

        if (previousPage && pageNumber - previousPage > 1) {
            items.push('ellipsis');
        }

        items.push(pageNumber);

        return items;
    }, []);
};

const formatSchedule = (value, fallback = 'Not scheduled') => {
    if (!value) {
        return fallback;
    }

    return new DateObject(value).format('MMMM DD, YYYY @ hh:mm a');
};

const viewModes = [
    { id: 'cards', label: 'Cards' },
    { id: 'list', label: 'List' },
];

export default function Dashboard({ auth }) {

    const [contracts, setContracts] = useState();
    const [apiUrl, setApiUrl] = useState('/api/contracts');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('cards');
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

    const addContract = () => {
        let data = {
            'contract_id' : contractData.contract_id,
            'title' : contractData.contract_title,
            'location' : contractData.contract_location,
            'description' : contractData.contract_details,
            'approved_budget' : contractData.contract_approved_budget,
            // Use 24-hour format for DB
            'pre_bid' : moment(contractData.pre_bid).format('YYYY-MM-DD HH:mm:ss'),
            'opening_of_bids' : moment(contractData.opening_of_bids).format('YYYY-MM-DD HH:mm:ss'),
            'bulletin_posting' : moment(contractData.bulletin_posting).format('YYYY-MM-DD'),
            'bulletin_removal' : moment(contractData.bulletin_removal).format('YYYY-MM-DD'),
            'archieve' : false
        }
        axios.post('api/contracts', data)
            .then(res => {
                console.log(res)
                getContracts();
                // Reset all forms and stepper
                setContractData({
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
                });
                setPage(0); // Stepper to step 1
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

    const downloadContract = (contract_id) => {
        console.log('contract/certification/' + contract_id);
        axios.get('contract/certification/' + contract_id, {responseType: 'blob'})
        .then(response => {
            console.log(response);
            window.open(URL.createObjectURL(response.data));
        })
        .catch(error => {

        })
    }

    useEffect(() => {
        getContracts();
    }, [apiUrl]);

    useEffect(() => {
        const trimmedSearch = searchTerm.trim();
        const timeoutId = setTimeout(() => {
            const searchQuery = trimmedSearch ? `?search=${encodeURIComponent(trimmedSearch)}` : '';
            setApiUrl(`/api/contracts${searchQuery}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    const paginationItems = contracts?.meta
        ? buildPaginationItems(contracts.meta.current_page, contracts.meta.last_page)
        : [];
    const contractItems = contracts?.data ?? [];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Dashboard</h2>}
        >
            <Head title="Dashboard" />

            <div className="container-fluid mt-8 px-4 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-amber-50 shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
                    <div className="border-b border-slate-200 px-6 py-6 sm:px-8">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                            <div className="max-w-2xl">
                                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                                    Contract Monitor
                                </p>
                                <p className="mt-3 text-sm leading-6 text-slate-600">
                                    Switch between a visual card layout and a denser list view depending on whether you are scanning schedules or comparing multiple contracts at once.
                                </p>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                                    <label htmlFor="contract-search" className="sr-only">
                                        Search contracts
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current text-slate-400" aria-hidden="true">
                                            <path fillRule="evenodd" d="M8.5 3a5.5 5.5 0 013.967 9.31l3.611 3.611a1 1 0 01-1.414 1.414l-3.611-3.611A5.5 5.5 0 118.5 3zm-3.5 5.5a3.5 3.5 0 117 0 3.5 3.5 0 01-7 0z" clipRule="evenodd" />
                                        </svg>
                                        <input
                                            id="contract-search"
                                            type="text"
                                            value={searchTerm}
                                            onChange={(event) => setSearchTerm(event.target.value)}
                                            placeholder="Search title, contract ID, or location"
                                            className="w-full min-w-[280px] border-0 bg-transparent p-0 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-0"
                                        />
                                    </div>
                                </div>
                                <div className="rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
                                    <div className="flex items-center gap-1">
                                        {viewModes.map((mode) => (
                                            <button
                                                key={mode.id}
                                                type="button"
                                                onClick={() => setViewMode(mode.id)}
                                                className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                                                    viewMode === mode.id
                                                        ? 'bg-slate-900 text-white shadow-sm'
                                                        : 'text-slate-600 hover:bg-slate-100'
                                                }`}
                                            >
                                                {mode.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                {contracts && (
                                    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                                        <span className="font-semibold text-slate-900">{contracts.meta.total}</span> total contracts
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-6 py-6 sm:px-8">
                        {!contracts ? (
                            <div className="flex min-h-[280px] items-center justify-center rounded-[24px] border border-dashed border-slate-300 bg-white/70">
                                <div className="rounded-full bg-sky-100 px-6 py-3 text-sm font-medium text-sky-700">
                                    Loading contracts...
                                </div>
                            </div>
                        ) : contractItems.length === 0 ? (
                            <div className="rounded-[24px] border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
                                <p className="text-lg font-semibold text-slate-900">No contracts yet</p>
                                <p className="mt-2 text-sm text-slate-500">Use the add button to create the first tracked project.</p>
                            </div>
                        ) : viewMode === 'cards' ? (
                            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                                {contractItems.map((contract) => (
                                    <Card key={contract.id} className="flex h-full flex-col overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.10)]">
                                        <div className="h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />
                                        <CardBody className="flex h-full flex-col p-3">
                                            <div className="flex items-start justify-between gap-3">
                                                <div>
                                                    <Typography
                                                        variant="h6"
                                                        className="max-w-[220px] overflow-hidden text-base leading-5 text-slate-900"
                                                        style={{
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 2,
                                                            WebkitBoxOrient: 'vertical',
                                                        }}
                                                        title={contract.title}
                                                    >
                                                        {contract.title}
                                                    </Typography>
                                                    <p className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                                                        {contract.contract_id}
                                                    </p>
                                                </div>
                                                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    contract.opening_of_bids_schedule
                                                        ? 'bg-emerald-50 text-emerald-700'
                                                        : 'bg-rose-50 text-rose-700'
                                                }`}>
                                                    {contract.opening_of_bids_schedule ? 'Active Schedule' : 'Cancelled'}
                                                </span>
                                            </div>

                                            <div className="mt-2.5 space-y-1">
                                                <div className="rounded-lg bg-slate-50 px-0 py-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Pre-Bid Conference</p>
                                                    <p className="mt-0.5 text-[11px] font-medium leading-[1.1rem] text-slate-800">
                                                        {formatSchedule(contract.pre_bid_schedule)}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg bg-slate-50 px-0 py-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Opening of Bids</p>
                                                    <p className={`mt-0.5 text-[11px] font-medium leading-[1.1rem] ${contract.opening_of_bids_schedule ? 'text-slate-800' : 'text-rose-600'}`}>
                                                        {formatSchedule(contract.opening_of_bids_schedule, 'Cancelled')}
                                                    </p>
                                                </div>
                                                <div className="rounded-lg border border-slate-200 bg-white px-0 py-0">
                                                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Bulletin Posting</p>
                                                    <p className="mt-0.5 text-[11px] leading-[1.1rem] text-slate-700">
                                                        {contract.bulletinboard_posting} to {contract.bulletinboard_removal}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="mt-3 flex items-center justify-between gap-2">
                                                <Link
                                                    href={`/contracts/${contract.contract_id}`}
                                                    className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold text-white transition hover:bg-slate-800"
                                                >
                                                    View Details
                                                </Link>
                                                <a
                                                    href={`contract/certification/${contract.contract_id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-[11px] font-semibold text-slate-600 transition hover:text-slate-900"
                                                >
                                                    Certification
                                                </a>
                                            </div>
                                        </CardBody>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
                                <div className="grid grid-cols-[1.3fr_1fr_1fr_auto] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                    <span>Contract</span>
                                    <span>Pre-Bid</span>
                                    <span>Opening of Bids</span>
                                    <span className="text-right">Actions</span>
                                </div>
                                <div className="divide-y divide-slate-200">
                                    {contractItems.map((contract) => (
                                        <div key={contract.id} className="grid grid-cols-1 gap-3 px-5 py-4 lg:grid-cols-[1.3fr_1fr_1fr_auto] lg:items-center">
                                            <div>
                                                <p className="text-sm font-semibold text-slate-900">{contract.title}</p>
                                                <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                                    {contract.contract_id}
                                                </p>
                                                <p className="mt-2 text-xs text-slate-600">
                                                    Posting: {contract.bulletinboard_posting} to {contract.bulletinboard_removal}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Pre-Bid</p>
                                                <p className="mt-1.5 text-xs text-slate-800">{formatSchedule(contract.pre_bid_schedule)}</p>
                                            </div>
                                            <div>
                                                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Opening</p>
                                                <p className={`mt-1.5 text-xs ${contract.opening_of_bids_schedule ? 'text-slate-800' : 'font-semibold text-rose-600'}`}>
                                                    {formatSchedule(contract.opening_of_bids_schedule, 'Cancelled')}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-3 lg:justify-end">
                                                <Link
                                                    href={`/contracts/${contract.contract_id}`}
                                                    className="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:border-slate-900 hover:text-slate-900"
                                                >
                                                    Open
                                                </Link>
                                                <a
                                                    href={`contract/certification/${contract.contract_id}`}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-800"
                                                >
                                                    Certification
                                                </a>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {contracts && (
                <div className="mx-auto mt-10 flex max-w-4xl flex-col items-center gap-4 px-4 pb-10 text-center">
                    <p className="text-sm text-gray-600">
                        Showing <span className="font-semibold text-gray-900">{contracts.meta.from ?? 0}</span> to <span className="font-semibold text-gray-900">{contracts.meta.to ?? 0}</span> of <span className="font-semibold text-gray-900">{contracts.meta.total}</span> entries
                    </p>
                    <nav aria-label="Dashboard pagination" className="flex flex-wrap items-center justify-center gap-2">
                        <button
                            onClick={() => setApiUrl(contracts.links.prev)}
                            disabled={!contracts.links.prev}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Previous
                        </button>

                        {paginationItems.map((item, index) => (
                            item === 'ellipsis' ? (
                                <span key={`ellipsis-${index}`} className="px-2 text-sm text-gray-400">
                                    ...
                                </span>
                            ) : (
                                <button
                                    key={item}
                                    onClick={() => setApiUrl(`/api/contracts?page=${item}`)}
                                    className={`min-w-[42px] rounded-lg px-4 py-2 text-sm font-medium transition ${
                                        contracts.meta.current_page === item
                                            ? 'bg-gray-900 text-white shadow-sm'
                                            : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    {item}
                                </button>
                            )
                        ))}

                        <button
                            onClick={() => setApiUrl(contracts.links.next)}
                            disabled={!contracts.links.next}
                            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Next
                        </button>
                    </nav>
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">
                        Page {contracts.meta.current_page} of {contracts.meta.last_page}
                    </p>
                </div>
            )}

            <button
                type="button"
                onClick={() => setModalDisplay(true)}
                aria-label="Add Contract"
                className="fixed bottom-6 right-6 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.24)] transition hover:-translate-y-1 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
                <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M11 4a1 1 0 10-2 0v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4z" />
                </svg>
            </button>

            <Modal show={modalDisplay}>
            <div className="relative rounded-lg bg-white shadow dark:bg-gray-700">
                <button type="button" onClick={() => setModalDisplay(false)} className="absolute right-2.5 top-3 ml-auto inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                    <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    <span className="sr-only">Close modal</span>
                </button>
                <div className="px-6 py-6 lg:px-8">
                    <Stepper page={page} formTitles={formTitles} />
                    <div>
                        {pageDisplay()}
                    </div>
                    <StepperControl
                        page={page}
                        formTitles={formTitles}
                        setPage={setPage}
                        setModalDisplay={setModalDisplay}
                        addContract={addContract}
                    />
                </div>
            </div>
            </Modal>


        </AuthenticatedLayout>
    );
}
