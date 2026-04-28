# Security Specification: MindBridge Chat System

## Data Invariants
1. Chat messages must belong to a valid channel.
2. Users can only send messages if authenticated.
3. Chat messages cannot be modified after creation (immutable).
4. Chat messages cannot be deleted by users.
5. Users can only read messages from channels they have access to. (Need to define access control for channels).

*Currently, the requirement is "Peer Support Chat" which in this context implies a global "wellness" room, but we should make it extensible.*

## The "Dirty Dozen" Payloads (Testing against firestore.rules)
1. Write message without text. -> SHOULD FAIL
2. Write message with extra fields (e.g., isAdmin: true). -> SHOULD FAIL
3. Write message with impersonated senderId. -> SHOULD FAIL
4. Write message with invalid channel name. -> SHOULD FAIL
5. Update existing message text. -> SHOULD FAIL
6. Delete a message. -> SHOULD FAIL
7. Read messages as unauthenticated user. -> SHOULD FAIL
8. Write message with extremely long text (DoS check). -> SHOULD FAIL
9. Write message with timestamp provided from client (instead of serverTimestamp). -> SHOULD FAIL
10. Read messages from a non-existent channel (if access control is channel-based).
11. Write message with invalid senderName size.
12. Write message with invalid timestamp format.

## Test Runner (firestore.rules.test.ts) - Conceptual
- Need to check if `firebase/rules-unit-testing` or similar is available.
*Since I cannot run actual unit tests, I will audit the rules manually against these requirements.*
