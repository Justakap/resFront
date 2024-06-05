import React, { useState } from 'react'
import axios from 'axios';
import { useEffect } from 'react';
export default function AddSubject() {


    const [formData, setFormData] = useState({
        code: '',
        credits: '',
    });
    const [successMessage, setSuccessMessage] = useState(null);


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/newSubject`, {
                code: formData.code,
                credits: formData.credits
            });

            if (response.data === "added") {
                setSuccessMessage("Subject added successfully!");
                window.location.reload();
            } else if (response.data === "exist") {
                alert("Subject already exists.");
            } else if (response.data === "nadded") {
                alert("Subject not added.");
            }
        } catch (error) {
            console.error("Server Error:", error);
            alert("Server Error");
        }
    };

    const [resource, setResource] = useState([]);
    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/resources`)
            .then(response => {
                setResource(response.data);
            })
            .catch(err => {
                console.log(err);
            });
    }, []);



    return (
        <>
            <>
                {successMessage && (
                    <div className="alert alert-success" role="alert">
                        {successMessage}
                    </div>
                )}

                <div className="text-3xl font-bold m-3 text-center">Modify Subject Credits</div>
                <hr className=' w-4/5 m-auto my-3' />
                <form onSubmit={handleSubmit}>
                    <div className='flex ml-6 flex-wrap justify-center'>
                        <div className="text-center max-w-sm w-72 p-6 m-3 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
                            <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Enter Details</h5>
                            <hr />

                            <input className='my-2 block py-2.5 px-0 w-full text-sm text-gray-500  appearance-none ' s placeholder='Enter Subject Code (eg : 1FY-21)' type="text" name='code' onChange={handleInputChange} value={formData.Course_Title} required />
                            <input className='my-2 block py-2.5 px-0 w-full text-sm text-gray-500  appearance-none ' placeholder='Enter Total Credits' type="text" name='credits' onChange={handleInputChange} value={formData.credits} required />

                            <button type="submit" className="mt-3 focus:outline-none text-white bg-green-500 hover:bg-green-600 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-green-200 dark:hover:bg-green-300 dark:focus:ring-green-800">Submit</button>
                        </div>
                    </div>
                </form>



            </>

        </>
    )
}
