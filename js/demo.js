// Demo state
let currentStep = 1;
let demoPhotos = [];
let simulationInterval = null;
let simulationTime = 0;
let photoCounter = 0;
let contributorCounter = 0;

// Sample photo URLs (using placeholder service)
const samplePhotos = [
    'https://picsum.photos/400/400?random=1',
    'https://picsum.photos/400/400?random=2',
    'https://picsum.photos/400/400?random=3',
    'https://picsum.photos/400/400?random=4',
    'https://picsum.photos/400/400?random=5',
    'https://picsum.photos/400/400?random=6',
    'https://picsum.photos/400/400?random=7',
    'https://picsum.photos/400/400?random=8',
    'https://picsum.photos/400/400?random=9',
    'https://picsum.photos/400/400?random=10',
    'https://picsum.photos/400/400?random=11',
    'https://picsum.photos/400/400?random=12'
];

// Initialize demo
function initDemo() {
    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('demoEventDate').value = today;
}

// Navigate between steps
function goToStep(step) {
    // Hide all steps
    document.querySelectorAll('.demo-step').forEach(s => {
        s.classList.remove('active');
    });
    
    // Show target step
    document.getElementById(`step${step}`).classList.add('active');
    
    // Update progress
    currentStep = step;
    document.getElementById('currentStep').textContent = step;
    document.getElementById('progressFill').style.width = `${(step / 4) * 100}%`;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Step-specific actions
    if (step === 2) {
        generateDemoQRCode();
    }
    
    if (step === 3) {
        resetSimulation();
    }
    
    if (step === 4) {
        renderManageGallery();
    }
}

