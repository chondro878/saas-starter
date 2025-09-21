'use client';

import * as React from 'react';
import * as SwitchPrimitives from '@radix-ui/react-switch';

export function Switch(props: React.ComponentProps<typeof SwitchPrimitives.Root>) {
  return (
    <SwitchPrimitives.Root
      className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 transition data-[state=checked]:bg-black"
      {...props}
    >
      <SwitchPrimitives.Thumb className="inline-block h-4 w-4 translate-x-1 rounded-full bg-white transition-transform data-[state=checked]:translate-x-6" />
    </SwitchPrimitives.Root>
  );
}