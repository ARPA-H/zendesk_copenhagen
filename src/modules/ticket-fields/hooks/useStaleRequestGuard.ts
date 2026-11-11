import { useCallback, useRef } from "react";

// Pass the requester only for fields whose results depend on it; a field that
// does not depend on the requester passes null so a requester change never
// discards its responses
export function useStaleRequestGuard(userId: number | null) {
  const requesterRef = useRef(userId);
  // Bumped on every requester transition, so a response that started under
  // requester A stays invalid after an A -> B -> A switch
  const requesterGenerationRef = useRef(0);
  if (requesterRef.current !== userId) {
    requesterRef.current = userId;
    requesterGenerationRef.current++;
  }
  const requestSeqRef = useRef(0);

  return useCallback(() => {
    const requesterGeneration = requesterGenerationRef.current;
    const requestSeq = ++requestSeqRef.current;

    return {
      isStale: () =>
        requesterGeneration !== requesterGenerationRef.current ||
        requestSeq !== requestSeqRef.current,
      isCurrent: () => requestSeq === requestSeqRef.current,
      isRequesterStale: () =>
        requesterGeneration !== requesterGenerationRef.current,
    };
  }, []);
}
