import React, { useState } from 'react'
import { useEffect } from 'react';
import axios from 'axios'
import { Link } from 'react-router-dom';
export default function Home() {

    const [file, setFile] = useState(null);
    const [analysisResult, setAnalysisResult] = useState(null);
    const [url, setUrl] = useState('');
    const [analysis, setAnalysis] = useState([]);
    const [data, setData] = useState([])
    const [credit, setCredit] = useState([])
    const [creditSum, setCreditSum] = useState(0)
    const [dataSubjects, setDataSubjects] = useState([])
    const [loading, setLoading] = useState(false);



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
        setLoading(true);
        try {
            const flaskResponse = await fetch(`${process.env.REACT_APP_API_FLASK_URL}/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body)
            });
            const responseData = await flaskResponse.json();
            // console.log(responseData);
            setAnalysis(responseData)
            setData(responseData)
            setDataSubjects(responseData.Subjects)
            setLoading(false); // Set loading to false after receiving response

        } catch (error) {
            console.error('Error:', error);
        }
    };

    useEffect(() => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/credits`)
            .then(response => { setCredit(response.data) })
            .catch(err => console.log(err));
    }, []);





    function handleHeaderClick_Subject_Name() {
        const obj = dataSubjects
        const sortedKeys = Object.values(obj)
        sortedKeys.sort((a, b) => a.Subject_Name.localeCompare(b.Subject_Name));
        setDataSubjects(sortedKeys)
    }
    function handleHeaderClick_Subject_Code() {
        const obj = dataSubjects
        const sortedKeys = Object.values(obj)
        sortedKeys.sort((a, b) => a.Subject_Code.localeCompare(b.Subject_Code));
        setDataSubjects(sortedKeys)
    }
    function handleHeaderClick_Internal_Marks() {
        const obj = dataSubjects
        const sortedKeys = Object.values(obj)
        sortedKeys.sort((a, b) => b.Internal_Marks.localeCompare(a.Internal_Marks));
        setDataSubjects(sortedKeys)
    }
    function handleHeaderClick_External_Marks() {
        const obj = dataSubjects
        const sortedKeys = Object.values(obj)
        sortedKeys.sort((a, b) => b.External_Marks.localeCompare(a.External_Marks));
        setDataSubjects(sortedKeys)
    }
    function handleHeaderClick_Grade() {
        const obj = dataSubjects
        const sortedKeys = Object.values(obj)
        sortedKeys.sort((a, b) => a.Grade.localeCompare(b.Grade));
        setDataSubjects(sortedKeys)
    }
    function handleHeaderClick_Total_Marks() {
        const obj = dataSubjects
        const sortedKeys = Object.values(obj)
        sortedKeys.sort((a, b) => b.Total_Marks.localeCompare(a.Total_Marks));
        setDataSubjects(sortedKeys)
    }
    let totalCreditPoints = 0;
    let totalCredits = 0;



    return (

        <div className=' bg-slate-100 -mt-2 h-full'>
            <div className="flex items-center my-2">
                <p className='text-center text-md mx-2 my-2 font-semibold'>Upload Result PDF here : </p>
                <input type="file" onChange={handleFileChange} accept="application/pdf" className=' bg-transparent border-none text-gray-700 py-1 px-2 leading-tight' />
                {url && <button onClick={send} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-4   rounded">Get Analysis</button>}

            </div>
            <center>
                {loading && <><div
                    className=" inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                    role="status">
                    <span
                        className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]"
                    >Loading...</span>
                </div></>}
            </center>

            {data ?
                <>
                    <h1 className=' text-center text-xl my-2'>Rajasthan Technical University</h1>
                    <h1 className=' text-center text-md my-1'>{data.College_name}</h1>
                    <h1 className=' text-center text-md my-1'>Semester : {data.semester}</h1>
                    {/* <h1 className=' text-center text-sm my-1'>{data && data.sem_name.slice(0, 26)}</h1> */}
                    <table class=" text-center w-4/5 m-auto border-2 text-sm rtl:text-right text-gray-500 ">
                        <thead class="text-xs  text-gray-700 uppercase bg-gray-50 ">
                            <tr>
                                <th scope="col" class=" text-left    px-6 py-2 border-2">
                                    Student Name : {data.Name}
                                </th>
                                <th scope="col" class=" text-left    px-6 py-2 border-2">
                                    Father Name : {data.father_name}
                                </th>
                            </tr>
                            <tr>

                                <th scope="col" class=" text-left    px-6 py-2 border-2">
                                    Roll Number : {data.Roll_No}
                                </th>
                                {data.Result == "PASS" ? <>
                                    <th scope="col" class=" text-left     px-6 py-2 border-2">
                                        Result : <span className='text-green-400'>{data.Result}</span>
                                    </th>
                                </>
                                    : <>
                                        <th scope="col" class=" text-left   px-6 py-3">
                                            Result : <span className='text-red-600'>{data.Result}</span>
                                        </th>
                                    </>}
                            </tr>
                        </thead>
                    </table>


                    <div class="relative overflow-x-auto shadow-md sm:rounded-lg">
                        {data.Result === "PASS" ? <>
                            <table class=" text-center w-4/5 m-auto border-2 text-sm rtl:text-right text-gray-500 ">
                                <thead class="text-xs border-b-2 text-gray-700 uppercase bg-gray-50 ">
                                    <tr>
                                        <th scope="col" class="  px-3 py-3">
                                            <div class="flex items-center">
                                                Sno
                                            </div>
                                        </th>
                                        <th scope="col" class=" text-left    px-6 py-3">
                                            <div class="flex items-center">
                                                Subject Name
                                                <button onClick={handleHeaderClick_Subject_Name}>
                                                    <svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </th>
                                        <th scope="col" class="px-3 py-3">
                                            <div class="flex items-center">
                                                Subject Code
                                                <button onClick={handleHeaderClick_Subject_Code}>
                                                    <svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </th>
                                        <th scope="col" class="px-3 py-3">
                                            <div class="flex items-center">
                                                Internal Marks
                                                <button onClick={handleHeaderClick_Internal_Marks}>
                                                    <svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </th>
                                        <th scope="col" class="px-3 py-3">
                                            <div class="flex items-center">
                                                External Marks
                                                <button onClick={handleHeaderClick_External_Marks}>
                                                    <svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </th>
                                        <th scope="col" class="px-3 py-3">
                                            <div class="flex items-center">
                                                Total Marks
                                                <button onClick={handleHeaderClick_Total_Marks}>
                                                    <svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </th>
                                        <th scope="col" class="px-3 py-3">
                                            <div class="flex items-center">
                                                Grade
                                                <button onClick={handleHeaderClick_Grade}>
                                                    <svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </th>
                                        <th scope="col" class="px-3 py-3">
                                            <div class="flex items-center">
                                                Credits

                                                {/* <button onClick={handleHeaderClick_Credits}>
                                        <svg class="w-3 h-3 ms-1.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                        </svg>
                                    </button> */}
                                            </div>
                                        </th>
                                        <th scope="col" class="px-3 py-3">
                                            <div class="flex items-center">
                                                Credit Points
                                            </div>
                                        </th>
                                    </tr>
                                </thead>

                                {dataSubjects && dataSubjects.map((e, index) => (
                                    <>
                                        <tbody>
                                            <tr class="odd:bg-white odd: even:bg-gray-50 even: border-b ">
                                                <th scope="row" class=" px-2 py-2 font-medium text-gray-900 whitespace-nowrap ">
                                                    {index + 1}
                                                </th>
                                                <th scope="row" class=" text-left  px-2 py-2 font-medium text-gray-900 whitespace-nowrap">
                                                    {e.Subject_Name}
                                                </th>
                                                <td class="px-2 py-2.5">
                                                    {e.Subject_Code}
                                                </td>
                                                <td class="px-2 py-2.5">
                                                    {e.Internal_Marks}
                                                </td>
                                                <td class="px-2 py-2.5">
                                                    {e.External_Marks}
                                                </td>
                                                <td class="px-2 py-2.5">
                                                    {e.Total_Marks}
                                                </td>
                                                <td class="px-2 py-2.5">
                                                    {e.Grade}
                                                </td>

                                                <td class="px-2 py-2.5">
                                                    {(() => {
                                                        const courseCredits = credit
                                                            .filter(subject => subject.Course_Title.toLowerCase() === e.Subject_Name.toLowerCase())
                                                            .map(subject => subject.Credits);

                                                        totalCredits += Number(courseCredits); // Add the credit points to the total
                                                        return courseCredits;
                                                    })()}
                                                </td>
                                                <td class="px-2 py-2.5">
                                                    {(() => {
                                                        const su = credit.filter(subject => subject.Course_Title === e.Subject_Name)
                                                        const course = credit.filter(subject => subject.Course_Title.toLowerCase() === e.Subject_Name.toLowerCase())[0]?.Credits;
                                                        const creditPoints = course * e.Points;
                                                        totalCreditPoints += creditPoints; // Add the credit points to the total
                                                        return creditPoints;
                                                    })()}
                                                </td>

                                            </tr>

                                        </tbody>
                                    </>
                                ))}
                            </table>
                            <table class=" text-center w-4/5 m-auto border-l-2 border-r-2 border-b-2 text-sm rtl:text-right text-gray-500 ">
                                <thead class="text-xs  text-gray-700 uppercase bg-gray-50 ">
                                    <tr>
                                        <th scope="col" class=" text-left px-6 py-3">
                                            Total Marks : {Math.trunc(data.Subjects && data.Percentage * data.Subjects.length)} / {data.Subjects && 100 * data.Subjects.length}
                                        </th>
                                        <th scope="col" class=" text-left    px-6 py-3">
                                            Total Grade Points : {totalCreditPoints}
                                        </th>
                                        <th scope="col" class=" text-left    px-6 py-3">
                                            Total Credit's : {totalCredits}
                                        </th>
                                        <th scope="col" class=" text-left    px-6 py-3">
                                            {data.semester > 4 ? <>CGPA : {(totalCreditPoints / totalCredits).toFixed(2)} - {((totalCreditPoints + 2) / totalCredits).toFixed(2)}</> : <> CGPA : {(totalCreditPoints / totalCredits).toFixed(2)} - {((totalCreditPoints + 1) / totalCredits).toFixed(2)}</>}
                                        </th>

                                    </tr>
                                </thead>
                            </table> </> : <div className='text-center font-bold text-lg mt-24 mb-80'>
                            Result Analysis Not Available !
                            {data.Name ? <> As you might have not cleared one or more subjects </> : <> Please Upload Correct File</>}
                        </div>}



                    </div>
                    <footer className=' text-center font-bold text-sm bottom-1' >
                        <p>  Designed and Developed by <Link>@Mark Digital</Link></p>
                        <p className=' text-red-500'>  Read <Link to={"/disclaimer"}> Disclaimer</Link></p>
                    </footer>


                </> : <>upload Result</>}

        </div>

    )
}