// Generate QR Code for demo
function generateDemoQRCode() {
    const qrContainer = document.querySelector('.qr-code-visual');
    if (!qrContainer) return;
    
    // Clear previous content
    qrContainer.innerHTML = '';
    
    // Generate QR code
    const demoUrl = `${window.location.origin}/eternize-checkout/upload.html?event=demo`;
    
    new QRCode(qrContainer, {
        text: demoUrl,
        width: 160,
        height: 160,
        colorDark: "#333333",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
}

// Copy demo link
function copyDemoLink() {
    const input = document.querySelector('.link-display-demo input');
    input.select();
    document.execCommand('copy');
    
    const btn = event.target;
    const originalText = btn.textContent;
    btn.textContent = '✓ Copiado!';
    btn.style.background = 'var(--verde-menta)';
    
    setTimeout(() => {
        btn.textContent = originalText;
        btn.style.background = '';
    }, 2000);
}

// Start photo simulation
function startSimulation() {
    const btn = document.getElementById('simulateBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    btn.style.display = 'none';
    stopBtn.style.display = 'inline-block';
    
    // Add photos gradually
    simulationInterval = setInterval(() => {
        if (photoCounter < samplePhotos.length) {
            addDemoPhoto();
            simulationTime++;
            document.getElementById('timeElapsed').textContent = simulationTime + 's';
        } else {
            stopSimulation();
        }
    }, 1500);
}

// Stop simulation
function stopSimulation() {
    if (simulationInterval) {
        clearInterval(simulationInterval);
        simulationInterval = null;
    }
    
    const btn = document.getElementById('simulateBtn');
    const stopBtn = document.getElementById('stopBtn');
    
    btn.style.display = 'inline-block';
    stopBtn.style.display = 'none';
    btn.textContent = '▶ Continuar Simulação';
}

// Reset simulation
function resetSimulation() {
    stopSimulation();
    photoCounter = 0;
    contributorCounter = 0;
    simulationTime = 0;
    demoPhotos = [];
    
    document.getElementById('photoCount').textContent = '0';
    document.getElementById('contributorCount').textContent = '0';
    document.getElementById('timeElapsed').textContent = '0s';
    document.getElementById('demoGallery').innerHTML = '';
    document.getElementById('simulateBtn').textContent = '▶ Simular Recebimento de Fotos';
}

// Add demo photo
function addDemoPhoto() {
    const photo = {
        id: Date.now().toString() + photoCounter,
        url: samplePhotos[photoCounter % samplePhotos.length],
        status: 'pending',
        timestamp: new Date().toISOString()
    };
    
    demoPhotos.push(photo);
    photoCounter++;
    
    // Update contributor count (simulate different people)
    if (photoCounter % 3 === 0) {
        contributorCounter++;
    }
    
    // Update stats
    document.getElementById('photoCount').textContent = photoCounter;
    document.getElementById('contributorCount').textContent = contributorCounter;
    
    // Add to gallery
    const gallery = document.getElementById('demoGallery');
    const photoEl = document.createElement('div');
    photoEl.className = 'demo-photo';
    photoEl.innerHTML = `
        <img src="${photo.url}" alt="Foto demo">
        <span class="photo-status-badge pending">Pendente</span>
    `;
    
    gallery.appendChild(photoEl);
}

// Render manage gallery
function renderManageGallery() {
    const gallery = document.getElementById('demoGalleryManage');
    
    gallery.innerHTML = demoPhotos.map(photo => `
        <div class="demo-photo" data-id="${photo.id}">
            <img src="${photo.url}" alt="Foto demo">
            <span class="photo-status-badge ${photo.status}">${photo.status === 'pending' ? 'Pendente' : 'Aprovada'}</span>
            ${photo.status === 'pending' ? `
                <div class="photo-actions-demo">
                    <button class="btn-approve-demo" onclick="approvePhoto('${photo.id}')">✓</button>
                    <button class="btn-reject-demo" onclick="rejectPhoto('${photo.id}')">✕</button>
                </div>
            ` : ''}
        </div>
    `).join('');
    
    updateCounts();
}

// Filter photos
function filterDemoPhotos(filter) {
    // Update active tab
    document.querySelectorAll('.tab-btn-demo').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filter and render
    const gallery = document.getElementById('demoGalleryManage');
    let filteredPhotos = demoPhotos;
    
    if (filter !== 'all') {
        filteredPhotos = demoPhotos.filter(p => p.status === filter);
    }
    
    gallery.innerHTML = filteredPhotos.map(photo => `
        <div class="demo-photo" data-id="${photo.id}">
            <img src="${photo.url}" alt="Foto demo">
            <span class="photo-status-badge ${photo.status}">${photo.status === 'pending' ? 'Pendente' : 'Aprovada'}</span>
            ${photo.status === 'pending' ? `
                <div class="photo-actions-demo">
                    <button class="btn-approve-demo" onclick="approvePhoto('${photo.id}')">✓</button>
                    <button class="btn-reject-demo" onclick="rejectPhoto('${photo.id}')">✕</button>
                </div>
            ` : ''}
        </div>
    `).join('');
}

// Approve photo
function approvePhoto(photoId) {
    const photo = demoPhotos.find(p => p.id === photoId);
    if (photo) {
        photo.status = 'approved';
        renderManageGallery();
    }
}

// Reject photo
function rejectPhoto(photoId) {
    demoPhotos = demoPhotos.filter(p => p.id !== photoId);
    renderManageGallery();
}

// Update counts
function updateCounts() {
    const allCount = demoPhotos.length;
    const pendingCount = demoPhotos.filter(p => p.status === 'pending').length;
    const approvedCount = demoPhotos.filter(p => p.status === 'approved').length;
    
    document.getElementById('countAll').textContent = allCount;
    document.getElementById('countPending').textContent = pendingCount;
    document.getElementById('countApproved').textContent = approvedCount;
    document.getElementById('approvedCount').textContent = approvedCount;
}

// Simulate download
function simulateDownload() {
    const btn = event.target;
    const originalText = btn.textContent;
    
    btn.textContent = 'Preparando download...';
    btn.disabled = true;
    
    setTimeout(() => {
        btn.textContent = '✓ Download Iniciado!';
        btn.style.background = 'var(--verde-menta)';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.disabled = false;
            btn.style.background = '';
            
            // Show success message
            alert('Em produção, todas as fotos aprovadas seriam baixadas em um arquivo ZIP!');
        }, 2000);
    }, 1500);
}

// Show final message
function showFinalMessage() {
    document.getElementById('finalModal').classList.add('active');
}

// Restart demo
function restartDemo() {
    document.getElementById('finalModal').classList.remove('active');
    resetSimulation();
    goToStep(1);
}

// Close modal on outside click
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Download demo QR Code
function downloadDemoQR() {
    const qrCanvas = document.querySelector('.qr-code-visual canvas');
    if (qrCanvas) {
        const url = qrCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = 'qrcode-eternize-demo.png';
        link.href = url;
        link.click();
    } else {
        alert('QR Code não foi gerado ainda. Aguarde um momento!');
    }
}

// Make function globally accessible
window.downloadDemoQR = downloadDemoQR;

// Initialize
initDemo();

// Auto-start simulation when reaching step 3 (optional)
// Uncomment if you want auto-start
// setTimeout(() => {
//     if (currentStep === 3) {
//         startSimulation();
//     }
// }, 1000);
