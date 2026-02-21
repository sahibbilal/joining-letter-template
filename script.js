// DOM Elements
const form = document.getElementById('joiningLetterForm');
const previewBtn = document.getElementById('previewBtn');
const clearBtn = document.getElementById('clearBtn');
const previewModal = document.getElementById('previewModal');
const closeModal = document.getElementById('closeModal');
const fullLetterPreview = document.getElementById('fullLetterPreview');
const printBtn = document.getElementById('printBtn');
const downloadBtn = document.getElementById('downloadBtn');

// Form fields
const formFields = {
    letterType: document.getElementById('letterType'),
    candidateName: document.getElementById('candidateName'),
    position: document.getElementById('position'),
    companyName: document.getElementById('companyName'),
    department: document.getElementById('department'),
    joiningDate: document.getElementById('joiningDate'),
    offerExpiryDate: document.getElementById('offerExpiryDate'),
    salary: document.getElementById('salary'),
    probationPeriod: document.getElementById('probationPeriod'),
    reportingManager: document.getElementById('reportingManager'),
    workLocation: document.getElementById('workLocation'),
    additionalTerms: document.getElementById('additionalTerms'),
    hrManager: document.getElementById('hrManager'),
    companyLogo: document.getElementById('companyLogo')
};

// Signature canvas
const signatureCanvas = document.getElementById('signatureCanvas');
const clearSignatureBtn = document.getElementById('clearSignature');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set default joining date to today
    const today = new Date().toISOString().split('T')[0];
    formFields.joiningDate.value = today;
    
    // Add event listeners
    addEventListeners();
    
    // Initialize form validation
    initializeValidation();
    
    // Initialize signature canvas
    initializeSignatureCanvas();
}

function addEventListeners() {
    // Form submission
    form.addEventListener('submit', handleFormSubmit);
    
    // Preview button
    previewBtn.addEventListener('click', showPreviewModal);
    
    // Clear button
    clearBtn.addEventListener('click', clearForm);
    
    // Signature controls
    clearSignatureBtn.addEventListener('click', clearSignature);
    
    // Modal controls
    closeModal.addEventListener('click', closePreviewModal);
    printBtn.addEventListener('click', printLetter);
    downloadBtn.addEventListener('click', downloadLetter);
    
    // Close modal when clicking outside
    previewModal.addEventListener('click', function(e) {
        if (e.target === previewModal) {
            closePreviewModal();
        }
    });
    
    // Real-time form data saving
    Object.values(formFields).forEach(field => {
        field.addEventListener('input', saveFormData);
    });
    
    // Show/hide additional terms based on letter type
    if (formFields.letterType) {
        formFields.letterType.addEventListener('change', function() {
            const additionalTermsField = document.getElementById('additionalTerms');
            const additionalTermsContainer = additionalTermsField ? additionalTermsField.closest('.form-group') : null;
            
            if (this.value === 'offer') {
                // Hide additional terms for offer letter
                if (additionalTermsContainer) {
                    additionalTermsContainer.style.display = 'none';
                }
            } else {
                // Show additional terms for joining letter
                if (additionalTermsContainer) {
                    additionalTermsContainer.style.display = 'block';
                }
            }
        });
        
        // Trigger change event to set initial state
        formFields.letterType.dispatchEvent(new Event('change'));
    }
}

function initializeValidation() {
    // Add validation to required fields
    const requiredFields = ['candidateName', 'position', 'companyName', 'joiningDate'];
    
    requiredFields.forEach(fieldName => {
        const field = formFields[fieldName];
        field.addEventListener('blur', () => validateField(field));
        field.addEventListener('input', () => clearFieldError(field));
    });
}

function validateField(field) {
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    if (isRequired && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    clearFieldError(field);
    return true;
}

function showFieldError(field, message) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.add('error');
    
    let errorElement = formGroup.querySelector('.error-message');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        formGroup.appendChild(errorElement);
    }
    errorElement.textContent = message;
}

