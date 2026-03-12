import { Modal } from "flowbite";


import React, { useState } from 'react';

export default function AddContractModal (props) {
    // Stepper state
    const [step, setStep] = useState(0);
    // Form state
    const [form, setForm] = useState({
        contract_id: '',
        contract_title: '',
        contract_details: '',
        contract_location: '',
        contract_approved_budget: ''
    });

    // Handle input change
    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Handle submit
    const handleSubmit = (e) => {
        e.preventDefault();
        // ...submit logic here (e.g., API call)
        // After submit, reset form and stepper
        setForm({
            contract_id: '',
            contract_title: '',
            contract_details: '',
            contract_location: '',
            contract_approved_budget: ''
        });
        setStep(0);
    };

    return (
        <Modal show={true}>
            <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <button type="button" onClick={() => props.setModalDisplay(false)} class="absolute top-3 right-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-800 dark:hover:text-white" data-modal-hide="authentication-modal">
                    <svg aria-hidden="true" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                    <span class="sr-only">Close modal</span>
                </button>
                <div class="px-6 py-6 lg:px-8">
                    <ol class="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base">
                        <li class={"flex md:w-full items-center " + (step === 0 ? "text-blue-600 dark:text-blue-500" : "") + " sm:after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700"}>
                            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                                <svg aria-hidden="true" class="w-4 h-4 mr-2 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                                Personal <span class="hidden sm:inline-flex sm:ml-2">Info</span>
                            </span>
                        </li>
                        <li class={"flex md:w-full items-center " + (step === 1 ? "text-blue-600 dark:text-blue-500" : "") + " after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-200 after:border-1 after:hidden sm:after:inline-block after:mx-6 xl:after:mx-10 dark:after:border-gray-700"}>
                            <span class="flex items-center after:content-['/'] sm:after:hidden after:mx-2 after:text-gray-200 dark:after:text-gray-500">
                                <span class="mr-2">2</span>
                                Account <span class="hidden sm:inline-flex sm:ml-2">Info</span>
                            </span>
                        </li>
                        <li class={"flex items-center " + (step === 2 ? "text-blue-600 dark:text-blue-500" : "") }>
                            <span class="mr-2">3</span>
                            Confirmation
                        </li>
                    </ol>
                    <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">Add New Contract</h3>
                    <form class="space-y-6" action="#" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="contract_id" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contract ID</label>
                            <input type="text" name="contract_id" id="contract_id" value={form.contract_id} onChange={handleChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="26FL0000" required />
                        </div>
                        <div className='mb-1'>
                            <label htmlFor="contract_title" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                            <textarea id="contract_title" name="contract_title" value={form.contract_title} onChange={handleChange} placeholder="Construction of Infra...." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div className='mb-1'>
                            <label htmlFor="contract_details" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Details</label>
                            <textarea id="contract_details" name="contract_details" value={form.contract_details} onChange={handleChange} placeholder="...." class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
                        </div>
                        <div>
                            <label htmlFor="contract_location" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location</label>
                            <input type="text" name="contract_location" id="contract_location" value={form.contract_location} onChange={handleChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Brgy. Balud Norte, Gubat, Sorsogon...." required />
                        </div>
                        <div>
                            <label htmlFor="contract_approved_budget" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Approved Budget</label>
                            <input type="text" name="contract_approved_budget" id="contract_approved_budget" value={form.contract_approved_budget} onChange={handleChange} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="P 99,000,000.00" required />
                        </div>
                        <button type="submit" class="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit Contract</button>
                    </form>
                </div>
            </div>
        </Modal>
    )
}
