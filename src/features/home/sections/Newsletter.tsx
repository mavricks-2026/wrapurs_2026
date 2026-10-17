"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { AnimatedText, Reveal } from "@/components/motion";
import { newsletter } from "@/config/content";
import { animationConfig } from "@/config/motion";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
  }

  return (
    <section className="pb-20">
      <Container>
        <Reveal>
          <div className="rounded-[24px] border border-line bg-section p-8 text-center shadow-soft sm:p-10 md:p-12">
            <AnimatedText
              as="h2"
              text={newsletter.title}
              highlight={newsletter.highlight}
              className="mb-2 font-display text-[28px] leading-tight text-plum sm:text-[32px] lg:text-[36px]"
            />
            <Reveal delay={0.15}>
              <p className="mx-auto mb-7 max-w-md font-body text-[16px] text-plum-muted">
                {newsletter.subtitle}
              </p>
            </Reveal>

            <AnimatePresence mode="wait" initial={false}>
              {done ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: animationConfig.duration.base, ease: animationConfig.ease.out }}
                  className="mx-auto flex max-w-md items-center justify-center gap-2.5 rounded-[14px] border border-brand/30 bg-white px-5 py-3.5 font-body text-[15px] font-semibold text-brand"
                >
                  <Icon name="check_circle" filled className="text-[20px]" />
                  {newsletter.successMessage}
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={submit}
                  initial={false}
                  exit={{ opacity: 0, y: -8 }}
                  className="mx-auto flex max-w-md flex-col items-stretch gap-3 sm:flex-row sm:items-center"
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={newsletter.placeholder}
                    aria-label="Email address"
                    className="w-full rounded-[14px] border border-line bg-white px-4 py-3 font-body text-[15px] text-plum placeholder-plum-muted transition-all focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  />
                  <motion.button
                    type="submit"
                    whileTap={{ scale: 0.97 }}
                    className="shrink-0 rounded-full bg-brand px-6 py-3 font-mono uppercase tracking-[0.12em] text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-brand-dark"
                  >
                    {newsletter.cta}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
