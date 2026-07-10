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
    const [importMode, setImportMode] = useState(null);
    const [pdfFile, setPdfFile] = useState(null);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState(null);
    const [importedContract, setImportedContract] = useState(null);

    const handlePdfChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setPdfFile(file);
            setImportError(null);
            setImportedContract(null);
        } else {
            setImportError('Please select a valid PDF file.');
        }
    };

    const handleImportPdf = () => {
        if (!pdfFile) {
            setImportError('Please select a PDF file first.');
            return;
        }

        setIsImporting(true);
        setImportError(null);
        setImportedContract(null);

        const formData = new FormData();
        formData.append('pdf', pdfFile);

        axios.post('/api/contracts/import-pdf', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        })
        .then(res => {
            setIsImporting(false);
            if (res.data.success) {
                setImportedContract(res.data.data);
                getContracts();
            } else {
                setImportError(res.data.message || 'Failed to import contract.');
            }
        })
        .catch(err => {
            setIsImporting(false);
            const msg = err.response?.data?.message || 'An error occurred during upload.';
            setImportError(msg);
        });
    };

    const handleCloseModal = () => {
        setModalDisplay(false);
        setImportMode(null);
        setPdfFile(null);
        setImportError(null);
        setImportedContract(null);
        setIsImporting(false);
        setPage(0);
    };

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
                onClick={() => { setModalDisplay(true); setImportMode(null); setPdfFile(null); setImportError(null); setImportedContract(null); }}
                aria-label="Add Contract"
                className="fixed bottom-6 right-6 z-20 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white shadow-[0_14px_30px_rgba(15,23,42,0.24)] transition hover:-translate-y-1 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300"
            >
                <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden="true">
                    <path d="M11 4a1 1 0 10-2 0v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4z" />
                </svg>
            </button>

            <Modal show={modalDisplay}>
                <div className="relative rounded-2xl bg-white shadow-xl border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                        <div className="flex items-center gap-2">
                            {importMode !== null && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setImportMode(null);
                                        setPdfFile(null);
                                        setImportError(null);
                                        setImportedContract(null);
                                    }}
                                    className="mr-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                                    </svg>
                                    Back
                                </button>
                            )}
                            <h3 className="text-base font-bold text-slate-900">
                                {importMode === 'manual' ? 'Add Contract Manually' : importMode === 'ai' ? 'Import PDF with Gemini' : 'Create New Contract'}
                            </h3>
                        </div>
                        <button type="button" onClick={handleCloseModal} className="inline-flex items-center rounded-lg bg-transparent p-1.5 text-sm text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition">
                            <svg aria-hidden="true" className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                            <span className="sr-only">Close modal</span>
                        </button>
                    </div>

                    <div className="px-6 py-6">
                        {importMode === null && (
                            <div className="space-y-6">
                                <p className="text-sm text-slate-500 text-center">
                                    Choose how you want to add a contract to BidWatch.
                                </p>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <button
                                        type="button"
                                        onClick={() => setImportMode('manual')}
                                        className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:border-slate-400 hover:shadow-md focus:outline-none"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                                            </svg>
                                        </div>
                                        <h4 className="mt-4 text-sm font-semibold text-slate-950">Manual Setup</h4>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Manually enter contract metadata, dates, and schedules.
                                        </p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setImportMode('ai')}
                                        className="group relative flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm transition hover:border-slate-400 hover:shadow-md focus:outline-none"
                                    >
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-50 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition-colors duration-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-11.761a2.67 2.67 0 00-2.316-4.32H14.18L15 3L6.018 14.761a2.67 2.67 0 002.316 4.32H9.813z" />
                                            </svg>
                                        </div>
                                        <h4 className="mt-4 text-sm font-semibold text-slate-950">Gemini PDF Import</h4>
                                        <p className="mt-1 text-xs text-slate-500">
                                            Upload a bidding PDF. Gemini automatically registers the details.
                                        </p>
                                    </button>
                                </div>
                            </div>
                        )}

                        {importMode === 'manual' && (
                            <div>
                                <Stepper page={page} formTitles={formTitles} />
                                <div className="mt-4">
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
                        )}

                        {importMode === 'ai' && (
                            <div className="space-y-6">
                                {!importedContract && !isImporting && (
                                    <div className="flex flex-col items-center justify-center">
                                        <label
                                            htmlFor="pdf-upload"
                                            className="flex w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 py-10 hover:bg-slate-100 transition duration-300"
                                        >
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <svg className="mb-3 h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path>
                                                </svg>
                                                <p className="mb-2 text-sm text-slate-700">
                                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                                </p>
                                                <p className="text-xs text-slate-500">PDF Document (Max 10MB)</p>
                                            </div>
                                            <input
                                                id="pdf-upload"
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                onChange={handlePdfChange}
                                            />
                                        </label>

                                        {pdfFile && (
                                            <div className="mt-4 w-full rounded-xl bg-slate-100 p-3 flex items-center justify-between border border-slate-200">
                                                <div className="flex items-center gap-2">
                                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-rose-500">
                                                        <path d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V11.25A8.25 8.25 0 0011.25 3H5.625z" />
                                                        <path d="M12.75 3v5.25c0 .621.504 1.125 1.125 1.125h5.25A8.287 8.287 0 0012.75 3z" />
                                                    </svg>
                                                    <div className="max-w-[200px] sm:max-w-[300px]">
                                                        <p className="text-xs font-semibold text-slate-900 truncate">{pdfFile.name}</p>
                                                        <p className="text-[10px] text-slate-500">{(pdfFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setPdfFile(null)}
                                                    className="text-xs font-medium text-rose-600 hover:text-rose-800 transition"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        )}

                                        {pdfFile && (
                                            <button
                                                type="button"
                                                onClick={handleImportPdf}
                                                className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 shadow-sm"
                                            >
                                                Process with Gemini
                                            </button>
                                        )}
                                    </div>
                                )}

                                {isImporting && (
                                    <div className="flex flex-col items-center justify-center py-10 space-y-4">
                                        <div className="relative flex items-center justify-center">
                                            <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-200 border-t-sky-600"></div>
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="absolute w-6 h-6 text-sky-600 animate-pulse">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-11.761a2.67 2.67 0 00-2.316-4.32H14.18L15 3L6.018 14.761a2.67 2.67 0 002.316 4.32H9.813z" />
                                            </svg>
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-sm font-semibold text-slate-900">Gemini is analyzing PDF...</p>
                                            <p className="text-xs text-slate-500 max-w-[280px]">
                                                Extracting contract titles, approved budgets, dates, and schedules. This may take a moment.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {importError && (
                                    <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-rose-700 text-xs">
                                        <div className="flex gap-2">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                                            </svg>
                                            <div>
                                                <span className="font-semibold">Import Error:</span> {importError}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {importedContract && (
                                    <div className="space-y-6">
                                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-emerald-900 text-center">
                                            <div className="inline-flex items-center justify-center rounded-full bg-emerald-100 p-2 text-emerald-600 mb-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-6 h-6">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <h4 className="text-sm font-bold">Successfully Imported!</h4>
                                            <p className="text-xs text-emerald-700 mt-1">
                                                The contract details have been extracted and registered in the database.
                                            </p>
                                        </div>

                                        <div className="border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50">
                                            <div className="border-b border-slate-100 bg-slate-50 px-4 py-3">
                                                <h5 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">Contract Summary</h5>
                                            </div>
                                            <div className="p-4 space-y-3 text-xs text-slate-700 divide-y divide-slate-100">
                                                <div className="flex justify-between py-1">
                                                    <span className="font-medium text-slate-500">Contract ID</span>
                                                    <span className="font-semibold text-slate-900">{importedContract.contract_id}</span>
                                                </div>
                                                <div className="flex flex-col py-1.5">
                                                    <span className="font-medium text-slate-500 mb-0.5">Title</span>
                                                    <span className="font-semibold text-slate-900">{importedContract.title}</span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span className="font-medium text-slate-500">Approved Budget</span>
                                                    <span className="font-semibold text-slate-900">
                                                        ₱{parseFloat(importedContract.approved_budget).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span className="font-medium text-slate-500">Location</span>
                                                    <span className="font-semibold text-slate-900">{importedContract.location || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span className="font-medium text-slate-500">Opening of Bids</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {importedContract.opening_of_bids ? moment(importedContract.opening_of_bids).format('MMMM DD, YYYY @ hh:mm a') : 'N/A'}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between py-1">
                                                    <span className="font-medium text-slate-500">Pre-Bid</span>
                                                    <span className="font-semibold text-slate-900">
                                                        {importedContract.pre_bid ? moment(importedContract.pre_bid).format('MMMM DD, YYYY @ hh:mm a') : 'N/A'}
                                                    </span>
                                                </div>
                                                {importedContract.pdf_path && (
                                                    <div className="flex justify-between py-1">
                                                        <span className="font-medium text-slate-500">Uploaded PDF</span>
                                                        <a
                                                            href={`/storage/${importedContract.pdf_path.replace('public/', '')}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="font-semibold text-sky-600 hover:text-sky-800 underline"
                                                        >
                                                            View Document
                                                        </a>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={handleCloseModal}
                                            className="w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                                        >
                                            Done
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </Modal>


        </AuthenticatedLayout>
    );
}
