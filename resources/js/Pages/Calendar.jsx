import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ViewState } from '@devexpress/dx-react-scheduler';
import { Appointments, DateNavigator, DayView, MonthView, Scheduler, TodayButton, Toolbar, ViewSwitcher } from '@devexpress/dx-react-scheduler-material-ui';
import { Head, router } from '@inertiajs/react';
import { Paper } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';

const isContractSchedule = (appointment) =>
    appointment?.contract_id &&
    appointment?.title &&
    (
        appointment.title.includes('Pre-bid Conference') ||
        appointment.title.includes('Opening of Bids')
    );

// Custom Appointment component
const CustomAppointment = ({ data, ...restProps }) => {
    let backgroundColor = '';
    const clickable = isContractSchedule(data);
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
            onClick={clickable ? () => router.visit(`/contracts/${data.contract_id}`) : restProps.onClick}
            style={{
                ...restProps.style,
                backgroundColor,
                color: '#fff', // ensure text is readable
                cursor: clickable ? 'pointer' : restProps.style?.cursor,
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

    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const getMonthlySchedule = () => {
        setIsLoading(true);
        axios.get('api/contract_schedule/month')
            .then(res => {
                setData(res.data)
            })
            .catch(error => {
                console.log(error)
            })
            .finally(() => {
                setIsLoading(false)
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
            <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
                <section className="site-panel mt-6 overflow-hidden rounded-[30px]">
                    <div className="flex flex-col gap-3 border-b border-[#00234714] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#003f7d]">
                                Interactive Planner
                            </p>
                            <h3 className="mt-1 text-xl font-semibold text-[#002347]">
                                Procurement activity calendar
                            </h3>
                        </div>
                        <p className="max-w-md text-sm leading-6 text-[#575757]">
                            Switch between month and day views, jump to today, and scan schedule types faster with color-coded appointments.
                        </p>
                    </div>

                    <div className="calendar-scheduler p-3 sm:p-5">
                        {isLoading ? (
                            <div className="flex min-h-[520px] items-center justify-center rounded-[24px] border border-dashed border-[#0023471f] bg-white/60 px-6 text-center">
                                <div>
                                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-[#003f7d]">
                                        Loading
                                    </p>
                                    <h3 className="mt-2 text-2xl font-semibold text-[#002347]">
                                        Preparing the calendar view
                                    </h3>
                                    <p className="mt-2 text-sm text-[#575757]">
                                        We&apos;re gathering the latest monthly schedule.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <Paper elevation={0} className="rounded-[24px] border border-[#00234712] bg-white/95 shadow-none">
                                <Scheduler data={data}>
                                    <ViewState defaultCurrentDate={new Date()} />
                                    <MonthView cellComponent={CustomMonthCell} />
                                    <DayView />
                                    <Toolbar />
                                    <ViewSwitcher />
                                    <DateNavigator />
                                    <TodayButton />
                                    <Appointments appointmentComponent={CustomAppointment} />
                                </Scheduler>
                            </Paper>
                        )}
                    </div>
                </section>
            </div>

        </AuthenticatedLayout>
    );
}
