import api from '@/lib/api';
import type { ContactFormData } from '@/types/contactForm';

export async function submitContactForm(data: ContactFormData): Promise<void> {
  await api.post('/contact', data);
}