function clearFieldError(field) {
    const formGroup = field.closest('.form-group');
    formGroup.classList.remove('error');
    const errorElement = formGroup.querySelector('.error-message');
    if (errorElement) {
        errorElement.remove();
    }
}

function validateForm() {
    let isValid = true;
    const requiredFields = ['candidateName', 'position', 'companyName', 'joiningDate'];
    
    requiredFields.forEach(fieldName => {
        if (!validateField(formFields[fieldName])) {
            isValid = false;
        }
    });
    
    return isValid;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    if (!validateForm()) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    // Show loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<div class="loading"></div> Generating...';
    submitBtn.disabled = true;
    
    // Simulate processing time
    setTimeout(() => {
        generateLetter();
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        showNotification('Joining letter generated successfully!', 'success');
    }, 1000);
}

function generateLetter() {
    const letterData = getFormData();
    const letterHTML = createLetterHTML(letterData);
    
    // Update modal preview
    fullLetterPreview.innerHTML = letterHTML;
    
    // Show success notification
    showNotification('Joining letter generated successfully!', 'success');
}

function getFormData() {
    return {
        letterType: formFields.letterType.value,
        candidateName: formFields.candidateName.value.trim(),
        position: formFields.position.value.trim(),
        companyName: formFields.companyName.value.trim(),
        department: formFields.department.value.trim(),
        joiningDate: formatDate(formFields.joiningDate.value),
        offerExpiryDate: formatDate(formFields.offerExpiryDate.value),
        salary: formFields.salary.value.trim(),
        probationPeriod: formFields.probationPeriod.value.trim(),
        reportingManager: formFields.reportingManager.value.trim(),
        workLocation: formFields.workLocation.value.trim(),
        additionalTerms: formFields.additionalTerms.value.trim(),
        hrManager: formFields.hrManager.value.trim(),
        companyLogo: formFields.companyLogo.files[0],
        signature: getSignatureData()
    };
}

function formatDate(dateString) {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    return date.toLocaleDateString('en-US', options);
}

function createLetterHTML(data) {
    const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    // Create logo HTML if logo is uploaded
    const logoHTML = data.companyLogo ? 
        `<img src="${URL.createObjectURL(data.companyLogo)}" alt="${data.companyName} Logo" class="company-logo">` : '';
    
    // Create watermark HTML if logo is uploaded (only for display, not PDF)
    const watermarkHTML = data.companyLogo ? 
        `<div class="letter-watermark"><img src="${URL.createObjectURL(data.companyLogo)}" alt="${data.companyName} Logo"></div>` : '';
    
    // Create signature HTML if signature is drawn
    const signatureHTML = data.signature ? 
        `<img src="${data.signature}" alt="Signature" class="signature-image">` : '';
    
    // Determine letter title based on type
    const letterTitle = data.letterType === 'offer' ? 'OFFER LETTER' : 'JOINING LETTER';
    
    return `
        <div class="letter-content">
            ${watermarkHTML}
            <div class="letter-header">
                ${logoHTML}
                ${!data.companyLogo ? `<div class="company-name">${data.companyName}</div>` : ''}
                <div class="letter-title">${letterTitle}</div>
            </div>
            
            <div class="letter-body">
                ${data.letterType === 'offer' ? createOfferLetterBody(data, currentDate) : createJoiningLetterBody(data, currentDate)}
            </div>
        </div>
    `;
}

