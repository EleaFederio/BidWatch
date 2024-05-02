import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TextToSpeech from '@/lib/TextToSpeech';
import AnnouncementModal from '@/lib/time_left/AnnouncementModal';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { Button, Card, Col, Container, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';

const Announcer = ({auth}) => {

    const [text, setText] = useState('');
    const [showModal, setShowModal] = useState(false);

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Announcer</h2>}
        >
            <Head>
                <title>Announcer</title>
            </Head>
            <Container fluid>
                <Row className='mt-5'>
                    <Col lg={6}>
                        <Card>
                            <Card.Header>
                                <h4 className='text-center'>Create Announcement</h4>
                            </Card.Header>
                            <Card.Body>
                                <FormGroup>
                                    <FormLabel>Announcement</FormLabel>
                                    <FormControl
                                        as='textarea'
                                        rows={10}
                                        value={text}
                                        onChange={(e) => setText(e.target.value)}
                                    />
                                </FormGroup>
                            </Card.Body>
                            <Card.Footer className='text-center'>
                                <TextToSpeech text={text}/>
                            </Card.Footer>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card>
                            <Card.Header>
                                <h4 className='text-center'>Scheduled Announcement</h4>
                            </Card.Header>
                            <Card.Body>
                                <Button className='mb-3' style={{backgroundColor: '#fd7702'}} variant='info' onClick={() => setShowModal(true)}>Create Scheduled Announcement</Button>
                                <Card >
                                    <Card.Body>
                                        <h5>Hello</h5>
                                    </Card.Body>
                                </Card>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <AnnouncementModal showModal={showModal} setShowModal={setShowModal} />
        </AuthenticatedLayout>
    )
}

export default Announcer
