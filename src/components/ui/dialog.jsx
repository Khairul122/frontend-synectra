import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

function Dialog({ ...props }) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({ ...props }) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({ ...props }) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({ ...props }) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({ className, ...props }) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-neu-black/75',
        'data-[state=open]:animate-in data-[state=closed]:animate-out',
        'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogContent({ className, children, ...props }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed left-[50%] top-[50%] z-50 w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%]',
          'bg-neu-white border-2 border-neu-black shadow-neu-xl rounded-none',
          'data-[state=open]:animate-in data-[state=closed]:animate-out',
          'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
          'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          'duration-200 sm:max-w-lg',
          className,
        )}
        {...props}
      >
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogBody({ className, ...props }) {
  return (
    <div
      data-slot="dialog-body"
      className={cn('px-5 py-4', className)}
      {...props}
    />
  );
}

function DialogHeader({ className, children, hideCloseButton = false, ...props }) {
  return (
    <div
      data-slot="dialog-header"
      className={cn(
        'flex items-center justify-between px-5 py-4 border-b-2 border-neu-black bg-neu-black flex-shrink-0',
        className,
      )}
      {...props}
    >
      <div className="flex flex-col gap-0.5 min-w-0">{children}</div>
      {!hideCloseButton && (
        <DialogPrimitive.Close className="text-neu-white/60 hover:text-neu-white transition-colors ml-4 flex-shrink-0">
          <X className="w-5 h-5" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

function DialogFooter({ className, ...props }) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col gap-2 border-t-2 border-neu-black px-5 py-4 sm:flex-row sm:justify-end flex-shrink-0',
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('font-display font-bold text-base text-neu-white leading-tight', className)}
      {...props}
    />
  );
}

function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('font-body text-xs text-neu-white/60', className)}
      {...props}
    />
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogBody,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
