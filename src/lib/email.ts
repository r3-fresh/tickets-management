
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailParams = {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
    cc?: string | string[];
}

export const sendEmail = async ({ to, subject, html, text, cc }: SendEmailParams) => {
    if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY is missing. Email not sent:", { to, subject });
        return { success: false, error: "Missing API Key" };
    }

    try {
        const from = process.env.EMAIL_FROM || 'onboarding@resend.dev';

        const data = await resend.emails.send({
            from,
            to,
            cc,
            subject,
            html,
            text,
        });

        if (data.error) {
            console.error("Resend API Error:", data.error);
            return { success: false, error: data.error };
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { success: false, error };
    }
};
