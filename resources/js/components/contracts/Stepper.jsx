import { useEffect, useRef, useState } from "react";

const displaySteps = (
    <>
         <li class="flex items-center text-blue-600 dark:text-blue-500 space-x-2.5">
        <span class="flex items-center justify-center w-8 h-8 border border-blue-600 rounded-full shrink-0 dark:border-blue-500">
            1
        </span>
        <span>
            <h3 class="font-medium leading-tight">User info</h3>
            <p class="text-sm">Step details here</p>
        </span>
    </li>
    </>
)

const Stepper = ({page, formTitles}) => {

    return (
        <>
            <h3 class="mb-4 text-xl font-medium text-gray-900 dark:text-white">{formTitles[page]}</h3>
        </>
    )
}

export default Stepper;
