# Part A — Coy Product Improvement Proposals

## Product Review

Coy is built around privacy-first, mutual-interest matching. Users can express interest in someone they know without immediately revealing their identity. A match is revealed only when interest is mutual.

Coy's existing product documentation describes privacy protections such as non-user opt-out and restrictions on contact slots. The following proposals are intended to **improve those existing protections**, rather than duplicate them.

These suggestions are based on the publicly documented product behavior and should be validated against the current application.

---

## Feature 1: Privacy-Preserving Abuse Reporting and Repeat-Offender Detection

### Problem

Coy's anonymous matching model protects users from the embarrassment of revealing one-sided interest. However, anonymity also creates a potential risk of unwanted or repeated contact.

Coy already provides mechanisms for recipients to opt out and report unwanted contact. A useful next step would be to identify patterns of repeated misuse while protecting the identities of legitimate users.

For example, if multiple recipients independently report unwanted contact associated with the same account, the platform could identify that pattern for further review.

### Proposed Solution

Introduce an abuse-detection and review system that builds on Coy's existing reporting mechanisms.

The system could:

- Accept structured reports of unwanted or inappropriate contact.
- Detect repeated verified reports associated with the same account.
- Apply rate limits or temporary restrictions when suspicious patterns occur.
- Escalate serious or repeated incidents for human review.
- Keep reporter identities and private crush information hidden from other users.
- Provide an appeal process to reduce the impact of false reports.

Detection should rely on verified signals and privacy-preserving internal records rather than exposing private contact lists.

### Why This Feature Is Required

Trust is essential for a privacy-focused matching product.

Even when individual messages can be blocked, a proactive abuse-prevention system could reduce repeated harassment and discourage misuse.

It would help Coy maintain its core promise: users should feel safe expressing interest without compromising another person's privacy or comfort.

### Expected Benefits

- Improved user trust and safety.
- Faster identification of repeat abuse.
- Reduced unwanted contact.
- Stronger protection of Coy's anonymous matching experience.

### Success Metrics

- Reduction in repeat verified abuse reports.
- Average time taken to resolve serious reports.
- Percentage of reported cases resolved appropriately.
- False-positive rate of automated restrictions.

---

## Feature 2: Delivery Failure Transparency and Fair Slot Recovery

### Problem

Coy limits the number of contacts users can add. These restrictions help discourage mass contact submissions and protect the privacy of the matching system.

However, a contact request may occasionally fail permanently because of an invalid address, an unreachable destination, or another confirmed delivery issue.

If such a request consumes a limited slot without any possibility of delivery, users may feel that the slot has been wasted.

At the same time, immediately returning slots after every delivery failure could enable repeated contact probing and weaken Coy's privacy protections.

### Proposed Solution

Introduce a carefully controlled slot-recovery process for confirmed permanent delivery failures.

The system could:

- Track delivery outcomes internally, distinguishing temporary failures from confirmed permanent failures.
- Avoid recovering slots for temporary delivery problems.
- Apply a cooldown before any eligible recovery.
- Limit the number of recoveries allowed within a given period.
- Ensure recovery actions are processed only once, even if delivery events are repeated.
- Display generic delivery status messages without revealing whether a contact has joined Coy, opted out, or expressed interest.

Recovery eligibility should be conservative and should not allow users to bypass Coy's existing slot-locking safeguards.

### Why This Feature Is Required

Limited contact slots are valuable to users.

A fair recovery mechanism could improve the experience when a request genuinely cannot be delivered, while preserving the restrictions that protect Coy's anonymous matching model.

This balances usability with privacy and abuse prevention.

### Expected Benefits

- Better use of limited contact slots.
- Reduced frustration from confirmed delivery failures.
- Improved transparency without exposing private information.
- Continued protection against repeated contact probing.

### Success Metrics

- Number of verified permanent delivery failures.
- Percentage of eligible slots successfully recovered.
- Reduction in support requests related to unusable slots.
- Rate of suspicious repeated recovery attempts.

---

## Feature Prioritization

**Priority 1 — Privacy-Preserving Abuse Reporting and Repeat-Offender Detection**

User trust and safety are fundamental to an anonymous matching platform. Strengthening protections against repeated misuse should take priority.

**Priority 2 — Delivery Failure Transparency and Fair Slot Recovery**

This could improve the user experience, but it requires careful safeguards to avoid undermining Coy's existing contact-slot restrictions.

## Conclusion

Both proposals aim to strengthen Coy's privacy-first product experience.

The first focuses on protecting users from repeated misuse, while the second addresses fairness in limited contact-slot usage.

Neither proposal requires exposing incoming likes, revealing who added whom, or weakening mutual-match privacy.

The goal is to improve user trust and usability while preserving Coy's core promise of anonymous, mutual-interest matching.
