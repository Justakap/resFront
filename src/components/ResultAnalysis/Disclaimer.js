import React from 'react'

export default function Disclaimer() {
    return (
        <div className='bg-slate-100 h-screen'>
            <div className="max-w-2xl mx-auto bg-slate-100 py-4">
                <h2 className="text-xl font-bold mb-4">Disclaimer : Result Analysis Tool</h2>
                <ol className="list-decimal list-inside">
                    <li className="mb-2">Publication Rights: We do not hold any rights to publish the data displayed on this website. The content is extracted from publicly available PDF documents for informational purposes only.</li>
                    <li className="mb-2">Accuracy of Data: While we strive to provide accurate and up-to-date information, we cannot guarantee the accuracy, completeness, or reliability of the data presented on this website. Users are advised to verify any information obtained here before making decisions based on it.</li>
                    <li className="mb-2">No Warranties: The information provided on this website is provided "as is" without any representations or warranties, express or implied. We make no representations or warranties in relation to the accuracy or completeness of the information.</li>
                    <li className="mb-2">Use at Your Own Risk: We shall not be liable for any loss or damage arising from the use of this website or its content.</li>
                    <li className="mb-2">Past Calculation Basis: The results displayed on this website are based on past calculations and may not reflect the current situation accurately. Users are advised to exercise caution and seek professional advice if needed.</li>
                    <li className="mb-2">Changes and Updates: We reserve the right to modify, update, or remove any content on this website without prior notice.</li>
                </ol>
                <p className="mt-4">By using this website, you agree to the terms of this disclaimer.</p>
            </div>
        </div>
    )
}
