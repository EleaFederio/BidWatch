import { Fragment, useState } from "react"
import Datepicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"

const ContractScheduleForm = ({contractData, setContractData, handleChange}) => {

    const [preBidSchedule, setPreBidSchedule] = useState(null);
    const [openingOfBidSchedule, setOpeningOfBidSchedule] = useState(null);
    const [startOfPosting, setStartOfPosting] = useState(null);
    const [endOfPosting, setEndOfPosting] = useState(null);

    return (
        <Fragment>
            <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.6.3/datepicker.min.js"></script>

        <label>Pre-Bid Conference Schedule</label>
        <div className="flex flex-col mb-3">
            <div className="relative">
            <Datepicker
                selected={contractData.pre_bid}
                onChange={date=>setContractData(contractData => ({
                    ...contractData,
                    pre_bid: date
                }))}
                dateFormat="yyyy-MM-dd hh:mm:ss"
                showTimeInput
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            </div>
        </div>

        <label>Opening of Bids Schedule</label>
        <div className="flex flex-col mb-3">
            <div className="relative">
            <Datepicker
                selected={contractData.opening_of_bids}
                onChange={date=>setContractData(contractData => ({
                    ...contractData,
                    opening_of_bids: date
                }))}
                dateFormat="yyyy-MM-dd hh:mm:ss"
                showTimeInput
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            </div>
        </div>

        <label>Start of Posting</label>
        <div className="flex flex-col mb-3">
            <div className="relative">
            <Datepicker
                selected={contractData.bulletin_posting}
                onChange={date=>setContractData(contractData => ({
                    ...contractData,
                    bulletin_posting: date
                }))}
                dateFormat="yyyy-MM-dd"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            </div>
        </div>

        <label>End of Posting</label>
        <div className="flex flex-col mb-20">
            <div className="relative">
            <Datepicker
                selected={contractData.bulletin_removal}
                onChange={date=>setContractData(contractData => ({
                    ...contractData,
                    bulletin_removal: date
                }))}
                dateFormat="yyyy-MM-dd"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            />
            </div>
        </div>

        </Fragment>
    )
}

export default ContractScheduleForm
