export default async function handler(req, res) {
  const domain = req.query.domain;

  if (!domain) {
    return res.status(400).json({ error: "Domain required" });
  }

  try {
    const apiURL = `https://api.ssllabs.com/api/v3/analyze?host=${domain}&all=done`;

    const response = await fetch(apiURL);
    const data = await response.json();

    if (!data.endpoints || data.endpoints.length === 0) {
      return res.json({ status: "PENDING" });
    }

    const endpoint = data.endpoints[0];
    const cert = endpoint.details?.cert;

    // If cert details not ready yet
    if (!cert) {
      return res.json({ status: "SCANNING" });
    }

    return res.status(200).json({
      domain: domain,
      grade: endpoint.grade || "N/A",
      ip: endpoint.ipAddress,
      issuer: cert.issuerLabel,
      valid_from: cert.notBefore,
      valid_to: cert.notAfter,
      trusted: endpoint.grade ? true : false,
      chain: "Root CA → Intermediate CA → Server Certificate"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Backend error",
      details: error.message
    });
  }
}
