import { openModal, closeModal } from './modals.js';

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;
  
  const html = `
    <div class="modalWrap" id="modalDepositConfirm">
      <div class="modal" style="max-width: 600px;">
        <div class="modalHead">
          <div>
            <h2>📋 Confirm Deposit Submission</h2>
            <p>Please verify your deposit information before submitting</p>
          </div>
          <button class="closeX">✕</button>
        </div>
        
        <div class="modalBody" style="padding: 20px;">
          <!-- Deposit Information -->
          <div id="depositConfirmContent" style="margin-bottom: 20px;"></div>
          
          <!-- Deposit Slip Preview -->
          <div id="depositSlipPreview" style="display: none; margin: 20px 0;">
            <div style="background: linear-gradient(135deg, #f8f9fa, #ffffff); padding: 20px; border-radius: 16px; border: 2px dashed #667eea;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h4 style="color: #1e3c72; margin: 0;">🖼️ Deposit Slip Preview</h4>
                <span class="badge" style="background: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px;">Uploaded</span>
              </div>
              <div id="slipImageContainer" style="text-align: center; max-height: 300px; overflow-y: auto; border-radius: 12px; background: white; padding: 10px;">
                <!-- Slip image will be inserted here -->
              </div>
            </div>
          </div>
        </div>
        
        <div class="hr"></div>
        
        <div class="row row-2" style="padding: 20px;">
          <button class="btn" id="cancelDepositConfirmBtn" style="padding: 14px;">Cancel</button>
          <button class="btn success" id="confirmDepositBtn" style="padding: 14px; background: linear-gradient(135deg, #27ae60, #2ecc71);">✅ Confirm & Submit</button>
        </div>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', html);
  
  // Close button event listeners
  document.querySelector('#modalDepositConfirm .closeX')?.addEventListener('click', () => closeModal('modalDepositConfirm'));
  document.getElementById('cancelDepositConfirmBtn')?.addEventListener('click', () => closeModal('modalDepositConfirm'));
}

export function openDepositConfirmModal(content, onConfirm, slipFile = null) {
  const modal = document.getElementById('modalDepositConfirm');
  if (!modal) return;
  
  // Set the content
  const contentDiv = document.getElementById('depositConfirmContent');
  if (contentDiv) {
    contentDiv.innerHTML = content;
  }
  
  // Handle slip preview
  const slipPreview = document.getElementById('depositSlipPreview');
  const slipContainer = document.getElementById('slipImageContainer');
  
  if (slipFile && slipPreview && slipContainer) {
    // Show slip preview section
    slipPreview.style.display = 'block';
    
    // Create image preview
    const reader = new FileReader();
    reader.onload = function(e) {
      slipContainer.innerHTML = `
        <img src="${e.target.result}" 
             style="max-width: 100%; max-height: 250px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);"
             alt="Deposit Slip" />
      `;
    };
    reader.readAsDataURL(slipFile);
  } else if (slipPreview) {
    // Hide slip preview if no file
    slipPreview.style.display = 'none';
    if (slipContainer) slipContainer.innerHTML = '';
  }
  
  // Handle confirm button
  const confirmBtn = document.getElementById('confirmDepositBtn');
  if (confirmBtn) {
    // Remove previous listeners
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    
    newBtn.addEventListener('click', async () => {
      try {
        // Disable button to prevent double submission
        newBtn.disabled = true;
        newBtn.style.opacity = '0.6';
        newBtn.innerHTML = '⏳ Processing...';
        
        await onConfirm();
        closeModal('modalDepositConfirm');
      } catch (error) {
        console.error('Confirmation error:', error);
        // Re-enable button on error
        newBtn.disabled = false;
        newBtn.style.opacity = '1';
        newBtn.innerHTML = '✅ Confirm & Submit';
      }
    });
  }
  
  // Open modal
  openModal('modalDepositConfirm');
}

// Alternative function if you want to pass base64 image directly
export function openDepositConfirmModalWithBase64(content, onConfirm, base64Image = null) {
  const modal = document.getElementById('modalDepositConfirm');
  if (!modal) return;
  
  // Set the content
  const contentDiv = document.getElementById('depositConfirmContent');
  if (contentDiv) {
    contentDiv.innerHTML = content;
  }
  
  // Handle slip preview with base64
  const slipPreview = document.getElementById('depositSlipPreview');
  const slipContainer = document.getElementById('slipImageContainer');
  
  if (base64Image && slipPreview && slipContainer) {
    slipPreview.style.display = 'block';
    slipContainer.innerHTML = `
      <img src="${base64Image}" 
           style="max-width: 100%; max-height: 250px; border-radius: 12px; box-shadow: 0 5px 15px rgba(0,0,0,0.1);"
           alt="Deposit Slip" />
    `;
  } else if (slipPreview) {
    slipPreview.style.display = 'none';
    if (slipContainer) slipContainer.innerHTML = '';
  }
  
  // Handle confirm button
  const confirmBtn = document.getElementById('confirmDepositBtn');
  if (confirmBtn) {
    const newBtn = confirmBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
    
    newBtn.addEventListener('click', async () => {
      try {
        newBtn.disabled = true;
        newBtn.style.opacity = '0.6';
        newBtn.innerHTML = '⏳ Processing...';
        
        await onConfirm();
        closeModal('modalDepositConfirm');
      } catch (error) {
        console.error('Confirmation error:', error);
        newBtn.disabled = false;
        newBtn.style.opacity = '1';
        newBtn.innerHTML = '✅ Confirm & Submit';
      }
    });
  }
  
  openModal('modalDepositConfirm');
}
