"use client";

import { SectionHeading } from "@/components/ui/SectionHeading";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { StaggerGroup, StaggerItem } from "@/components/motion";
import { howItWorks } from "@/config/content";

export function HowItWorks() {
  return (
    <section className="bg-section py-16">
      <Container>
        <SectionHeading title={howItWorks.title} highlight={howItWorks.highlight} />

        <StaggerGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
          {howItWorks.steps.map((step) => (
            <StaggerItem key={step.step}>
              <div className="flex h-full flex-col items-center rounded-[24px] border border-line bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-cardHover">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-white">
                  <Icon name={step.icon} className="text-[28px]" />
                </div>
                <div className="mb-1 font-display text-[17px] text-brand">{step.step}</div>
                <h3 className="mb-2 font-display text-[22px] text-plum">{step.title}</h3>
                <p className="font-body text-[14px] leading-relaxed text-plum-muted">
                  {step.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Container>
    </section>
  );
}
