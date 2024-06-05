import React, { useState } from 'react';
import axios from 'axios'
import Home from './Home';

export default function UploadResult() {
    const [file, setFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [url, setUrl] = useState('');
    const [analysis, setAnalysis] = useState([]);


    const presetKey = process.env.REACT_APP_API_PRESET_KEY;
    const cloudName = process.env.REACT_APP_API_CLOUD_NAME;

    const handleFileChange = async (event) => {
        event.preventDefault()
        const selectedFile = event.target.files[0];
        // setFile(selectedFile);
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('upload_preset', presetKey);

        try {
            const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await response.json();
            console.log('File uploaded successfully:', data);

            const body = data.secure_url;
            console.log('PDF URL:', body);
            setUrl(body)


        } catch (error) {
            console.error('Error:', error.message);
        }
    };


    const send = async (e) => {
        e.preventDefault()
        const body = url;
        try {
            const flaskResponse = await fetch('http://127.0.0.1:5000/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            const responseData = await flaskResponse.json();
            // console.log(responseData);
            setAnalysis(responseData)
        } catch (error) {
            console.error('Error:', error);
        }
    };



    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100">
            <div className="text-5xl text-purple-600 mb-8">Result Analysis Tool</div>
            <form className='w-full max-w-md'>
                <div className="flex items-center border-b-2 border-green-500 py-2">
                    <input type="file" onChange={handleFileChange} accept="application/pdf" className='appearance-none bg-transparent border-none w-full text-gray-700 mr-3 py-1 px-2 leading-tight' />
                    <div>
                        {url && <button onClick={send} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 w-full rounded">Get Analysis</button>}
                    </div>
                </div>
            </form>
           
        </div>
    );
}
