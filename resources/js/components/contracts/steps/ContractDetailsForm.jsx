import React from 'react';

function formatCurrency(value) {
    if (value === undefined || value === null || value === '') return '';
    const parts = value.toString().split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
}

const ContractDetailsForm = ({contractData, handleChange}) => {
    const [budget, setBudget] = React.useState(contractData.contract_approved_budget || '');

    const handleBudgetChange = (e) => {
        let raw = e.target.value.replace(/,/g, '');
        // Only allow numbers and dot
        if (!/^\d*(\.\d*)?$/.test(raw)) return;
        setBudget(formatCurrency(raw));
        handleChange({
            ...e,
            target: {
                ...e.target,
                name: 'contract_approved_budget',
                value: raw
            }
        });
    };

    React.useEffect(() => {
        setBudget(formatCurrency(contractData.contract_approved_budget || ''));
    }, [contractData.contract_approved_budget]);

    return (
        <form className="space-y-6" action="#">
            <div>
                <label for="contract_id" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Contract ID</label>
                <input type="text" name="contract_id" id="contract_id" value={contractData.contract_id} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="26FL0000" required />
            </div>
            <div className='mb-1'>
                <label for="contract_title" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Title</label>
                <textarea id="contract_title" name="contract_title" placeholder="Construction of Infra...." value={contractData.contract_title} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
            </div>
            <div>
                <label for="contract_location" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Location</label>
                <input type="textarea" name="contract_location" id="contract_location" value={contractData.contract_location} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" placeholder="Brgy. Balud Norte, Gubat, Sorsogon...." required />
            </div>
            <div className='mb-1'>
                <label for="contract_details" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Details</label>
                <textarea id="contract_details" name="contract_details" placeholder="...." value={contractData.contract_details} onChange={handleChange} className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" required />
            </div>
            <div>
                <label htmlFor="contract_approved_budget" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Approved Budget</label>
                <input
                    type="text"
                    name="contract_approved_budget"
                    id="contract_approved_budget"
                    value={budget}
                    onChange={handleBudgetChange}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                    placeholder="P 99,000,000.00"
                    required
                    inputMode="decimal"
                    autoComplete="off"
                />
            </div>

            
        </form>
    )
}

export default ContractDetailsForm