function createOfferLetterBody(data, currentDate) {
    return `
        <p><strong>Date:</strong> ${currentDate}</p>
        <p>Dear ${data.candidateName},</p>
        <p>We are pleased to extend a formal job offer for the position of <strong>${data.position}</strong> at <strong>${data.companyName}</strong>. After careful consideration of your qualifications and experience, we believe you would be an excellent addition to our team.</p>
        
        <p><strong>Offer Details:</strong> We are offering you the position of <strong>${data.position}</strong>${data.department ? ` in the ${data.department} department` : ''} with a proposed start date of <strong>${data.joiningDate}</strong>${data.workLocation ? ` at our ${data.workLocation} location` : ''}.${data.salary ? ` Your compensation package will be ${data.salary}` : ''}${data.probationPeriod ? ` with a probation period of ${data.probationPeriod}` : ''}${data.reportingManager ? ` and you will be reporting to ${data.reportingManager}` : ''}.</p>
        
        <p>Please confirm your acceptance of this offer by signing and returning this letter${data.offerExpiryDate ? ` by ${data.offerExpiryDate}` : ' within 7 business days'}. If you have any questions or need clarification on any aspect of this offer, please contact us immediately.</p>
        
        <p>We look forward to welcoming you to our team and are confident that you will contribute significantly to our organization's success.</p>
        
        <p>Best regards,</p>
        <div class="letter-signature">
            <div class="signature-section">
                ${data.signature ? `<img src="${data.signature}" alt="Signature" class="signature-image">` : ''}
                <div class="signature-line"></div>
            </div>
            <div class="hr-details">
                <p><strong>${data.hrManager || 'HR Manager'}</strong></p>
                <p>Human Resources Department</p>
                <p>${data.companyName}</p>
            </div>
        </div>
    `;
}

function createJoiningLetterBody(data, currentDate) {
    return `
        <p><strong>Date:</strong> ${currentDate}</p>
        <p><strong>To:</strong> ${data.candidateName}${data.workLocation ? `, ${data.workLocation}` : ''}</p>
        <p><strong>Subject: Joining Letter for the position of ${data.position}</strong></p>
        <p>Dear ${data.candidateName},</p>
        <p>We are pleased to inform you that you have been selected for the position of <strong>${data.position}</strong> in our organization. We welcome you to <strong>${data.companyName}</strong> and look forward to your valuable contribution to our team.</p>
        
        <p><strong>Your joining details are as follows:</strong></p>
        <p>You have been appointed to the position of <strong>${data.position}</strong>${data.department ? ` in the ${data.department} department` : ''}. Your joining date is scheduled for <strong>${data.joiningDate}</strong>${data.workLocation ? ` at our ${data.workLocation} location` : ''}.${data.salary ? ` Your salary package will be ${data.salary}` : ''}${data.reportingManager ? ` and you will be reporting to ${data.reportingManager}` : ''}.</p>
        
        <p><strong>Please report to the HR department on your joining date at 9:00 AM. Kindly bring the following documents:</strong></p>
        <ul>
            <li>Original educational certificates</li>
            <li>Previous employment experience certificates</li>
            <li>Identity proof (Aadhar Card/PAN Card)</li>
            <li>Address proof</li>
            <li>Passport size photographs (2 copies)</li>
            <li>Medical fitness certificate (if applicable)</li>
        </ul>
        
        ${data.additionalTerms ? `<p><strong>Additional Terms & Conditions:</strong> ${data.additionalTerms}</p>` : ''}
        
        <p>We are confident that you will be a valuable addition to our team and contribute significantly to our organization's growth and success.</p>
        <p>Once again, congratulations on your selection, and we look forward to welcoming you to our team.</p>
        
        <p>Best regards,</p>
        <p><strong>${data.hrManager || 'HR Manager'}</strong><br>
        Human Resources Department<br>
        ${data.companyName}</p>
        
        <div class="letter-signature">
            ${data.signature ? `<img src="${data.signature}" alt="Signature" class="signature-image">` : ''}
            <div class="signature-line"></div>
        </div>
    `;
}

function showPreviewModal() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields before previewing', 'error');
        return;
    }
    
    generateLetter();
    previewModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closePreviewModal() {
    previewModal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function printLetter() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields before printing', 'error');
        return;
    }
    
    generateLetter();
    window.print();
}

