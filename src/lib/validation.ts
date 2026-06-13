import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Введите имя"),
  email: z.string().email("Некорректный email"),
  phone: z.string().min(10, "Введите телефон"),
  password: z.string().min(6, "Минимум 6 символов"),
});

export const loginSchema = z.object({
  email: z.string().email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const orderAmountSchema = z.object({
  amount: z.coerce.number().positive("Сумма должна быть больше 0"),
});

export const quoteAmountSchema = z.object({
  quoteAmount: z.coerce.number().positive("Сумма сметы должна быть больше 0"),
});

export const withdrawalSchema = z.object({
  amount: z.coerce.number().positive("Сумма должна быть больше 0"),
  details: z.string().min(5, "Укажите реквизиты для выплаты"),
});

export const spendSchema = z.object({
  amount: z.coerce.number().positive("Сумма должна быть больше 0"),
  details: z.string().min(5, "Опишите, на какой заказ использовать баланс"),
});

export const manualLeadSchema = z.object({
  clientName: z.string().min(2, "Введите имя клиента"),
  clientPhone: z.string().min(10, "Введите телефон"),
  clientEmail: z.string().email("Некорректный email").optional().or(z.literal("")),
  refCode: z.string().min(2, "Введите промокод реферера"),
  notes: z.string().optional(),
});
