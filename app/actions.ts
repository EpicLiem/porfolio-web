'use server';

import { Resend } from 'resend';
import { z } from 'zod';

const resend = new Resend(process.env.RESEND_API_KEY);

// Define a schema for validation using Zod
const ContactFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  message: z.string().min(1, { message: 'Message is required.' }),
});

export interface ContactFormState {
  message: string;
  error?: string;
  success: boolean;
}

export async function sendContactMessage(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  'use server';

  console.log('Server action received form data:', formData);

  // Validate form data
  const validatedFields = ContactFormSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    message: formData.get('message'),
  });

  // If validation fails, return errors
  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    return {
      message: 'Validation failed.',
      error: JSON.stringify(validatedFields.error.flatten().fieldErrors), // Send errors back
      success: false,
    };
  }

  const { name, email, message } = validatedFields.data;

  // Ensure API key is set
  if (!process.env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not set.');
    return {
      message: 'Server configuration error.',
      error: 'Email service is not configured.',
      success: false,
    };
  }

  try {
    // Send the email
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Use the default or your verified domain
      to: ['liem@epicliem.com'], // Your receiving email address
      subject: `New Contact Message from ${name}`,
      replyTo: email, // Set reply-to for easy response
      html: `<p>You received a new message from your portfolio contact form:</p>
             <p><strong>Name:</strong> ${name}</p>
             <p><strong>Email:</strong> ${email}</p>
             <p><strong>Message:</strong></p>
             <p>${message.replace(/\n/g, '<br>')}</p>`, // Format message for HTML
    });

    if (error) {
      console.error('Resend API error:', error);
      return {
        message: 'Failed to send message.',
        error: error.message,
        success: false,
      };
    }

    console.log('Email sent successfully:', data);
    return { message: 'Message sent successfully!', success: true };

  } catch (e: unknown) {
    console.error('Error sending email:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      message: 'An unexpected error occurred.',
      error: errorMessage,
      success: false,
    };
  }
} 