function downloadLetter() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields before downloading', 'error');
        return;
    }
    
    generateLetter();
    
    // Create a new window for printing/downloading
    const printWindow = window.open('', '_blank');
    const letterHTML = createLetterHTML(getFormData());
    
    // Create PDF version without watermark
    let pdfLetterHTML = createLetterHTML(getFormData()).replace(/<div class="letter-watermark">.*?<\/div>/gs, '');
    
    // Remove only the date field (first paragraph in letter body)
    pdfLetterHTML = pdfLetterHTML.replace(/<p><strong>Date:<\/strong>.*?<\/p>/g, '');
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>${getFormData().letterType === 'offer' ? 'Offer' : 'Joining'} Letter - ${getFormData().candidateName}</title>
            <style>
                body {
                    font-family: 'Times New Roman', serif;
                    line-height: 1.4;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 40px 60px;
                    font-size: 14px;
                }
                .letter-header {
                    text-align: center;
                    margin-bottom: 20px;
                    padding-bottom: 15px;
                    border-bottom: 2px solid #333;
                }
                .company-logo {
                    max-width: 150px;
                    max-height: 80px;
                    margin: 0 auto 20px auto;
                    display: block;
                    object-fit: contain;
                }
                .company-name {
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin-bottom: 8px;
                }
                .letter-title {
                    font-size: 1.1rem;
                    font-weight: 500;
                }
                .letter-body p {
                    margin-bottom: 8px;
                    text-align: justify;
                }
                .letter-signature {
                    margin-top: 25px;
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 0 30px;
                }
                .signature-section {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                }
                .signature-image {
                    max-width: 180px;
                    max-height: 60px;
                    margin: 5px 0;
                    display: block;
                    object-fit: contain;
                }
                .signature-line {
                    border-bottom: 1px solid #333;
                    width: 180px;
                    margin: 10px 0 5px 0;
                }
                .hr-details {
                    text-align: right;
                    line-height: 1.3;
                }
                .hr-details p {
                    margin: 1px 0;
                    font-size: 0.9rem;
                }
                @media print {
                    body { margin: 0; padding: 15px; }
                    .letter-body p { margin-bottom: 6px; }
                    .letter-body br { display: none; }
                }
                
                /* Hide only the date field in PDF */
                .letter-body p:first-child {
                    display: none !important;
                }
                
                @page {
                    margin: 0;
                    size: A4;
                }
            </style>
        </head>
        <body>
            ${pdfLetterHTML}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    
    // Trigger download
    setTimeout(() => {
        printWindow.print();
    }, 500);
    
    showNotification('Letter downloaded successfully!', 'success');
}

function clearForm() {
    if (confirm('Are you sure you want to clear all form data?')) {
        form.reset();
        clearSignature();
        
        // Clear cookies
        deleteCookie('joiningLetterFormData');
        deleteCookie('joiningLetterData_chunks');
        // Clear chunked cookies
        for (let i = 0; i < 10; i++) {
            deleteCookie(`joiningLetterData_${i}`);
        }
        
        
        // Clear any validation errors
        document.querySelectorAll('.form-group.error').forEach(group => {
            group.classList.remove('error');
        });
        document.querySelectorAll('.error-message').forEach(error => {
            error.remove();
        });
        
        // Set default date
        const today = new Date().toISOString().split('T')[0];
        formFields.joiningDate.value = today;
        
        showNotification('Form cleared successfully', 'success');
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        max-width: 400px;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification-content {
            display: flex;
            align-items: center;
            gap: 10px;
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideIn 0.3s ease-out reverse';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + Enter to generate letter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (validateForm()) {
            generateLetter();
            showNotification('Joining letter generated successfully!', 'success');
        }
    }
    
    // Escape to close modal
    if (e.key === 'Escape' && previewModal.style.display === 'block') {
        closePreviewModal();
    }
});

// Cookie utility functions
function setCookie(name, value, days = 7) {
    const expires = new Date();
    expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
    document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return decodeURIComponent(c.substring(nameEQ.length, c.length));
    }
    return null;
}

function deleteCookie(name) {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
}

