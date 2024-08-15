import React from 'react'
// has to been changed as a pop up in near future 
// has to be modified like play store 
// main whats new section above and rest all detailed updates with a heading as the version number 

export default function WhatsNew() {
    return (
        <>
            <div className='bg-slate-100 h-screen p-4'>
                <div className="max-w-2xl mx-auto bg-slate-100 py-4">
                    <h2 className="text-xl text-blue-500     font-bold mb-4">What's New : Result Analysis Tool</h2>
                    <ol className="list-decimal list-inside">
                        <li className='my-1'>No more Delays in Analysis ! </li>
                        <li className='my-1'>Abbreviation used for Subject name in Bargraph</li>
                        <li className='my-1'>Introduced Histograms and PieChart for better Analysis</li>
                        <li className='my-1'>Bugs Fixed ! Impoved UI for Mobile Devices</li>
                        <li className="mb-2">From v2.0 The Analysis is available for all the below mentioned Branches </li>
                        <div className="sub ml-4">
                            <ol className=' list-decimal list-inside text-sm mb-2'>

                                <li>Computer Science Engineering (I-VIII Semester)</li>
                                <li>Computer Science and Engineering (Artificial Intelligence) (I-VIII Semester)</li>
                                <li>Computer Science and Engineering (Data Science) (I-VIII Semester)</li>
                                <li>Computer Science and Engineering (Internet of Things) (I-VIII Semester)</li>
                                <li>Information Technology (I-VIII Semester)</li>
                                <li>Electrical Engineering (I-VIII Semester)</li>
                                <li>Mechanical Engineering (I-VIII Semester)</li>
                                <li>Electronics Engineering (I-VIII Semester)</li>
                                <li>Civil Engineering (I-VIII Semester)</li>
                            </ol>
                        </div>
                        <li className=' my-1'>From v2.0, You will be able to save your Analysis as a PDF File <br /></li>
                    </ol>
                </div>
            </div> 
        </>
    )
}
