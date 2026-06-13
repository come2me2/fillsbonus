"use client";

import Link from "next/link";
import { useState } from "react";
import { CLIENT_DISCOUNT_PERCENT, REFERRER_BONUS_PERCENT } from "@/lib/bonus";

const faqItems = [
  {
    question: "Это бесплатно?",
    answer:
      "Да. Регистрация и участие в программе бесплатны. Вы получаете персональную ссылку и промокод сразу после создания аккаунта.",
  },
  {
    question: "Когда начисляется бонус?",
    answer: `Бонус ${REFERRER_BONUS_PERCENT}% начисляется после того, как заказ друга полностью оплачен и доставлен. До этого момента заявка отображается в вашем кабинете.`,
  },
  {
    question: "Как друг получит скидку?",
    answer: `Друг может перейти по вашей ссылке или назвать промокод при оформлении заявки на сайте FILLS. Скидка ${CLIENT_DISCOUNT_PERCENT}% применяется к сумме сметы.`,
  },
  {
    question: "Можно ли вывести деньги?",
    answer:
      "Да. Накопленный бонусный баланс можно потратить на заказ мебели FILLS или отправить запрос на вывод средств через личный кабинет.",
  },
  {
    question: "Кто может участвовать?",
    answer:
      "Клиенты FILLS, дизайнеры, партнёры и все, кто знаком с брендом. Если вы уже покупали мебель FILLS или просто хотите рекомендовать нас — программа для вас.",
  },
  {
    question: "Что если друг уже оставлял заявку?",
    answer:
      "Бонус начисляется только за новых клиентов, которые ещё не были привязаны к другому рефереру. Если друг уже оформлял заявку ранее, реферальная связь не создаётся.",
  },
  {
    question: "Сколько друзей можно привести?",
    answer:
      "Без ограничений. За каждый доставленный заказ приглашённого клиента вы получаете бонус на баланс.",
  },
];

export function HomeFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq">
      <h2 className="text-2xl font-medium text-brand-dark">Частые вопросы</h2>
      <div className="mt-6 space-y-3">
        {faqItems.map((item, index) => {
          const isOpen = openIndex === index;

          return (
            <div key={item.question} className="rounded-2xl border border-border bg-card">
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium">{item.question}</span>
                <span className="text-xl text-muted">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen ? (
                <p className="border-t border-border px-5 py-4 text-sm leading-relaxed text-muted">
                  {item.answer}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/register"
          className="btn-pill inline-flex rounded-full bg-brand px-6 py-3 font-medium text-white hover:bg-brand-dark"
        >
          Зарегистрироваться бесплатно
        </Link>
      </div>
    </section>
  );
}
