/**
 * PhotoVault Upload & Camera Handler - Clean Implementation
 * Fixes all conflicting implementations and provides unified functionality
 */

class PhotoVaultUploader {
    constructor() {
        // State management
        this.selectedFiles = [];
        this.capturedPhotos = [];
        this.isUploading = false;
        this.currentStream = null;
        this.availableCameras = [];
        this.maxFileSize = 16 * 1024 * 1024; // 16MB
        this.allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        
        this.init();
    }
    
    init() {
        console.log('PhotoVault Uploader: Initializing...');
        this.bindEvents();
        this.initializeCamera().catch(err => {
            console.warn('Camera initialization failed:', err);
        });
    }
    
    bindEvents() {
        // File input events
        const fileInput = document.getElementById('file');
        const uploadForm = document.getElementById('uploadForm');
        const uploadArea = document.getElementById('uploadArea');
        
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelection(e));
        }
        
        if (uploadForm) {
            uploadForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }
        
        if (uploadArea) {
            // Click to select files - but avoid triggering on buttons or interactive elements
            uploadArea.addEventListener('click', (e) => {
                // Don't trigger file input if clicking on buttons, interactive elements, or thumbnails
                if (e.target.tagName === 'BUTTON' || 
                    e.target.closest('button') || 
                    e.target.closest('.btn') ||
                    e.target.closest('#filePreviews') ||
                    e.target === fileInput) {
                    return;
                }
                fileInput?.click();
            });
            
            // Drag and drop
            this.setupDragAndDrop(uploadArea);
        }
        
        // Camera events
        this.bindCameraEvents();
    }
    
    bindCameraEvents() {
        const startCameraBtn = document.getElementById('startCameraBtn');
        const captureBtn = document.getElementById('captureBtn');
        const cameraSelect = document.getElementById('cameraSelect');
        
        if (startCameraBtn) {
            startCameraBtn.addEventListener('click', () => this.startCamera());
        }
        
        if (captureBtn) {
            captureBtn.addEventListener('click', () => this.capturePhoto());
        }
        
        if (cameraSelect) {
            cameraSelect.addEventListener('change', () => this.onCameraSelected());
        }
    }
    
    async initializeCamera() {
        if (!navigator.mediaDevices?.getUserMedia) {
            console.log('Camera not supported');
            this.disableCameraUI('Camera not supported in this browser');
            return;
        }
        
        try {
            // Request permission and enumerate devices
            await navigator.mediaDevices.getUserMedia({ video: true });
            await this.enumerateCameras();
        } catch (error) {
            console.error('Camera initialization error:', error);
            this.disableCameraUI('Camera permission denied');
        }
    }
    
    async enumerateCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            this.availableCameras = devices.filter(device => device.kind === 'videoinput');
            const cameraSelect = document.getElementById('cameraSelect');
            
            if (cameraSelect && this.availableCameras.length > 0) {
                cameraSelect.innerHTML = '<option value="">Select Camera...</option>';
                this.availableCameras.forEach((camera, index) => {
                    const option = document.createElement('option');
                    option.value = camera.deviceId;
                    option.textContent = camera.label || `Camera ${index + 1}`;
                    cameraSelect.appendChild(option);
                });
                
                // Auto-select first camera
                if (this.availableCameras.length === 1) {
                    cameraSelect.value = this.availableCameras[0].deviceId;
                }
            } else {
                this.disableCameraUI('No cameras found');
            }
        } catch (error) {
            console.error('Error enumerating cameras:', error);
            this.disableCameraUI('Could not access cameras');
        }
    }
    
    disableCameraUI(message) {
        const cameraSelect = document.getElementById('cameraSelect');
        const startCameraBtn = document.getElementById('startCameraBtn');
        
        if (cameraSelect) {
            cameraSelect.innerHTML = `<option value="">${message}</option>`;
            cameraSelect.disabled = true;
        }
        
        if (startCameraBtn) {
            startCameraBtn.disabled = true;
            startCameraBtn.textContent = message;
        }
    }
    
    onCameraSelected() {
        const startCameraBtn = document.getElementById('startCameraBtn');
        const cameraSelect = document.getElementById('cameraSelect');
        
        if (startCameraBtn && cameraSelect) {
            startCameraBtn.disabled = !cameraSelect.value;
            startCameraBtn.textContent = cameraSelect.value ? 'Start Camera' : 'Select Camera First';
        }
    }
    
    async startCamera() {
        const cameraSelect = document.getElementById('cameraSelect');
        const video = document.getElementById('cameraVideo');
        const captureBtn = document.getElementById('captureBtn');
        const startCameraBtn = document.getElementById('startCameraBtn');
        
        if (!cameraSelect?.value) {
            this.showMessage('Please select a camera', 'warning');
            return;
        }
        
        try {
            // Stop existing stream
            this.stopCamera();
            
            const constraints = {
                video: {
                    deviceId: { exact: cameraSelect.value },
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };
            
            this.currentStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            if (video) {
                video.srcObject = this.currentStream;
                video.style.display = 'block';
            }
            
            if (captureBtn) {
                captureBtn.style.display = 'block';
            }
            
            if (startCameraBtn) {
                startCameraBtn.textContent = 'Stop Camera';
                startCameraBtn.onclick = () => this.stopCamera();
            }
            
            this.showMessage('Camera started successfully', 'success');
        } catch (error) {
            console.error('Camera start error:', error);
            this.handleCameraError(error);
        }
    }
    
    stopCamera() {
        if (this.currentStream) {
            this.currentStream.getTracks().forEach(track => track.stop());
            this.currentStream = null;
        }
        
        const video = document.getElementById('cameraVideo');
        const captureBtn = document.getElementById('captureBtn');
        const startCameraBtn = document.getElementById('startCameraBtn');
        
        if (video) {
            video.style.display = 'none';
            video.srcObject = null;
        }
        
        if (captureBtn) {
            captureBtn.style.display = 'none';
        }
        
        if (startCameraBtn) {
            startCameraBtn.textContent = 'Start Camera';
            startCameraBtn.onclick = () => this.startCamera();
        }
    }
    
    handleCameraError(error) {
        let message = 'Camera error occurred';
        
        switch (error.name) {
            case 'NotAllowedError':
                message = 'Camera permission denied. Please allow camera access and try again.';
                break;
            case 'NotFoundError':
                message = 'No camera found. Please check your camera connection.';
                break;
            case 'NotReadableError':
                message = 'Camera is being used by another application.';
                break;
            case 'OverconstrainedError':
                message = 'Camera constraints not supported. Try a different camera.';
                break;
        }
        
        this.showMessage(message, 'error');
    }
    
    capturePhoto() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('captureCanvas');
        
        if (!video || !canvas || !this.currentStream) {
            this.showMessage('Camera not ready', 'error');
            return;
        }
        
        const context = canvas.getContext('2d');
        
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        if (canvas.width === 0 || canvas.height === 0) {
            this.showMessage('Could not capture photo - invalid dimensions', 'error');
            return;
        }
        
        // Draw current frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Auto-save to database: Upload immediately
        canvas.toBlob((blob) => {
            if (!blob) {
                this.showMessage('Failed to capture photo', 'error');
                return;
            }

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const file = new File([blob], `camera-photo-${timestamp}.jpg`, { type: 'image/jpeg' });

            // Immediately upload single file
            this.uploadSingleFile(file)
                .then(() => {
                    // Add to UI state for visual feedback
                    this.capturedPhotos.push(file);
                    this.selectedFiles.push(file);
                    this.updateFileDisplay();
                    this.showMessage('Photo captured and uploaded successfully', 'success');
                })
                .catch((error) => {
                    this.showMessage(`Upload failed: ${error.message}`, 'error');
                    console.error('Upload error:', error);
                });
        }, 'image/jpeg', 0.9);
    }
    
    async uploadSingleFile(file) {
        const formData = new FormData();
        formData.append('files[]', file);
        
        // Add CSRF token if available
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content 
                       || document.querySelector('input[name="csrf_token"]')?.value;
        if (csrfToken) {
            formData.append('csrf_token', csrfToken);
        }
        
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                return data;
            } else {
                throw new Error(data.message || data.error || 'Upload failed');
            }
        } catch (error) {
            console.error('Upload error:', error);
            throw error;
        }
    }
    
    handleFileSelection(event) {
        const files = Array.from(event.target.files || []);
        
        if (files.length === 0) {
            return;
        }
        
        const validFiles = this.validateFiles(files);
        
        if (validFiles.length === 0) {
            this.showMessage('No valid image files selected', 'warning');
            return;
        }
        
        this.selectedFiles = [...this.selectedFiles, ...validFiles];
        this.updateFileDisplay();
        
        const message = validFiles.length === 1 
            ? `Selected: ${validFiles[0].name}`
            : `Selected ${validFiles.length} files`;
        this.showMessage(message, 'success');
    }
    
    validateFiles(files) {
        return files.filter(file => {
            if (!this.allowedTypes.includes(file.type.toLowerCase())) {
                this.showMessage(`${file.name}: Invalid file type`, 'error');
                return false;
            }
            
            if (file.size > this.maxFileSize) {
                this.showMessage(`${file.name}: File too large (max 16MB)`, 'error');
                return false;
            }
            
            return true;
        });
    }
    
    updateFileDisplay() {
        const uploadBtn = document.getElementById('uploadBtn');
        const previews = document.getElementById('filePreviews');
        
        // Update upload button state
        if (uploadBtn) {
            uploadBtn.disabled = this.selectedFiles.length === 0 || this.isUploading;
        }
        
        // Update file previews
        if (previews) {
            if (this.selectedFiles.length > 0) {
                previews.style.display = '';
                this.renderFilePreview();
            } else {
                previews.innerHTML = '';
                previews.style.display = 'none';
            }
        }
    }
    
    renderFilePreview() {
        const container = document.getElementById('filePreviews');
        if (!container) return;
        container.innerHTML = '';

        this.selectedFiles.forEach((file, index) => {
            const item = document.createElement('div');
            item.className = 'position-relative d-inline-block me-2 mb-2';
            item.style.width = '100px';
            item.style.height = '100px';

            const img = document.createElement('img');
            img.alt = file.name;
            img.className = 'rounded border';
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.objectFit = 'cover';

            if (file.type && file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => { img.src = e.target.result; };
                reader.readAsDataURL(file);
            } else {
                img.src = '/static/img/placeholder.png';
            }

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'btn btn-sm btn-danger position-absolute top-0 end-0 translate-middle';
            removeBtn.style.zIndex = '2';
            removeBtn.innerHTML = '<i class="bi bi-x"></i>';
            removeBtn.addEventListener('click', () => this.removeFile(index));

            const caption = document.createElement('div');
            caption.className = 'position-absolute bottom-0 start-0 w-100 bg-dark bg-opacity-50 text-white text-truncate px-1';
            caption.style.fontSize = '0.7rem';
            caption.textContent = file.name;

            item.appendChild(img);
            item.appendChild(removeBtn);
            item.appendChild(caption);
            container.appendChild(item);
        });
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateFileDisplay();
        this.showMessage('File removed', 'info');
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize uploader when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('uploadForm')) {
        window.photoVaultUploader = new PhotoVaultUploader();
    }
});

