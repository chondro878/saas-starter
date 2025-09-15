'use client';

import Image from 'next/image';
import { ReactNode } from 'react';

interface SplitTeaserProps {
  title: string;
  imageUrl: string;
  leftContent: ReactNode;
  rightContent: ReactNode;
}

export default function SplitTeaser({
  title,
  imageUrl,
  leftContent,
  rightContent,
}: SplitTeaserProps) {
  return (
    <section className="w-full py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8 items-center">
        <div>{leftContent}</div>
        <div>{rightContent}</div>
      </div>
    </section>
  );
}