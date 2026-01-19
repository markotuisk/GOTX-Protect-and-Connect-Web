export async function onRequestPost({ request, env }) {
    try {
        const { caseId, status } = await request.json();

        if (!caseId || !status) {
            return new Response(JSON.stringify({ error: "Missing parameters" }), { status: 400 });
        }

        if (env.SUBMISSIONS) {
            // Retrieve existing case
            const caseDataStr = await env.SUBMISSIONS.get(`case:${caseId}`);

            if (caseDataStr) {
                const caseData = JSON.parse(caseDataStr);
                caseData.status = status; // Update status
                caseData.lastUpdated = new Date().toISOString();

                // Save back
                await env.SUBMISSIONS.put(`case:${caseId}`, JSON.stringify(caseData));

                return new Response(JSON.stringify({ message: "Status Updated", caseId }), { status: 200 });
            } else {
                return new Response(JSON.stringify({ error: "Case not found" }), { status: 404 });
            }
        }

        return new Response(JSON.stringify({ message: "KV not binding" }), { status: 200 });

    } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
}
