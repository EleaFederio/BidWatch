import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ViewState } from '@devexpress/dx-react-scheduler';
import { Appointments, DateNavigator, DayView, MonthView, Scheduler, TodayButton, Toolbar, ViewSwitcher } from '@devexpress/dx-react-scheduler-material-ui';
import { Head } from '@inertiajs/react';
import { Paper } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

export default function Dashboard({ auth }) {

    const currentDate = '2023-06-07';
    const [data, setData] = useState([]);

    const getMonthlySchedule = () => {
        axios.get('api/contract_schedule/month')
            .then(res => {
                console.log(res.data)
                setData(res.data)
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
            <Head>
                <title>Bid-Watch - Calendar</title>
            </Head>
            <Container>
            {
                !data ?
                <h1>Loading...</h1> :
                (
                    <Paper className='mt-5'>
                        <Scheduler
                            data={data}
                        >
                            <ViewState defaultCurrentDate={new Date()} />
                            <MonthView />
                            <DayView />
                            <Toolbar/>
                            <ViewSwitcher/>
                            <DateNavigator/>
                            <TodayButton/>
                            <Appointments />
                        </Scheduler>
                    </Paper>
                )
            }
            </Container>

        </AuthenticatedLayout>
    );
}
