import { useState, useEffect } from "react";
import { Button, Form, Modal } from "react-bootstrap";
import { useSnapshot } from "valtio";
import axios from "axios";
import ReactDatePicker from "react-datepicker";
import moment from "moment/moment";

const AnnouncementModal = ({showModal, setShowModal}) => {
    const [announcement, setAnnouncement] = useState({
        title: '',
        message: '',
        date: new Date(),
    });

    function handleChange(evt) {
        const value = evt.target.value;
        setAnnouncement({
          ...announcement,
          [evt.target.name]: value
        });
      }

    useEffect(() => {}, []);

    return(
        <Modal
            show={showModal}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header>
                <Modal.Title id="contained-modal-title-vcenter">
                    Create New Announcement
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control type="text" value={announcement.title} onChange={handleChange} name={'title'} placeholder="Enter Title" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Announcement</Form.Label>
                        <Form.Control as="textarea" value={announcement.message} onChange={handleChange} name={'message'} rows={3} placeholder="Enter Announcement Content" />
                    </Form.Group>
                </Form>

                <Form.Group className="mb-3">
                    <Form.Label>Date & Time</Form.Label>
                    <ReactDatePicker className="form-control"
                        onChange={(date) => setAnnouncement({
                            ...announcement,
                            date : date
                        })}
                        selected={announcement.date}
                        dateFormat="MMMM d, yyyy h:mm aa"
                        showTimeSelect
                        showTimeInput
                        onKeyDown={(e) => {
                            e.preventDefault();
                         }}
                    />
                </Form.Group>
            </Modal.Body>


            <Modal.Footer>
                <Button variant="danger" size="sm" onClick={() => setShowModal(false)}>Close</Button>
                <Button variant="primary" size="sm" onClick={() => submitCreateAnnouncement()}>Create</Button>
            </Modal.Footer>
        </Modal>
    )
}

export default AnnouncementModal;
