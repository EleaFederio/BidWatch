import axios from "axios";
import { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";

export default function OfficersListForm({ className = '' }) {

    const [officers, setOfficers] = useState([]);

    //
    const getOfficersList = () => {
        axios.get('api/officers')
        .then(res => {
            setOfficers(res);
        })
        .catch(error => {
            console.log(error)
        })
    }


    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Update Signatory</h2>

                <Table striped bordered hover size="sm">
                    <thead>
                        <tr>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Position</th>
                        <th>Designation</th>
                        </tr>
                    </thead>
                    <tbody>
                        {

                        }
                        {/* <tr>
                            <td>Mark</td>
                            <td>Otto</td>
                            <td>@mdo</td>
                            <td>@mdo</td>
                        </tr> */}
                    </tbody>
                </Table>

                <p className="mt-1 text-sm text-gray-600">
                    {/* Ensure your account is using a long, random password to stay secure. */}
                </p>
                <Button>Add</Button>
            </header>

        </section>
    );
}
