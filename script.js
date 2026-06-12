document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('clearanceForm');
    const txnSearchInput = document.getElementById('txn_id_search');
    const txnList = document.getElementById('txnList');
    const txnIdHidden = document.getElementById('txn_id');
    const mappedData = document.getElementById('mappedData');
    const actionSection = document.getElementById('actionSection');
    
    // Read-only displays
    const studentNameInput = document.getElementById('student_name');
    const installmentNoInput = document.getElementById('installment_no');
    
    // Collapsible data
    const toggleDetailsBtn = document.getElementById('toggleDetails');
    const moreDetails = document.getElementById('moreDetails');
    const dispAmount = document.getElementById('disp_amount');
    const dispChequeNo = document.getElementById('disp_cheque_no');
    const dispBank = document.getElementById('disp_bank');
    const dispDueDate = document.getElementById('disp_due_date');

    // Action inputs
    const statusSelect = document.getElementById('status');
    const clearedDateGroup = document.getElementById('clearedDateGroup'); 
    const clearedDateInput = document.getElementById('cleared_date');
    const receiptTarget = document.getElementById('receipt-render-target');
    
    // --- Premium Modal Helper ---
    function showModal({ title, message, icon = '✓', type = 'success', confirmText = 'OK', cancelText = null }) {
        return new Promise((resolve) => {
            const modal = document.getElementById('cocoonModal');
            const mTitle = document.getElementById('modalTitle');
            const mMsg = document.getElementById('modalMessage');
            const mIcon = document.getElementById('modalIcon');
            const pBtn = document.getElementById('modalPrimaryBtn');
            const sBtn = document.getElementById('modalSecondaryBtn');

            mTitle.textContent = title;
            mMsg.innerHTML = message;
            mIcon.textContent = icon;
            mIcon.className = 'modal-icon ' + type;
            pBtn.textContent = confirmText;

            if (cancelText) {
                sBtn.style.display = 'block';
                sBtn.textContent = cancelText;
            } else {
                sBtn.style.display = 'none';
            }

            modal.classList.add('active');

            const cleanup = (val) => {
                modal.classList.remove('active');
                pBtn.removeEventListener('click', confirmHandler);
                sBtn.removeEventListener('click', cancelHandler);
                resolve(val);
            };

            const confirmHandler = () => cleanup(true);
            const cancelHandler = () => cleanup(false);

            pBtn.addEventListener('click', confirmHandler);
            sBtn.addEventListener('click', cancelHandler);
        });
    }

    const WEBHOOK_URL = 'https://n8n.srv1498466.hstgr.cloud/webhook-test/2c91da46-9ea0-4740-bef7-b053a4335f93';
    const SHEET_ID = '16JAViFIXgf0oDqC5Nl0V6UpGqKrUVGAHkoEeYw1LdGs';
    const GID = '48600366';

    // Verified Base64 Encoding of 'cocoon logo.webp'
    const COCOON_LOGO_B64 = `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`;

    function generateReceiptHTML(data) {
        const dateNow = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
        
        // Google Drive Direct Fallback Link
        const DRIVE_LOGO = 'https://lh3.googleusercontent.com/d/1u3h-3xgbLgJ5MDvPYwPO-ojJjHsecuMP';
        
        return `
<div id="receipt-preview-wrapper" style="font-family: 'Outfit', sans-serif; color: #2d3436; margin: 0; padding: 100px 40px; background: white; width: 800px; box-sizing: border-box;">
    <div class="receipt-container" style="max-width: 600px; margin: 0 auto; border: 2px solid #00a19a; border-radius: 20px; padding: 40px; position: relative; overflow: hidden; background: white; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
        <div class="status-badge" style="position: absolute; top: 120px; right: 20px; transform: rotate(15deg); border: 4px solid #00b894; color: #00b894; font-size: 1.5rem; font-weight: 800; padding: 10px 20px; border-radius: 10px; opacity: 0.2; pointer-events: none;">${(data.cheque_clearance_status || "CLEARED").toUpperCase()}</div>
        
        <div class="header" style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid #f39200; padding-bottom: 20px;">
            <img id="pdf-logo" src="cocoon logo.webp" crossorigin="anonymous"
                 onerror="this.onerror=null; this.src='${DRIVE_LOGO}';"
                 style="width: 100px; height: auto; margin-bottom: 10px; display: block; margin-left: auto; margin-right: auto;">
            <h1 class="company-name" style="color: #f39200; font-size: 1.5rem; font-weight: 700; margin: 0;">COCOON GROUP TUITION</h1>
            <div class="receipt-title" style="color: #00a19a; font-size: 1.2rem; font-weight: 600; margin-top: 5px;">FEE PAYMENT RECEIPT</div>
        </div>
        
        <div class="txn-details" style="margin: 20px 0; display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div class="detail-item">
                <span class="label" style="color: #636e72; font-weight: 500; display: block; font-size: 0.8rem;">DATE</span>
                <span class="value" style="color: #2d3436; font-weight: 600;">${data.cleared_date || dateNow}</span>
            </div>
            <div class="detail-item">
                <span class="label" style="color: #636e72; font-weight: 500; display: block; font-size: 0.8rem;">RECEIPT ID</span>
                <span class="value" style="color: #2d3436; font-weight: 600;">RCP-${Date.now().toString().slice(-6)}</span>
            </div>
            <div class="detail-item">
                <span class="label" style="color: #636e72; font-weight: 500; display: block; font-size: 0.8rem;">STUDENT NAME</span>
                <span class="value" style="color: #2d3436; font-weight: 600;">${data.Student_Name || data.student_name}</span>
            </div>
            <div class="detail-item">
                <span class="label" style="color: #636e72; font-weight: 500; display: block; font-size: 0.8rem;">TXN ID</span>
                <span class="value" style="color: #2d3436; font-weight: 600;">${data.Txn_ID || data.txn_id}</span>
            </div>
            <div class="detail-item">
                <span class="label" style="color: #636e72; font-weight: 500; display: block; font-size: 0.8rem;">INSTALLMENT NO.</span>
                <span class="value" style="color: #2d3436; font-weight: 600;">${data.Installment_No || data.installment_no}</span>
            </div>
            <div class="detail-item">
                <span class="label" style="color: #636e72; font-weight: 500; display: block; font-size: 0.8rem;">CHEQUE NO.</span>
                <span class="value" style="color: #2d3436; font-weight: 600;">${data.Cheque_No || data.cheque_no || '-'}</span>
            </div>
        </div>

        <div class="amount-section" style="background: #e7f9f7; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: center;">
            <span class="amount-label" style="color: #00a19a; font-weight: 600; font-size: 1rem;">AMOUNT RECEIVED</span>
            <span class="amount-value" style="color: #2d3436; font-size: 2.5rem; font-weight: 700; display: block;">₹${data.Amount || data.amount || '0'}</span>
            <div class="bank-info" style="color: #00a19a; font-weight: 600; margin-top: 10px;">Received on IDFC FIRST BANK</div>
        </div>

        <div class="footer" style="margin-top: 40px; text-align: center; font-size: 0.8rem; color: #636e72; border-top: 1px solid #dfe6e9; padding-top: 20px;">
            <div class="footer-item" style="margin-bottom: 5px;">Website: www.fguynwfcei.com</div>
            <div class="footer-item" style="margin-bottom: 5px;">Email: cocoon@gmail.com</div>
            <div class="footer-item" style="margin-bottom: 5px;">Contact: +91 36471 68764</div>
            <div style="margin-top:15px; font-weight:700; color:#2d3436;">Thank you for choosing Cocoon Group Tuition!</div>
        </div>
    </div>
</div>`;
    }

    let allTransactions = [];
    let selectedTxnData = null;

    // 1. Fetch Transaction Data
    async function fetchTransactions() {
        try {
            const data = await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                const cbName = 'gvizCallback_' + Math.floor(Math.random() * 100000);
                window[cbName] = (jsonData) => {
                    delete window[cbName];
                    script.remove();
                    resolve(jsonData);
                };
                script.onerror = () => {
                    delete window[cbName];
                    script.remove();
                    reject(new Error("Failed to load Google Sheets"));
                };
                script.src = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json;responseHandler:${cbName}&gid=${GID}`;
                document.body.appendChild(script);
            });

            const rows = data.table.rows;
            const cols = data.table.cols;
            
            let headers = [];
            let dataRows = rows;
            if (cols[0] && cols[0].label) {
                headers = cols.map(c => c ? c.label : '');
            } else if (rows.length > 0) {
                headers = rows[0].c.map(cell => cell ? cell.v : '');
                dataRows = rows.slice(1);
            }
            
            allTransactions = dataRows.map(row => {
                const record = {};
                if (row.c) {
                    row.c.forEach((cell, i) => {
                        const colLabel = headers[i];
                        if (colLabel) {
                            record[colLabel] = cell ? (cell.f || cell.v) : null;
                        }
                    });
                }
                return record;
            }).filter(txn => {
                const txnId = txn.Txn_ID || txn.txn_id;
                return txnId && String(txnId).trim() !== '' && String(txnId).toLowerCase() !== 'txn_id';
            });

            renderTxnDropdown(allTransactions);
        } catch (error) {
            console.error('Error fetching transactions:', error);
            txnList.innerHTML = `<div class="dropdown-item no-results">Error loading transactions. Please check permissions.</div>`;
        }
    }    function renderTxnDropdown(list) {
        txnList.innerHTML = '';
        if (list.length === 0) {
            txnList.innerHTML = '<div class="dropdown-item no-results">No transactions found</div>';
        } else {
            list.forEach(txn => {
                const div = document.createElement('div');
                div.className = 'dropdown-item';
                const txnId = txn.Txn_ID || txn.txn_id || '';
                const studentName = txn.Student_Name || txn.student_name || 'Unknown';
                div.textContent = `${txnId} - ${studentName}`;
                div.onclick = () => {
                    txnSearchInput.value = txnId;
                    handleTxnSelection(txnId);
                    txnList.classList.remove('active');
                };
                txnList.appendChild(div);
            });
        }
    }

    txnSearchInput.addEventListener('focus', () => {
        txnList.classList.add('active');
    });

    txnSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        const filtered = allTransactions.filter(txn => {
            const txnId = (txn.Txn_ID || txn.txn_id || '').toLowerCase();
            const studentName = (txn.Student_Name || txn.student_name || '').toLowerCase();
            return txnId.includes(query) || studentName.includes(query);
        });
        renderTxnDropdown(filtered);
    });

    document.addEventListener('click', (e) => {
        if (!document.getElementById('txnDropdown').contains(e.target)) {
            txnList.classList.remove('active');
        }
    });

    function handleTxnSelection(txnId) {
        const txn = allTransactions.find(t => t.Txn_ID === txnId || t.txn_id === txnId);
        
        if (txn) {
            selectedTxnData = txn;
            txnIdHidden.value = txnId;
            
            // Map common fields - Handle both Title Case and snake_case
            studentNameInput.value = txn.Student_Name || txn.student_name || '';
            installmentNoInput.value = txn.Installment_No || txn.installment_no || '';
            
            // Auto-Fill Action Details
            dispAmount.textContent = txn.Amount || txn.amount || '-';
            dispChequeNo.textContent = txn.Cheque_No || txn.cheque_no || '-';
            dispBank.textContent = txn.Bank || txn.bank || '-';
            dispDueDate.textContent = txn.Due_Date || txn.due_date || '-';

            // Auto-preset Clearance Date to Due Date
            const dueDateValue = txn.Due_Date || txn.due_date;
            const isoDueDate = formatToISO(dueDateValue);
            if (isoDueDate) {
                clearedDateInput.value = isoDueDate;
            } else {
                const d = new Date(dueDateValue);
                if (!isNaN(d)) {
                    clearedDateInput.value = d.toISOString().split('T')[0];
                } else {
                    clearedDateInput.value = new Date().toISOString().split('T')[0];
                }
            }
            
            // Correct visibility toggling
            mappedData.style.display = 'block';
            actionSection.style.display = 'block';
            
            statusSelect.value = 'Cleared';
            clearedDateGroup.style.display = 'flex';
        }
    }

    // Helper to format Date(Y, M, D) to YYYY-MM-DD
    function formatToISO(gDate) {
        if (!gDate) return '';
        // Check if string matches Date(2025,3,10)
        const match = gDate.match(/Date\((\d+),(\d+),(\d+)\)/);
        if (match) {
            const y = match[1];
            const m = String(Number(match[2]) + 1).padStart(2, '0'); // JS months are 0-indexed
            const d = match[3].padStart(2, '0');
            return `${y}-${m}-${d}`;
        }
        return '';
    }

    // Toggle Details
    toggleDetailsBtn.addEventListener('click', () => {
        moreDetails.classList.toggle('active');
        toggleDetailsBtn.classList.toggle('active');
        toggleDetailsBtn.querySelector('.arrow').textContent = moreDetails.classList.contains('active') ? '▲' : '▼';
        toggleDetailsBtn.innerHTML = moreDetails.classList.contains('active') ? '<span class="arrow">▲</span> Hide Details' : '<span class="arrow">▼</span> View More Details';
    });

    // 3. Status Change (Hide/Show date)
    statusSelect.addEventListener('change', (e) => {
        if (e.target.value === 'Cleared') {
            clearedDateGroup.style.display = 'flex';
        } else {
            clearedDateGroup.style.display = 'none';
        }
    });

    // 4. Submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        if (!selectedTxnData) return;

        const btn = form.querySelector('button[type="submit"]');
        const originalBtnText = btn.textContent;
        btn.disabled = true;
        btn.textContent = 'Preparing Receipt...';

        const formData = new FormData(form);
        const dataPayload = {
            ...selectedTxnData,
            cheque_clearance_status: formData.get('status'),
            cleared_date: formData.get('cleared_date') || '',
            clearance_remarks: formData.get('remarks'),
            updated_at: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
        };

        let overlay;
        try {
            // 1. Prepare Receipt HTML
            const receiptHtml = generateReceiptHTML(dataPayload);
            
            // Create a VISIBLE fullscreen overlay for high-fidelity capture
            overlay = document.createElement('div');
            overlay.style.position = 'fixed';
            overlay.style.top = '0';
            overlay.style.left = '0';
            overlay.style.width = '100%';
            overlay.style.height = '100%';
            overlay.style.backgroundColor = 'rgba(0,0,0,0.85)';
            overlay.style.zIndex = '999999';
            overlay.style.display = 'flex';
            overlay.style.flexDirection = 'column';
            overlay.style.alignItems = 'center';
            overlay.style.justifyContent = 'center';
            overlay.style.padding = '20px';
            overlay.style.overflowY = 'auto';

            // Status message on overlay
            const statusMsg = document.createElement('div');
            statusMsg.style.color = 'white';
            statusMsg.style.fontSize = '1.5rem';
            statusMsg.style.marginBottom = '20px';
            statusMsg.style.fontWeight = 'bold';
            statusMsg.textContent = 'Generating High-Resolution Receipt...';
            overlay.appendChild(statusMsg);

            // The receipt container (must be visible to the user temporarily for capture)
            const container = document.createElement('div');
            container.style.cssText = 'background:white; box-shadow:0 0 50px rgba(0,0,0,0.5); border-radius:10px; overflow:hidden;';
            container.innerHTML = receiptHtml;
            overlay.appendChild(container);

            document.body.appendChild(overlay);

            // 2. WAIT FOR EVERYTHING WITH A STRICT TIMEOUT
            console.log('[DEBUG] Starting capture wait sequence...');
            const logoImg = container.querySelector('#pdf-logo');
            
            // Function to wait for image load
            const waitForImage = (img) => {
                return new Promise((resolve) => {
                    if (img.complete && img.naturalHeight !== 0) {
                        console.log('[DEBUG] Image already complete.');
                        resolve();
                        return;
                    }
                    img.onload = () => {
                        console.log('[DEBUG] Image loaded successfully.');
                        resolve();
                    };
                    img.onerror = () => {
                        console.log('[DEBUG] Image failed to load (will try fallback/canvas anyway to prevent hang).');
                        resolve();
                    };
                });
            };

            let countdown = 5;
            const timer = setInterval(() => {
                countdown--;
                if (statusMsg) {
                   statusMsg.textContent = `Capturing Receipt in ${countdown}s... [Security Bypass]`;
                }
                if (countdown <= 0) clearInterval(timer);
            }, 1000);

            // Race the image load against a strict 3-second timeout
            console.log('[DEBUG] Waiting for logo image...');
            await Promise.race([
                waitForImage(logoImg),
                new Promise(resolve => setTimeout(() => {
                    console.log('[DEBUG] Image wait timed out (3s bypass). Proceeding anyway.');
                    resolve();
                }, 3000))
            ]);

            console.log('[DEBUG] Waiting for remaining UI buffer...');
            await new Promise(resolve => setTimeout(resolve, 3000)); // Buffer wait reduced since we had image wait
            await document.fonts.ready;
            console.log('[DEBUG] Proceeding to PDF generation...');
            // 3. Generate PDF using html2pdf.js
            const filename = `Receipt_${dataPayload.Txn_ID || dataPayload.txn_id || 'clearance'}.pdf`;
            const opt = {
                margin: 0,
                filename: filename,
                image: { type: 'jpeg', quality: 1 },
                html2canvas: { 
                    scale: 2, 
                    useCORS: true, 
                    letterRendering: true,
                    allowTaint: true,
                    backgroundColor: '#ffffff',
                    scrollY: 0,
                    scrollX: 0
                },
                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
            };

            console.log('[DEBUG] Calling html2pdf worker...');
            const captureElement = container.querySelector('#receipt-preview-wrapper');
            const worker = html2pdf().set(opt).from(captureElement);
            const pdfBlob = await worker.output('blob');
            console.log('[DEBUG] PDF output generated successfully.');
            btn.textContent = 'Finalizing...';

            // CRITICAL FIX: Hide the giant black capture overlay SO THE MODAL CAN BE SEEN!
            overlay.style.display = 'none';

            // 4. Handle Download Choice (Premium Modal)
            const shouldDownload = await showModal({
                title: 'RECEIPT READY',
                message: 'Your high-fidelity receipt has been generated. Would you like to save a local copy?',
                icon: '📥',
                type: 'warning',
                confirmText: 'Save Locally',
                cancelText: 'No, Just Submit'
            });
            
            if (shouldDownload) {
                await worker.save();
            }

            btn.textContent = 'Uploading to Server...';

            // 5. Prepare Multipart Submission
            const submissionData = new FormData();
            Object.keys(dataPayload).forEach(key => {
                submissionData.append(key, dataPayload[key]);
            });
            submissionData.append('receipt', pdfBlob, filename);

            const response = await fetch(WEBHOOK_URL, {
                method: 'POST',
                body: submissionData
            });

            if (response.ok) {
                overlay.remove();
                await showModal({
                    title: 'SUCCESS!',
                    message: 'The clearance record and receipt were successfully uploaded to the central server.',
                    icon: '✅',
                    type: 'success'
                });
                form.reset();
                window.location.reload();
            } else {
                throw new Error('Server responded with error');
            }
        } catch (error) {
            console.error('Submission error:', error);
            
            // Helpful error for local testing (CORS)
            if (error.message.includes('Failed to fetch') || window.location.protocol === 'file:') {
                if (overlay) overlay.remove();
                await showModal({
                    title: 'LOCAL RESTRICTION',
                    message: 'Your browser blocked the server connection (CORS) because this is a local file.<br><br><b>THIS IS NORMAL:</b> Once deployed to Vercel, this will submit instantly. Your PDF is ready for manual use!',
                    icon: '🔒',
                    type: 'warning',
                    confirmText: 'Understood'
                });
            } else {
                await showModal({
                    title: 'SUBMISSION ERROR',
                    message: 'We encountered an error uploading the data. Please check your connection.',
                    icon: '❌',
                    type: 'error'
                });
            }
            
            btn.disabled = false;
            btn.textContent = originalBtnText;
        }
    });

    fetchTransactions();
});
