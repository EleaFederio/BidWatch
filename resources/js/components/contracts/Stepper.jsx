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

const Stepper = ({steps, currentStep}) => {

    const [newStep, setNewStep] = useState([]);
    const stepRef = useRef();

    useEffect(() => {
        const stepState = steps.map((step, index) => Object.assign(
            {},
            {
                description: step,
                completed: false,
                highlighted: index === 0 ? true : false,
                selected: index === 0 ? true : false 
            }
        ))
    }, steps, currentStep)

    return (
        <>
            <ol class="flex items-center w-full text-sm font-medium text-center text-gray-500 dark:text-gray-400 sm:text-base mb-5">
                {displaySteps}
            </ol>
        </>
    )
}

export default Stepper;