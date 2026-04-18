export default async function handler(req, res) {
  const domain = req.query.domain;

  if (!domain) {
    return res.status(400).json({ error: "Domain required" });
  }

  try {
    const apiURL = `https://api.ssllabs.com/api/v3/analyze?host=${domain}`;

    const response = await fetch(apiURL);

    if (!response.ok) {
      return res.status(500).json({ error: "SSL Labs API failed" });
    }

    const data = await response.json();

    if (!data.endpoints || data.endpoints.length === 0) {
      return res.json({ status: "PENDING" });
    }

    const endpoint = data.endpoints[0];

    // Some responses don't have details immediately
    const cert = endpoint.details?.cert || {};

    return res.status(200).json({
      domain: domain,
      grade: endpoint.grade || "Pending",
      ip: endpoint.ipAddress || "N/A",
      issuer: cert.issuerLabel || "Fetching...",
      valid_from: cert.notBefore || null,
      valid_to: cert.notAfter || null,
      trusted: endpoint.grade ? true : false,
      chain: "Root CA → Intermediate CA → Server Certificate"
    });

  } catch (error) {
    return res.status(500).json({
      error: "Function crashed",
      details: error.message
    });
  }
}
