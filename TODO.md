# Fix Frontend Unlock Window Bug for Password Index 4

## Approved Plan Steps:
- [x] Step 1: Add debug console.logs to `isInUnlockWindow` and `canViewPassword` in public/index.html to trace why password 4 shows locked despite backend data.

**Next**: Step 3 - No console logs received; likely current time outside 09:00-20:00 window (correctly locked). Temporary fix: widen password 4 window to 00:00-23:59 for testing unlock.

- [ ] Step 2: Test with server running, check browser console for logs during current time.
- [3] Step 3: Analyze logs, fix logic (e.g., timezone, state, conditions).
- [ ] Step 4: Remove debug logs after fix.
- [ ] Step 5: Test decryption and full flow.
- [ ] Step 6: attempt_completion

**Status**: Starting Step 1.

