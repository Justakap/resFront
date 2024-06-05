import React from 'react'

export default function WhatsNew() {
    return (
        <>
            <div className='bg-slate-100 h-screen'>
                <div className="max-w-2xl mx-auto bg-slate-100 py-4">
                    <h2 className="text-xl text-blue-500     font-bold mb-4">What's New : Result Analysis Tool</h2>
                    <ol className="list-decimal list-inside">
                        <li className="mb-2">From v2.0 The Analysis is available for all the below mentioned Branches </li>
                        <div className="sub ml-4">
                            <ol className=' list-decimal list-inside text-sm mb-2'>

                                <li>Computer Science Engineering (I-VIII Semester)</li>
                                <li>Computer Science and Engineering (Artificial Intelligence) (I-VIII Semester)</li>
                                <li>Computer Science and Engineering (Data Science) (I-VIII Semester)</li>
                                <li>Computer Science and Engineering (Internet if Things) (I-VIII Semester)</li>
                                <li>Information Technology (I-VIII Semester)</li>
                                <li>Electrical Engineering (I-VIII Semester)</li>
                                <li>Mechanical Engineering (I-VIII Semester)</li>
                                <li>Electronics Engineering (I-VIII Semester)</li>
                                <li>Civil Engineering (I-VIII Semester)</li>
                            </ol>
                        </div>
                        <li className=' my-1'>From v2.0, You will be able to save your Analysis as a PDF File <br /><span className='px-2 text-sm text-gray-600'>(If you are using a mobile device. Please switch to Desktop Site mode form Browser Setting)</span></li>
                        <li className='my-1'>Bugs Fixed ! Impoved UI</li>
                    </ol>
                </div>
            </div> 
        </>
    )
}
