import { CtaLink } from "@/components/explorer/ui";
import { MAX_MESSAGE_CHARS } from "@/twin/policy";
import { fill, type TwinCopy } from "./copy";
import type { ChatFailure } from "./stream";

interface Props {
  failure: ChatFailure;
  copy: TwinCopy;
  book: string;
}

/** Why the chat didn't answer, in the visitor's language, with a way forward (research A2, A4, A6, P2). */
export function ChatFailureNote({ failure, copy, book }: Props) {
  const message = fill(copy.failures[failure], { max: MAX_MESSAGE_CHARS });
  if (failure === "invalid") {
    return (
      <p role="alert" className="text-[0.9375rem] text-muted">
        {message}
      </p>
    );
  }
  return (
    <div role="status" className="grid justify-items-start gap-4 rounded-[14px] border border-rule bg-surface p-5">
      <p>{message}</p>
      <CtaLink>{book}</CtaLink>
    </div>
  );
}
