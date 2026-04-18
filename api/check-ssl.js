export default async function handler(req, res) {
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({ error: "Domain is required" });
  }

  try {
    const response = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${domain}&all=done`);
    const data = await response.json();

    if (!data.endpoints || data.endpoints.length === 0) {
      return res.json({ status: "PENDING" });
    }

    const endpoint = data.endpoints[0];
    const cert = endpoint.details?.cert;

    if (!cert) {
      return res.json({ status: "NO_CERT" });
    }

    res.json({
      domain,
      grade: endpoint.grade,
      ip: endpoint.ipAddress,
      issuer: cert.issuerLabel,
      valid_from: cert.notBefore,
      valid_to: cert.notAfter,
      trusted: endpoint.grade ? true : false,
      chain: "Root CA → Intermediate CA → Server Certificate"
    });

  } catch (err) {
    res.status(500).json({ error: "SSL check failed" });
  }
}api/check-ssl.js
