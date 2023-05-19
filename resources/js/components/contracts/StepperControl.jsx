const StepperControl = ({page, setPage, formTitles, addContract, setModalDisplay}) => {
    return (
        <>
            <div class="flex items-center justify-between mt-5">
                <button
                    disabled={page === 0}
                    onClick={() => {
                        setPage((currPage) => currPage - 1)
                    }}
                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Back </button>
                <button
                    // disabled={page === formTitles.length - 1}
                    onClick={() => {
                        if(page === formTitles.length -1){
                            setModalDisplay(false)
                            addContract()
                        }
                        setPage((currPage) => currPage + 1)
                    }} 
                    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Next </button>
            </div>
            {/* https://youtu.be/YFHuaOl7frk 22 min*/}
        </>
    )
}

export default StepperControl;