// Missing methods - added as prototype methods
PhotoVaultUploader.prototype.showMessage = function(message, type = 'info', timeout = 3000) {
    const box = document.getElementById('uploadProgress');
    if (!box) { console.log(`[${type}] ${message}`); return; }
    const map = { success: 'alert-success', info: 'alert-info', warning: 'alert-warning', error: 'alert-danger' };
    box.className = `alert ${map[type] || 'alert-info'} mt-3`;
    box.textContent = message;
    box.style.display = 'block';
    if (timeout !== 0) {
        clearTimeout(this._msgTimer);
        this._msgTimer = setTimeout(() => { box.style.display = 'none'; }, timeout);
    }
};

PhotoVaultUploader.prototype.setupDragAndDrop = function(area) {
    const stop = (e) => { e.preventDefault(); e.stopPropagation(); };
    ['dragenter','dragover'].forEach(ev => area.addEventListener(ev, (e)=>{ stop(e); area.classList.add('dragover'); }));
    ['dragleave','drop'].forEach(ev => area.addEventListener(ev, (e)=>{ stop(e); area.classList.remove('dragover'); }));
    area.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer?.files || []);
        if (!files.length) return;
        const valid = this.validateFiles(files);
        if (!valid.length) { this.showMessage('No valid image files dropped', 'warning'); return; }
        this.selectedFiles = this.selectedFiles.concat(valid);
        this.updateFileDisplay();
        this.showMessage(`Added ${valid.length} file(s)`, 'success');
    });
};

PhotoVaultUploader.prototype.handleFormSubmit = async function(e) {
    e.preventDefault();
    if (this.isUploading) return;
    if (!this.selectedFiles.length) { this.showMessage('Please select files first', 'warning'); return; }
    this.isUploading = true;
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) uploadBtn.disabled = true;
    let ok = 0, fail = 0;
    this.showMessage(`Uploading ${this.selectedFiles.length} file(s)...`, 'info', 0);
    for (const file of this.selectedFiles) {
        try { 
            await this.uploadSingleFile(file); 
            ok++; 
            this.showMessage(`Uploaded ${ok}/${this.selectedFiles.length}`, 'info', 0); 
        }
        catch { 
            fail++; 
        }
    }
    this.isUploading = false;
    if (uploadBtn) uploadBtn.disabled = false;
    this.selectedFiles = [];
    this.updateFileDisplay();
    this.showMessage(fail ? `Uploaded ${ok}, failed ${fail}` : `Uploaded ${ok} file(s) successfully`, fail ? 'warning' : 'success');
};