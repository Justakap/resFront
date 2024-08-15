
import React, { useState, useEffect } from "react";
import axios from "axios";
import "jspdf-autotable";
import jsPDF from "jspdf";
import "./index.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Modal } from "flowbite-react";
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

    const gradeMapping = {
        "A++": 10,
        "A+": 9,
        "A": 8.5,
        "B+": 8,
        "B": 7.5,
        "C+": 7,
        "C": 6.5,
        "D+": 6,
        "D": 5.5,
        "E+": 5,
        "E": 4.5,
        "F": 0
    }
    const MarksBarGraph = ({ dataSubjects }) => {
        const chartData = [
            ["Subject", "Marks"],
            ...dataSubjects.map((subject) => [
                subject.Subject_Name,
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
            setUrl(data.secure_url);
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

    const send = async (e) => {
        e.preventDefault();
        setLoading(true);
        const body = url;
        // console.log(credit);
        try {
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

            setTimeout(() => {
                setOpenModal(true);
            }, 4000);
        } catch (error) {
            setLoading(false);
            // console.error("Error:", error);
            toast.error("Some internal error eccoured!", {
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

    useEffect(() => {
        axios
            .get(`${process.env.REACT_APP_API_BASE_URL}/credits`)
            .then((response) => setCredit(response.data))
            .catch((err) => setError("Error fetching credits"));
    }, []);

    const [sortOrder, setSortOrder] = useState(true); // true for ascending, false for descending

    const sortDataSubjects = (key) => {
        const sorted = [...dataSubjects].sort((a, b) => {
            const compare = a[key].localeCompare(b[key]);
            return sortOrder ? compare : -compare;
        });
        setDataSubjects(sorted);
        setSortOrder(!sortOrder); // Toggle the sort order
    };

    let totalCreditPoints = 0;
    let totalCredits = 0;

    const downloadPDF = () => {
        const doc = new jsPDF();

        // Add the title
        doc.setFontSize(18);
        doc.text(
            "Rajasthan Technical University",
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
                        c.Course_Title.toLowerCase() === subject.Subject_Name.toLowerCase()
                );
                return matchedSubject ? Number(matchedSubject.Credits) : 0;
            })();

            const creditPoints = (() => {
                const matchedSubject = credit.find(
                    (c) =>
                        c.Course_Title.toLowerCase() === subject.Subject_Name.toLowerCase()
                );
                const course = matchedSubject ? Number(matchedSubject.Credits) : 0;
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
                ? `${(totalCreditPoints / totalCredits).toFixed(2)} - ${(
                    (totalCreditPoints + 2) /
                    totalCredits
                ).toFixed(2)}`
                : `${(totalCreditPoints / totalCredits).toFixed(2)} - ${(
                    (totalCreditPoints + 1) /
                    totalCredits
                ).toFixed(2)}`;

        const summaryData = [
            [
                `${totalMarks} / ${maxMarks}`,
                `${totalCreditPoints}`,
                `${totalCredits}`,
                `${cgpa}`,
            ],
        ];

        // Add the summary table below the first table with some space
        const finalY = doc.lastAutoTable.finalY;
        doc.autoTable({
            head: [["Total Marks", "Total Grade Points", "Total Credits", "CGPA"]], // Empty header to align with the summary data
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

        // Capture graph screenshot and add to PDF
        // const graphElement = document.getElementById("g-chart"); // Replace with the actual ID of the graph element
        // html2canvas(graphElement).then((canvas) => {
        //   const imgData = canvas.toDataURL("image/png");
        //   const imgWidth = 190; // Adjust as needed
        //   const imgHeight = (canvas.height * imgWidth) / canvas.width;
        //   const finalY = doc.lastAutoTable.finalY + 7; // Add some space between the last table and the graph
        //   doc.addImage(imgData, "PNG", 10, finalY, imgWidth, imgHeight);
        //   doc.save(`${data.Roll_No}.pdf`);
        // });

        const pageHeight = doc.internal.pageSize.height;

        // Adding @MarkDigital at the bottom of the page
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text("@MarkDigital", 14, pageHeight - 10);
        }
        doc.save(`${data.Roll_No}.pdf`);
    };

    return (
        <div className="report-container">
            <h2 className="rtu-head">Rajasthan Technical University</h2>
            <p className="text-center mb-3">Report Analyser</p>
            <h3 className="clg-head m-3">{data && data.College_name}</h3>
            <div className="input-file w-4/5">
                <p className=" mr-1 font-semibold text-sm text-nowrap">
                    Upload Result :
                </p>
                <input
                    type="file"
                    onChange={handleFileChange}
                    accept="application/pdf"
                    className="rounded-lg border-2 border-gray-200  mr-1"
                />
                {url && (
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

            {error && <p className="text-red-500 text-center">{error}</p>}
            {data && data.Result === "PASS" && (
                <button
                    onClick={downloadPDF}
                    className="bg-blue-600  text-white font-bold p-1.5 px-2 rounded-lg printBtn"
                >
                    Download PDF
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
            {data ? (
                <>
                    <div className="table-report w-4/5">
                        <table className="text-center m-auto border-2 text-sm rtl:text-right text-gray-500 mt-4 w-full">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                <tr>
                                    <th scope="col" className="text-left px-6 py-2 border-2">
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
                                        Result:{" "}
                                        <span
                                            className={`${data && data.Result === "PASS" ? "bg-green-100" : "bg-red-100"
                                                } text-green-800 text-xs font-medium me-2 px-2.5 py-0.5 rounded dark:bg-green-900 dark:text-green-300 mx-3`}
                                        >
                                            {data && data.Result}
                                        </span>
                                    </th>
                                </tr>
                            </thead>
                        </table>

                        <div className="relative overflow-x-auto">
                            {data && data.Result === "PASS" ? (
                                <>
                                    <table className="text-center m-auto border-2 text-sm rtl:text-right text-gray-600">
                                        <thead className="text-xs border-b-2 text-gray-700 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-3">Sno</th>
                                                <th className="text-left px-6 py-3">
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
                                                <th className="px-3 py-3">
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
                                                <th className="px-3 py-3">
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
                                                <th className="px-3 py-3">
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
                                                <th className="px-3 py-3">
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
                                                <th className="px-3 py-3">
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
                                                <th className="px-3 py-3">Credits </th>
                                                <th className="px-3 py-3">Credit Points</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {dataSubjects.map((subject, index) => {
                                                const courseCredits = (() => {
                                                    const matchedSubject = credit.find(
                                                        (c) =>
                                                            c.Course_Title.toLowerCase() ===
                                                            subject.Subject_Name.toLowerCase()
                                                    );
                                                    return matchedSubject
                                                        ? Number(matchedSubject.Credits)
                                                        : 0;
                                                })();

                                                const creditPoints = (() => {
                                                    const matchedSubject = credit.find(
                                                        (c) =>
                                                            c.Course_Title.toLowerCase() ===
                                                            subject.Subject_Name.toLowerCase()
                                                    );
                                                    const course = matchedSubject
                                                        ? Number(matchedSubject.Credits)
                                                        : 0;
                                                    const creditPoints = course * Number(subject.Points);
                                                    totalCreditPoints += creditPoints; // Add the credit points to the total
                                                    return creditPoints;
                                                })();

                                                totalCredits += courseCredits; // Add the course credits to the total
                                                return (
                                                    <tr
                                                        key={index}
                                                        className="bg-white border-b "
                                                    >
                                                        <th className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                                            {index + 1}
                                                        </th>
                                                        <td className="text-left px-6 py-2">
                                                            {subject.Subject_Name}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {subject.Subject_Code}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {subject.Internal_Marks}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            {subject.External_Marks}
                                                        </td>
                                                        <td className="px-3 py-2">{subject.Grade}</td>
                                                        <td className="px-3 py-2">{subject.Total_Marks}</td>
                                                        <td className="px-3 py-2">{courseCredits}</td>
                                                        <td className="px-3 py-2">{creditPoints}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                    <table className="text-center w-full text-nowrap border-l-2 border-r-2 border-b-2 text-sm rtl:text-right text-gray-500 ">
                                        <thead className="text-xs  text-gray-700 uppercase bg-gray-50 ">
                                            <tr>
                                                <th scope="col" className=" text-left px-6 py-3">
                                                    Total Marks :{" "}
                                                    {Math.trunc(
                                                        data.Subjects &&
                                                        data.Percentage * data.Subjects.length
                                                    )}{" "}
                                                    / {data.Subjects && 100 * data.Subjects.length}
                                                </th>
                                                <th scope="col" className=" text-left    px-6 py-3">
                                                    Total Grade Points : {totalCreditPoints}
                                                </th>
                                                <th scope="col" className=" text-left    px-6 py-3">
                                                    Total Credit's : {totalCredits}
                                                </th>
                                                <th
                                                    scope="col"
                                                    className=" text-left    px-6 py-3 pr-16"
                                                >
                                                    {data.semester > 4 ? (
                                                        <>
                                                            {totalCreditPoints / totalCredits < 9.95 ? (
                                                                <>
                                                                    {" "}
                                                                    CGPA :{" "}
                                                                    {(totalCreditPoints / totalCredits).toFixed(
                                                                        2
                                                                    )}{" "}
                                                                    -{" "}
                                                                    {(
                                                                        (totalCreditPoints + 2) /
                                                                        totalCredits
                                                                    ).toFixed(2)}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    CGPA :{" "}
                                                                    {(totalCreditPoints / totalCredits).toFixed(
                                                                        2
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                            {totalCreditPoints / totalCredits < 9.95 ? (
                                                                <>
                                                                    {" "}
                                                                    CGPA :{" "}
                                                                    {(totalCreditPoints / totalCredits).toFixed(
                                                                        1
                                                                    )}{" "}
                                                                    -{" "}
                                                                    {(
                                                                        (totalCreditPoints + 2) /
                                                                        totalCredits
                                                                    ).toFixed(2)}
                                                                </>
                                                            ) : (
                                                                <>
                                                                    CGPA :{" "}
                                                                    {(totalCreditPoints / totalCredits).toFixed(
                                                                        2
                                                                    )}
                                                                </>
                                                            )}
                                                        </>
                                                    )}
                                                </th>
                                            </tr>
                                        </thead>
                                    </table>
                                    <Modal
                                        show={openModal}
                                        size="md"
                                        onClose={() => setOpenModal(false)}
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
                                <p className="text-center text-red-600">Result: FAIL</p>
                            )}
                        </div>
                    </div>

                    {data && data.Result === "PASS" && (
                        <div className="chart w-4/5 mx-auto mt-2 " id="g-chart">
                            <MarksBarGraph dataSubjects={dataSubjects} />
                        </div>
                    )}


                    <footer className="footer text-sm footer-center p-4 bg-base-300 text-base-content bg-blue-100 text-center text-black  w-full bottom-0">
                        
                        <aside>
                            <p className="footer-text">
                                <span className="font-bold">
                                    Designed and Developed by @MarkDigital
                                </span>{" "}
                                |<span> <Link to={"/disclaimer"} className="font-bold">
                                    Read Disclaimer
                                </Link>
                            </span> |{" "}
                            <span><Link to={"/whatsNew"} className="font-bold text-sm text-blue-500">
                        What's New ? v2.1
                    </Link></span>
                        </p>
                    </aside>
                </footer>
        </>
    ) : (
        <p className="text-center text-lg my-2">
            <footer className="footer footer-center p-4 bg-base-300 text-base-content text-center text-black w-full bottom-0">
                <aside>
                    <p className="font-bold text-sm text-gray-400">
                        Designed and Developed by @MarkDigital
                    </p>
                    <p className=" text-xs"></p>
                    <Link to={"/whatsNew"} className="font-bold text-sm text-blue-500">
                        What's New ? v2.1
                    </Link>
                </aside>
            </footer>
        </p>
    )
}
<ToastContainer />
    </div >
  );
}