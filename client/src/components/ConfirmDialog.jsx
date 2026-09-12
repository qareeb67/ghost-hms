import { useCallback, useEffect, useRef, useState } from "react";
import { AlertTriangle, X } from "lucide-react";

import "./ConfirmDialog.css";

let resolveConfirmation = null;
let requestConfirmation = null;

export const confirmAction = (options = {}) => {
    return new Promise((resolve) => {
        resolveConfirmation = resolve;
        requestConfirmation?.(options);
    });
};

function ConfirmDialogHost() {
    const [dialog, setDialog] = useState(null);
    const dialogRef = useRef(null);

    useEffect(() => {
        requestConfirmation = (options) => {
            setDialog({
                title: options.title || "Confirm action",
                message:
                    options.message ||
                    "Are you sure you want to continue?",
                confirmText:
                    options.confirmText || "Confirm",
                cancelText:
                    options.cancelText || "Cancel",
                destructive:
                    options.destructive !== false,
            });
        };

        return () => {
            requestConfirmation = null;
        };
    }, []);

    const close = useCallback((confirmed) => {
        if (resolveConfirmation) {
            resolveConfirmation(confirmed);
            resolveConfirmation = null;
        }

        setDialog(null);
    }, []);

    useEffect(() => {
        if (!dialog) return;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                close(false);
                return;
            }

            if (event.key === "Enter") {
                close(true);
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [dialog, close]);

    useEffect(() => {
        if (!dialog) return;

        requestAnimationFrame(() => {
            dialogRef.current?.focus();
        });
    }, [dialog]);

    if (!dialog) return null;

    return (
        <div
            className="ghost-confirm-overlay"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    close(false);
                }
            }}
        >
            <section
                className="ghost-confirm-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="ghost-confirm-title"
                tabIndex="-1"
                ref={dialogRef}
            >
                <button
                    type="button"
                    className="ghost-confirm-close"
                    onClick={() => close(false)}
                    aria-label="Close confirmation"
                >
                    <X size={18} />
                </button>

                <div className={`ghost-confirm-icon ${dialog.destructive ? "is-danger" : ""}`}>
                    <AlertTriangle size={22} />
                </div>

                <div className="ghost-confirm-copy">
                    <span className="ghost-confirm-eyebrow">
                        Ghost HMS
                    </span>

                    <h2 id="ghost-confirm-title">
                        {dialog.title}
                    </h2>

                    <p>
                        {dialog.message}
                    </p>
                </div>

                <div className="ghost-confirm-actions">
                    <button
                        type="button"
                        className="ghost-confirm-cancel"
                        onClick={() => close(false)}
                    >
                        {dialog.cancelText}
                    </button>

                    <button
                        type="button"
                        className={`ghost-confirm-submit ${dialog.destructive ? "is-danger" : ""}`}
                        onClick={() => close(true)}
                    >
                        {dialog.confirmText}
                    </button>
                </div>
            </section>
        </div>
    );
}

export default ConfirmDialogHost;
