import React, { useState, useEffect } from "react";
import axios from "axios";
import "jspdf-autotable";
import jsPDF from "jspdf";
import "./index.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Modal } from "flowbite-react";
import { Chart } from "react-google-charts";
import html2canvas from "html2canvas";
import { Link } from "react-router-dom";

export default function Home() {
    const [file, setFile] = useState(null);
    const [url, setUrl] = useState("");
    const [analysis, setAnalysis] = useState(null);
    const [data, setData] = useState(null);
    const [dataSubjects, setDataSubjects] = useState([]);
    const [credit, setCredit] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [cgpa, setCgpa] = useState(0);
    const [dbName, setdbName] = useState("");
    const [dbSem, setdbSem] = useState("");
    const [dbRoll_no, setdbRoll_no] = useState("");

    let [totalCredits, setTotalCredits] = useState(0);
    let [totalCreditPoints, setTotalCreditPoints] = useState(0);
    // const [studentDB, setStudentDB]= useState({
    //     Name:"",
    //     Roll_No:"",
    //     Cgpa:"",
    //     semester:""
    // })

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/credits`)
            .then((response) => setCredit(response.data))
            .catch((err) => setError("Error fetching credits"));
    }, []);



    function toAcronym(str) {
        // Split the string into words
        let words = str.split(' ');

        // Map each word to its initial letter and join them into a single string
        let acronym = words.map(word => word.charAt(0).toUpperCase()).join('');

        return acronym;
    }

    const getGradeComposition = () => {
        const gradeCount = dataSubjects.reduce((acc, subject) => {
            if (acc[subject.Grade]) {
                acc[subject.Grade]++;
            } else {
                acc[subject.Grade] = 1;
            }
            return acc;
        }, {});

        const chartData = [["Grade", "Number of Subjects"]];
        for (const grade in gradeCount) {
            chartData.push([grade, gradeCount[grade]]);
        }
        return chartData;
    };

    const GradePieChart = ({ dataSubjects }) => {
        const chartData = getGradeComposition();

        const options = {
            title: "Composition of Subjects Under Each Grade",
            pieHole: 0.4,
        };

        return (
            <Chart
                chartType="PieChart"
                width="100%"
                height="400px"
                data={chartData}
                options={options}
            />
        );
    };

    const MarksBarGraph = ({ dataSubjects }) => {
        const chartData = [
            ["Subject", "Marks"],
            ...dataSubjects.map((subject) => [
                toAcronym(subject.Subject_Name),
                parseInt(subject.Total_Marks),
            ]),
        ];

        const options = {
            title: "Marks Distribution by Subject",
            chartArea: { width: "50%" },
            hAxis: {
                title: "Marks",
                minValue: 0,
            },
            vAxis: {
                title: "Subjects",
            },
        };

        return (
            <Chart
                chartType="BarChart"
                width="100%"
                height="400px"
                data={chartData}
                options={options}
            />
        );
    };

    const presetKey = process.env.REACT_APP_API_PRESET_KEY;
    const cloudName = process.env.REACT_APP_API_CLOUD_NAME;

 

    const handleFileChange = async (event) => {

        event.preventDefault();


        toast.success("Uploading......", {
            position: "bottom-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "dark",
            transition: Bounce,
        });

        const selectedFile = event.target.files[0];

        // Check the file extension
        const fileExtension = selectedFile.name.split(".").pop().toLowerCase();
        if (fileExtension !== "pdf") {
            toast.error("Only PDF files are allowed!", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
            });
            return; // Return early if the file is not a PDF
        }

        const formData = new FormData();
        formData.append("file", selectedFile);
        formData.append("upload_preset", presetKey);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error("Failed to upload file");
            }

            const data = await response.json();
            await setUrl(data.secure_url);

            toast.success("PDF Uploaded Successfully !!", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });


        } catch (error) {
            setError(error.message);
            setLoading(false);
            toast.error("Some internal error occurred!", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }
    };



    // const send = async (e) => {
    //     e.preventDefault();
    //     setLoading(true);
    //     const body = url;
    //     // console.log(credit);
    //     try {
    //         const flaskResponse = await fetch(
    //             `${process.env.REACT_APP_API_FLASK_URL}/send`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(body),
    //             }
    //         );
    //         const responseData = await flaskResponse.json();
    //         setLoading(false);
    //         toast.success("Report is ready !!", {
    //             position: "bottom-center",
    //             autoClose: 5000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: true,
    //             draggable: true,
    //             progress: undefined,
    //             theme: "dark",
    //             transition: Bounce,
    //         });
    //         setAnalysis(responseData);
    //         setData(responseData);
    //         setDataSubjects(responseData.Subjects);
    //         let localTotalCredits = 0;
    //         let localTotalCreditPoints = 0;

    //         responseData.Subjects.forEach((subject) => {
    //             const matchedSubject = credit.find((c) => c.code === subject.Subject_Code);
    //             const courseCredits = matchedSubject ? Number(matchedSubject.credits) : 0;
    //             const creditPoints = courseCredits * Number(subject.Points);

    //             localTotalCredits += courseCredits;
    //             localTotalCreditPoints += creditPoints;
    //         });

    //         setTotalCredits(localTotalCredits);
    //         setTotalCreditPoints(localTotalCreditPoints);

    //         const calculatedCgpa =
    //             ((localTotalCreditPoints + 5) / (localTotalCredits + 0.5)).toFixed(2);
    //         const rollNo = responseData.Roll_No || "Unknown";
    //         const name = responseData.Name || "No Name";
    //         const semester = responseData.semester || "N/A";
    //         // setCgpa(calculatedCgpa);
    //         // setdbRoll_no(rollNo);
    //         // setdbName(name);
    //         // setdbSem(semester);
    //         console.log(calculatedCgpa, rollNo, name, semester)
    //         const response = await axios.post(
    //             `${process.env.REACT_APP_API_FLASK_URL}/uploadStudent`,
    //             rollNo,name,semester,calculatedCgpa
    //             {
    //               headers: {
    //                 'Content-Type': 'application/json',
    //               },
    //             }
    //           );

    //         setTimeout(() => {
    //             if (localStorage.getItem("isModal") === "closed") {
    //                 setOpenModal(false);
    //             } else {
    //                 setOpenModal(true);
    //             }
    //         }, 5000);
    //     } catch (error) {
    //         setLoading(false);
    //         // console.error("Error:", error);
    //         toast.error("Incorrect File Upload or Server Busy!", {
    //             position: "bottom-center",
    //             autoClose: 5000,
    //             hideProgressBar: false,
    //             closeOnClick: true,
    //             pauseOnHover: true,
    //             draggable: true,
    //             progress: undefined,
    //             theme: "dark",
    //             transition: Bounce,
    //         });
    //     }
    // };
    const send = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        // Assuming 'url' is the data object you want to send
        const body = url;
        
        try {
            // Fetch data from Flask API
            const flaskResponse = await fetch(
                `${process.env.REACT_APP_API_FLASK_URL}/send`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                }
            );
    
            const responseData = await flaskResponse.json();
            setLoading(false);
    
            // Toast notification for success
            toast.success("Report is ready !!", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
    
            setAnalysis(responseData);
            setData(responseData);
            setDataSubjects(responseData.Subjects);
    
            let localTotalCredits = 0;
            let localTotalCreditPoints = 0;
    
            // Calculate total credits and credit points
            responseData.Subjects.forEach((subject) => {
                const matchedSubject = credit.find((c) => c.code === subject.Subject_Code);
                const courseCredits = matchedSubject ? Number(matchedSubject.credits) : 0;
                const creditPoints = courseCredits * Number(subject.Points);
    
                localTotalCredits += courseCredits;
                localTotalCreditPoints += creditPoints;
            });
    
            setTotalCredits(localTotalCredits);
            setTotalCreditPoints(localTotalCreditPoints);
    
            const calculatedCgpa = (
                (localTotalCreditPoints + 5) / (localTotalCredits + 0.5)
            ).toFixed(2);
    
            const rollNo = responseData.Roll_No;
            const name = responseData.Name;
            const semester = responseData.semester;
            const father_name = responseData.father_name;
            const College_name = responseData.College_name;
            const Result = responseData.Result;
            const Percentage = responseData.Percentage;
            
    
            // console.log(calculatedCgpa, rollNo, name, semester);
    
            // Send data to server to upload to the database
                const response = await axios.post(
                    `${process.env.REACT_APP_API_BASE_URL}/uploadStudent`,
                    {
                        Roll_No: rollNo,
                        Name: name,
                        Cgpa: calculatedCgpa,
                        semester: semester,
                        father_name: father_name,
                        College_name: College_name,
                        Result: Result,
                        Percentage: Percentage,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
            
           
            // console.log(response)
    
            // Check response status and handle success or error
            // if (response.status === 201) {
            //     console.log("Student data uploaded successfully:", response.data);
            // } else {
            //     console.error("Error uploading student data:", response.statusText);
            // }
    
            // Set timeout for modal handling
            setTimeout(() => {
                if (localStorage.getItem("isModal") === "closed") {
                    setOpenModal(false);
                } else {
                    setOpenModal(true);
                }
            }, 5000);
        } catch (error) {
            setLoading(false);
            console.error("Error:", error);
            // Toast notification for error
            toast.error("Incorrect File Upload or Server Busy!", {
                position: "bottom-center",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "dark",
                transition: Bounce,
            });
        }
    };
    


    const [sortOrder, setSortOrder] = useState(true); // true for ascending, false for descending

    const sortDataSubjects = (key) => {
        const sorted = [...dataSubjects].sort((a, b) => {
            const compare = a[key].localeCompare(b[key]);
            return sortOrder ? compare : -compare;
        });
        setDataSubjects(sorted);
        setSortOrder(!sortOrder); // Toggle the sort order
    };

    // let totalCreditPoints = 0;
    // let totalCredits = 0;

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Add the title
        doc.setFontSize(18);
        doc.text(
            "Result Analysis",
            doc.internal.pageSize.width / 2,
            14,
            {
                align: "center",
            }
        );

        // Student Details Table
        const studentDetails = [
            [
                {
                    content: `Student Name: ${data.Name}`,
                    colSpan: 2,
                    styles: { halign: "left" },
                },
                {
                    content: `Father Name: ${data.father_name}`,
                    colSpan: 2,
                    styles: { halign: "left" },
                },
            ],
            [
                {
                    content: `Roll Number: ${data.Roll_No}`,
                    colSpan: 2,
                    styles: { halign: "left" },
                },
                {
                    content: `Result: ${data.Result}`,
                    colSpan: 2,
                    styles: {
                        halign: "left",
                        fillColor:
                            data.Result === "PASS" ? [144, 238, 144] : [255, 182, 193],
                    },
                },
            ],
        ];

        doc.autoTable({
            body: studentDetails,
            startY: 30,
            styles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
                halign: "center",
            },
            headStyles: {
                fillColor: [173, 216, 230],
            },
            bodyStyles: {
                minCellHeight: 10,
            },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
        });

        // Marks Table
        const tableColumn = [
            "Sno",
            "Subject Name",
            "Subject Code",
            "Internal Marks",
            "External Marks",
            "Grade",
            "Total Marks",
            "Credits",
            "Credit Points",
        ];
        const tableRows = [];

        let totalCreditPoints = 0;
        let totalCredits = 0;

        dataSubjects.forEach((subject, index) => {
            const courseCredits = (() => {
                const matchedSubject = credit.find(
                    (c) =>
                        c.code === subject.Subject_Code
                );
                return matchedSubject ? Number(matchedSubject.credits) : 0;
            })();

            const creditPoints = (() => {
                const matchedSubject = credit.find(
                    (c) =>
                        c.code === subject.Subject_Code
                );
                const course = matchedSubject ? Number(matchedSubject.credits) : 0;
                const creditPoints = course * Number(subject.Points);
                totalCreditPoints += creditPoints;
                return creditPoints;
            })();

            totalCredits += courseCredits;

            const subjectData = [
                index + 1,
                subject.Subject_Name,
                subject.Subject_Code,
                subject.Internal_Marks,
                subject.External_Marks,
                subject.Grade,
                subject.Total_Marks,
                courseCredits,
                creditPoints,
            ];
            tableRows.push(subjectData);
        });

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: doc.lastAutoTable.finalY + 7,
            styles: {
                fillColor: [255, 255, 255],
                textColor: [0, 0, 0],
            },
            headStyles: {
                fillColor: [173, 216, 230],
            },
            bodyStyles: {
                minCellHeight: 10,
            },
            alternateRowStyles: {
                fillColor: [240, 240, 240],
            },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
        });

        // Calculate values for the summary table
        const totalMarks = Math.trunc(data.Percentage * data.Subjects.length);
        const maxMarks = data.Subjects.length * 100;
        const cgpa =
            data.semester > 4
                ? `${Math.min(((totalCreditPoints + 5) / (totalCredits + 0.5)).toFixed(2), 10.00)}`
                : `${Math.min(((totalCreditPoints + 5) / (totalCredits + 0.5)).toFixed(2), 10.00)}`;


        const summaryData = [
            [
                `${cgpa}`,
                `${totalMarks} / ${maxMarks}`,
                `${totalCreditPoints + 5}`,
                `${totalCredits + 0.5}`
            ],
        ];

        // Add the summary table below the first table with some space
        const finalY = doc.lastAutoTable.finalY;
        doc.autoTable({
            head: [["CGPA", "Total Marks", "Total Grade Points", "Total Credits"]], // Empty header to align with the summary data
            body: summaryData,
            startY: finalY + 7, // Add some space between the tables
            styles: {
                fillColor: [173, 216, 230],
                textColor: [0, 0, 0],
            },
            headStyles: {
                fillColor: [255, 255, 255],
            },
            tableLineColor: [0, 0, 0],
            tableLineWidth: 0.1,
            columnStyles: {
                0: { cellWidth: "auto" },
                1: { cellWidth: "auto" },
                2: { cellWidth: "auto" },
                3: { cellWidth: "auto" },
            },
        });


        const pageHeight = doc.internal.pageSize.height;

        // Adding @MarkDigital at the bottom of the page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text("@MarkDigital", 14, pageHeight - 10);
            doc.setFontSize(7)
            doc.text("Based on the calculated values, Accuracy and validity may vary", 7, pageHeight - 2);
        }
        doc.save(`${data.Roll_No}.pdf`);
    };




    return (
        <div className="report-container">
            <h2 className="rtu-head">Rajasthan Technical University</h2>
            <p className="tool-name mb-4">Result Analysis </p>
            <button onClick={send}>SEND</button>

            <div className='input-file sm:w-4/5 w-[calc(100%-20px)] m-auto'>
                {url ? <></> : <> <p className=" mr-3 font-semibold text-sm text-nowrap">
                    Upload Result :
                </p></>}

                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="w-56 sm:w-auto rounded-lg border-2 border-gray-200"
                />
                {url && !data && (
                    <button
                        onClick={send}
                        className="bg-blue-600 text-white font-bold p-2 rounded-lg text-nowrap mx-1"
                    >
                        Analyse
                        {loading && (
                            <div
                                className=" inline-block h-3 w-3 text-white mx-2 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
                                role="status"
                            >
                                <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                                    Loading...
                                </span>
                            </div>
                        )}
                    </button>
                )}
            </div>
            {/*  this result creates a problem so validate that data is present */}
            {data && data.Result != "FAIL" && (
                <button
                    onClick={downloadPDF}
                    className="bg-blue-600  text-white font-bold p-2 rounded-lg printBtn"
                >
                    PDF
                    <svg
                        className=" w-6 mx-2"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                        <g
                            id="SVGRepo_tracerCarrier"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                        ></g>
                        <g id="SVGRepo_iconCarrier">
                            <path
                                d="M12 12V19M12 19L9.75 16.6667M12 19L14.25 16.6667M6.6 17.8333C4.61178 17.8333 3 16.1917 3 14.1667C3 12.498 4.09438 11.0897 5.59198 10.6457C5.65562 10.6268 5.7 10.5675 5.7 10.5C5.7 7.46243 8.11766 5 11.1 5C14.0823 5 16.5 7.46243 16.5 10.5C16.5 10.5582 16.5536 10.6014 16.6094 10.5887C16.8638 10.5306 17.1284 10.5 17.4 10.5C19.3882 10.5 21 12.1416 21 14.1667C21 16.1917 19.3882 17.8333 17.4 17.8333"
                                stroke="#ffffff"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                            ></path>
                        </g>
                    </svg>
                </button>
            )}

            {/* {error && <p className="text-red-500 text-center">{error}</p>} */}

            {data ? (
                <>
                    {/* <h3 className="clg-head m-3">{data && data.College_name}</h3> */}
                    <div className="table-report">
                        <table className="text-center m-auto border-2 text-sm rtl:text-right text-gray-500 mt-4 w-full">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="text-left px-6 py-2 border-2 ">
                                        Student Name: {data.Name}
                                    </th>
                                    <th scope="col" className="text-left px-6 py-2 border-2">
                                        Father Name: {data.father_name}
                                    </th>
                                </tr>
                                <tr>
                                    <th scope="col" className="text-left px-6 py-2 border-2">
                                        Roll Number: {data.Roll_No}
                                    </th>
                                    <th scope="col" className="text-left px-6 py-2 border-2">
                                        Remarks :

                                        {data.Result === "PASS" ? <>

                                            <span
                                                className={`${data.Result != "FAIL" ? "bg-green-100" : "bg-red-100"
                                                    } text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded  mx-3`}
                                            >
                                                {data.Result}
                                            </span>
                                        </> : <>
                                            <span
                                                className={`${data.Result != "FAIL" ? "bg-red-100" : "bg-red-100"
                                                    } text-red-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded mx-3`}
                                            >
                                                {data.Result}
                                            </span>
                                        </>}



                                    </th>
                                </tr>
                            </thead>
                        </table>

                        <div className="relative w-full">
                            {data.Result != "FAIL" ? (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="text-center border-2 text-sm  text-gray-500 marks-tbl bg-gray-50">
                                            <thead className="text-xs border-b-2 text-gray-700 uppercase">
                                                <tr>
                                                    <th className="px-3 py-3">Sno</th>
                                                    <th className="text-left px-6 py-3 text-nowrap">
                                                        Subject Name{" "}
                                                        <button
                                                            onClick={() => sortDataSubjects("Subject_Name")}
                                                        >
                                                            <svg
                                                                className="w-3 h-3 ms-1.5"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                            </svg>
                                                        </button>
                                                    </th>
                                                    <th className="px-3 py-3 text-nowrap">
                                                        Subject Code{" "}
                                                        <button
                                                            onClick={() => sortDataSubjects("Subject_Code")}
                                                        >
                                                            <svg
                                                                className="w-3 h-3 ms-1.5"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                            </svg>
                                                        </button>
                                                    </th>
                                                    <th className="px-3 py-3 text-nowrap">
                                                        INTERNAL MARKS{" "}
                                                        <button
                                                            onClick={() => sortDataSubjects("Internal_Marks")}
                                                        >
                                                            <svg
                                                                className="w-3 h-3 ms-1.5"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                            </svg>
                                                        </button>
                                                    </th>
                                                    <th className="px-3 py-3 text-nowrap">
                                                        External Marks{" "}
                                                        <button
                                                            onClick={() => sortDataSubjects("External_Marks")}
                                                        >
                                                            <svg
                                                                className="w-3 h-3 ms-1.5"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                            </svg>
                                                        </button>
                                                    </th>

                                                    <th className="px-3 py-3 text-nowrap">
                                                        Total Marks{" "}
                                                        <button
                                                            onClick={() => sortDataSubjects("Total_Marks")}
                                                        >
                                                            <svg
                                                                className="w-3 h-3 ms-1.5"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                            </svg>
                                                        </button>
                                                    </th>
                                                    <th className="px-3 py-3 text-nowrap">
                                                        Grade{" "}
                                                        <button onClick={() => sortDataSubjects("Grade")}>
                                                            <svg
                                                                className="w-3 h-3 ms-1.5"
                                                                fill="currentColor"
                                                                viewBox="0 0 24 24"
                                                            >
                                                                <path d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Zm6.852 1.952H8.574a2.072 2.072 0 0 0-1.847 1.087 1.9 1.9 0 0 0 .11 1.985l3.426 5.05a2.123 2.123 0 0 0 3.472 0l3.427-5.05a1.9 1.9 0 0 0 .11-1.985 2.074 2.074 0 0 0-1.846-1.087Z" />
                                                            </svg>
                                                        </button>
                                                    </th>
                                                    <th className="px-3 py-3 text-nowrap">Credits </th>
                                                    <th className="px-3 py-3 text-nowrap">
                                                        Credit Points
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {dataSubjects.map((subject, index) => {
                                                    const courseCredits = (() => {
                                                        const matchedSubject = credit.find(
                                                            (c) => c.code === subject.Subject_Code
                                                        );
                                                        return matchedSubject
                                                            ? Number(matchedSubject.credits)
                                                            : 0;
                                                    })();

                                                    const creditPoints = (() => {
                                                        const matchedSubject = credit.find(
                                                            (c) => c.code === subject.Subject_Code
                                                        );
                                                        const course = matchedSubject
                                                            ? Number(matchedSubject.credits)
                                                            : 0;
                                                        const creditPoints =
                                                            course * Number(subject.Points);
                                                        totalCreditPoints += creditPoints; // Add the credit points to the total
                                                        return creditPoints;
                                                    })();

                                                    totalCredits += courseCredits; // Add the course credits to the total
                                                    return (
                                                        <tr
                                                            key={index}
                                                            className="bg-white border-b text-gray-700"
                                                        >
                                                            <th className="px-3 py-2 font-medium text-black whitespace-nowrap ">
                                                                {index + 1}
                                                            </th>
                                                            <td className="text-left px-6 py-2">
                                                                {subject.Subject_Name}
                                                            </td>
                                                            <td className="px-3 py-2 text-nowrap">
                                                                {subject.Subject_Code}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {subject.Internal_Marks}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {subject.External_Marks}
                                                            </td>
                                                            <td className="px-3 py-2">
                                                                {subject.Total_Marks}
                                                            </td>
                                                            <td className="px-3 py-2">{subject.Grade}</td>
                                                            <td className="px-3 py-2">{courseCredits}</td>
                                                            <td className="px-3 py-2">{creditPoints}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="border-2 text-sm text-gray-700 bg-gray-50 last-table">
                                            <tr>
                                                <th scope="col" className="p-4 text-center">
                                                    {data.semester > 4 ? (
                                                        <>
                                                            CGPA :{" "}
                                                            {((totalCreditPoints + 5) / (totalCredits + 0.5)).toFixed(
                                                                2
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {" "}
                                                            CGPA :{" "}
                                                            {((totalCreditPoints + 5) / (totalCredits + 0.5)).toFixed(
                                                                2
                                                            )}
                                                        </>
                                                    )}
                                                </th>
                                                <th scope="col" className="p-4 text-center">
                                                    Total Marks :{" "}
                                                    {Math.trunc(
                                                        data.Subjects &&
                                                        data.Percentage * data.Subjects.length
                                                    )}{" "}
                                                    / {data.Subjects && 100 * data.Subjects.length}
                                                </th>
                                                <th scope="col" className="p-4 text-center">
                                                    Total Grade Points : {totalCreditPoints + 5}
                                                </th>
                                                <th scope="col" className="p-4 text-center">
                                                    Total Credits : {totalCredits + 0.5}
                                                </th>

                                            </tr>
                                        </table>
                                    </div>

                                    <Modal
                                        show={openModal}
                                        size="md"
                                        onClose={() => {
                                            setOpenModal(false);
                                            localStorage.setItem("isModal", "closed");
                                        }}
                                        popup
                                    >
                                        <Modal.Header />
                                        <Modal.Body>
                                            <iframe
                                                src="https://docs.google.com/forms/d/e/1FAIpQLSdwTNdwnQCAirPtd0AhdUOqD6XY2FbCTAjYpQPRHIrOyB0LGQ/viewform?embedded=true"
                                                width=""
                                                height="500"
                                                frameBorder="0"
                                                marginHeight="0"
                                                marginWidth="0"
                                                className="w-full"
                                            >
                                                Loading…
                                            </iframe>
                                        </Modal.Body>
                                    </Modal>
                                </>
                            ) : (
                                <></>)}
                        </div>
                    </div>

                    {data.Result != "FAIL" && (
                        <div className="charts rounded-md">
                            <div className="chart w-full rounded-md" id="g-chart-1">
                                <MarksBarGraph dataSubjects={dataSubjects} />
                            </div>

                            <div className="chart w-full " id="g-chart-2">
                                <GradePieChart dataSubjects={dataSubjects} />
                            </div>
                        </div>
                    )}


                    <footer class="footer text-sm footer-center p-4 bg-base-300 text-base-content bg-blue-100 text-center text-black w-full mt-5">
                        <aside>
                            <p class="footer-text">
                                <span class="font-bold">
                                    Designed and Developed by @MarkDigital
                                </span>{" "}
                                | <span><Link to={"/disclaimer"} className="font-bold ">
                                    Disclaimer
                                </Link></span> | <span> <Link to={"/whatsNew"} className="font-bold text-sm text-blue-500">
                                    What's New ? v2.3
                                </Link></span> | <Link to={"https://forms.gle/rQJkDNMT6bNcXZF4A"}><span className="font-bold text-sm text-blue-500">FeedBack</span></Link>
                            </p>
                        </aside>
                    </footer>
                </>
            ) : (
                <p className="text-center text-lg my-8"></p>
            )
            }
            <ToastContainer />

            {
                data === null && (
                    <footer class="footer text-sm footer-center p-4 bg-base-300 text-base-content bg-blue-100 text-center text-black w-full bottom-0 fixed">
                        <aside>
                            <p class="footer-text">
                                <span class="font-bold">
                                    Designed and Developed by @MarkDigital
                                </span>{" "}
                                |<span> <Link to={"/disclaimer"} className="font-bold">
                                    Read Disclaimer
                                </Link></span> | <span> <Link to={"/whatsNew"} className="font-bold text-sm text-blue-500">
                                    What's New ? v2.3
                                </Link></span> |  <Link target="blank" to={"https://forms.gle/rQJkDNMT6bNcXZF4A"}><span className="font-bold text-sm text-blue-500">FeedBack</span></Link>
                            </p>
                        </aside>
                    </footer>
                )
            }
        </div >
    );
}
