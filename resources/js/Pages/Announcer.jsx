import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { Button, Card, Col, Container, FormControl, FormGroup, FormLabel, Row } from 'react-bootstrap';

const Announcer = ({auth}) => {
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
                                    <FormControl as='textarea' rows={10} />
                                </FormGroup>
                            </Card.Body>
                            <Card.Footer className='text-center'>
                                <Button lg>Announce</Button>
                            </Card.Footer>
                        </Card>
                    </Col>
                    <Col lg={6}>
                        <Card>
                            <Card.Header>
                                <h4 className='text-center'>Scheduled Announcement</h4>
                            </Card.Header>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </AuthenticatedLayout>
    )
}

export default Announcer
