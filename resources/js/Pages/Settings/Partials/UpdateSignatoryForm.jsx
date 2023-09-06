import { Button } from "react-bootstrap";

export default function UpdateSignatoryForm({ className = '' }) {


    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">Update Signatory</h2>

                <p className="mt-1 text-sm text-gray-600">
                    {/* Ensure your account is using a long, random password to stay secure. */}
                </p>
                <Button>Update</Button>
            </header>


        </section>
    );
}
