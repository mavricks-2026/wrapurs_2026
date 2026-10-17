"use client";

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { StarRating } from "@/components/common/StarRating";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { testimonials, testimonialsSection } from "@/config/content";

export function Testimonials() {
  return (
    <section className="py-16">
      <Container>
        <SectionHeading
          title={testimonialsSection.title}
          highlight={testimonialsSection.highlight}
          subtitle={testimonialsSection.subtitle}
        />

        <StaggerGroup className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:gap-7">
          {testimonials.map((t) => (
            <StaggerItem key={t.name}>
              <figure className="flex h-full flex-col rounded-[24px] border border-line bg-white p-5 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover">
                <div className="relative mb-4 h-[190px] overflow-hidden rounded-[18px] border border-line bg-surface">
                  <Image
                    src={t.image}
                    alt=""
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                  />
                </div>
                <StarRating rating={t.rating} className="mb-2.5" />
                <blockquote className="mb-4 font-body text-[15px] italic leading-relaxed text-plum">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-auto border-t border-line pt-3">
                  <span className="block font-display text-[18px] font-bold text-brand-dark">
                    {t.name}
                  </span>
                  <span className="font-body text-[13px] text-plum-muted">{t.location}</span>
                </figcaption>
              </figure>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
