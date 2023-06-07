import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ViewState } from '@devexpress/dx-react-scheduler';
import { Appointments, MonthView, Scheduler } from '@devexpress/dx-react-scheduler-material-ui';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Dashboard({ auth }) {

    const currentDate = '2023-06-07';
    const [data, setData] = useState([]);

    const getMonthlySchedule = () => {
        axios.get('http://127.0.0.1:8000/api/contract_schedule/month')
            .then(res => {
                console.log(res.data.data)
                setData(res.data.data)
            })
            .catch(error => {
                console.log(error)
            })
    }

    useEffect(() => {
        getMonthlySchedule()
    }, [])

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Calendar</h2>}
        >

            {
                !data ?
                <h1>Loading...</h1> :
                (
                    <Scheduler
                        data={data}
                    >
                        <ViewState currentDate={new Date()} />
                        <MonthView />
                        <Appointments />
                    </Scheduler>
                )
            }

        </AuthenticatedLayout>
    );
}
