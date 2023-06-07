import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { ViewState } from '@devexpress/dx-react-scheduler';
import { Appointments, MonthView, Scheduler } from '@devexpress/dx-react-scheduler-material-ui';

export default function Dashboard({ auth }) {

    const currentDate = '2023-06-07';
    const schedulerData = [
        {
            title: '22FL0035 Opening of Bids',
            startDate: new Date(2023, 5, 7, 9, 30),
            endDate: new Date(2023, 5, 7, 11, 30),
        }, {
            title: '22FL0022 Pre-bid Conference',
            startDate: new Date(2023, 6, 6, 14, 0),
            endDate: new Date(2023, 6, 6, 14, 30),
        },{
            title: '22FL0023 Pre-bid Conference',
            startDate: new Date(2023, 6, 6, 14, 0),
            endDate: new Date(2023, 6, 6, 14, 30),
        },{
            title: '22FL0024 Pre-bid Conference',
            startDate: new Date(2023, 6, 6, 14, 0),
            endDate: new Date(2023, 6, 6, 14, 30),
        }
    ];

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Calendar</h2>}
        >

            <Scheduler
                data={schedulerData}
            >
                <ViewState currentDate={new Date()} />
                <MonthView />
                <Appointments />
            </Scheduler>

        </AuthenticatedLayout>
    );
}
