import { Link } from '@inertiajs/react';
import { Card, CardBody, Chip, Typography } from '@material-tailwind/react';
import DateObject from 'react-date-object';

const formatSchedule = (value) => {
    if (!value) {
        return 'Not scheduled';
    }

    return new DateObject(value).format('MMMM DD, YYYY @ hh:mm a');
};

const formatPostingDate = (value) => {
    if (!value) {
        return '---';
    }

    return new DateObject(value).format('MMMM DD, YYYY');
};

const formatBudget = (value) => {
    const amount = Number(value ?? 0);

    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
};

export default function ContractDetails({ contract }) {
    return (
        <div className="container mx-auto max-w-4xl px-4">
            <Card className="shadow-lg">
                <CardBody className="space-y-6">
                    <div className="flex flex-col gap-4 border-b border-blue-gray-50 pb-6 md:flex-row md:items-start md:justify-between">
                        <div>
                            <Typography variant="h3" color="blue-gray">
                                {contract.title}
                            </Typography>
                            <Typography variant="lead" className="mt-2 text-blue-gray-600">
                                {contract.contract_id}
                            </Typography>
                        </div>
                        <Chip
                            value={contract.archieve ? 'Archived' : 'Active'}
                            color={contract.archieve ? 'blue-gray' : 'green'}
                            className="w-fit"
                        />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Location
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {contract.location || 'No location provided'}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Approved Budget
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatBudget(contract.approved_budget)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Pre-Bid Conference
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatSchedule(contract.pre_bid)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Opening of Bids
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatSchedule(contract.opening_of_bids)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Bulletin Posting
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatPostingDate(contract.bulletin_posting)}
                            </Typography>
                        </div>
                        <div className="rounded-xl bg-blue-gray-50 p-4">
                            <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                                Bulletin Removal
                            </Typography>
                            <Typography className="mt-2 text-base text-blue-gray-900">
                                {formatPostingDate(contract.bulletin_removal)}
                            </Typography>
                        </div>
                    </div>

                    <div className="rounded-xl border border-blue-gray-50 p-5">
                        <Typography variant="small" className="font-semibold uppercase tracking-wide text-blue-gray-500">
                            Description
                        </Typography>
                        <Typography className="mt-3 whitespace-pre-line text-base leading-7 text-blue-gray-900">
                            {contract.description || 'No description provided'}
                        </Typography>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <Link
                            href="/dashboard"
                            className="rounded-lg bg-blue-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-gray-700"
                        >
                            Back to Dashboard
                        </Link>
                        <a
                            href={`/contract/certification/${contract.contract_id}`}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-lg border border-blue-gray-200 px-4 py-2 text-sm font-semibold text-blue-gray-800 transition hover:bg-blue-gray-50"
                        >
                            Open Certification
                        </a>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
}
