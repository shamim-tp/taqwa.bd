import { initializeDatabase, getDatabase } from './modules/database/db.js';

document.addEventListener("DOMContentLoaded", async () => {

  await initializeDatabase("firebase");

  document.getElementById("saveDepositBtn")
    ?.addEventListener("click", handleDeposit);

});


// ==========================
// MAIN DEPOSIT FUNCTION
// ==========================

async function handleDeposit() {

  const depositData = {
    memberName: document.getElementById("memberName").value,
    memberEmail: document.getElementById("memberEmail").value,
    receiptNo: "MR" + Date.now(),
    amount: document.getElementById("amount").value,
    date: new Date().toLocaleDateString()
  };

  await saveDeposit(depositData);
}


// ==========================
// SAVE + EMAIL
// ==========================

async function saveDeposit(depositData) {

  try {

    showLoading("Saving & Sending Receipt...");

    const db = getDatabase();

    await db.collection("deposits").add(depositData);

    await sendDepositReceiptEmail(depositData);

    hideLoading();
    showToast("Success", "Deposit Saved & Receipt Sent");

  } catch (error) {

    hideLoading();
    console.error(error);
    showToast("Error", "Deposit saved but email failed");

  }

}


// ==========================
// EMAIL WITH PDF ATTACHMENT
// ==========================

async function sendDepositReceiptEmail(depositData) {

  const pdfBase64 = await generateReceiptPDF(depositData);

  return emailjs.send(
    "service_li1nizv",
    "template_eq13h6v",
    {
      member_name: depositData.memberName,
      member_email: depositData.memberEmail,
      receipt_no: depositData.receiptNo,
      amount: depositData.amount,
      date: depositData.date,
      attachment: pdfBase64
    }
  );

}


// ==========================
// PDF GENERATOR
// ==========================

async function generateReceiptPDF(depositData) {

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("TAQWA PROPERTIES BD", 20, 20);

  doc.setFontSize(12);
  doc.text("Deposit Receipt", 20, 30);

  doc.line(20, 35, 190, 35);

  doc.text(`Receipt No: ${depositData.receiptNo}`, 20, 50);
  doc.text(`Member: ${depositData.memberName}`, 20, 60);
  doc.text(`Email: ${depositData.memberEmail}`, 20, 70);
  doc.text(`Amount: ${depositData.amount}`, 20, 80);
  doc.text(`Date: ${depositData.date}`, 20, 90);

  doc.text("Thank you for your investment.", 20, 110);

  const base64 = doc.output("datauristring").split(',')[1];

  return base64;
}


// ==========================
// UI HELPERS
// ==========================

function showLoading(message) {
  const overlay = document.getElementById("loadingOverlay");
  overlay.querySelector("p").textContent = message;
  overlay.style.display = "block";
}

function hideLoading() {
  document.getElementById("loadingOverlay").style.display = "none";
}

function showToast(title, message) {

  const wrap = document.getElementById("toastWrap");

  const div = document.createElement("div");
  div.style.background = "#333";
  div.style.color = "#fff";
  div.style.padding = "10px";
  div.style.marginTop = "10px";

  div.innerHTML = `<strong>${title}</strong><br>${message}`;

  wrap.appendChild(div);

  setTimeout(() => div.remove(), 4000);
}
