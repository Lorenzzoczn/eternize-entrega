// Get event ID from URL
const urlParams = new URLSearchParams(window.location.search);
const eventId = urlParams.get('event');

if (!eventId) {
    document.body.innerHTML = '<div style="text-align: center; padding: 100px 20px;"><h1>Link inválido</h1><p>Este link de upload não é válido.</p></div>';
}

// Get event data
const events = JSON.parse(localStorage.getItem('eternize_events')) || [];
const event = events.find(e => e.id === eventId);

if (event) {
    document.getElementById('eventName').textContent = `Envie suas memórias para ${event.name}`;
} else {
    document.getElementById('eventName').textContent = 'Envie suas memórias deste evento especial';
}

// File handling
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const uploadPreview = document.getElementById('uploadPreview');
const uploadBtn = document.getElementById('uploadBtn');
const uploadSection = document.getElementById('uploadSection');
const successSection = document.getElementById('successSection');

let selectedFiles = [];

// Click to select files
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.background = 'var(--gradient-ouro)';
    uploadArea.style.transform = 'scale(1.02)';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.background = '';
    uploadArea.style.transform = '';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.background = '';
    uploadArea.style.transform = '';
    handleFiles(e.dataTransfer.files);
});

// File input change
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

function handleFiles(files) {
    const validFiles = Array.from(files).filter(file => {
        const isValid = file.type.startsWith('image/') || file.type.startsWith('video/');
        const isUnder50MB = file.size <= 50 * 1024 * 1024;
        return isValid && isUnder50MB;
    });
    
    if (validFiles.length === 0) {
        alert('Por favor, selecione apenas fotos ou vídeos (máximo 50MB cada)');
        return;
    }
    
    selectedFiles = [...selectedFiles, ...validFiles];
    renderPreview();
    uploadBtn.style.display = 'block';
}

function renderPreview() {
    uploadPreview.innerHTML = selectedFiles.map((file, index) => {
        const url = URL.createObjectURL(file);
        const isVideo = file.type.startsWith('video/');
        
        return `
            <div class="preview-item">
                ${isVideo 
                    ? `<video src="${url}" muted></video>`
                    : `<img src="${url}" alt="Preview">`
                }
                <button class="preview-remove" onclick="removeFile(${index})">×</button>
            </div>
        `;
    }).join('');
}

function removeFile(index) {
    selectedFiles.splice(index, 1);
    renderPreview();
    
    if (selectedFiles.length === 0) {
        uploadBtn.style.display = 'none';
    }
}

// Upload files
uploadBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;
    
    uploadBtn.disabled = true;
    uploadBtn.textContent = 'Enviando...';
    
    try {
        // Simulate upload delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Save to localStorage
        const existingPhotos = JSON.parse(localStorage.getItem(`event_${eventId}_photos`)) || [];
        
        selectedFiles.forEach((file, index) => {
            const url = URL.createObjectURL(file);
            existingPhotos.push({
                id: Date.now().toString() + index,
                url: url,
                status: 'pending',
                uploaded_at: new Date().toISOString(),
                filename: file.name
            });
        });
        
        localStorage.setItem(`event_${eventId}_photos`, JSON.stringify(existingPhotos));
        
        // Show success
        uploadSection.style.display = 'none';
        successSection.style.display = 'block';
        
    } catch (error) {
        console.error('Upload error:', error);
        alert('Erro ao enviar fotos. Tente novamente.');
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Enviar Memórias';
    }
});

// Upload more
document.getElementById('uploadMoreBtn').addEventListener('click', () => {
    successSection.style.display = 'none';
    uploadSection.style.display = 'block';
    selectedFiles = [];
    fileInput.value = '';
    uploadPreview.innerHTML = '';
    uploadBtn.style.display = 'none';
});

// Make removeFile globally accessible
window.removeFile = removeFile;