// Auto-save form data to cookies
function saveFormData() {
    const formData = {};
    Object.keys(formFields).forEach(key => {
        formData[key] = formFields[key].value;
    });
    
    // Save signature canvas data
    const signatureData = getSignatureData();
    if (signatureData) {
        formData.signatureData = signatureData;
    }
    
    // Split large data into multiple cookies if needed
    const dataString = JSON.stringify(formData);
    if (dataString.length > 4000) {
        // Split into chunks for large data
        const chunks = [];
        for (let i = 0; i < dataString.length; i += 4000) {
            chunks.push(dataString.substring(i, i + 4000));
        }
        chunks.forEach((chunk, index) => {
            setCookie(`joiningLetterData_${index}`, chunk, 7);
        });
        setCookie('joiningLetterData_chunks', chunks.length.toString(), 7);
    } else {
        setCookie('joiningLetterFormData', dataString, 7);
    }
}

function loadFormData() {
    let savedData = getCookie('joiningLetterFormData');
    
    // Check if data was split into chunks
    if (!savedData) {
        const chunksCount = getCookie('joiningLetterData_chunks');
        if (chunksCount) {
            const chunks = [];
            for (let i = 0; i < parseInt(chunksCount); i++) {
                const chunk = getCookie(`joiningLetterData_${i}`);
                if (chunk) chunks.push(chunk);
            }
            if (chunks.length > 0) {
                savedData = chunks.join('');
            }
        }
    }
    
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(key => {
                if (formFields[key] && formData[key]) {
                    formFields[key].value = formData[key];
                }
            });
            
            // Restore signature canvas if data exists
            if (formData.signatureData) {
                restoreSignatureCanvas(formData.signatureData);
            }
        } catch (e) {
            console.error('Error loading saved form data:', e);
        }
    }
}

function restoreSignatureCanvas(signatureData) {
    const img = new Image();
    img.onload = function() {
        const ctx = signatureCanvas.getContext('2d');
        ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
        ctx.drawImage(img, 0, 0, signatureCanvas.width, signatureCanvas.height);
    };
    img.src = signatureData;
}

// Load saved data on page load
window.addEventListener('load', loadFormData);
// Signature Canvas Functions
function initializeSignatureCanvas() {
    const ctx = signatureCanvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set canvas properties
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Mouse events
    signatureCanvas.addEventListener('mousedown', startDrawing);
    signatureCanvas.addEventListener('mousemove', draw);
    signatureCanvas.addEventListener('mouseup', stopDrawing);
    signatureCanvas.addEventListener('mouseout', stopDrawing);

    // Touch events for mobile
    signatureCanvas.addEventListener('touchstart', handleTouch);
    signatureCanvas.addEventListener('touchmove', handleTouch);
    signatureCanvas.addEventListener('touchend', stopDrawing);
    
    // Save data when signature is drawn
    signatureCanvas.addEventListener('mouseup', saveFormData);
    signatureCanvas.addEventListener('touchend', saveFormData);

    function startDrawing(e) {
        isDrawing = true;
        const rect = signatureCanvas.getBoundingClientRect();
        lastX = e.clientX - rect.left;
        lastY = e.clientY - rect.top;
    }

    function draw(e) {
        if (!isDrawing) return;
        
        const rect = signatureCanvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(currentX, currentY);
        ctx.stroke();

        lastX = currentX;
        lastY = currentY;
    }

    function stopDrawing() {
        isDrawing = false;
    }

    function handleTouch(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent(e.type === 'touchstart' ? 'mousedown' : 
                                         e.type === 'touchmove' ? 'mousemove' : 'mouseup', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        signatureCanvas.dispatchEvent(mouseEvent);
    }
}

function clearSignature() {
    const ctx = signatureCanvas.getContext('2d');
    ctx.clearRect(0, 0, signatureCanvas.width, signatureCanvas.height);
}

function getSignatureData() {
    // Check if canvas has any content
    const ctx = signatureCanvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, signatureCanvas.width, signatureCanvas.height);
    const data = imageData.data;
    
    // Check if there's any non-transparent pixel
    for (let i = 3; i < data.length; i += 4) {
        if (data[i] > 0) {
            return signatureCanvas.toDataURL('image/png');
        }
    }
    return null;
}

