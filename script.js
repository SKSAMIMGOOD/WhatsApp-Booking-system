/* ==========================================================================
   SyncBook Premium JavaScript - Wizard State, Validation & WhatsApp Integration
   ========================================================================== */

// 1. WhatsApp Configuration Variable
// Change this number to your official business phone number (with country code, no "+" or spaces)
const WHATSAPP_PHONE = "9064677945"; 

// Local Storage Key
const LOCAL_STORAGE_KEY = "syncbook_form_data";

// 2. DOM Elements & State
document.addEventListener("DOMContentLoaded", () => {
    // Form and Steps Elements
    const form = document.getElementById("booking-form");
    const steps = document.querySelectorAll(".form-step");
    const indicators = document.querySelectorAll(".step-indicator");
    const progressBar = document.getElementById("form-progress-bar");
    
    // Navigation Buttons
    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    const submitBtn = document.getElementById("submit-btn");
    const resetBtn = document.getElementById("reset-btn");

    // Form Inputs & Fields
    const fullNameInput = document.getElementById("full-name");
    const companyNameInput = document.getElementById("company-name");
    const emailInput = document.getElementById("email");
    const mobileInput = document.getElementById("mobile-number");
    const whatsappInput = document.getElementById("whatsapp-number");
    const syncWhatsappCheckbox = document.getElementById("sync-whatsapp");
    
    const addressInput = document.getElementById("address");
    const cityInput = document.getElementById("city");
    const stateInput = document.getElementById("state");
    const countryInput = document.getElementById("country");
    const pinCodeInput = document.getElementById("pin-code");
    
    const serviceInput = document.getElementById("service-required");
    const packageInput = document.getElementById("package");
    const meetingTypeInputs = document.getElementsByName("meetingType");
    const prefDateInput = document.getElementById("preferred-date");
    const prefTimeInput = document.getElementById("preferred-time");
    const budgetInput = document.getElementById("budget");
    const deadlineInput = document.getElementById("project-deadline");
    const referralInput = document.getElementById("referral");
    
    const descriptionInput = document.getElementById("project-desc");
    const charCountEl = document.getElementById("char-count");
    
    // Live Ticket Elements
    const ticketIdEl = document.getElementById("ticket-id");
    const summaryClientName = document.getElementById("summary-client-name");
    const summaryClientOrg = document.getElementById("summary-client-org");
    const summaryClientContact = document.getElementById("summary-client-contact");
    const summaryService = document.getElementById("summary-service");
    const summaryPackage = document.getElementById("summary-package");
    const summaryBudget = document.getElementById("summary-budget");
    const summaryMeeting = document.getElementById("summary-meeting");
    const summarySession = document.getElementById("summary-session");
    const summaryDeadline = document.getElementById("summary-deadline");
    const summaryCompletionBar = document.getElementById("summary-completion-bar");
    const summaryCompletionText = document.getElementById("summary-completion-text");

    // Modal elements
    const modal = document.getElementById("confirm-modal");
    const modalClose = document.getElementById("modal-close");
    const modalCancel = document.getElementById("modal-cancel-btn");
    const modalConfirm = document.getElementById("modal-confirm-btn");
    
    // Theme toggle
    const themeToggleBtn = document.getElementById("theme-toggle");
    const sunIcon = themeToggleBtn.querySelector(".sun-icon");
    const moonIcon = themeToggleBtn.querySelector(".moon-icon");

    // State Variables
    let currentStep = 1;
    let uploadedFiles = [];

    // Set Min Date to Today (restrict past bookings)
    const today = new Date().toISOString().split("T")[0];
    prefDateInput.min = today;
    if (deadlineInput) deadlineInput.min = today;

    // Generate Dynamic Ticket ID once on load
    const dateFormatted = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    ticketIdEl.textContent = `#SB-${dateFormatted}-${randomSuffix}`;

    /* --------------------------------------------------------------------------
       3. Theme Toggler (Dark/Light Modes)
       -------------------------------------------------------------------------- */
    const initTheme = () => {
        const savedTheme = localStorage.getItem("syncbook_theme") || "dark";
        if (savedTheme === "light") {
            document.body.classList.add("light-theme");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
        } else {
            document.body.classList.remove("light-theme");
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
        }
    };

    themeToggleBtn.addEventListener("click", () => {
        document.body.classList.toggle("light-theme");
        const isLight = document.body.classList.contains("light-theme");
        
        if (isLight) {
            localStorage.setItem("syncbook_theme", "light");
            sunIcon.style.display = "none";
            moonIcon.style.display = "block";
            showToast("Light Theme Activated", "Optimized for high contrast environments", "info");
        } else {
            localStorage.setItem("syncbook_theme", "dark");
            sunIcon.style.display = "block";
            moonIcon.style.display = "none";
            showToast("Dark Theme Activated", "Optimized for comfortable screen viewing", "info");
        }
    });

    initTheme();

    /* --------------------------------------------------------------------------
       4. Toast Notification Trigger
       -------------------------------------------------------------------------- */
    const showToast = (title, desc, type = "info") => {
        const toastContainer = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        
        let icon = "💡";
        if (type === "success") icon = "✅";
        if (type === "danger") icon = "❌";
        if (type === "warning") icon = "⚠️";

        toast.innerHTML = `
            <span class="toast-icon">${icon}</span>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                <div class="toast-desc">${desc}</div>
            </div>
        `;
        
        toastContainer.appendChild(toast);

        // Slide out and remove toast
        setTimeout(() => {
            toast.classList.add("removing");
            toast.addEventListener("transitionend", () => {
                toast.remove();
            });
        }, 4000);
    };

    /* --------------------------------------------------------------------------
       5. Step Navigation & Validation Engine
       -------------------------------------------------------------------------- */
    const updateWizardUI = () => {
        // Form progress bar width calculation
        const progressPercentage = ((currentStep) / steps.length) * 100;
        progressBar.style.width = `${progressPercentage}%`;

        // Toggle Step Views
        steps.forEach((step, idx) => {
            if (idx + 1 === currentStep) {
                step.classList.add("active");
            } else {
                step.classList.remove("active");
            }
        });

        // Toggle step indicator progress visual classes
        indicators.forEach((indicator, idx) => {
            const stepNum = idx + 1;
            if (stepNum === currentStep) {
                indicator.classList.add("active");
                indicator.classList.remove("completed");
            } else if (stepNum < currentStep) {
                indicator.classList.remove("active");
                indicator.classList.add("completed");
            } else {
                indicator.classList.remove("active", "completed");
            }
        });

        // Navigation button configurations
        if (currentStep === 1) {
            prevBtn.style.visibility = "hidden";
        } else {
            prevBtn.style.visibility = "visible";
        }

        if (currentStep === steps.length) {
            nextBtn.style.display = "none";
            submitBtn.style.display = "inline-flex";
        } else {
            nextBtn.style.display = "inline-flex";
            submitBtn.style.display = "none";
        }
    };

    // Validation patterns
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone) => {
        // Validates standard international numbers, digits 8 to 15, optional leading +
        return /^\+?[0-9]{8,15}$/.test(phone.replace(/[\s-()]/g, ""));
    };

    const setError = (inputEl, errorEl, message) => {
        const group = inputEl.closest(".input-group");
        if (group) {
            group.classList.add("invalid");
            if (errorEl) errorEl.textContent = message;
        }
    };

    const clearError = (inputEl) => {
        const group = inputEl.closest(".input-group");
        if (group) {
            group.classList.remove("invalid");
        }
    };

    // Validates a single input element
    const validateField = (inputEl) => {
        const val = inputEl.value.trim();
        
        // Full Name
        if (inputEl.id === "full-name") {
            if (!val) {
                setError(inputEl, document.getElementById("err-full-name"), "Full name is required");
                return false;
            } else if (val.length < 3) {
                setError(inputEl, document.getElementById("err-full-name"), "Name must be at least 3 letters");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        // Email
        if (inputEl.id === "email") {
            if (!val) {
                setError(inputEl, document.getElementById("err-email"), "Email address is required");
                return false;
            } else if (!validateEmail(val)) {
                setError(inputEl, document.getElementById("err-email"), "Enter a valid email address");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        // Phone
        if (inputEl.id === "mobile-number") {
            if (!val) {
                setError(inputEl, document.getElementById("err-mobile-number"), "Mobile number is required");
                return false;
            } else if (!validatePhone(val)) {
                setError(inputEl, document.getElementById("err-mobile-number"), "Enter a valid phone number (e.g. 10 digits)");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        // Service dropdown
        if (inputEl.id === "service-required") {
            if (!val) {
                setError(inputEl, document.getElementById("err-service"), "Service selection is required");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        // Package dropdown
        if (inputEl.id === "package") {
            if (!val) {
                setError(inputEl, document.getElementById("err-package"), "Package selection is required");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        // Budget dropdown
        if (inputEl.id === "budget") {
            if (!val) {
                setError(inputEl, document.getElementById("err-budget"), "Budget selection is required");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        // Date Picker
        if (inputEl.id === "preferred-date") {
            if (!val) {
                setError(inputEl, document.getElementById("err-pref-date"), "Preferred meeting date is required");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        // Time Picker
        if (inputEl.id === "preferred-time") {
            if (!val) {
                setError(inputEl, document.getElementById("err-pref-time"), "Preferred meeting time is required");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        // Description
        if (inputEl.id === "project-desc") {
            if (!val) {
                setError(inputEl, document.getElementById("err-project-desc"), "Project description is required");
                return false;
            } else if (val.length < 20) {
                setError(inputEl, document.getElementById("err-project-desc"), "Provide at least 20 characters describing requirements");
                return false;
            }
            clearError(inputEl);
            return true;
        }

        return true;
    };

    // Validate all inputs in the active step
    const validateStep = (stepNumber) => {
        let isValid = true;
        
        if (stepNumber === 1) {
            if (!validateField(fullNameInput)) isValid = false;
            if (!validateField(emailInput)) isValid = false;
            if (!validateField(mobileInput)) isValid = false;
        } else if (stepNumber === 2) {
            if (!validateField(serviceInput)) isValid = false;
            if (!validateField(packageInput)) isValid = false;
            if (!validateField(budgetInput)) isValid = false;
            if (!validateField(prefDateInput)) isValid = false;
            if (!validateField(prefTimeInput)) isValid = false;
        } else if (stepNumber === 3) {
            if (!validateField(descriptionInput)) isValid = false;
        }

        return isValid;
    };

    // Wire Validation event listeners on inputs change
    const addLiveValidationListeners = () => {
        const fieldsToValidate = [
            fullNameInput, emailInput, mobileInput,
            serviceInput, packageInput, budgetInput,
            prefDateInput, prefTimeInput, descriptionInput
        ];

        fieldsToValidate.forEach(field => {
            field.addEventListener("input", () => {
                validateField(field);
                updateTicketSummary();
                saveFormData();
            });
            field.addEventListener("blur", () => {
                validateField(field);
            });
        });
    };

    addLiveValidationListeners();

    // Step Transition Clicks
    nextBtn.addEventListener("click", () => {
        if (validateStep(currentStep)) {
            currentStep++;
            updateWizardUI();
            window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
            showToast("Validation Warning", "Please correct highlighted fields before advancing.", "warning");
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentStep > 1) {
            currentStep--;
            updateWizardUI();
            window.scrollTo({ top: 0, behavior: "smooth" });
        }
    });

    // Make Step Indicators clickable to bounce between validated steps
    indicators.forEach(indicator => {
        indicator.addEventListener("click", () => {
            const targetStep = parseInt(indicator.getAttribute("data-step"));
            if (targetStep === currentStep) return;

            // Forward navigation check
            if (targetStep > currentStep) {
                // Check if all steps in between are valid
                for (let s = currentStep; s < targetStep; s++) {
                    if (!validateStep(s)) {
                        showToast("Validation Stop", `Complete step ${s} required fields first.`, "warning");
                        return;
                    }
                }
            }
            
            currentStep = targetStep;
            updateWizardUI();
        });
    });

    /* --------------------------------------------------------------------------
       6. Custom Dropdown Select Elements Logic
       -------------------------------------------------------------------------- */
    const setupCustomSelects = () => {
        const selectGroups = document.querySelectorAll(".custom-select-group");

        selectGroups.forEach(group => {
            const trigger = group.querySelector(".custom-select-trigger");
            const hiddenInput = group.querySelector("input[type='hidden']");
            const optionsContainer = group.querySelector(".custom-options-container");
            const options = group.querySelectorAll(".custom-option");
            const selectedText = trigger.querySelector(".selected-val");

            // Open/Close Dropdown Panel
            trigger.addEventListener("click", (e) => {
                e.stopPropagation();
                // Close other selects
                selectGroups.forEach(otherGroup => {
                    if (otherGroup !== group) otherGroup.classList.remove("open");
                });
                group.classList.toggle("open");
                trigger.setAttribute("aria-expanded", group.classList.contains("open"));
            });

            // Selection Event
            options.forEach(option => {
                option.addEventListener("click", (e) => {
                    e.stopPropagation();
                    const val = option.getAttribute("data-value");
                    hiddenInput.value = val;
                    selectedText.textContent = option.textContent;
                    
                    options.forEach(opt => opt.classList.remove("selected"));
                    option.classList.add("selected");
                    
                    group.classList.remove("open");
                    trigger.setAttribute("aria-expanded", "false");

                    // Trigger validation and updates
                    validateField(hiddenInput);
                    updateTicketSummary();
                    saveFormData();
                });
            });

            // Accessibility: Keyboard Navigation
            trigger.addEventListener("keydown", (e) => {
                let open = group.classList.contains("open");
                
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    trigger.click();
                } else if (e.key === "Escape") {
                    group.classList.remove("open");
                    trigger.setAttribute("aria-expanded", "false");
                } else if (e.key === "ArrowDown" && open) {
                    e.preventDefault();
                    const nextOpt = optionsContainer.querySelector(".custom-option:hover")?.nextElementSibling || options[0];
                    nextOpt.focus();
                }
            });
        });

        // Click away listener to close select drop-downs
        document.addEventListener("click", () => {
            selectGroups.forEach(group => {
                group.classList.remove("open");
                group.querySelector(".custom-select-trigger").setAttribute("aria-expanded", "false");
            });
        });
    };

    setupCustomSelects();

    /* --------------------------------------------------------------------------
       7. Sync WhatsApp Number & Textarea Counter
       -------------------------------------------------------------------------- */
    // Synchronize phone number
    const handleWhatsappSync = () => {
        if (syncWhatsappCheckbox.checked) {
            whatsappInput.value = mobileInput.value;
            whatsappInput.setAttribute("readonly", true);
            whatsappInput.style.opacity = "0.7";
            whatsappInput.style.pointerEvents = "none";
            whatsappInput.closest(".floating-group").classList.add("focused-filled");
        } else {
            whatsappInput.removeAttribute("readonly");
            whatsappInput.style.opacity = "1";
            whatsappInput.style.pointerEvents = "all";
        }
        updateTicketSummary();
        saveFormData();
    };

    syncWhatsappCheckbox.addEventListener("change", handleWhatsappSync);
    mobileInput.addEventListener("input", () => {
        if (syncWhatsappCheckbox.checked) {
            whatsappInput.value = mobileInput.value;
            updateTicketSummary();
            saveFormData();
        }
    });

    // Character counter for project description
    descriptionInput.addEventListener("input", () => {
        const count = descriptionInput.value.length;
        charCountEl.textContent = count;
        
        // Warning triggers when close to limit
        if (count >= 900) {
            charCountEl.style.color = "var(--danger)";
        } else if (count >= 750) {
            charCountEl.style.color = "var(--warning)";
        } else {
            charCountEl.style.color = "var(--text-muted)";
        }
    });

    /* --------------------------------------------------------------------------
       8. Ticket Live Summary Card updates
       -------------------------------------------------------------------------- */
    const updateTicketSummary = () => {
        // Contact details
        const nameVal = fullNameInput.value.trim();
        summaryClientName.textContent = nameVal ? nameVal : "Anonymous Client";

        const compVal = companyNameInput.value.trim();
        summaryClientOrg.textContent = compVal ? compVal : "Independent Partner";

        const emailVal = emailInput.value.trim();
        const phoneVal = mobileInput.value.trim();
        if (emailVal || phoneVal) {
            summaryClientContact.innerHTML = `${emailVal ? '📧 ' + emailVal : ''} ${phoneVal ? '<br>📱 ' + phoneVal : ''}`;
        } else {
            summaryClientContact.textContent = "-";
        }

        // Specs Selection
        summaryService.textContent = serviceInput.value ? serviceInput.value : "Not Selected";
        summaryPackage.textContent = packageInput.value ? packageInput.value + " Tier" : "Not Selected";
        summaryBudget.textContent = budgetInput.value ? budgetInput.value : "Not Specified";

        // Meeting type selection
        let selectedMeeting = "Online Meeting";
        for (const input of meetingTypeInputs) {
            if (input.checked) {
                selectedMeeting = input.value === "Online" ? "💻 Online" : input.value === "Offline" ? "🤝 In-Person" : "📞 Phone Call";
                break;
            }
        }
        summaryMeeting.textContent = selectedMeeting;

        // Session Time
        const rawDate = prefDateInput.value;
        const rawTime = prefTimeInput.value;
        if (rawDate) {
            const dateObj = new Date(rawDate);
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            const prettyDate = dateObj.toLocaleDateString('en-IN', options);
            summarySession.textContent = `${prettyDate} @ ${rawTime ? rawTime : 'N/A'}`;
        } else {
            summarySession.textContent = "-";
        }

        // Project deadline
        const rawDeadline = deadlineInput.value;
        if (rawDeadline) {
            const dateObj = new Date(rawDeadline);
            const options = { day: 'numeric', month: 'short', year: 'numeric' };
            summaryDeadline.textContent = dateObj.toLocaleDateString('en-IN', options);
        } else {
            summaryDeadline.textContent = "Not Specified";
        }

        // Completion Rate calculation
        calculateCompletion();
    };

    // Calculate form progress percentage
    const calculateCompletion = () => {
        const fields = [
            fullNameInput, emailInput, mobileInput,
            serviceInput, packageInput, budgetInput,
            prefDateInput, prefTimeInput, descriptionInput
        ];
        
        let validFieldsCount = 0;
        fields.forEach(field => {
            // Use custom checking that doesn't trigger UI errors
            const val = field.value.trim();
            if (field.id === "full-name" && val.length >= 3) validFieldsCount++;
            else if (field.id === "email" && validateEmail(val)) validFieldsCount++;
            else if (field.id === "mobile-number" && validatePhone(val)) validFieldsCount++;
            else if (field.id === "service-required" && val !== "") validFieldsCount++;
            else if (field.id === "package" && val !== "") validFieldsCount++;
            else if (field.id === "budget" && val !== "") validFieldsCount++;
            else if (field.id === "preferred-date" && val !== "") validFieldsCount++;
            else if (field.id === "preferred-time" && val !== "") validFieldsCount++;
            else if (field.id === "project-desc" && val.length >= 20) validFieldsCount++;
        });

        const rate = Math.round((validFieldsCount / fields.length) * 100);
        summaryCompletionBar.style.width = `${rate}%`;
        summaryCompletionText.textContent = `${rate}%`;
    };

    /* --------------------------------------------------------------------------
       9. Drag & Drop Upload Mock UI Interactions
       -------------------------------------------------------------------------- */
    const dropZone = document.getElementById("drop-zone");
    const fileUploader = document.getElementById("file-uploader");
    const uploadBtn = document.getElementById("upload-btn");
    const previewList = document.getElementById("file-preview-list");

    const triggerUpload = () => fileUploader.click();
    uploadBtn.addEventListener("click", triggerUpload);
    dropZone.addEventListener("click", (e) => {
        // Prevent click bubbling loop if clicking browse button
        if (e.target !== uploadBtn) {
            triggerUpload();
        }
    });

    dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("dragover");
    });

    dropZone.addEventListener("dragleave", () => {
        dropZone.classList.remove("dragover");
    });

    dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("dragover");
        handleFiles(e.dataTransfer.files);
    });

    fileUploader.addEventListener("change", () => {
        handleFiles(fileUploader.files);
    });

    const handleFiles = (filesList) => {
        for (let file of filesList) {
            // Check max size 10MB
            if (file.size > 10 * 1024 * 1024) {
                showToast("File Oversized", `${file.name} exceeds the 10MB file limit.`, "danger");
                continue;
            }
            
            uploadedFiles.push(file);
            renderFileItem(file);
        }
        showToast("Files Added", `${filesList.length} file(s) attached to request.`, "success");
    };

    const renderFileItem = (file) => {
        const li = document.createElement("li");
        li.className = "file-item";
        
        // Shorten name if too long
        let dispName = file.name;
        if (dispName.length > 25) {
            dispName = dispName.slice(0, 15) + "..." + dispName.slice(-8);
        }

        const sizeKb = (file.size / 1024).toFixed(1);
        
        li.innerHTML = `
            <div class="file-details">
                <span>📄</span>
                <strong>${dispName}</strong> <span>(${sizeKb} KB)</span>
            </div>
            <button type="button" class="file-remove-btn">&times;</button>
        `;

        li.querySelector(".file-remove-btn").addEventListener("click", () => {
            uploadedFiles = uploadedFiles.filter(f => f !== file);
            li.style.transform = "translateY(-8px)";
            li.style.opacity = "0";
            setTimeout(() => li.remove(), 250);
            showToast("File Detached", `${file.name} removed.`, "info");
        });

        previewList.appendChild(li);
    };

    /* --------------------------------------------------------------------------
       10. Auto-Save Local Storage Data Management
       -------------------------------------------------------------------------- */
    const saveFormData = () => {
        const formData = {
            fullName: fullNameInput.value,
            companyName: companyNameInput.value,
            email: emailInput.value,
            mobileNumber: mobileInput.value,
            whatsappNumber: whatsappInput.value,
            syncWhatsapp: syncWhatsappCheckbox.checked,
            address: addressInput.value,
            city: cityInput.value,
            state: stateInput.value,
            country: countryInput.value,
            pinCode: pinCodeInput.value,
            serviceRequired: serviceInput.value,
            package: packageInput.value,
            meetingType: Array.from(meetingTypeInputs).find(input => input.checked)?.value || "Online",
            preferredDate: prefDateInput.value,
            preferredTime: prefTimeInput.value,
            budget: budgetInput.value,
            projectDeadline: deadlineInput.value,
            referral: referralInput.value,
            projectDescription: descriptionInput.value
        };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(formData));
    };

    const loadFormData = () => {
        const savedDataRaw = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (!savedDataRaw) return;

        try {
            const data = JSON.parse(savedDataRaw);
            
            // Map values back to inputs
            fullNameInput.value = data.fullName || "";
            companyNameInput.value = data.companyName || "";
            emailInput.value = data.email || "";
            mobileInput.value = data.mobileNumber || "";
            whatsappInput.value = data.whatsappNumber || "";
            syncWhatsappCheckbox.checked = data.syncWhatsapp || false;
            
            addressInput.value = data.address || "";
            cityInput.value = data.city || "";
            stateInput.value = data.state || "";
            countryInput.value = data.country || "";
            pinCodeInput.value = data.pinCode || "";
            
            serviceInput.value = data.serviceRequired || "";
            packageInput.value = data.package || "";
            
            if (data.meetingType) {
                Array.from(meetingTypeInputs).forEach(input => {
                    input.checked = input.value === data.meetingType;
                });
            }

            prefDateInput.value = data.preferredDate || "";
            prefTimeInput.value = data.preferredTime || "";
            budgetInput.value = data.budget || "";
            deadlineInput.value = data.projectDeadline || "";
            referralInput.value = data.referral || "";
            descriptionInput.value = data.projectDescription || "";

            // Custom dropdown triggers visual texts mapping
            restoreCustomDropdownsVisuals();
            
            // Sync WhatsApp read-only properties
            handleWhatsappSync();
            
            // Update Ticket Summary
            updateTicketSummary();
            
            // Update char counter
            charCountEl.textContent = descriptionInput.value.length;

            showToast("Draft Loaded", "Resumed booking configuration from auto-save", "info");

        } catch (e) {
            console.error("Failed to parse auto-saved local storage form data", e);
        }
    };

    const restoreCustomDropdownsVisuals = () => {
        const selectGroups = document.querySelectorAll(".custom-select-group");
        selectGroups.forEach(group => {
            const hiddenInput = group.querySelector("input[type='hidden']");
            const triggerText = group.querySelector(".selected-val");
            const options = group.querySelectorAll(".custom-option");
            
            const savedVal = hiddenInput.value;
            if (savedVal) {
                options.forEach(option => {
                    if (option.getAttribute("data-value") === savedVal) {
                        option.classList.add("selected");
                        triggerText.textContent = option.textContent;
                    } else {
                        option.classList.remove("selected");
                    }
                });
            }
        });
    };

    // Load data upon load
    loadFormData();

    // Reset button clear data
    resetBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to clear the entire form? This will erase all auto-saved progress.")) {
            localStorage.removeItem(LOCAL_STORAGE_KEY);
            form.reset();
            
            // Reset custom dropdown values manually since they are not default form controls
            document.querySelectorAll(".custom-select-group input[type='hidden']").forEach(input => input.value = "");
            document.querySelectorAll(".custom-select-group .selected-val").forEach(txt => {
                if (txt.closest("#service-select-group")) txt.textContent = "Select Service...";
                else if (txt.closest("#package-select-group")) txt.textContent = "Select Package...";
                else if (txt.closest("#budget-select-group")) txt.textContent = "Select Budget...";
                else if (txt.closest("#referral-select-group")) txt.textContent = "Select Source...";
            });
            document.querySelectorAll(".custom-option").forEach(opt => opt.classList.remove("selected"));

            // Clear file previews
            uploadedFiles = [];
            previewList.innerHTML = "";

            // Sync resets
            syncWhatsappCheckbox.checked = false;
            handleWhatsappSync();

            // Set Step back to 1
            currentStep = 1;
            updateWizardUI();

            // Reset summary
            updateTicketSummary();

            showToast("Form Reset Complete", "All drafts cleared successfully.", "success");
        }
    });

    /* --------------------------------------------------------------------------
       11. Form Submit & Confirmation Modal Handler
       -------------------------------------------------------------------------- */
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        
        // Final sanity validation checks
        if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
            showToast("Incomplete Form", "Required inputs are missing or invalid.", "danger");
            return;
        }

        // Show spinner on submit button
        const btnText = submitBtn.querySelector(".btn-text");
        const spinner = submitBtn.querySelector(".btn-loading-spinner");
        
        btnText.style.display = "none";
        spinner.style.display = "block";
        submitBtn.setAttribute("disabled", true);

        // Simulate slight network process delay for luxury corporate feel
        setTimeout(() => {
            openConfirmationModal();
            
            // Restore button visual
            btnText.style.display = "block";
            spinner.style.display = "none";
            submitBtn.removeAttribute("disabled");
        }, 800);
    });

    const openConfirmationModal = () => {
        // Bind Modal values
        document.getElementById("modal-name").textContent = fullNameInput.value;
        
        const orgVal = companyNameInput.value.trim();
        if (orgVal) {
            document.getElementById("modal-org").textContent = orgVal;
            document.getElementById("modal-org-row").style.display = "block";
        } else {
            document.getElementById("modal-org-row").style.display = "none";
        }

        document.getElementById("modal-email").textContent = emailInput.value;
        document.getElementById("modal-phone").textContent = mobileInput.value;

        const waVal = whatsappInput.value.trim();
        if (waVal) {
            document.getElementById("modal-whatsapp").textContent = waVal;
            document.getElementById("modal-whatsapp-row").style.display = "block";
        } else {
            document.getElementById("modal-whatsapp-row").style.display = "none";
        }

        // Address compilation
        const address = addressInput.value.trim();
        const city = cityInput.value.trim();
        const state = stateInput.value.trim();
        const country = countryInput.value.trim();
        const pin = pinCodeInput.value.trim();
        
        let fullAddressParts = [];
        if (address) fullAddressParts.push(address);
        if (city) fullAddressParts.push(city);
        if (state) fullAddressParts.push(state);
        if (country) fullAddressParts.push(country);
        if (pin) fullAddressParts.push(`PIN: ${pin}`);
        
        const fullAddressStr = fullAddressParts.join(", ");
        if (fullAddressStr) {
            document.getElementById("modal-location").textContent = fullAddressStr;
            document.getElementById("modal-location-row").style.display = "block";
        } else {
            document.getElementById("modal-location-row").style.display = "none";
        }

        // Specs
        document.getElementById("modal-service").textContent = serviceInput.value;
        document.getElementById("modal-package").textContent = packageInput.value;
        
        // Meeting type
        const selectedMeeting = Array.from(meetingTypeInputs).find(input => input.checked)?.value || "Online";
        document.getElementById("modal-meeting").textContent = selectedMeeting;

        // Proposed session
        const rawDate = prefDateInput.value;
        const rawTime = prefTimeInput.value;
        const dateObj = new Date(rawDate);
        const options = { day: 'numeric', month: 'long', year: 'numeric' };
        const prettyDate = dateObj.toLocaleDateString('en-IN', options);
        document.getElementById("modal-schedule").textContent = `${prettyDate} at ${rawTime}`;

        document.getElementById("modal-budget").textContent = budgetInput.value;

        // Estimated deadline
        const rawDeadline = deadlineInput.value;
        if (rawDeadline) {
            const dlDateObj = new Date(rawDeadline);
            document.getElementById("modal-deadline").textContent = dlDateObj.toLocaleDateString('en-IN', options);
            document.getElementById("modal-deadline-row").style.display = "block";
        } else {
            document.getElementById("modal-deadline-row").style.display = "none";
        }

        // Referral source
        const refVal = referralInput.value;
        if (refVal) {
            document.getElementById("modal-referral").textContent = refVal;
            document.getElementById("modal-referral-row").style.display = "block";
        } else {
            document.getElementById("modal-referral-row").style.display = "none";
        }

        document.getElementById("modal-description").textContent = descriptionInput.value;

        // Open modal overlay
        modal.classList.add("open");
        document.body.style.overflow = "hidden"; // Prevent background scroll
    };

    const closeConfirmationModal = () => {
        modal.classList.remove("open");
        document.body.style.overflow = "auto";
    };

    modalClose.addEventListener("click", closeConfirmationModal);
    modalCancel.addEventListener("click", closeConfirmationModal);
    
    // Close modal on click outside modal-container
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeConfirmationModal();
        }
    });

    /* --------------------------------------------------------------------------
       12. Form formatting & WhatsApp click-to-chat redirection
       -------------------------------------------------------------------------- */
    modalConfirm.addEventListener("click", () => {
        // Construct the WhatsApp Message Text
        const name = fullNameInput.value.trim();
        const company = companyNameInput.value.trim() || "N/A";
        const email = emailInput.value.trim();
        const mobile = mobileInput.value.trim();
        const whatsappNum = whatsappInput.value.trim() || "Same as Mobile";
        
        // Gather address components
        const address = addressInput.value.trim();
        const city = cityInput.value.trim();
        const state = stateInput.value.trim();
        const country = countryInput.value.trim();
        const pin = pinCodeInput.value.trim();
        
        let addressLines = [];
        if (address) addressLines.push(address);
        let areaParts = [];
        if (city) areaParts.push(city);
        if (state) areaParts.push(state);
        if (areaParts.length > 0) addressLines.push(areaParts.join(", "));
        let countryParts = [];
        if (country) countryParts.push(country);
        if (pin) countryParts.push(`PIN: ${pin}`);
        if (countryParts.length > 0) addressLines.push(countryParts.join(" - "));

        const finalAddressStr = addressLines.length > 0 ? addressLines.join("\n") : "N/A";

        const service = serviceInput.value;
        const packageTier = packageInput.value;
        const meetingType = Array.from(meetingTypeInputs).find(input => input.checked)?.value || "Online";
        
        // Pretty Date conversion
        const rawDate = prefDateInput.value;
        const dateObj = new Date(rawDate);
        const dateOptions = { day: 'numeric', month: 'long', year: 'numeric' };
        const formattedDate = dateObj.toLocaleDateString('en-IN', dateOptions);
        
        const prefTime = prefTimeInput.value;
        const budget = budgetInput.value;
        
        const rawDeadline = deadlineInput.value;
        let formattedDeadline = "N/A";
        if (rawDeadline) {
            const dlDateObj = new Date(rawDeadline);
            formattedDeadline = dlDateObj.toLocaleDateString('en-IN', dateOptions);
        }

        const projectDetails = descriptionInput.value.trim();

        // Building the text templates with matching symbols
        const messageLines = [
            "-----------------------------------",
            "📌 NEW BOOKING REQUEST",
            "-----------------------------------",
            `👤 Name:\n${name}`,
            `🏢 Company:\n${company}`,
            `📧 Email:\n${email}`,
            `📱 Phone:\n${mobile}`,
            `💬 WhatsApp:\n${whatsappNum}`,
            `📍 Address:\n${finalAddressStr}`,
            "-----------------------------------",
            `📦 Service:\n${service}`,
            `💎 Package:\n${packageTier}`,
            `📅 Date:\n${formattedDate}`,
            `🕒 Time:\n${prefTime}`,
            `💰 Budget:\n${budget}`,
            `⏳ Deadline:\n${formattedDeadline}`,
            `🗣️ Meeting Mode:\n${meetingType}`,
            "-----------------------------------",
            `📝 Project Details:\n\n${projectDetails}`,
            "-----------------------------------"
        ];

        // Format and url encode the lines
        const finalMessageStr = messageLines.join("\n\n");
        const encodedMessage = encodeURIComponent(finalMessageStr);
        
        // Assemble click-to-chat API URL
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

        // Redirect user to WhatsApp Web or App in a new tab
        window.open(whatsappUrl, "_blank");

        // Clean up steps, localStorage drafts, and UI
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        form.reset();
        
        // Clear hidden values
        document.querySelectorAll(".custom-select-group input[type='hidden']").forEach(input => input.value = "");
        document.querySelectorAll(".custom-select-group .selected-val").forEach(txt => {
            if (txt.closest("#service-select-group")) txt.textContent = "Select Service...";
            else if (txt.closest("#package-select-group")) txt.textContent = "Select Package...";
            else if (txt.closest("#budget-select-group")) txt.textContent = "Select Budget...";
            else if (txt.closest("#referral-select-group")) txt.textContent = "Select Source...";
        });
        document.querySelectorAll(".custom-option").forEach(opt => opt.classList.remove("selected"));

        // Clear files
        uploadedFiles = [];
        previewList.innerHTML = "";

        // Reset sync checkboxes
        syncWhatsappCheckbox.checked = false;
        handleWhatsappSync();

        // Reset indicators and steps back to step 1
        currentStep = 1;
        updateWizardUI();
        updateTicketSummary();

        // Close Confirmation modal
        closeConfirmationModal();

        // Thank user with Toast
        showToast("Booking request sent!", "Form data prepared and dispatched to WhatsApp.", "success");
    });
});
