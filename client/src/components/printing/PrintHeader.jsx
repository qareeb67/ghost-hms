
function PrintHeader({
    hospitalName = "Hospital Management System",
    hospitalAddress = "Nigeria",
    hospitalPhone = "",
    hospitalEmail = "",
    documentTitle = "",
    documentSubtitle = "",
}) {
    return (
        <header className="print-header">

            <div className="print-header-main">

                <div className="print-hospital">

                    <div className="print-hospital-logo">
                        <span>GH</span>
                    </div>

                    <div className="print-hospital-info">

                        <h1>
                            {hospitalName}
                        </h1>

                        {hospitalAddress && (
                            <p>
                                {hospitalAddress}
                            </p>
                        )}

                        <div className="print-hospital-contact">

                            {hospitalPhone && (
                                <span>
                                    Tel: {hospitalPhone}
                                </span>
                            )}

                            {hospitalEmail && (
                                <span>
                                    {hospitalEmail}
                                </span>
                            )}

                        </div>

                    </div>

                </div>


                <div className="print-document-info">

                    {documentTitle && (
                        <h2>
                            {documentTitle}
                        </h2>
                    )}

                    {documentSubtitle && (
                        <p>
                            {documentSubtitle}
                        </p>
                    )}

                    <span className="print-document-date">
                        Printed:{" "}
                        {new Date().toLocaleDateString(
                            "en-NG",
                            {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                            }
                        )}
                    </span>

                </div>

            </div>


            <div className="print-header-line" />

        </header>
    );
}

export default PrintHeader;