export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const verifyToken = process.env.META_WEBHOOK_VERIFY_TOKEN;

    if (
        mode === "subscribe" &&
        token === verifyToken &&
        challenge
    ) {
        console.log("Meta webhook verified.");

        return new Response(challenge, {
            status: 200,
        });
    }

    console.error("Meta webhook verification failed.");

    return new Response("Forbidden", {
        status: 403,
    });
}

// export async function POST(request: Request) {
//     try {
//         const body = await request.json();

//         if (body.object !== "page") {
//             return Response.json({ received: true });
//         }

//         for (const entry of body.entry ?? []) {
//             for (const event of entry.messaging ?? []) {
//                 if (!event.message) {
//                     continue;
//                 }

//                 const normalizedMessage = {
//                     platform: "facebook",
//                     senderId: event.sender?.id ?? null,
//                     recipientId: event.recipient?.id ?? null,
//                     messageId: event.message?.mid ?? null,
//                     text: event.message?.text ?? null,
//                     timestamp: event.timestamp ?? null,
//                     isFromBusiness: Boolean(event.message?.is_echo),
//                     attachments: event.message?.attachments ?? [],
//                 };

//                 console.log("Normalized Messenger message:");
//                 console.dir(normalizedMessage, { depth: null });
//             }
//         }

//         return Response.json({
//             received: true,
//         });
//     } catch (error) {
//         console.error("Webhook processing error:", error);

//         return new Response("Bad Request", {
//             status: 400,
//         });
//     }
// }

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("\n========== META WEBHOOK RAW ==========");
        console.dir(body, { depth: null });
        console.log("======================================\n");

        if (body.object !== "page") {
            return Response.json({ received: true });
        }

        for (const entry of body.entry ?? []) {
            const eventGroups = [
                {
                    source: "messaging",
                    events: entry.messaging ?? [],
                },
                {
                    source: "standby",
                    events: entry.standby ?? [],
                },
            ];

            for (const group of eventGroups) {
                for (const event of group.events) {
                    console.log(`Event source: ${group.source}`);

                    // Incoming or outgoing message
                    if (event.message) {
                        const normalizedMessage = {
                            type: "message",
                            eventSource: group.source,

                            platform: "facebook",

                            senderId: event.sender?.id ?? null,
                            recipientId: event.recipient?.id ?? null,

                            messageId: event.message?.mid ?? null,
                            text: event.message?.text ?? null,

                            timestamp: event.timestamp ?? null,

                            isFromBusiness: Boolean(event.message?.is_echo),

                            attachments:
                                event.message?.attachments ?? [],

                            referral:
                                event.referral ??
                                event.message?.referral ??
                                null,
                        };

                        console.log("Messenger message:");
                        console.dir(normalizedMessage, {
                            depth: null,
                        });
                    }

                    // Referral/ad entry
                    if (event.referral) {
                        console.log("Messenger referral:");
                        console.dir(event.referral, {
                            depth: null,
                        });
                    }

                    // Button / postback
                    if (event.postback) {
                        console.log("Messenger postback:");
                        console.dir(event.postback, {
                            depth: null,
                        });
                    }
                }
            }
        }

        return Response.json({
            received: true,
        });
    } catch (error) {
        console.error(
            "Webhook processing error:",
            error
        );

        return new Response("Bad Request", {
            status: 400,
        });
    }
}