export async function onRequestPost({ request, env }) {
    try {
        const formData = await request.json();

        // Validate required fields
        if (!formData.name || !formData.email || !formData.message) {
            return new Response(JSON.stringify({ error: "Incomplete transmission data" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Generate a unique Case ID
        const caseId = `CASE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        // Prepare Email Content (Protect Branding)
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { margin: 0; padding: 0; background-color: #050505; font-family: 'Courier New', monospace; color: #e0e0e0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #0a0a0a; border: 1px solid #1a1a1a; }
        .header { background-color: #000; padding: 30px; text-align: center; border-bottom: 2px solid #0072CE; }
        .header h1 { color: #fff; letter-spacing: 4px; font-size: 20px; margin: 0; text-transform: uppercase; }
        .content { padding: 40px 30px; }
        .h1 { color: #0072CE; font-size: 18px; margin-bottom: 20px; font-weight: bold; text-transform: uppercase; }
        .field-row { margin-bottom: 20px; border-bottom: 1px solid #1a1a1a; padding-bottom: 15px; }
        .label { color: #666; font-size: 10px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 5px; display: block; }
        .value { color: #ffffff; font-size: 14px; line-height: 1.5; }
        .footer { background-color: #000; padding: 20px; text-align: center; font-size: 10px; color: #444; border-top: 1px solid #1a1a1a; }
        .highlight { background: rgba(0, 114, 206, 0.1); border-left: 2px solid #0072CE; padding: 15px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>GOTX PROTECT</h1>
        </div>
        <div class="content">
            <div class="h1">SECURE TRANSMISSION: ${formData.identity || 'UNKNOWN'}</div>
            <p style="color: #666; font-size: 12px; margin-bottom: 30px;">ENCRYPTED PACKET RECEIVED. ORIGIN: GATEWAY.</p>
            
            <div class="field-row"><span class="label">Operative / Identity</span><div class="value">${formData.name || 'Redacted'}</div></div>
            <div class="field-row"><span class="label">Return Address</span><div class="value">${formData.email}</div></div>
            <div class="field-row"><span class="label">Case ID</span><div class="value">${caseId}</div></div>
            
            <div class="highlight"><span class="label">Decrypted Message</span><div class="value">${formData.message}</div></div>
        </div>
        <div class="footer">
            CONFIDENTIAL // NOFORN<br>
            Secure Channel: gotx.uk
        </div>
    </div>
</body>
</html>`;

        // ZeptoMail API Configuration
        const zeptoUrl = "https://api.zeptomail.eu/v1.1/email";
        const zeptoToken = env.ZEPTOMAIL_TOKEN;

        if (!zeptoToken) {
            console.error("Missing ZEPTOMAIL_TOKEN environment variable");
            return new Response(JSON.stringify({ error: "Server configuration error" }), { status: 500 });
        }

        const payload = {
            "from": { "address": "no-reply@gotx.uk", "name": "GOTX Operations" },
            "to": [
                { "email_address": { "address": "info@gotx.uk", "name": "GOTX Command" } },
                { "email_address": { "address": formData.email, "name": formData.name || 'Operative' } }
            ],
            "subject": `SECURE: Inquiry from ${formData.name || 'Unknown'} [${caseId}]`,
            "htmlbody": emailHtml,
        };

        const response = await fetch(zeptoUrl, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": zeptoToken
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("ZeptoMail Error:", errorText);
            return new Response(JSON.stringify({ error: "Transmission Blocked" }), { status: 502 });
        }

        // --- PERSISTENT LOGGING (KV) ---
        try {
            if (env.SUBMISSIONS) {
                const counterKey = 'stats:counter_protect';
                let counter = await env.SUBMISSIONS.get(counterKey);
                counter = counter ? parseInt(counter) + 1 : 1;
                await env.SUBMISSIONS.put(counterKey, counter.toString());

                const logEntry = {
                    logId: `Ops:${counter}`,
                    caseId: caseId,
                    timestamp: new Date().toISOString(),
                    status: 'RECEIVED',
                    origin: 'GOTX Protect',
                    data: formData
                };
                await env.SUBMISSIONS.put(`case:${caseId}`, JSON.stringify(logEntry));
            }
        } catch (kvError) {
            console.error("KV Logging Error:", kvError);
        }

        return new Response(JSON.stringify({ message: "Transmission Successful", caseId: caseId }), {
            status: 200,
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ error: "Internal System Failure" }), { status: 500 });
    }
}
