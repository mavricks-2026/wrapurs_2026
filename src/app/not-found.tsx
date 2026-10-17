"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ButtonLink } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { AnimatedText } from "@/components/motion";

export default function NotFound() {
  return (
    <section className="bg-surface py-24">
      <Container className="text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-line bg-white text-brand shadow-soft"
        >
          <Icon name="search_off" className="text-[40px]" />
        </motion.div>

        <AnimatedText
          as="h1"
          text="This keepsake has wandered off"
          highlight="wandered"
          onView={false}
          className="font-display text-[36px] leading-tight text-plum sm:text-[44px]"
        />

        <p className="mx-auto mt-4 max-w-md font-body text-[16px] text-plum-muted">
          The page you&apos;re looking for doesn&apos;t exist — but there are plenty of handmade
          treasures waiting for you.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <ButtonLink href="/shop" size="lg">
            Explore the Shop
            <Icon name="arrow_forward" className="text-[20px]" />
          </ButtonLink>
          <Link
            href="/"
            className="font-body text-[15px] font-semibold text-brand-dark underline transition-colors hover:text-brand"
          >
            Back home
          </Link>
        </div>
      </Container>
    </section>
  );
}
