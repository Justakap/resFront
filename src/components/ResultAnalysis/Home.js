import React, { useState, useEffect } from "react";
import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import "../../index.css";
import { ToastContainer, toast, Bounce } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Button, Modal } from "flowbite-react";
import { Link } from "react-router-dom";
import ReactGA from 'react-ga'


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

  const presetKey = process.env.REACT_APP_API_PRESET_KEY;
  const cloudName = process.env.REACT_APP_API_CLOUD_NAME;

  useEffect(() => {
    ReactGA.pageview(window.location.pathname);

  }, [])



  const handleFileChange = async (event) => {
    event.preventDefault();
    const selectedFile = event.target.files[0];

    // Check the file extension
    const fileExtension = selectedFile.name.split(".").pop();
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
      }, 7000);
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
    const table = document.querySelector(".table-report");

    html2canvas(table)
      .then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Add the image to the PDF
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

        // Add the watermark text
        const watermarkText = "@MarkDigital";
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        pdf.setFontSize(20); // Set the font size of the watermark
        pdf.setTextColor(150, 150, 150); // Set the color of the watermark (gray)
        pdf.text(watermarkText, pageWidth / 2, pageHeight / 2, {
          align: "center",
        });

        // Save the PDF
        pdf.save(`${data.Roll_No}.pdf`);
      })
      .catch((error) => {
        console.error("Error generating PDF:", error);
      });
  };

  return (
    <div className=" bg-slate-100 h-screen">
      <div className="report-container">
        <h2 className="rtu-head">Rajasthan Technical University</h2>
        <p className="text-center mb-3">Result Analyser</p>
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
              className="bg-blue-800 text-white font-bold p-2 rounded-lg text-nowrap mx-1"
            >
              Analyse
              {loading && (
                <div
                  className=" inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-primary motion-reduce:animate-[spin_1.5s_linear_infinite]"
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

        {error && <p className="text-red-500 text-center">{ }</p>}

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
                        className={
                          data.Result === "PASS"
                            ? "text-green-400"
                            : "text-red-600"
                        }
                      >
                        {data.Result}
                      </span>
                    </th>
                  </tr>
                </thead>
              </table>

              <div className="relative overflow-x-auto">
                {data.Result === "PASS" ? (
                  <>
                    <table className="text-center m-auto border-2 text-sm rtl:text-right text-gray-500">
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
                                c.code ===
                                subject.Subject_Code
                            );
                            return matchedSubject
                              ? Number(matchedSubject.credits)
                              : 0;
                          })();

                          const creditPoints = (() => {
                            const matchedSubject = credit.find(
                              (c) =>
                                c.code ===
                                subject.Subject_Code
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
                            <tr key={index} className="bg-white border-b ">
                              <th className="px-3 py-2 font-medium text-gray-900 whitespace-nowrap">
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
                              <td className="px-3 py-2">
                                {subject.Total_Marks}
                              </td>
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
                  // <p className="text-center text-red-600">Result: </p>
                  <></>
                )}
              </div>
            </div>
            <div className="bg-slate-100 pb-3">
              <button
                onClick={downloadPDF}
                className="bg-black  text-white font-bold p-2 rounded-lg printBtn "
              >
                Download PDF{" "}
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
            </div>
            <footer className="footer text-sm footer-center p-4 bg-base-300 text-base-content bg-blue-100 text-center text-black  w-full bottom-0">
              <aside>
                <p className="font-bold">
                  Designed and Developed by @MarkDigital
                </p>
                <Link to={"/disclaimer"} className="font-bold">
                  Read Disclaimer
                </Link>
                <p className=" text-xs">v2.0</p>
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
                  What's New ? v2.0
                </Link>
              </aside>
            </footer>
          </p>
        )}
        <ToastContainer />
      </div>
    </div>
  );
}
