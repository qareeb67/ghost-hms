/* =========================================================
   GHOST HMS NOTIFICATION SERVICE
   ========================================================= */

let notificationCounter = 0;

const getContainer = () => {
    let container = document.getElementById("ghost-hms-notifications");

    if (!container) {
        container = document.createElement("div");
        container.id = "ghost-hms-notifications";
        container.className = "ghost-hms-notifications";
        document.body.appendChild(container);
    }

    return container;
};

const inferType = (message) => {
    const text = String(message || "").toLowerCase();

    if (
        /failed|error|invalid|unable|cannot|could not|not allowed|denied|missing|incorrect/.test(text)
    ) {
        return "error";
    }

    if (
        /offline|warning|connection|already exists|not found|are you sure|required/.test(text)
    ) {
        return "warning";
    }

    if (
        /success|successful|added|updated|deleted|created|recorded|registered|saved|completed|synchronized|restored/.test(text)
    ) {
        return "success";
    }

    return "info";
};

export const showToast = (message, type) => {
    if (typeof document === "undefined") {
        return null;
    }

    const text = String(message || "").trim();

    if (!text) {
        return null;
    }

    const resolvedType = type || inferType(text);
    const container = getContainer();
    const id = `ghost-toast-${++notificationCounter}`;

    const toast = document.createElement("div");
    toast.className = `ghost-hms-toast ghost-hms-toast-${resolvedType}`;
    toast.id = id;
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");

    const icon = document.createElement("span");
    icon.className = "ghost-hms-toast-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent =
        resolvedType === "success"
            ? "✓"
            : resolvedType === "error"
                ? "!"
                : resolvedType === "warning"
                    ? "!"
                    : "i";

    const content = document.createElement("div");
    content.className = "ghost-hms-toast-content";

    const title = document.createElement("strong");
    title.className = "ghost-hms-toast-title";
    title.textContent =
        resolvedType === "success"
            ? "Success"
            : resolvedType === "error"
                ? "Action failed"
                : resolvedType === "warning"
                    ? "Please note"
                    : "Information";

    const body = document.createElement("p");
    body.className = "ghost-hms-toast-message";
    body.textContent = text;

    const close = document.createElement("button");
    close.className = "ghost-hms-toast-close";
    close.type = "button";
    close.setAttribute("aria-label", "Dismiss notification");
    close.textContent = "×";

    content.appendChild(title);
    content.appendChild(body);
    toast.appendChild(icon);
    toast.appendChild(content);
    toast.appendChild(close);
    container.appendChild(toast);

    let dismissed = false;
    let timeoutId = null;

    const removeToast = () => {
        if (dismissed) {
            return;
        }

        dismissed = true;

        if (timeoutId) {
            window.clearTimeout(timeoutId);
        }

        toast.classList.add("is-leaving");

        window.setTimeout(() => {
            toast.remove();
        }, 220);
    };

    close.addEventListener("click", removeToast);

    const startTimer = () => {
        if (dismissed) {
            return;
        }

        timeoutId = window.setTimeout(removeToast, 4500);
    };

    toast.addEventListener("mouseenter", () => {
        if (timeoutId) {
            window.clearTimeout(timeoutId);
            timeoutId = null;
        }
    });

    toast.addEventListener("mouseleave", startTimer);

    startTimer();

    return removeToast;
};

export default showToast;
