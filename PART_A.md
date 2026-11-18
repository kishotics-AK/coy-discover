# Part A — Product Improvement Proposals

**Product:** Coy  
**Assignment:** Product Review and Feature Suggestions

## Introduction

After reviewing Coy's core concept, I identified two potential improvements focused on user privacy and the experience of managing limited contact opportunities.

The proposed features aim to improve user trust, reduce unnecessary friction, and make the product more efficient without changing its fundamental purpose.

---

## Feature 1: Privacy-Preserving Non-User Opt-Out

### 1. Problem Statement

Not everyone who receives a contact request through Coy will necessarily want to participate in the platform.

A person who is not registered may prefer not to receive further requests. However, requiring that person to create an account just to express this preference would introduce unnecessary friction.

There is also a privacy concern: an opt-out mechanism should not reveal whether a particular phone number or email address belongs to someone who has opted out.

### 2. Proposed Solution

Introduce a **privacy-preserving opt-out mechanism** that allows non-users to decline future Coy contact requests without creating an account.

A recipient could access a secure opt-out link included in a legitimate contact notification and choose not to receive future requests.

The system would record the preference securely and prevent future requests through the opted-out contact channel.

### 3. User Flow

1. A person receives a contact request notification through Coy.
2. The notification includes a secure opt-out link.
3. The recipient opens the link and sees a simple explanation of the opt-out option.
4. The recipient confirms that they no longer want to receive contact requests.
5. Coy records the preference and suppresses future requests to that contact destination.
6. The sender receives a generic unavailable status without learning whether the recipient opted out.

### 4. Technical Approach

- Generate a short-lived, signed opt-out token associated with the intended contact destination.
- Verify the token before accepting an opt-out request.
- Store a keyed hash of the normalized contact identifier instead of retaining unnecessary plaintext personal information.
- Check the suppression list before initiating new contact requests.
- Use generic responses to prevent attackers from determining whether a contact identifier exists or has opted out.
- Apply rate limiting, token expiration, and audit logging to reduce abuse.

### 5. Expected Benefits

**For recipients:** Greater control over unwanted contact and no need to register merely to opt out.

**For existing users:** Clearer handling of unavailable contacts without exposing sensitive recipient preferences.

**For Coy:** Stronger privacy practices, improved trust, and fewer unwanted contact attempts.

### 6. Success Metrics

- Reduction in repeated unwanted contact attempts.
- Percentage of valid opt-out requests successfully processed.
- Reduction in complaints related to unwanted contact.
- Opt-out flow completion rate.

---

## Feature 2: Automatic Slot Recovery

### 1. Problem Statement

If Coy limits the number of active contact requests or available slots, an unsuccessful request can consume a valuable opportunity.

For example, a user might initiate a request to an invalid or permanently unreachable contact destination. If the system continues to reserve the slot despite confirmed delivery failure, the user may lose an opportunity without receiving any meaningful outcome.

This can create frustration and make the product feel less predictable.

### 2. Proposed Solution

Introduce **automatic slot recovery** for contact requests that the system confirms are permanently undeliverable.

When Coy receives a reliable permanent delivery-failure status, the associated request can be closed and its occupied slot restored automatically.

Temporary failures, pending requests, and recipient decisions should not trigger automatic recovery.

### 3. User Flow

1. A user initiates a contact request, occupying an available slot.
2. Coy attempts to deliver the request through the supported contact channel.
3. The delivery provider reports a permanent delivery failure.
4. Coy verifies the failure and marks the request as undeliverable.
5. The occupied slot is automatically released.
6. The user sees a neutral status message explaining that the request could not be delivered and the slot has been restored.

### 4. Technical Approach

- Track request states such as `PENDING`, `DELIVERED`, `TEMPORARY_FAILURE`, and `PERMANENT_FAILURE`.
- Integrate reliable delivery-status events from the supported messaging provider.
- Recover slots only when a permanent failure is confirmed.
- Use an atomic database transaction to update the request state and release the slot.
- Make recovery operations idempotent so duplicate provider events cannot restore the same slot multiple times.
- Maintain an audit trail for troubleshooting and operational monitoring.

### 5. Expected Benefits

**For users:** Fewer wasted slots and a more predictable experience.

**For Coy:** Better utilization of limited contact opportunities and fewer support requests related to failed deliveries.

**For product reliability:** Clearer request states and consistent handling of permanent delivery failures.

### 6. Success Metrics

- Number of slots recovered after confirmed permanent delivery failures.
- Average time between failure confirmation and slot recovery.
- Reduction in support requests related to unavailable slots.
- Percentage of recovery events processed without duplication.

---

## Prioritization and Conclusion

I would prioritize **Feature 1: Privacy-Preserving Non-User Opt-Out** because consent and privacy are fundamental to building trust in a contact-based product.

**Feature 2: Automatic Slot Recovery** would be the next priority because it improves the usability and reliability of limited contact opportunities.

Together, these improvements address two important aspects of the product experience:

- **Trust and control:** Respecting recipients' preferences without exposing private information.
- **Efficiency and reliability:** Preventing permanently failed requests from unnecessarily consuming user capacity.

Both proposals are intended as potential improvements and would require validation against Coy's existing functionality, delivery infrastructure, and product rules before implementation.