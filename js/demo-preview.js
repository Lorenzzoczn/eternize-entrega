// Demo Preview Functionality

// Show demo tab
function showDemoTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.demo-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.closest('.demo-tab-btn').classList.add('active');
    
    // Update tab content
    document.querySelectorAll('.demo-tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`tab-${tabName}`).classList.add('active');
    
    // Generate QR Code when share tab is shown
    if (tabName === 'share') {
        generateDemoQRCode();
    }
}

// Generate QR Code
function generateDemoQRCode() {
    const qrContainer = document.getElementById('qrCodePreview');
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Generate new QR code
    const demoUrl = `${window.location.origin}/eternize-checkout/upload.html?event=demo`;
    
    new QRCode(qrContainer, {
        text: demoUrl,
        width: 180,
        height: 180,
        colorDark: "#333333",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Open full demo in modal
function openFullDemo() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.id = 'fullDemoModal';
    modal.innerHTML = `
        <div class="modal-content modal-large" style="max-width: 1200px;">
            <div class="modal-header">
                <h2>🎯 Teste Completo do Eternize</h2>
                <button class="modal-close" onclick="closeFullDemo()">&times;</button>
            </div>
            <div class="modal-body">
                <iframe src="demo.html" style="width: 100%; height: 80vh; border: none; border-radius: 15px;"></iframe>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeFullDemo();
        }
    });
}

// Close full demo
function closeFullDemo() {
    const modal = document.getElementById('fullDemoModal');
    if (modal) {
        modal.remove();
    }
}

// Initialize QR Code on page load
window.addEventListener('load', () => {
    // Generate QR code for the share tab (will be shown when tab is clicked)
    setTimeout(() => {
        if (document.getElementById('qrCodePreview')) {
            // Don't generate immediately, wait for user to click share tab
        }
    }, 1000);
});

// Make functions globally accessible
window.showDemoTab = showDemoTab;
window.openFullDemo = openFullDemo;
window.closeFullDemo = closeFullDemo;
