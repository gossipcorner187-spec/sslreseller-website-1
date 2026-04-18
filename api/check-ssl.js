<script>
async function checkSSL() {
  const domain = document.getElementById("domain").value.trim();
  const resultDiv = document.getElementById("result");

  if (!domain) {
    resultDiv.innerHTML = "Please enter a domain.";
    return;
  }

  resultDiv.innerHTML = "🔄 Checking SSL...";

  try {
    const response = await fetch(`https://sslcheckerproject1.vercel.app/api/check-ssl?domain=${domain}`);
    const data = await response.json();

    // 🔁 If still scanning → retry automatically
    if (data.status === "PENDING" || data.status === "SCANNING") {
      resultDiv.innerHTML = "🔄 Scanning in progress... retrying in 5 seconds...";
      setTimeout(() => checkSSL(), 5000);
      return;
    }

    // ✅ Final result
    resultDiv.innerHTML = `
      <strong>Domain:</strong> ${data.domain}<br>
      <strong>Grade:</strong> ${data.grade}<br>
      <strong>Issuer:</strong> ${data.issuer}<br>
      <strong>Valid From:</strong> ${new Date(data.valid_from).toDateString()}<br>
      <strong>Valid To:</strong> ${new Date(data.valid_to).toDateString()}<br>
      <strong>Trust:</strong> ${data.trusted ? "✅ Trusted" : "❌ Not Trusted"}<br>

      <br><strong>🔗 Chain of Trust:</strong><br>
      ${data.chain}
    `;

  } catch (err) {
    resultDiv.innerHTML = "Error connecting to backend.";
  }
}
</script>
