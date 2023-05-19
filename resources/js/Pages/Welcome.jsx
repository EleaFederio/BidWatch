import { Link, Head } from '@inertiajs/react';
import moment from 'moment';
import Container from 'react-bootstrap/Container';
import { useEffect, useState } from 'react';
import { Alert, Col, Row, Table } from 'react-bootstrap';
import axios from 'axios';

export default function Welcome({ auth, laravelVersion, phpVersion }) {

    const [currentDateTime, setCurrentDateTime] = useState(new Date())
    const [bacActivities, setBacActivities] = useState();

    const getBacActivities = () => {
        axios.get('/api/contract_schedule/bidding')
        .then(res => {
            setBacActivities(res)
        })
    }

    useEffect(()=>{
        getBacActivities()
        setInterval(() => setCurrentDateTime(new Date()), 1000)
    }, [])

    return (
        <>
            <Head title="Welcome" />
            <div className="relative sm:flex sm:justify-center sm:items-center min-h-screen bg-dots-darker bg-center bg-gray-100 dark:bg-dots-lighter dark:bg-gray-900 selection:bg-red-500 selection:text-white">
                <div className="sm:fixed sm:top-0 sm:right-0 p-6 text-right">
                    {auth.user ? (
                        <Link
                            href={route('dashboard')}
                            className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={route('login')}
                                className="font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Log in
                            </Link>

                            <Link
                                href={route('register')}
                                className="ml-4 font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline focus:outline-2 focus:rounded-sm focus:outline-red-500"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>

                
                

                <Container fluid>
                    <Row className='mt-5'>
                        <Col lg={10}>
                            <video autoPlay loop >
                                <source src='../storage/videos/videoloop.mp4' type='video/mp4' />
                            </video>
                        </Col>
                        <Col>
                            <h1 className='text-center'>BAC Activities</h1>
                            <Row className='h-50'>
                                <Col lg={12}>
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th className='text-center'>Pre-Bid Conference</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                            <Row>
                                <Col lg={12}>
                                    <Table>
                                        <thead>
                                            <tr>
                                                <th className='text-center'>Opening of Bids</th>
                                            </tr>
                                        </thead>
                                        <tbody>

                                        </tbody>
                                    </Table>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={12} className='mt-3'>
                            <Alert variant='primary'><h1><b>{moment(currentDateTime).format('MMMM D, yyyy (dddd)')} - {currentDateTime.toLocaleTimeString()}</b></h1></Alert>
                        </Col>
                    </Row>
                </Container>


                    {/* <video autoPlay loop >
                        <source src='../storage/videos/videoloop.mp4' type='video/mp4' />
                    </video> */}

            </div>
        </>
    );
}
