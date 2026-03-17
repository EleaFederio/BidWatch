import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ViewState } from '@devexpress/dx-react-scheduler';
import { Appointments, DateNavigator, DayView, MonthView, Scheduler, TodayButton, Toolbar, ViewSwitcher } from '@devexpress/dx-react-scheduler-material-ui';
import { Head } from '@inertiajs/react';
import { Paper } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

// Custom Appointment component
const CustomAppointment = ({ data, ...restProps }) => {
    let backgroundColor = '';
    const today = new Date();
    const startDate = new Date(data.startDate);
    if (
        startDate.getFullYear() === today.getFullYear() &&
        startDate.getMonth() === today.getMonth() &&
        startDate.getDate() === today.getDate()
    ) {
        backgroundColor = '#2ecc40'; // green for today
    } else if (data.title && data.title.includes('Pre-bid Conference')) {
        backgroundColor = '#ff5003';
    } else if (data.title && data.title.includes('Opening of Bids')) {
        backgroundColor = '#003366';
    }
    return (
        <Appointments.Appointment
            {...restProps}
            data={data}
            style={{
                ...restProps.style,
                backgroundColor,
                color: '#fff', // ensure text is readable
            }}
        />
    );
};

// Custom Month Cell component
const CustomMonthCell = ({ startDate, ...restProps }) => {
    const today = new Date();
    const cellDate = new Date(startDate);
    const isToday = (
        cellDate.getFullYear() === today.getFullYear() &&
        cellDate.getMonth() === today.getMonth() &&
        cellDate.getDate() === today.getDate()
    );
    return (
        <MonthView.Cell
            {...restProps}
            startDate={startDate}
            style={{
                ...restProps.style,
                backgroundColor: isToday ? '#2ecc40' : restProps.style?.backgroundColor,
            }}
        />
    );
};

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
                            <MonthView cellComponent={CustomMonthCell} />
                            <DayView />
                            <Toolbar/>
                            <ViewSwitcher/>
                            <DateNavigator/>
                            <TodayButton/>
                            <Appointments appointmentComponent={CustomAppointment} />
                        </Scheduler>
                    </Paper>
                )
            }
            </Container>

        </AuthenticatedLayout>
    );
}
